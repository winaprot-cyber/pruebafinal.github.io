import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, Plus, Edit2, Trash2, CreditCard, Share2, TrendingUp, TrendingDown, DollarSign, X, Check, Camera, Shield, Heart, PiggyBank } from 'lucide-react';
import { formatCurrency, generateId, calculateBonuses, calculateDiscounts, calculateBaseIngreso, calculateSpecialDiscounts, calculateSpecialBonuses } from '../utils/calculations';
import { shareAsImageWhatsApp } from '../utils/shareImage';
import type { useStore } from '../store/useStore';
import type { Income, Expense, Debt } from '../store/useStore';

export default function Balance({ store }: { store: ReturnType<typeof useStore> }) {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showExpensePaymentModal, setShowExpensePaymentModal] = useState(false);
  const [selectedDebt, setSelectedDebt] = useState<Debt | null>(null);
  const [selectedExpense, setSelectedExpense] = useState<Expense | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPhoto, setPaymentPhoto] = useState<string>('');
  const [editingDebt, setEditingDebt] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);
  const photoRef = useRef<HTMLInputElement>(null);

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
  const { iessAporteActive, saludConyugeActive, fondosReservaActive } = store.data.salaryConfig;
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

  // Special items calculation
  const baseIngreso = calculateBaseIngreso(base, 0);
  const specialDiscounts = calculateSpecialDiscounts(baseIngreso);
  const specialBonuses = calculateSpecialBonuses(baseIngreso);
  const iessAmount = iessAporteActive ? specialDiscounts.iessAporte : 0;
  const saludAmount = saludConyugeActive ? specialDiscounts.saludConyuge : 0;
  const fondosAmount = fondosReservaActive ? specialBonuses.fondosReserva : 0;

  const netMonthly = base + bonuses + fondosAmount - discounts - iessAmount - saludAmount + totalIncome - totalExpenses - totalDebtPayments;
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
      id: editingIncome || generateId(),
      name: incomeName,
      amount: parseFloat(incomeAmount) || 0,
      fixed: incomeFixed,
      forMonthEnd: incomeForMonthEnd,
      type: incomeType,
    };
    if (editingIncome) {
      store.updateIncome(editingIncome, income);
      setEditingIncome(null);
    } else {
      store.addIncome(income);
    }
    setIncomeName(''); setIncomeAmount(''); setShowIncomeForm(false);
  };

  const handleSaveExpense = () => {
    if (!expenseName) return;
    const amount = parseFloat(expenseAmount) || 0;
    const expense: Expense = {
      id: editingExpense || generateId(),
      name: expenseName,
      amount: amount,
      originalAmount: editingExpense ? (store.data.expenses.find(e => e.id === editingExpense)?.originalAmount || amount) : amount,
      paidAmount: editingExpense ? (store.data.expenses.find(e => e.id === editingExpense)?.paidAmount || 0) : 0,
      category: expenseCategory,
      frequency: expenseFrequency,
    };
    if (editingExpense) {
      store.updateExpense(editingExpense, expense);
      setEditingExpense(null);
    } else {
      store.addExpense(expense);
    }
    setExpenseName(''); setExpenseAmount(''); setShowExpenseForm(false);
  };

  const handleSaveDebt = () => {
    if (!debtName) return;
    const total = parseFloat(debtTotal) || 0;
    const monthly = parseFloat(debtMonthly) || 0;
    const debt: Debt = {
      id: editingDebt || generateId(),
      name: debtName,
      totalAmount: total,
      monthlyPayment: monthly,
      type: debtType,
      frequency: debtFrequency,
      paidAmount: editingDebt ? (store.data.debts.find(d => d.id === editingDebt)?.paidAmount || 0) : 0,
      progress: editingDebt ? (store.data.debts.find(d => d.id === editingDebt)?.progress || 0) : 0,
      paymentsMade: editingDebt ? (store.data.debts.find(d => d.id === editingDebt)?.paymentsMade || 0) : 0,
      totalPayments: monthly > 0 ? Math.ceil(total / monthly) : undefined,
    };
    if (editingDebt) {
      store.updateDebt(editingDebt, debt);
      setEditingDebt(null);
    } else {
      store.addDebt(debt);
    }
    setDebtName(''); setDebtTotal(''); setDebtMonthly(''); setShowDebtForm(false);
  };

  const handlePayment = (debt: Debt, amount: number, full: boolean) => {
    const paid = full ? debt.totalAmount - debt.paidAmount : amount;
    const newPaid = debt.paidAmount + paid;
    const progress = (newPaid / debt.totalAmount) * 100;
    const newPaymentsMade = debt.paymentsMade + 1;
    store.updateDebt(debt.id, { paidAmount: newPaid, progress, paymentsMade: newPaymentsMade });
    setShowPaymentModal(false);
    setPaymentAmount('');
    setPaymentPhoto('');
    setSelectedDebt(null);
  };

  const handleExpensePayment = (expense: Expense) => {
    // Mark expense as paid (for one-time expenses)
    if (expense.frequency === 'once') {
      store.removeExpense(expense.id);
    }
    setShowExpensePaymentModal(false);
    setSelectedExpense(null);
    setPaymentPhoto('');
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPaymentPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sharePaymentWhatsApp = async (type: string, item: any, amount: number, photo?: string) => {
    const receiptData = {
      title: 'Control Biométrico',
      subtitle: `Comprobante de Pago - ${type}`,
      color: type === 'Deuda' ? '#ef4444' : '#f97316',
      fields: [
        { label: 'Concepto:', value: item.name },
        { label: 'Monto:', value: formatCurrency(amount), highlight: true },
        { label: 'Fecha:', value: new Date().toLocaleDateString('es-EC') },
        ...(item.progress ? [{ label: 'Progreso:', value: `${item.progress.toFixed(1)}%` }] : []),
        ...(item.paymentsMade ? [{ label: 'Pagos:', value: `${item.paymentsMade}/${item.totalPayments || '?'}` }] : []),
      ],
      photo: photo,
      footer: 'by Hugo León',
    };
    await shareAsImageWhatsApp(receiptData, `pago-${item.name}-${Date.now()}`);
  };

  const shareWhatsApp = async (type: string, itemData: any) => {
    const colorMap: Record<string, string> = {
      'Ingreso': '#10b981',
      'Gasto': '#f97316',
      'Deuda': '#ef4444',
    };
    
    const fields = [];
    if (type === 'Ingreso') {
      fields.push(
        { label: 'Nombre:', value: itemData.name },
        { label: 'Monto:', value: formatCurrency(itemData.amount), highlight: true },
        { label: 'Tipo:', value: itemData.type },
        { label: 'Frecuencia:', value: itemData.fixed ? 'Fijo' : 'Variable' },
      );
    } else if (type === 'Gasto') {
      fields.push(
        { label: 'Categoría:', value: itemData.name },
        { label: 'Monto:', value: formatCurrency(itemData.amount), highlight: true },
        { label: 'Frecuencia:', value: itemData.frequency },
      );
    } else if (type === 'Deuda') {
      fields.push(
        { label: 'Nombre:', value: itemData.name },
        { label: 'Total:', value: formatCurrency(itemData.totalAmount) },
        { label: 'Pagado:', value: formatCurrency(itemData.paidAmount) },
        { label: 'Restante:', value: formatCurrency(itemData.totalAmount - itemData.paidAmount), highlight: true },
        { label: 'Progreso:', value: `${itemData.progress.toFixed(1)}%` },
      );
    }

    const receiptData = {
      title: 'Control Biométrico',
      subtitle: type,
      color: colorMap[type] || '#3b82f6',
      fields,
      footer: 'by Hugo León',
    };
    await shareAsImageWhatsApp(receiptData, `${type.toLowerCase()}-${itemData.name}-${Date.now()}`);
  };

  const startEditDebt = (debt: Debt) => {
    setEditingDebt(debt.id);
    setDebtName(debt.name);
    setDebtTotal(debt.totalAmount.toString());
    setDebtMonthly(debt.monthlyPayment.toString());
    setDebtType(debt.type);
    setDebtFrequency(debt.frequency);
    setShowDebtForm(true);
  };

  const startEditExpense = (expense: Expense) => {
    setEditingExpense(expense.id);
    setExpenseName(expense.name);
    setExpenseAmount(expense.amount.toString());
    setExpenseCategory(expense.category);
    setExpenseFrequency(expense.frequency);
    setShowExpenseForm(true);
  };

  const startEditIncome = (income: Income) => {
    setEditingIncome(income.id);
    setIncomeName(income.name);
    setIncomeAmount(income.amount.toString());
    setIncomeFixed(income.fixed);
    setIncomeForMonthEnd(income.forMonthEnd);
    setIncomeType(income.type);
    setShowIncomeForm(true);
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
    <div className="space-y-4 md:space-y-6">
      <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
        <PieIcon size={24} className="text-purple-400" />
        Balance Personal
      </h2>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
          className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-emerald-300">Neto a Recibir</p>
          <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(netMonthly)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-orange-300">Gastos Mensuales</p>
          <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-red-300">Deudas Global</p>
          <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(totalDebtsRemaining)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-blue-300">Balance Personal</p>
          <p className={`text-lg md:text-2xl font-bold ${personalBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            {formatCurrency(personalBalance)}
          </p>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Distribución Mensual</h3>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Flujo de Caja</h3>
          <div className="h-48 md:h-56">
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
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-emerald-400 flex items-center gap-2"><TrendingUp size={20} /> Ingresos</h3>
          <button onClick={() => { setEditingIncome(null); setIncomeName(''); setIncomeAmount(''); setShowIncomeForm(true); }} className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-2 md:px-3 py-1 rounded-lg text-emerald-300 text-xs md:text-sm">
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
                  <button onClick={handleSaveIncome} className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded text-emerald-300 text-sm">{editingIncome ? 'Actualizar' : 'Guardar'}</button>
                  <button onClick={() => setShowIncomeForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          {store.data.incomes.map(inc => (
            <div key={inc.id}>
              <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 md:px-4 py-2">
                <div>
                  <p className="text-sm text-white">{inc.name}</p>
                  <p className="text-xs text-slate-400">{formatCurrency(inc.amount)} • {inc.type} {inc.forMonthEnd ? '• Fin de mes' : ''}</p>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => startEditIncome(inc)} className="text-blue-400 hover:text-blue-300"><Edit2 size={14} /></button>
                  <button onClick={() => { store.removeIncome(inc.id); }} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                  <button onClick={() => shareWhatsApp('Ingreso', inc)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {store.data.incomes.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin ingresos adicionales</p>}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-orange-400 flex items-center gap-2"><TrendingDown size={20} /> Gastos</h3>
          <button onClick={() => { setEditingExpense(null); setExpenseName(''); setExpenseAmount(''); setShowExpenseForm(true); }} className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 px-2 md:px-3 py-1 rounded-lg text-orange-300 text-xs md:text-sm">
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
                  <button onClick={handleSaveExpense} className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded text-orange-300 text-sm">{editingExpense ? 'Actualizar' : 'Guardar'}</button>
                  <button onClick={() => setShowExpenseForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          {store.data.expenses.map(exp => {
            const originalAmount = exp.originalAmount || exp.amount;
            const paidAmount = exp.paidAmount || 0;
            const remainingAmount = exp.amount;
            const paidPercentage = originalAmount > 0 ? (paidAmount / originalAmount) * 100 : 0;
            const isFullyPaid = remainingAmount <= 0;
            
            return (
              <div key={exp.id}>
                <div className="bg-slate-700/30 rounded-lg px-3 md:px-4 py-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex-1">
                      <p className="text-sm text-white">{categoryLabels[exp.category] || exp.name}</p>
                      <p className="text-xs text-slate-400">
                        {isFullyPaid ? (
                          <span className="text-emerald-400 font-semibold">✓ Pagado completamente</span>
                        ) : (
                          <>
                            Restante: {formatCurrency(remainingAmount)} • {exp.frequency}
                          </>
                        )}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {!isFullyPaid && (
                        <button onClick={() => { setSelectedExpense(exp); setShowExpensePaymentModal(true); }} className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300 text-xs">Pagar</button>
                      )}
                      <button onClick={() => startEditExpense(exp)} className="text-blue-400 hover:text-blue-300"><Edit2 size={14} /></button>
                      <button onClick={() => store.removeExpense(exp.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                      <button onClick={() => shareWhatsApp('Gasto', exp)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
                    </div>
                  </div>
                  
                  {/* Barra de progreso de pago */}
                  {originalAmount > 0 && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Pagado: {formatCurrency(paidAmount)}</span>
                        <span className={paidPercentage === 100 ? 'text-emerald-400 font-semibold' : ''}>
                          {paidPercentage.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-2">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${paidPercentage}%` }}
                          className={`h-2 rounded-full transition-all ${
                            paidPercentage === 100 
                              ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                              : 'bg-gradient-to-r from-orange-500 to-orange-400'
                          }`}
                        />
                      </div>
                      {paidAmount > 0 && !isFullyPaid && (
                        <p className="text-xs text-slate-500 mt-1">
                          Original: {formatCurrency(originalAmount)}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
          {store.data.expenses.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin gastos registrados</p>}
        </div>
      </div>

      {/* Debts Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-red-400 flex items-center gap-2"><CreditCard size={20} /> Deudas</h3>
          <button onClick={() => { setEditingDebt(null); setDebtName(''); setDebtTotal(''); setDebtMonthly(''); setShowDebtForm(true); }} className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-2 md:px-3 py-1 rounded-lg text-red-300 text-xs md:text-sm">
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
                  <button onClick={handleSaveDebt} className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded text-red-300 text-sm">{editingDebt ? 'Actualizar' : 'Guardar'}</button>
                  <button onClick={() => setShowDebtForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-3">
          {store.data.debts.map(debt => (
            <div key={debt.id}>
              <div className="bg-slate-700/30 rounded-lg p-3 md:p-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 gap-2">
                  <div>
                    <p className="text-sm font-medium text-white">{debt.name}</p>
                    <p className="text-xs text-slate-400">{debt.type} • {formatCurrency(debt.monthlyPayment)}/mes</p>
                    <p className="text-xs text-blue-400 mt-1">
                      Pagos realizados: {debt.paymentsMade}/{debt.totalPayments || '?'}
                    </p>
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => { setSelectedDebt(debt); setShowPaymentModal(true); setPaymentPhoto(''); }}
                      className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300 text-xs">Pagar</button>
                    <button onClick={() => startEditDebt(debt)} className="text-blue-400 hover:text-blue-300"><Edit2 size={14} /></button>
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
            </div>
          ))}
          {store.data.debts.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin deudas registradas</p>}
        </div>
      </div>

      {/* Debt Payment Modal */}
      <AnimatePresence>
        {showPaymentModal && selectedDebt && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pagar Deuda</h3>
                <button onClick={() => setShowPaymentModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <p className="text-sm text-slate-400 mb-2">{selectedDebt.name} - Restante: {formatCurrency(selectedDebt.totalAmount - selectedDebt.paidAmount)}</p>
              <p className="text-xs text-blue-400 mb-4">Pagos realizados: {selectedDebt.paymentsMade}/{selectedDebt.totalPayments || '?'}</p>
              
              <input type="number" placeholder="Monto a pagar" value={paymentAmount} onChange={e => setPaymentAmount(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm mb-4" />
              
              {/* Photo Upload */}
              <div className="mb-4">
                <button
                  onClick={() => photoRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm hover:bg-slate-600/50"
                >
                  <Camera size={16} /> {paymentPhoto ? 'Cambiar foto' : 'Agregar foto del comprobante'}
                </button>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {paymentPhoto && (
                  <div className="mt-2 relative">
                    <img src={paymentPhoto} alt="Comprobante" className="w-full h-32 object-cover rounded-lg border border-slate-600" />
                    <button
                      onClick={() => setPaymentPhoto('')}
                      className="absolute top-2 right-2 bg-red-500/80 p-1 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mb-3">
                <button onClick={() => handlePayment(selectedDebt, parseFloat(paymentAmount) || 0, false)}
                  className="flex-1 bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-lg text-blue-300 text-sm">Pago Parcial</button>
                <button onClick={() => handlePayment(selectedDebt, 0, true)}
                  className="flex-1 bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-300 text-sm">Pago Total</button>
              </div>
              <button onClick={() => { sharePaymentWhatsApp('Deuda', selectedDebt, parseFloat(paymentAmount) || selectedDebt.monthlyPayment, paymentPhoto); }}
                className="w-full flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-lg text-green-300 text-sm">
                <Share2 size={14} /> Compartir por WhatsApp (Foto)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expense Payment Modal */}
      <AnimatePresence>
        {showExpensePaymentModal && selectedExpense && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 w-full max-w-md">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Pagar Gasto</h3>
                <button onClick={() => setShowExpensePaymentModal(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
              </div>
              <p className="text-sm text-slate-400 mb-4">{selectedExpense.name} - {formatCurrency(selectedExpense.amount)}</p>
              
              {/* Photo Upload */}
              <div className="mb-4">
                <button
                  onClick={() => photoRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm hover:bg-slate-600/50"
                >
                  <Camera size={16} /> {paymentPhoto ? 'Cambiar foto' : 'Agregar foto del comprobante'}
                </button>
                <input ref={photoRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                {paymentPhoto && (
                  <div className="mt-2 relative">
                    <img src={paymentPhoto} alt="Comprobante" className="w-full h-32 object-cover rounded-lg border border-slate-600" />
                    <button
                      onClick={() => setPaymentPhoto('')}
                      className="absolute top-2 right-2 bg-red-500/80 p-1 rounded"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button onClick={() => handleExpensePayment(selectedExpense)}
                className="w-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-300 text-sm mb-3">
                Marcar como Pagado
              </button>
              <button onClick={() => { sharePaymentWhatsApp('Gasto', selectedExpense, selectedExpense.amount, paymentPhoto); }}
                className="w-full flex items-center justify-center gap-2 bg-green-500/20 border border-green-500/30 px-3 py-2 rounded-lg text-green-300 text-sm">
                <Share2 size={14} /> Compartir por WhatsApp (Foto)
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
