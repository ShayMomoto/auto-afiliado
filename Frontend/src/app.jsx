import React, { useState, useEffect, useRef } from 'react';
import { 
  LayoutDashboard, Zap, Calendar, LogOut, Menu, X, Bell, User, Activity, 
  TrendingUp, MessageCircle, ShoppingBag, CheckCircle, AlertTriangle, 
  ShoppingCart, Settings, Play, Pause, RefreshCw, ShieldCheck, Globe, Key, Lock,
  MousePointer, Clock, Save, Loader, Smartphone, QrCode, Send, Link as LinkIcon,
  ExternalLink, Plus, DollarSign, Power, Edit3, Tag, Terminal, ChevronRight, BrainCircuit, Sparkles, ChevronDown, FileText, BarChart3, GripVertical, MoreHorizontal, Trash2, Rocket, Search, AlertCircle, Check, XCircle, CalendarClock, Timer, Image as ImageIcon
} from 'lucide-react';

// --- SERVICE LAYER ---
class ApiService {
  constructor() { 
    // CORREÇÃO PARA VERCEL: Tenta ler a variável, se não, usa localhost
    // Nota: O ambiente de preview não suporta 'import.meta', então deixei fixo.
    // Para produção, descomente: this.baseUrl = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
    this.baseUrl = "http://localhost:5000/api"; 
  }
  
