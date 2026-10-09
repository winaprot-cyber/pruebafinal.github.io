import { useStore } from './store/useStore';
import AuthScreen from './components/AuthScreen';
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
        return <div className="text-white">Contenido de Inicio</div>;
      case 'historial':
        return <div className="text-white">Contenido de Historial</div>;
      case 'reporte':
        return <div className="text-white">Contenido de Reporte</div>;
      case 'pagos':
        return <div className="text-white">Contenido de Pagos</div>;
      case 'finanzas':
        return <FinanzasTab store={store} />;
      case 'balance':
        return <div className="text-white">Contenido de Balance</div>;
      case 'decimo':
        return <div className="text-white">Contenido de Décimo</div>;
      case 'admin':
        return isAdmin ? <AdminPanel store={store} /> : null;
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

// Componente temporal de Finanzas con botones funcionales
function FinanzasTab({ store }: { store: ReturnType<typeof useStore> }) {
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [bonusName, setBonusName] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [discountName, setDiscountName] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

  const handleSaveBonus = () => {
    if (!bonusName || !bonusAmount) return;
    store.addBonus({
      name: bonusName,
      amount: parseFloat(bonusAmount),
      active: true,
      basedOnSalary: false,
      percentage: 0,
      type: 'bonus',
    });
    setBonusName('');
    setBonusAmount('');
    setShowBonusForm(false);
  };

  const handleSaveDiscount = () => {
    if (!discountName || !discountAmount) return;
    store.addDiscount({
      name: discountName,
      amount: parseFloat(discountAmount),
      active: true,
      basedOnSalary: false,
      percentage: 0,
      type: 'discount',
    });
    setDiscountName('');
    setDiscountAmount('');
    setShowDiscountForm(false);
  };

  const bonuses = store.getUserBonuses();
  const discounts = store.getUserDiscounts();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Finanzas</h2>

      {/* Bonos */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-emerald-400">Bonos</h3>
          <button
            onClick={() => setShowBonusForm(!showBonusForm)}
            className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 px-4 py-2 rounded-lg transition-colors"
          >
            + Agregar Bono
          </button>
        </div>

        <AnimatePresence>
          {showBonusForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-700/30 rounded-lg p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del bono"
                  value={bonusName}
                  onChange={(e) => setBonusName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={bonusAmount}
                  onChange={(e) => setBonusAmount(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveBonus}
                    className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setShowBonusForm(false);
                      setBonusName('');
                      setBonusAmount('');
                    }}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {bonuses.map(bonus => (
            <div key={bonus.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
              <div>
                <p className="text-white font-medium">{bonus.name}</p>
                <p className="text-sm text-slate-400">${bonus.amount.toFixed(2)}</p>
              </div>
              <button
                onClick={() => store.removeBonus(bonus.id)}
                className="text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
          ))}
          {bonuses.length === 0 && (
            <p className="text-slate-500 text-center py-4">No hay bonos registrados</p>
          )}
        </div>
      </div>

      {/* Descuentos */}
      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-400">Descuentos</h3>
          <button
            onClick={() => setShowDiscountForm(!showDiscountForm)}
            className="bg-red-500/20 hover:bg-red-500/30 text-red-400 px-4 py-2 rounded-lg transition-colors"
          >
            + Agregar Descuento
          </button>
        </div>

        <AnimatePresence>
          {showDiscountForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="bg-slate-700/30 rounded-lg p-4 mb-4 space-y-3">
                <input
                  type="text"
                  placeholder="Nombre del descuento"
                  value={discountName}
                  onChange={(e) => setDiscountName(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
                <input
                  type="number"
                  placeholder="Monto"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                />
                <div className="flex gap-2">
                  <button
                    onClick={handleSaveDiscount}
                    className="flex-1 bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg transition-colors"
                  >
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setShowDiscountForm(false);
                      setDiscountName('');
                      setDiscountAmount('');
                    }}
                    className="flex-1 bg-slate-600 hover:bg-slate-700 text-white py-2 rounded-lg transition-colors"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {discounts.map(discount => (
            <div key={discount.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg p-3">
              <div>
                <p className="text-white font-medium">{discount.name}</p>
                <p className="text-sm text-slate-400">${discount.amount.toFixed(2)}</p>
              </div>
              <button
                onClick={() => store.removeDiscount(discount.id)}
                className="text-red-400 hover:text-red-300"
              >
                Eliminar
              </button>
            </div>
          ))}
          {discounts.length === 0 && (
            <p className="text-slate-500 text-center py-4">No hay descuentos registrados</p>
          )}
        </div>
      </div>
    </div>
  );
}

// Panel de Administración
function AdminPanel({ store }: { store: ReturnType<typeof useStore> }) {
  const users = store.getAllUsers();

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Panel de Administración</h2>

      <div className="bg-slate-800/50 backdrop-blur border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold text-blue-400 mb-4">Usuarios Registrados</h3>
        <div className="space-y-3">
          {users.map(user => (
            <div key={user.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white font-medium">{user.name}</p>
                  <p className="text-sm text-slate-400">@{user.username}</p>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs ${
                  user.role === 'admin' 
                    ? 'bg-purple-500/20 text-purple-400' 
                    : 'bg-blue-500/20 text-blue-400'
                }`}>
                  {user.role === 'admin' ? 'Administrador' : 'Usuario'}
                </span>
              </div>
              {user.email && (
                <p className="text-xs text-slate-500">{user.email}</p>
              )}
              <p className="text-xs text-slate-500 mt-1">
                Registrado: {new Date(user.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
