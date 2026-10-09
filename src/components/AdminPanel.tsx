import { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Shield, Calendar, CreditCard, DollarSign, TrendingUp, TrendingDown, ArrowLeft } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';
import type { User } from '../types';

interface AdminPanelProps {
  store: ReturnType<typeof useStore>;
  onBack: () => void;
}

export default function AdminPanel({ store, onBack }: AdminPanelProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const users = store.getAllUsers();
  const currentUser = store.getCurrentUser()!;

  // Verificar si es el super admin
  const isSuperAdmin = currentUser.username.toLowerCase() === 'dome4437';

  if (!isSuperAdmin) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="card-solid rounded-xl p-8 text-center">
          <Shield size={48} className="text-red-400 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-white mb-2">Acceso Restringido</h2>
          <p className="text-slate-400">No tienes permisos para acceder al panel de administración.</p>
          <button
            onClick={onBack}
            className="btn-primary mt-4 px-6 py-2 rounded-lg"
          >
            Volver
          </button>
        </div>
      </div>
    );
  }

  const getUserStats = (userId: string) => {
    const timeEntries = store.data.timeEntries.filter(e => e.userId === userId);
    const bonuses = store.data.bonuses.filter(b => b.userId === userId);
    const discounts = store.data.discounts.filter(d => d.userId === userId);
    const incomes = store.data.incomes.filter(i => i.userId === userId);
    const expenses = store.data.expenses.filter(e => e.userId === userId);
    const debts = store.data.debts.filter(d => d.userId === userId);
    const holidays = store.data.holidays.filter(h => h.userId === userId);
    const decimoEntries = store.data.decimoEntries.filter(d => d.userId === userId);

    const totalHours = timeEntries.reduce((sum, e) => sum + e.hours, 0);
    const totalBonuses = bonuses.reduce((sum, b) => sum + b.amount, 0);
    const totalDiscounts = discounts.reduce((sum, d) => sum + d.amount, 0);
    const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);
    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalDebts = debts.reduce((sum, d) => sum + d.totalAmount, 0);

    return {
      timeEntries: timeEntries.length,
      totalHours,
      bonuses: bonuses.length,
      totalBonuses,
      discounts: discounts.length,
      totalDiscounts,
      incomes: incomes.length,
      totalIncome,
      expenses: expenses.length,
      totalExpenses,
      debts: debts.length,
      totalDebts,
      holidays: holidays.length,
      decimoEntries: decimoEntries.length,
    };
  };

  if (selectedUser) {
    const stats = getUserStats(selectedUser.id);
    const userTimeEntries = store.data.timeEntries.filter(e => e.userId === selectedUser.id);
    const userBonuses = store.data.bonuses.filter(b => b.userId === selectedUser.id);
    const userDiscounts = store.data.discounts.filter(d => d.userId === selectedUser.id);
    const userIncomes = store.data.incomes.filter(i => i.userId === selectedUser.id);
    const userExpenses = store.data.expenses.filter(e => e.userId === selectedUser.id);
    const userDebts = store.data.debts.filter(d => d.userId === selectedUser.id);

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedUser(null)}
            className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
          >
            <ArrowLeft size={18} />
            Volver a Lista de Usuarios
          </button>
        </div>

        {/* User Info */}
        <div className="card-elevated rounded-xl p-6">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-2xl">{selectedUser.name.charAt(0).toUpperCase()}</span>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{selectedUser.name}</h2>
              <p className="text-slate-400">@{selectedUser.username}</p>
              {selectedUser.email && <p className="text-sm text-slate-500">{selectedUser.email}</p>}
              <p className="text-xs text-slate-500 mt-1">
                Registrado: {new Date(selectedUser.createdAt).toLocaleDateString('es-ES')}
              </p>
            </div>
            <span className={`ml-auto px-3 py-1 rounded-full text-xs ${
              selectedUser.role === 'admin' 
                ? 'bg-purple-500/20 text-purple-400' 
                : 'bg-blue-500/20 text-blue-400'
            }`}>
              {selectedUser.role === 'admin' ? 'Administrador' : 'Usuario'}
            </span>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-solid rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <Calendar size={20} className="text-blue-400" />
              <p className="text-sm text-slate-400">Marcaciones</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.timeEntries}</p>
            <p className="text-xs text-slate-500">{stats.totalHours.toFixed(1)} horas totales</p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card-solid rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} className="text-emerald-400" />
              <p className="text-sm text-slate-400">Bonos</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.bonuses}</p>
            <p className="text-xs text-slate-500">{formatCurrency(stats.totalBonuses)} total</p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card-solid rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={20} className="text-red-400" />
              <p className="text-sm text-slate-400">Descuentos</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.discounts}</p>
            <p className="text-xs text-slate-500">{formatCurrency(stats.totalDiscounts)} total</p>
          </motion.div>

          <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card-solid rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign size={20} className="text-purple-400" />
              <p className="text-sm text-slate-400">Ingresos</p>
            </div>
            <p className="text-2xl font-bold text-white">{stats.incomes}</p>
            <p className="text-xs text-slate-500">{formatCurrency(stats.totalIncome)} total</p>
          </motion.div>
        </div>

        {/* Detailed Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Time Entries */}
          <div className="card-solid rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={20} className="text-blue-400" />
              Marcaciones Recientes
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userTimeEntries.slice(0, 10).map(entry => (
                <div key={entry.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">{new Date(entry.date).toLocaleDateString('es-ES')}</span>
                    <span className="text-sm font-semibold text-blue-400">{entry.hours.toFixed(2)}h</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    {entry.entryTime} - {entry.exitTime || 'Pendiente'}
                  </p>
                </div>
              ))}
              {userTimeEntries.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Sin marcaciones</p>
              )}
            </div>
          </div>

          {/* Bonuses */}
          <div className="card-solid rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <TrendingUp size={20} className="text-emerald-400" />
              Bonos
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userBonuses.map(bonus => (
                <div key={bonus.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">{bonus.name}</span>
                    <span className="text-sm font-semibold text-emerald-400">{formatCurrency(bonus.amount)}</span>
                  </div>
                </div>
              ))}
              {userBonuses.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Sin bonos</p>
              )}
            </div>
          </div>

          {/* Expenses */}
          <div className="card-solid rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <DollarSign size={20} className="text-orange-400" />
              Gastos
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userExpenses.map(expense => (
                <div key={expense.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">{expense.name}</span>
                    <span className="text-sm font-semibold text-orange-400">{formatCurrency(expense.amount)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">{expense.category} • {expense.frequency}</p>
                </div>
              ))}
              {userExpenses.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Sin gastos</p>
              )}
            </div>
          </div>

          {/* Debts */}
          <div className="card-solid rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <CreditCard size={20} className="text-red-400" />
              Deudas
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {userDebts.map(debt => (
                <div key={debt.id} className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-white">{debt.name}</span>
                    <span className="text-sm font-semibold text-red-400">{formatCurrency(debt.totalAmount)}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-1">
                    Pago mensual: {formatCurrency(debt.monthlyPayment)} • {debt.progress.toFixed(0)}% pagado
                  </p>
                </div>
              ))}
              {userDebts.length === 0 && (
                <p className="text-slate-500 text-sm text-center py-4">Sin deudas</p>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Shield size={24} className="text-purple-400" />
          Panel de Administración
        </h2>
        <button
          onClick={onBack}
          className="btn-secondary flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <ArrowLeft size={18} />
          Volver
        </button>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-blue-400" />
            <p className="text-sm text-slate-400">Total Usuarios</p>
          </div>
          <p className="text-3xl font-bold text-white">{users.length}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={20} className="text-purple-400" />
            <p className="text-sm text-slate-400">Administradores</p>
          </div>
          <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'admin').length}</p>
        </div>
        <div className="card-elevated rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <Users size={20} className="text-emerald-400" />
            <p className="text-sm text-slate-400">Usuarios Regulares</p>
          </div>
          <p className="text-3xl font-bold text-white">{users.filter(u => u.role === 'user').length}</p>
        </div>
      </div>

      {/* Users List */}
      <div className="card-solid rounded-xl p-6">
        <h3 className="text-lg font-semibold text-white mb-4">Usuarios Registrados</h3>
        <div className="space-y-3">
          {users.map(user => {
            const stats = getUserStats(user.id);
            return (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className="bg-slate-700/50 rounded-lg p-4 border border-slate-600/50 cursor-pointer hover:bg-slate-700/80 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-lg">{user.name.charAt(0).toUpperCase()}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-white font-semibold">{user.name}</p>
                      <span className={`px-2 py-0.5 rounded-full text-xs ${
                        user.role === 'admin' 
                          ? 'bg-purple-500/20 text-purple-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        {user.role === 'admin' ? 'Admin' : 'User'}
                      </span>
                    </div>
                    <p className="text-sm text-slate-400">@{user.username}</p>
                    {user.email && <p className="text-xs text-slate-500">{user.email}</p>}
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-400">{stats.timeEntries} marcaciones</p>
                    <p className="text-xs text-slate-500">{stats.totalHours.toFixed(1)}h</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