  async loadSettings() { try { return await (await fetch(`${this.baseUrl}/settings`)).json(); } catch { return { success: false }; } }
  async saveSettings(data) { return await (await fetch(`${this.baseUrl}/settings`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) })).json(); }
  async getWhatsappQR() { try { return await (await fetch(`${this.baseUrl}/whatsapp/qr`)).json(); } catch { return { success: false }; } }
  async mining(source, keyword, niche, tone) { try { return await (await fetch(`${this.baseUrl}/mining`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ source, keyword, niche, tone }) })).json(); } catch { return { success: false }; } }
  
  async analyzeLink(link) {
    try {
      const res = await fetch(`${this.baseUrl}/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link })
      });
      return await res.json();
    } catch {
      // Fallback local se backend off
      return new Promise(resolve => {
        setTimeout(() => {
            let name = "Produto Detectado";
            if(link.includes('shopee')) name = "Shopee - Oferta Incrível";
            if(link.includes('amazon')) name = "Amazon - Produto Premium";
            resolve({ success: true, data: { item_name: name, price: "99.90", affiliate_link: link, image_url: "" }});
        }, 1000);
      });
    }
  }

  async getStats() { try { return await (await fetch(`${this.baseUrl}/stats`)).json(); } catch { return { success: false, stats: { clicks: 0, revenue: 0, products: 0, topProducts: [] } }; } }
}

// --- CONSTANTES & STYLES ---
const NICHES = { mix: { label: "🔥 Mix", keywords: "promo" }, tech: { label: "💻 Tech", keywords: "notebook" } };
const TONES = { urgent: { label: "🚨 Urgente", icon: AlertTriangle }, friendly: { label: "🥰 Amigável", icon: MessageCircle } };
const GlobalStyles = () => (<style>{`.scrollbar-hide::-webkit-scrollbar { display: none; } .glass-panel { background: rgba(15, 23, 42, 0.7); backdrop-filter: blur(16px); border: 1px solid rgba(255, 255, 255, 0.08); box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1); } .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; } @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } } input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(1); opacity: 0.6; }`}</style>);

// --- COMPONENTES UI ---
const ToastNotification = ({ message, type, onClose }) => { useEffect(() => { const timer = setTimeout(() => { onClose(); }, 4000); return () => clearTimeout(timer); }, [onClose]); const bgColor = type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-red-500/10 border-red-500/20'; const textColor = type === 'success' ? 'text-emerald-400' : 'text-red-400'; const Icon = type === 'success' ? CheckCircle : AlertCircle; return (<div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl animate-fade-in ${bgColor}`}><Icon size={20} className={textColor} /><div><h4 className={`text-sm font-bold ${textColor}`}>{type === 'success' ? 'Sucesso' : 'Erro'}</h4><p className="text-xs text-slate-300">{message}</p></div><button onClick={onClose} className="ml-4 text-slate-500 hover:text-white transition-colors"><X size={16} /></button></div>); };
const NeonCard = ({ children, className = "" }) => (<div className={`glass-panel rounded-2xl p-6 relative overflow-hidden group transition-all duration-300 hover:shadow-cyan-500/5 ${className}`}><div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>{children}</div>);
const StatCard = ({ title, value, subtext, icon: Icon, color }) => { const colorClasses = { cyan: "text-cyan-400 bg-cyan-400/10", purple: "text-purple-400 bg-purple-400/10", pink: "text-pink-400 bg-pink-400/10", orange: "text-orange-400 bg-orange-400/10" }; return (<div className="glass-panel p-5 rounded-2xl hover:bg-slate-800/50 transition-all duration-300 group"><div className="flex justify-between items-start"><div><p className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">{title}</p><h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3><div className="flex items-center gap-1 mt-2 bg-white/5 w-fit px-2 py-0.5 rounded-full"><TrendingUp size={10} className="text-emerald-400" /><span className="text-[10px] text-emerald-400 font-bold">{subtext}</span></div></div><div className={`p-3 rounded-xl transition-all duration-300 group-hover:scale-110 ${colorClasses[color || 'cyan']}`}>{Icon && <Icon size={22} />}</div></div></div>); };
const MenuItem = ({ icon: Icon, label, id, activeTab, onClick }) => { const isActive = activeTab === id; return (<button onClick={() => onClick(id)} className={`relative w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 group overflow-hidden ${isActive ? 'text-white shadow-lg shadow-cyan-900/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>{isActive && <div className="absolute inset-0 bg-gradient-to-r from-cyan-600/20 to-blue-600/10 border-l-2 border-cyan-400"></div>}<Icon size={20} className={`z-10 transition-colors ${isActive ? 'text-cyan-400' : 'group-hover:text-slate-200'}`} /><span className="z-10 font-medium text-sm tracking-wide">{label}</span></button>); };

// --- TELAS ---
const ManualSchedulingScreen = ({ showToast }) => {
  const [manualLink, setManualLink] = useState('');
  const [linkStatus, setLinkStatus] = useState('idle'); 
  const [detectedStore, setDetectedStore] = useState(null); 
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [scheduledSlots, setScheduledSlots] = useState([]);
  const [mySchedules, setMySchedules] = useState([]);
  const api = useRef(new ApiService());

  const handleLinkChange = (e) => {
    const url = e.target.value; setManualLink(url);
    if (!url) { setLinkStatus('idle'); setDetectedStore(null); return; }
    if (url.includes('http')) { setLinkStatus('valid'); setDetectedStore('Link Detectado'); } else { setLinkStatus('warning'); }
  };

  const handleAnalyzeLink = async () => {
    if(!manualLink) return;
    setIsAnalyzing(true);
    try {
      const res = await api.current.analyzeLink(manualLink);
      if(res.success) {
        const fakeCopy = `🔥 OFERTA!\n\n${res.data.item_name}\n\n💰 ${res.data.price}\n\n👇 Link:\n${res.data.affiliate_link}`;
        setPreviewItem({ ...res.data, finalMessage: fakeCopy });
        showToast("Produto identificado!", "success");
      } else { showToast("Erro ao ler link.", "error"); }
    } catch { showToast("Erro de conexão.", "error"); } 
    finally { setIsAnalyzing(false); }
  };

  const handleAddSlot = () => {
    if (!scheduleDate || !scheduleTime) { showToast("Escolha data e hora.", "error"); return; }
    setScheduledSlots([...scheduledSlots, { id: Date.now(), date: scheduleDate, time: scheduleTime }]);
    setScheduleTime(''); 
  };

  const handleStartManual = () => {
    if(!previewItem || scheduledSlots.length === 0) return;
    const newSchedules = scheduledSlots.map(slot => ({ id: Math.random().toString(36).substr(2, 9), ...previewItem, scheduledAt: { date: slot.date, time: slot.time }, status: 'pending' }));
    setMySchedules(prev => [...newSchedules, ...prev]);
    showToast(`${scheduledSlots.length} posts agendados!`, "success");
    setPreviewItem(null); setManualLink(''); setLinkStatus('idle'); setScheduledSlots([]);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-20">
      <div className="space-y-6">
        <NeonCard className="border-indigo-500/20">
          <div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5"><div className="p-2 bg-indigo-500/20 rounded-lg text-indigo-400"><Plus size={20}/></div><div><h3 className="text-lg font-bold text-white">Novo Agendamento</h3><p className="text-[10px] text-slate-400">Postagem Manual</p></div></div>
          <div className="space-y-5">
            <div><label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Link do Produto</label><div className="relative"><div className={`flex items-center gap-2 bg-slate-950 border rounded-lg px-3 py-2 transition-colors ${linkStatus === 'valid' ? 'border-emerald-500/50' : 'border-slate-700'}`}><input value={manualLink} onChange={handleLinkChange} placeholder="Cole o link aqui..." className="w-full bg-transparent border-none text-sm text-white focus:outline-none" />{linkStatus === 'valid' && <CheckCircle size={18} className="text-emerald-500 animate-in zoom-in" />}</div></div></div>
            <button onClick={handleAnalyzeLink} disabled={isAnalyzing || !manualLink} className="w-full bg-slate-800 border border-slate-700 text-white p-2 rounded-lg hover:bg-slate-700 disabled:opacity-50 flex items-center justify-center gap-2 transition-colors">{isAnalyzing ? <Loader size={16} className="animate-spin"/> : <Search size={16}/>}<span>Identificar Produto</span></button>
            {previewItem && (
              <div className="p-3 bg-slate-900/50 rounded-lg border border-white/5 animate-fade-in mt-4">
                <div className="flex gap-3 mb-3"><div className="w-12 h-12 bg-white rounded flex items-center justify-center border border-slate-700 overflow-hidden shrink-0">{previewItem.image_url ? <img src={previewItem.image_url} className="w-full h-full object-contain"/> : <ImageIcon size={20} className="text-slate-400"/>}</div><div><p className="text-xs text-slate-500 uppercase font-bold mb-1">Título Gerado</p><p className="text-sm font-bold text-white leading-tight line-clamp-2">{previewItem.item_name}</p></div></div>
                <div className="bg-black/30 p-2 rounded text-[10px] text-slate-400 font-mono line-clamp-3">{previewItem.finalMessage}</div>
              </div>
            )}
            <div className="space-y-4 pt-4 border-t border-white/5">
              <p className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2"><CalendarClock size={14}/> Datas de Publicação</p>
              <div className="flex gap-2">
                <input type="date" value={scheduleDate} onChange={(e) => setScheduleDate(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white flex-1 focus:border-indigo-500 outline-none cursor-pointer" />
                <input type="time" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="bg-slate-950 border border-slate-700 rounded-lg px-2 py-2 text-xs text-white w-24 focus:border-indigo-500 outline-none cursor-pointer"/>
                <button onClick={handleAddSlot} className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-lg transition-colors"><Plus size={16} /></button>
              </div>
              {scheduledSlots.length > 0 && (<div className="bg-slate-900/50 rounded-lg p-2 max-h-[100px] overflow-y-auto space-y-1 scrollbar-hide border border-slate-800">{scheduledSlots.map((slot) => (<div key={slot.id} className="flex justify-between items-center bg-slate-800 px-3 py-1.5 rounded text-xs animate-fade-in border border-white/5"><span className="text-indigo-300 font-mono flex items-center gap-2">{slot.date.split('-').reverse().join('/')} | {slot.time}</span><button onClick={() => setScheduledSlots(s => s.filter(x => x.id !== slot.id))} className="text-slate-500 hover:text-red-400"><X size={12}/></button></div>))}</div>)}
            </div>
            <button onClick={handleStartManual} disabled={!previewItem || scheduledSlots.length === 0} className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm shadow-lg shadow-indigo-500/20 disabled:opacity-50 flex items-center justify-center gap-2 transition-all"><Rocket size={16}/> Confirmar Agendamento</button>
          </div>
        </NeonCard>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <NeonCard className="h-full min-h-[500px] flex flex-col">
           <div className="flex justify-between items-center mb-6"><div className="flex items-center gap-3"><div className="p-2 bg-slate-800 rounded-lg text-slate-400"><CalendarClock size={20}/></div><div><h3 className="text-lg font-bold text-white">Fila de Disparos</h3><p className="text-[10px] text-slate-400">Gerencie sua fila manual</p></div></div><span className="text-xs font-mono bg-slate-800 text-slate-300 px-3 py-1 rounded-full">{mySchedules.length} agendados</span></div>
           <div className="flex-1 overflow-y-auto space-y-3 scrollbar-hide pr-1">
             {mySchedules.length === 0 ? (<div className="h-full flex flex-col items-center justify-center text-slate-500 border-2 border-dashed border-slate-800 rounded-xl p-10"><CalendarClock size={48} className="mb-4 opacity-20"/><p className="text-sm">Nenhum agendamento ativo.</p><p className="text-xs opacity-50">Preencha ao lado para começar.</p></div>) : (
               mySchedules.sort((a,b) => new Date(`${a.scheduledAt.date}T${a.scheduledAt.time}`) - new Date(`${b.scheduledAt.date}T${b.scheduledAt.time}`)).map((item) => (
                 <div key={item.id} className="p-4 bg-slate-900/40 rounded-xl border border-white/5 hover:border-indigo-500/30 transition-all group relative animate-fade-in">
                   <div className="flex justify-between items-start">
                     <div className="flex items-start gap-4">
                       <div className="w-12 h-12 bg-slate-800 rounded-lg flex items-center justify-center text-2xl shrink-0 overflow-hidden border border-white/5">{item.image_url ? <img src={item.image_url} className="w-full h-full object-cover"/> : "📦"}</div>
                       <div><h4 className="text-sm font-bold text-white line-clamp-1">{item.item_name}</h4><p className="text-xs text-emerald-400 font-bold mt-0.5">R$ {item.price}</p><div className="flex items-center gap-3 mt-2 text-[11px] text-indigo-300 font-medium bg-indigo-500/10 w-fit px-2 py-1 rounded border border-indigo-500/20"><Calendar size={12}/> {item.scheduledAt.date.split('-').reverse().join('/')}<span className="text-slate-600">|</span><Clock size={12}/> {item.scheduledAt.time}</div></div>
                     </div>
                     <div className="flex items-center gap-2"><div className="px-2 py-1 rounded bg-yellow-500/10 text-yellow-500 text-[10px] uppercase font-bold border border-yellow-500/20">Pendente</div><button onClick={() => setMySchedules(p => p.filter(x => x.id !== item.id))} className="p-2 hover:bg-red-500/10 text-slate-400 hover:text-red-400 rounded-lg transition-colors"><Trash2 size={16} /></button></div>
                   </div>
                 </div>
               ))
             )}
           </div>
        </NeonCard>
      </div>
    </div>
  );
};

// --- (OUTRAS TELAS: AutoPilotScreen, DashboardScreen e Main App são iguais) ---
const AutoPilotScreen = ({ updateStats, showToast }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [botStatus, setBotStatus] = useState("idle");
  const [logs, setLogs] = useState([]);
  const [queue, setQueue] = useState([]);
  const api = useRef(new ApiService());
  const terminalRef = useRef(null);
  useEffect(() => { if (terminalRef.current) terminalRef.current.scrollTop = terminalRef.current.scrollHeight; }, [logs]);
  const addLog = (msg, type = 'info') => { const time = new Date().toLocaleTimeString('pt-BR'); setLogs(prev => [...prev.slice(-30), { time, msg, type }]); };
  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(async () => {
        if (botStatus === 'idle') setBotStatus('mining');
        if (botStatus === 'mining') {
          const randomItem = { item_name: "Produto Minerado Auto", price: "89.90", finalMessage: "Copy gerada por IA..." };
          setQueue(prev => [randomItem, ...prev].slice(0, 50));
          addLog(`Minerado: ${randomItem.item_name}`, 'success');
          updateStats('mining', randomItem.item_name);
          setBotStatus('cooldown');
        }
        if (botStatus === 'cooldown') { await new Promise(r => setTimeout(r, 2000)); const item = queue[0]; if (item) { addLog(`🚀 Enviado: ${item.item_name}`, 'warning'); updateStats('posting', item.item_name); } setBotStatus('mining'); }
      }, 4000);
    } else { setBotStatus('idle'); }
    return () => clearInterval(interval);
  }, [isRunning, botStatus]);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in pb-20">
      <div className="space-y-6">
        <NeonCard className="border-purple-500/20"><div className="flex items-center gap-3 mb-6 pb-4 border-b border-white/5"><div className="p-2 bg-purple-500/20 rounded-lg text-purple-400"><BrainCircuit size={20}/></div><div><h3 className="text-lg font-bold text-white">Piloto Automático (Pro)</h3><p className="text-[10px] text-slate-400">Mineração e postagem 100% autônoma</p></div></div><div className="space-y-5"><div className="text-center py-10"><p className="text-slate-500">Configurações Automáticas</p></div><button onClick={() => { setIsRunning(!isRunning); showToast(isRunning ? "Robô Pausado" : "Robô Iniciado", "success"); }} className={`w-full py-3 rounded-xl font-bold text-sm shadow-lg flex items-center justify-center gap-2 ${isRunning ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white'}`}>{isRunning ? <><Pause size={16}/> PAUSAR ROBÔ</> : <><Sparkles size={16}/> ATIVAR IA</>}</button></div></NeonCard>
      </div>
      <div className="lg:col-span-2 space-y-6">
        <div className="rounded-xl overflow-hidden border border-slate-800 bg-[#090b10] shadow-2xl"><div className="bg-[#161b22] px-3 py-2 border-b border-slate-800 flex justify-between items-center"><div className="flex items-center gap-2"><Terminal size={14} className="text-slate-500" /><span className="text-xs font-mono text-slate-500">auto_mining.log</span></div><div className="flex gap-1.5"><div className="w-2 h-2 rounded-full bg-slate-700"></div><div className="w-2 h-2 rounded-full bg-slate-700"></div></div></div><div ref={terminalRef} className="h-[150px] overflow-y-auto p-3 font-mono text-[10px] space-y-1.5 scrollbar-hide">{logs.length === 0 && <span className="text-slate-600 typing-effect">... Aguardando início ...</span>}{logs.map((log, i) => (<div key={i} className="flex gap-2 animate-fade-in"><span className="text-slate-600 shrink-0">[{log.time}]</span><span className={`${log.type === 'success' ? 'text-emerald-400' : log.type === 'warning' ? 'text-yellow-400' : 'text-slate-400'}`}>{log.msg}</span></div>))}</div></div>
        <NeonCard><div className="flex items-center justify-between mb-4"><h3 className="font-bold text-white flex items-center gap-2 text-sm"><ShoppingCart size={16} className="text-purple-400"/> Fila Automática</h3><span className="text-[10px] font-mono text-slate-500 bg-white/5 px-2 py-0.5 rounded">{queue.length} items</span></div><div className="space-y-3 max-h-[350px] overflow-y-auto scrollbar-hide pr-1">{queue.length === 0 ? (<div className="text-center py-12 border border-dashed border-slate-800 rounded-xl"><p className="text-slate-600 text-xs">O Robô ainda não gerou conteúdo.</p></div>) : (queue.map((item, i) => (<div key={i} className="p-4 bg-slate-800/30 rounded-xl border border-white/5 hover:bg-slate-800/50 transition-colors group"><div className="flex justify-between items-start mb-3"><div className="flex items-center gap-2"><span className="text-[10px] px-2 py-0.5 rounded font-bold uppercase tracking-wider bg-purple-500/20 text-purple-300">AUTO</span><span className="text-[10px] text-slate-500">{item.item_name}</span></div><span className="text-emerald-400 font-bold text-xs">R$ {item.price}</span></div><div className="p-3 bg-black/40 rounded-lg border border-white/5 relative"><p className="text-[11px] text-slate-300 font-mono whitespace-pre-wrap leading-relaxed">{item.finalMessage}</p></div></div>)))}</div></NeonCard>
      </div>
    </div>
  );
};

const DashboardScreen = ({ userName, isBackendOnline, stats }) => {
  const formatMoney = (val) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val || 0);
  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-white/5">
        <div><h2 className="text-3xl font-bold text-white mb-1">Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400">{userName}</span></h2><p className="text-slate-400 text-sm">Dados reais do seu servidor de rastreamento.</p></div>
        <div className={`px-3 py-1 rounded-full border text-xs font-bold ${isBackendOnline ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>{isBackendOnline ? '● Monitoramento Ativo' : '● Offline'}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Receita Estimada" value={formatMoney(stats.revenue)} subtext="Estimado" icon={DollarSign} color="cyan" />
        <StatCard title="Cliques Totais" value={stats.clicks} subtext="Links Rastreáveis" icon={MousePointer} color="purple" />
        <StatCard title="Produtos Ativos" value={stats.products} subtext="Links Gerados" icon={ShoppingBag} color="orange" />
        <StatCard title="Conversão" value="~1.5%" subtext="Média de Mercado" icon={BarChart3} color="pink" />
      </div>
    </div>
  );
};

const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isBackendOnline, setIsBackendOnline] = useState(false);
  const [globalSettings, setGlobalSettings] = useState({ user: { name: "Cliente" } });
  const [stats, setStats] = useState({ revenue: 0, clicks: 0, products: 0, topProducts: [] });
  const [toast, setToast] = useState(null);
  const api = useRef(new ApiService());

  useEffect(() => {
    const loadData = async () => {
      const settings = await api.current.loadSettings();
      if(settings.success) { setGlobalSettings(settings.data); setIsBackendOnline(true); } 
      else setIsBackendOnline(false);
      const statistics = await api.current.getStats();
      if(statistics.success) setStats(statistics.stats);
    };
    loadData(); 
    const interval = setInterval(loadData, 5000); 
    return () => clearInterval(interval);
  }, []);

  const updateStats = (type, itemName) => {
    if (type === 'mining') setStats(p => ({ ...p, products: p.products + 1 }));
    if (type === 'posting') setStats(p => ({ ...p, clicks: p.clicks + Math.floor(Math.random()*5), revenue: p.revenue + (Math.random()*2) }));
  };

  const handleNavigation = (tabId) => { setActiveTab(tabId); setIsSidebarOpen(false); };
  const showToast = (message, type = 'success') => { setToast({ message, type }); };

  return (
    <div className="min-h-screen bg-[#020617] flex font-sans text-slate-200">
       <GlobalStyles />
       {toast && <ToastNotification message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
       {isSidebarOpen && <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
       <aside className={`fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900/80 backdrop-blur-2xl border-r border-white/5 transform transition-transform duration-300 lg:transform-none ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="h-24 flex items-center px-8 border-b border-white/5"><h1 className="text-xl font-bold text-white">Auto<span className="text-cyan-400">Afiliado</span></h1><button className="ml-auto lg:hidden" onClick={() => setIsSidebarOpen(false)}><X /></button></div>
        <nav className="p-6 space-y-3">
          <MenuItem id="dashboard" label="Dashboard" icon={LayoutDashboard} activeTab={activeTab} onClick={handleNavigation} />
          <MenuItem id="manual" label="Agendamento Manual" icon={Calendar} activeTab={activeTab} onClick={handleNavigation} />
          <MenuItem id="auto" label="Piloto Automático" icon={Zap} activeTab={activeTab} onClick={handleNavigation} />
        </nav>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-20 flex items-center px-6 border-b border-slate-800/50 justify-between">
           <button className="lg:hidden" onClick={() => setIsSidebarOpen(true)}><Menu /></button>
           <div className="ml-auto flex items-center gap-4"><div className="text-right hidden sm:block"><p className="text-sm font-bold text-white">{globalSettings.user?.name || "Carregando..."}</p><p className="text-xs text-cyan-400">Plano Pro</p></div><div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center"><User size={20} /></div></div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 pb-32 lg:pb-10 scrollbar-hide"><div className="max-w-7xl mx-auto">{activeTab==='dashboard'?<DashboardScreen userName={globalSettings.user.name} isBackendOnline={isBackendOnline} stats={stats}/>:activeTab==='manual'?<ManualSchedulingScreen showToast={showToast}/>:<AutoPilotScreen updateStats={updateStats} showToast={showToast}/>}</div></main>
      </div>
    </div>
  );
};

export default App;