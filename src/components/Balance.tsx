import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, Plus, Edit2, Trash2, CreditCard, Share2, TrendingUp, TrendingDown, DollarSign, X, Check } from 'lucide-react';
import { formatCurrency, generateId, calculateBonuses, calculateDiscounts } from '../utils/calculations';
import type { useStore } from '../store/useStore';
import type { Income, Expense, Debt } from '../store/useStore';

export default function Balance({ store }: { store: ReturnType<typeof useStore> }) {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');

  // Income form
  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeFixed, setIncomeFixed] = useState(false);
  const [incomeForMonthEnd, setIncomeForMonthEnd] = useState(false);
  const [incomeType, setIncomeType] = useState<'fixed' | 'extra' | 'variable'>('fixed');

  // Expense form
  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('alimenticios');
  const [expenseFrequency, setExpenseFrequency] = useState<'monthly' | 'weekly' | 'annual' | 'once'>('monthly');

  // Debt form
  const [debtName, setDebtName] = useState('');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');
  const [debtType, setDebtType] = useState('personal');
  const [debtFrequency, setDebtFrequency] = useState<'monthly' | 'once'>('monthly');

  const base = store.data.salaryConfig.baseSalary;
  const bonuses = calculateBonuses(store.data.bonuses, base);
  const discounts = calculateDiscounts(store.data.discounts, base);

  const totalIncome = store.data.incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = store.data.expenses.reduce((s, e) => {
    if (e.frequency === 'weekly') return s + e.amount * 4;
    if (e.frequency === 'annual') return s + e.amount / 12;
    return s + e.amount;
  }, 0);
  const totalDebtPayments = store.data.debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const totalDebtsRemaining = store.data.debts.reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  const netMonthly = base + bonuses - discounts + totalIncome - totalExpenses - totalDebtPayments;
  const personalBalance = netMonthly;

  // Chart data
  const pieData = [
    { name: 'Ingresos', value: base + bonuses + totalIncome, color: '#10b981' },
    { name: 'Descuentos', value: discounts, color: '#ef4444' },
    { name: 'Gastos', value: totalExpenses, color: '#f59e0b' },
    { name: 'Deudas', value: totalDebtPayments, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  const barData = [
    { name: 'Sueldo', value: base },
    { name: 'Bonos', value: bonuses },
    { name: 'Ingresos', value: totalIncome },
    { name: 'Descuentos', value: -discounts },
    { name: 'Gastos', value: -totalExpenses },
    { name: 'Deudas', value: -totalDebtPayments },
  ];

  const handleSaveIncome = () => {
    if (!incomeName) return;
    const income: Income = {
      id: generateId(),
      name: incomeName,
      amount: parseFloat(incomeAmount) || 0,
      fixed: incomeFixed,
      forMonthEnd: incomeForMonthEnd,
      type: incomeType,
    };
    store.addIncome(income);
    setIncomeName(''); setIncomeAmount(''); setShowIncomeForm(false);
  };

  const handleSaveExpense = () => {
    if (!expenseName) return;
    const expense: Expense = {
      id: generateId(),
      name: expenseName,
      amount: parseFloat(expenseAmount) || 0,
      category: expenseCategory,
      frequency: expenseFrequency,
    };
    store.addExpense(expense);
    setExpenseName(''); setExpenseAmount(''); setShowExpenseForm(false);
  };

  const handleSaveDebt = () => {
    if (!debtName) return;
    const debt: Debt = {
      id: generateId(),
      name: debtName,
      totalAmount: parseFloat(debtTotal) || 0,
      monthlyPayment: parseFloat(debtMonthly) || 0,
      type: debtType,
      frequency: debtFrequency,
      paidAmount: 0,
      progress: 0,
    };
    store.addDebt(debt);
    setDebtName(''); setDebtTotal(''); setDebtMonthly(''); setShowDebtForm(false);
  };

  const handlePayment = (debt: Debt, amount: number, full: boolean) => {
    const paid = full ? debt.totalAmount - debt.paidAmount : amount;
    const newPaid = debt.paidAmount + paid;
    const progress = (newPaid / debt.totalAmount) * 100;
    store.updateDebt(debt.id, { paidAmount: newPaid, progress });
    setShowPaymentModal(false);
    setPaymentAmount('');
    setSelectedDebt(null);
  };

  const sharePaymentWhatsApp = (debt: Debt, amount: number) => {
    const text = `*Control Biométrico - Pago Realizado*\n\nDeuda: ${debt.name}\nMonto pagado: ${formatCurrency(amount)}\nProgreso: ${debt.progress.toFixed(1)}%\nRestante: ${formatCurrency(debt.totalAmount - debt.paidAmount - amount)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareWhatsApp = (type: string, data: any) => {
    const text = `*Control Biométrico - ${type}*\n\n${JSON.stringify(data, null, 2)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const categoryLabels: Record<string, string> = {
    alimenticios: '🍽️ Alimenticios',
    servicios: '📱 Servicios Varios',
    luz: '💡 Luz/Internet',
    agua: '💧 Agua',
    transporte: '🚗 Transporte',
    academicos: '📚 Académicos',
    otros: '📦 Otros',
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold flex items-center gap-2">
        <PieIcon size={24} className="text-purple-400" />
        Balance Personal
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-xs text-emerald-300">Neto a Recibir</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(netMonthly)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-4">
          <p className="text-xs text-orange-300">Gastos Mensuales</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-xs text-red-300">Deudas Global</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalDebtsRemaining)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4">
          <p className="text-xs text-blue-300">Balance Personal</p>
          <p className={`text-2xl font-bold ${personalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(personalBalance)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Distribución Mensual</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Flujo de Caja</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, i) => (
                    <Cell key={i} fill={entry.value >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Income Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-emerald-400 flex items-center gap-2"><TrendingUp size={20} /> Ingresos</h3>
          <button onClick={() => setShowIncomeForm(true)} className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded-lg text-emerald-300 text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showIncomeForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Nombre" value={incomeName} onChange={e => setIncomeName(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                  <input type="number" placeholder="Monto" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <select value={incomeType} onChange={e => setIncomeType(e.target.value as any)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="fixed">Fijo</option><option value="extra">Extra</option><option value="variable">Variable</option>
                  </select>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={incomeFixed} onChange={e => setIncomeFixed(e.target.checked)} className="rounded" /> Fijo
                  </label>
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input type="checkbox" checked={incomeForMonthEnd} onChange={e => setIncomeForMonthEnd(e.target.checked)} className="rounded" /> Fin de mes
                  </label>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveIncome} className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded text-emerald-300 text-sm">Guardar</button>
                  <button onClick={() => setShowIncomeForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          {store.data.incomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-2">
              <div>
                <p className="text-sm text-white">{inc.name}</p>
                <p className="text-xs text-slate-400">{formatCurrency(inc.amount)} • {inc.type} {inc.forMonthEnd ? '• Fin de mes' : ''}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => { store.removeIncome(inc.id); }} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Ingreso', inc)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
              </div>
            </div>
          ))}
          {store.data.incomes.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin ingresos adicionales</p>}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-orange-400 flex items-center gap-2"><TrendingDown size={20} /> Gastos</h3>
          <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded-lg text-orange-300 text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showExpenseForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Nombre" value={expenseName} onChange={e => setExpenseName(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                  <input type="number" placeholder="Monto" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="alimenticios">Alimenticios</option><option value="servicios">Servicios Varios</option>
                    <option value="luz">Luz/Internet</option><option value="agua">Agua</option>
                    <option value="transporte">Transporte</option><option value="academicos">Académicos</option><option value="otros">Otros</option>
                  </select>
                  <select value={expenseFrequency} onChange={e => setExpenseFrequency(e.target.value as any)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="monthly">Mensual</option><option value="weekly">Semanal</option>
                    <option value="annual">Anual</option><option value="once">Único</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveExpense} className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded text-orange-300 text-sm">Guardar</button>
                  <button onClick={() => setShowExpenseForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          {store.data.expenses.map(exp => (
            <div key={exp.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-2">
              <div>
                <p className="text-sm text-white">{categoryLabels[exp.category] || exp.name}</p>
                <p className="text-xs text-slate-400">{formatCurrency(exp.amount)} • {exp.frequency}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => store.removeExpense(exp.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Gasto', exp)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
              </div>
            </div>
          ))}
          {store.data.expenses.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin gastos registrados</p>}
        </div>
      </div>

      {/* Debts Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-red-400 flex items-center gap-2"><CreditCard size={20} /> Deudas</h3>
          <button onClick={() => setShowDebtForm(true)} className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-3 py-1 rounded-lg text-red-300 text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showDebtForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input placeholder="Nombre" value={debtName} onChange={e => setDebtName(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                  <select value={debtType} onChange={e => setDebtType(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="personal">Préstamo Personal</option><option value="electrodomestico">Electrodoméstico</option>
                    <option value="tarjeta">Tarjeta</option><option value="otro">Otro</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <input type="number" placeholder="Monto total" value={debtTotal} onChange={e => setDebtTotal(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                  <input type="number" placeholder="Pago mensual" value={debtMonthly} onChange={e => setDebtMonthly(e.target.value)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                  <select value={debtFrequency} onChange={e => setDebtFrequency(e.target.value as any)} className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                    <option value="monthly">Mensual</option><option value="once">Único</option>
                  </select>
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveDebt} className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded text-red-300 text-sm">Guardar</button>
                  <button onClick={() => setShowDebtForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-3">
          {store.data.debts.map(debt => (
            <div key={debt.id} className="bg-slate-700/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-sm font-medium text-white">{debt.name}</p>
                  <p className="text-xs text-slate-400">{debt.type} • {formatCurrency(debt.monthlyPayment)}/mes</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setSelectedDebt(debt); setShowPaymentModal(true); }}
                    className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300 text-xs">Pagar</button>
                  <button onClick={() => store.removeDebt(debt.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  <button onClick={() => shareWhatsApp('Deuda', debt)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-slate-600 rounded-full h-2">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${debt.progress}%` }} className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full" />
                </div>
                <span className="text-xs text-slate-400">{debt.progress.toFixed(0)}%</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Restante: {formatCurrency(debt.totalAmount - debt.paidAmount)}</p>
            </div>
          ))}
          {store.data.debts.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin deudas registradas</p>}
        </div>
      </div>

      {/* Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedDebt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pagar Deuda</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <p className="text-sm text-slate-400 mb-2">{selectedDebt.name} - Restante: {formatCurrency(selectedDebt.totalAmount - selectedDebt.paidAmount)}</p>
              <input type="number" placeholder="Monto a pagar" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm mb-4" />
              <div className="flex gap-2">
                <button onClick={() => handlePayment(selectedDebt, parseFloat(paymentAmount) || 0, false)}
                  className="flex-1 bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-lg text-blue-300 text-sm">Pago Parcial</button>
                <button onClick={() => handlePayment(selectedDebt, 0, true)}
                  className="flex-1 bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-300 text-sm">Pago Completo</button>
              </div>
              <button onClick={() => { sharePaymentWhatsApp(selectedDebt, parseFloat(paymentAmount) || 0); }}
                className="w-full mt-3 flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-lg text-green-300 text-sm">
                <Share2 size={14} /> Compartir por WhatsApp
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
