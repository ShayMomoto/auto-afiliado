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
const LINKS_FILE = path.join(__dirname, 'links.json');

// --- LEITOR DE LINKS ---
async function scrapeProductPage(url) {
  console.log(`🕵️ Analisando: ${url}`);
  const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
  const page = await browser.newPage();
  await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36');
  
  try {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
    const data = await page.evaluate(() => {
      const getMeta = (p) => document.querySelector(`meta[property="${p}"]`)?.content || document.querySelector(`meta[name="${p}"]`)?.content;
      return {
        title: getMeta('og:title') || document.title,
        image: getMeta('og:image') || document.querySelector('img')?.src,
        price: document.querySelector('.a-price .a-offscreen')?.innerText || "R$ 99,90 (Est)"
      };
    });
    await browser.close();
    return { item_name: data.title, image_url: data.image, price: data.price, affiliate_link: url };
  } catch (error) {
    await browser.close();
    return null;
  }
}

// --- DATABASE MOCK ---
const readDB = () => { try { return JSON.parse(fs.readFileSync(DB_FILE)); } catch { return {}; } };
const writeDB = (data) => fs.writeFileSync(DB_FILE, JSON.stringify(data));

// --- ROTAS ---
app.get('/api/settings', (req, res) => res.json({ success: true, data: readDB() }));
app.post('/api/settings', (req, res) => { writeDB(req.body); res.json({ success: true }); });

app.post('/api/analyze', async (req, res) => {
  const data = await scrapeProductPage(req.body.link);
  if(data) res.json({ success: true, data });
  else res.status(500).json({ success: false });
});

// Mock Mining
app.post('/api/mining', (req, res) => {
  setTimeout(() => res.json({ success: true, data: [{ item_name: "Oferta Auto", price: "59.90", affiliate_link: "https://shopee..." }] }), 1500);
});

app.get('/api/whatsapp/qr', (req, res) => res.json({ success: true, qr: "mock", status: "QR_READY" }));
app.get('/api/stats', (req, res) => res.json({ success: true, stats: { clicks: 12, revenue: 4.50, products: 5, topProducts: [] } }));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server rodando na porta ${PORT}`));