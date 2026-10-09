import { useStore } from './store/useStore';
import AuthScreen from './components/AuthScreen';
import Inicio from './components/Inicio';
import Historial from './components/Historial';
import Reporte from './components/Reporte';
import Pagos from './components/Pagos';
import Finanzas from './components/Finanzas';
import Balance from './components/Balance';
import Decimo from './components/Decimo';
import UserMenu from './components/UserMenu';
import AdminPanel from './components/AdminPanel';
import FloatingPaymentsButton from './components/FloatingPaymentsButton';
import AlarmButton from './components/AlarmButton';
import { Home, History, FileText, CreditCard, Wallet, PieChart, Calendar } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function App() {
  const store = useStore();
  const [activeTab, setActiveTab] = useState('inicio');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  if (!store.getCurrentUser()) {
    return <AuthScreen store={store} />;
  }

  const user = store.getCurrentUser()!;

  const tabs = [
    { id: 'inicio', label: 'Inicio', icon: Home },
    { id: 'historial', label: 'Historial', icon: History },
    { id: 'reporte', label: 'Reporte', icon: FileText },
    { id: 'pagos', label: 'Pagos', icon: CreditCard },
    { id: 'finanzas', label: 'Finanzas', icon: Wallet },
    { id: 'balance', label: 'Balance', icon: PieChart },
    { id: 'decimo', label: 'Décimo', icon: Calendar },
  ];

  const renderContent = () => {
    if (showAdminPanel) {
      return <AdminPanel store={store} onBack={() => setShowAdminPanel(false)} />;
    }

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
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-slate-800/50 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <span className="text-white font-bold text-lg">CB</span>
            </div>
            <div>
              <h1 className="text-lg md:text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Control Biométrico
              </h1>
              <p className="text-xs text-slate-400">by Hugo León</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium text-white">{user.name}</p>
              <p className="text-xs text-slate-400">
                {user.role === 'admin' ? (
                  <span className="text-purple-400">Administrador</span>
                ) : (
                  <span className="text-blue-400">Usuario</span>
                )}
              </p>
            </div>
            <UserMenu store={store} onOpenAdmin={() => setShowAdminPanel(true)} />
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-slate-800/30 backdrop-blur border-b border-slate-700/50 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide py-3">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30'
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
            transition={{ duration: 0.3 }}
          >
            {renderContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Floating Buttons */}
      <FloatingPaymentsButton store={store} />
      <AlarmButton store={store} />

      {/* Footer */}
      <footer className="bg-slate-800/50 border-t border-slate-700/50 py-4 mt-8">
        <p className="text-center text-xs text-slate-500">
          Control Biométrico v2.0 — Creado por Hugo León — Modo Offline Activo
        </p>
      </footer>
    </div>
  );
}
