import { useStore } from './store/useStore';
import AuthScreen from './components/AuthScreen';
import Inicio from './components/Inicio';
import Historial from './components/Historial';
import Reporte from './components/Reporte';
import Pagos from './components/Pagos';
import Finanzas from './components/Finanzas';
import Balance from './components/Balance';
import Decimo from './components/Decimo';
import Admin from './components/Admin';
import { Home, History, FileText, CreditCard, Wallet, PieChart, Calendar, LogOut, Users } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('inicio');

  if (!store.getCurrentUser()) {
    return <AuthScreen store={store} />;
  }

  const user = store.getCurrentUser()!;
  const isAdmin = store.isAdmin();

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'historial', label: 'Historial', icon: History },
    { id: 'reporte', label: 'Reporte', icon: FileText },
    { id: 'pagos', label: 'Pagos', icon: CreditCard },
    { id: 'finanzas', label: 'Finanzas', icon: Wallet },
    { id: 'balance', label: 'Balance', icon: PieChart },
    { id: 'decimo', label: 'Décimo', icon: Calendar },
  ];

  if (isAdmin) {
    tabs.push({ id: 'admin', label: 'Admin', icon: Users });
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'inicio':
        return <Inicio store={store} />;
      case 'historial':
        return <Historial store={store} />;
      case 'reporte':
        return <Reporte store={store} />;
      case 'pagos':
        return <Pagos store={store} />;
      case 'finanzas':
        return <Finanzas store={store} />;
      case 'balance':
        return <Balance store={store} />;
      case 'decimo':
        return <Decimo store={store} />;
      case 'admin':
        return isAdmin ? <Admin store={store} /> : null;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold">CB</span>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white">Control Biométrico</h1>
              <p className="text-xs text-slate-400">by Hugo León</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm text-white">{user.name}</p>
              <p className="text-xs text-slate-400">{user.role === 'admin' ? 'Administrador' : 'Usuario'}</p>
            </div>
            <button
              onClick={store.logout}
              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 p-2 rounded-lg transition-colors"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 backdrop-blur border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto py-3">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-700/30'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
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
            transition={{ duration: 0.2 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  );
}
