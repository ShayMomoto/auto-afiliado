require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const puppeteer = require('puppeteer');

const app = express();
app.use(cors());
app.use(express.json());

const DB_FILE = path.join(__dirname, 'database.json');

// --- LEITOR DE LINKS (SCRAPING DIRETO) ---
async function scrapeProductPage(url) {
  console.log(`🕵️ Analisando link: ${url}`);
  
  const browser = await puppeteer.launch({ 
    headless: "new", 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] 
  });
  
  const page = await browser.newPage();
  
  // Finge ser um usuário real para evitar bloqueios
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');

  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // Estratégia Universal: Tenta pegar dados via Meta Tags (Open Graph)
    // Isso funciona na Amazon, Shopee, Magalu, Mercado Livre, etc.
    const data = await page.evaluate(() => {
      const getMeta = (prop) => document.querySelector(`meta[property="${prop}"]`)?.content || 
                                document.querySelector(`meta[name="${prop}"]`)?.content || null;
      
      const priceElement = document.querySelector('.a-price .a-offscreen') || // Amazon
                           document.querySelector('._3n5NQx') || // Shopee (classe variavel, fallback abaixo)
                           document.querySelector('[data-testid="price-value"]'); // Genérico

      return {
        title: getMeta('og:title') || document.title,
        image: getMeta('og:image') || document.querySelector('img')?.src, // Pega a imagem principal
        price: priceElement ? priceElement.innerText : null
      };
    });

    await browser.close();
    
    // Tratamento de dados
    return {
      item_name: data.title || "Produto não identificado",
      image_url: data.image || "https://via.placeholder.com/150?text=Sem+Foto",
      price: data.price || "Consulte",
      original_link: url
    };

  } catch (error) {
    console.error("Erro no scraping:", error.message);
    await browser.close();
    return null;
  }
}

// ... (Funções de Banco de Dados mantidas iguais) ...
const defaultData = { user: {}, config: {}, social: {} };
const readDB = () => { try { return JSON.parse(fs.readFileSync(DB_FILE)); } catch { return defaultData; } };
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2));

// --- ROTAS ---

// NOVA ROTA: Analisar Link
app.post('/api/analyze', async (req, res) => {
  const { link } = req.body;
  if (!link) return res.status(400).json({ success: false, msg: "Link obrigatório" });

  const productData = await scrapeProductPage(link);

  if (productData) {
    // Adiciona ID de afiliado se configurado
    const db = readDB();
    const affiliateId = db.config.affiliateId || "";
    
    // Simplesmente anexa o ID (Lógica real dependeria da loja)
    // productData.affiliate_link = `${link}?affiliate_id=${affiliateId}`; 
    productData.affiliate_link = link; // Por enquanto mantém o original

    res.json({ success: true, data: productData });
  } else {
    res.status(500).json({ success: false, msg: "Não foi possível ler o site." });
  }
});

// ... (Resto das rotas /settings, /mining, /whatsapp mantidas) ...
app.get('/api/settings', (req, res) => res.json({ success: true, data: readDB() }));
app.post('/api/settings', (req, res) => {
  const current = readDB();
  writeDB({ ...current, ...req.body });
  res.json({ success: true });
});
app.get('/api/whatsapp/qr', (req, res) => res.json({ success: true, qr: "mock", status: "QR_READY" }));
app.post('/api/mining', (req, res) => res.json({ success: true, data: [] })); // Placeholder

app.listen(5000, () => console.log(`🚀 Server com Leitor de Imagens rodando na porta 5000`));