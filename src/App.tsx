import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Home, History, FileText, CreditCard, Wallet, PieChart, Calendar, Download, Upload } from 'lucide-react';
import { useStore } from './store/useStore';
import Inicio from './components/Inicio';
import Historial from './components/Historial';
import Reporte from './components/Reporte';
import Pagos from './components/Pagos';
import Finanzas from './components/Finanzas';
import Balance from './components/Balance';
import Decimo from './components/Decimo';

const tabs = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'historial', label: 'Historial', icon: History },
  { id: 'reporte', label: 'Reporte', icon: FileText },
  { id: 'pagos', label: 'Pagos', icon: CreditCard },
  { id: 'finanzas', label: 'Finanzas', icon: Wallet },
  { id: 'balance', label: 'Balance', icon: PieChart },
  { id: 'decimo', label: 'Décimo', icon: Calendar },
];

export default function App() {
  const [activeTab, setActiveTab] = useState('inicio');
  const store = useStore();

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          if (ev.target?.result) {
            store.importData(ev.target.result as string);
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio': return <Inicio store={store} />;
      case 'historial': return <Historial store={store} />;
      case 'reporte': return <Reporte store={store} />;
      case 'pagos': return <Pagos store={store} />;
      case 'finanzas': return <Finanzas store={store} />;
      case 'balance': return <Balance store={store} />;
      case 'decimo': return <Decimo store={store} />;
      default: return <Inicio store={store} />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <header className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <span className="text-lg font-bold">CB</span>
            </div>
            <div>
              <h1 className="text-lg font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Control Biométrico
              </h1>
              <p className="text-xs text-slate-400">by Hugo León</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={store.exportData}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              title="Exportar datos"
            >
              <Download size={18} />
            </button>
            <button
              onClick={handleImport}
              className="p-2 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 transition-colors"
              title="Importar datos"
            >
              <Upload size={18} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="bg-slate-800/50 backdrop-blur border-b border-slate-700/30 sticky top-[60px] z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex overflow-x-auto scrollbar-hide gap-1 py-2">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/30'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700/30 py-4 mt-8">
        <p className="text-center text-xs text-slate-500">
          Control Biométrico v1.0 — Creado por Hugo León — Modo Offline Activo
        </p>
      </footer>
    </div>
  );
}
