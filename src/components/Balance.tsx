import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, Plus, Trash2, CreditCard, Share2, TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { formatCurrency, calculateBonuses, calculateDiscounts, calculateBaseIngreso, calculateSpecialDiscounts, calculateSpecialBonuses } from '../utils/calculations';
import { shareAsImageWhatsApp } from '../utils/shareImage';
import type { useStore } from '../store/useStore';
import type { Income, Expense, Debt } from '../types';
import PaymentModal from './PaymentModal';

export default function Balance({ store }: { store: ReturnType<typeof useStore> }) {
  const [showIncomeForm, setShowIncomeForm] = useState(false);
  const [showExpenseForm, setShowExpenseForm] = useState(false);
  const [showDebtForm, setShowDebtForm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState<'expense' | 'debt'>('expense');

  const [incomeName, setIncomeName] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeType, setIncomeType] = useState<'fixed' | 'extra' | 'variable'>('fixed');

  const [expenseName, setExpenseName] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseCategory, setExpenseCategory] = useState('servicios_basicos');
  const [expenseFrequency, setExpenseFrequency] = useState<'monthly' | 'weekly' | 'annual' | 'once'>('monthly');

  const [debtName, setDebtName] = useState('');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');
  const [debtType, setDebtType] = useState('quirografario');
  const [debtAmortization, setDebtAmortization] = useState<'frances' | 'alemana'>('frances');
  const [debtMonths, setDebtMonths] = useState('');
  const [debtInterestRate, setDebtInterestRate] = useState('');

  const base = store.getSalaryConfig().baseSalary;
  const { iessAporteActive, saludConyugeActive, fondosReservaActive } = store.getSalaryConfig();
  const bonuses = store.getUserBonuses();
  const discounts = store.getUserDiscounts();
  const incomes = store.getUserIncomes();
  const expenses = store.getUserExpenses();
  const debts = store.getUserDebts();

  const totalIncome = incomes.reduce((s, i) => s + i.amount, 0);
  const totalExpenses = expenses.reduce((s, e) => {
    if (e.frequency === 'weekly') return s + e.amount * 4;
    if (e.frequency === 'annual') return s + e.amount / 12;
    return s + e.amount;
  }, 0);
  const totalDebtPayments = debts.reduce((s, d) => s + d.monthlyPayment, 0);
  const totalDebtsRemaining = debts.reduce((s, d) => s + (d.totalAmount - d.paidAmount), 0);

  const baseIngreso = calculateBaseIngreso(base, 0);
  const specialDiscounts = calculateSpecialDiscounts(baseIngreso);
  const specialBonuses = calculateSpecialBonuses(baseIngreso);
  const iessAmount = iessAporteActive ? specialDiscounts.iessAporte : 0;
  const saludAmount = saludConyugeActive ? specialDiscounts.saludConyuge : 0;
  const fondosAmount = fondosReservaActive ? specialBonuses.fondosReserva : 0;
  const totalBonuses = calculateBonuses(bonuses, base);
  const totalDiscounts = calculateDiscounts(discounts, base);

  const netMonthly = base + totalBonuses + fondosAmount - totalDiscounts - iessAmount - saludAmount + totalIncome - totalExpenses - totalDebtPayments;

  const handleSaveIncome = () => {
    if (!incomeName) return;
    store.addIncome({ name: incomeName, amount: parseFloat(incomeAmount) || 0, fixed: incomeType === 'fixed', forMonthEnd: false, type: incomeType });
    setIncomeName(''); setIncomeAmount(''); setShowIncomeForm(false);
  };

  const handleSaveExpense = () => {
    if (!expenseName) return;
    store.addExpense({ name: expenseName, amount: parseFloat(expenseAmount) || 0, category: expenseCategory, frequency: expenseFrequency });
    setExpenseName(''); setExpenseAmount(''); setShowExpenseForm(false);
  };

  const handleSaveDebt = () => {
    if (!debtName) return;
    store.addDebt({ 
      name: debtName, 
      totalAmount: parseFloat(debtTotal) || 0, 
      monthlyPayment: parseFloat(debtMonthly) || 0, 
      type: debtType, 
      frequency: 'monthly', 
      paidAmount: 0, 
      progress: 0, 
      paymentsMade: 0,
      amortizationType: debtAmortization,
      interestRate: parseFloat(debtInterestRate) || 0,
      totalMonths: parseInt(debtMonths) || 0,
    });
    setDebtName(''); setDebtTotal(''); setDebtMonthly(''); setDebtMonths(''); setDebtInterestRate(''); setShowDebtForm(false);
  };

  const openPaymentModal = (item: any, type: 'expense' | 'debt') => {
    setSelectedItem(item);
    setItemType(type);
    setShowPaymentModal(true);
  };

  const handlePayment = (amount: number, isFull: boolean, photo?: string) => {
    if (!selectedItem) return;

    if (itemType === 'expense') {
      const currentPaid = selectedItem.paidAmount || 0;
      const originalAmount = selectedItem.originalAmount || selectedItem.amount;
      const newPaid = currentPaid + amount;
      
      store.updateExpense(selectedItem.id, {
        paidAmount: newPaid,
        originalAmount: originalAmount,
        amount: isFull ? 0 : Math.max(0, selectedItem.amount - amount),
      });
    } else if (itemType === 'debt') {
      const newPaid = selectedItem.paidAmount + amount;
      const progress = (newPaid / selectedItem.totalAmount) * 100;
      const newPaymentsMade = (selectedItem.paymentsMade || 0) + 1;

      store.updateDebt(selectedItem.id, {
        paidAmount: newPaid,
        progress,
        paymentsMade: newPaymentsMade,
      });
    }
  };

  const shareWhatsApp = async (type: string, itemData: any) => {
    const receiptData = {
      title: 'Control Biométrico',
      subtitle: type,
      color: '#ef4444',
      fields: [{ label: 'Nombre:', value: itemData.name }, { label: 'Monto:', value: formatCurrency(itemData.amount), highlight: true }],
      footer: 'by Hugo León',
    };
    await shareAsImageWhatsApp(receiptData, `${type.toLowerCase()}-${itemData.name}`);
  };

  const categoryLabels: Record<string, string> = {
    servicios_basicos: '💡 Servicios Básicos',
    alimenticios: '🍽️ Alimenticios',
    electrodomesticos: '🔌 Electrodomésticos',
    transporte: '🚗 Transporte',
    salud: '🏥 Salud',
    educacion: '📚 Educación',
    entretenimiento: '🎬 Entretenimiento',
    ropa: '👕 Ropa',
    hogar: '🏠 Hogar',
    servicios: '📱 Servicios (Internet/Teléfono)',
    agua: '💧 Agua',
    luz: '💡 Luz',
    academicos: '📚 Académicos',
    otros: '📦 Otros',
  };

  const pieData = [
    { name: 'Ingresos', value: base + totalBonuses + totalIncome, color: '#10b981' },
    { name: 'Descuentos', value: totalDiscounts, color: '#ef4444' },
    { name: 'Gastos', value: totalExpenses, color: '#f59e0b' },
    { name: 'Deudas', value: totalDebtPayments, color: '#8b5cf6' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="card-elevated rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
          <PieIcon size={24} className="text-purple-400" />
          Balance Personal
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-emerald-300">Neto a Recibir</p>
          <p className="text-lg md:text-2xl font-bold text-white mt-1">{formatCurrency(netMonthly)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-orange-300">Gastos Mensuales</p>
          <p className="text-lg md:text-2xl font-bold text-white mt-1">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-red-300">Deudas Global</p>
          <p className="text-lg md:text-2xl font-bold text-white mt-1">{formatCurrency(totalDebtsRemaining)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-blue-300">Balance Personal</p>
          <p className={`text-lg md:text-2xl font-bold mt-1 ${netMonthly >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(netMonthly)}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="card-solid rounded-xl p-4 md:p-6">
          <h3 className="text-sm font-semibold mb-4 text-slate-300">Distribución Mensual</h3>
          <div className="h-48 md:h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {pieData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="card-solid rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-emerald-400 flex items-center gap-2"><TrendingUp size={20} /> Ingresos</h3>
          <button onClick={() => setShowIncomeForm(true)} className="btn-secondary flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showIncomeForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/80 rounded-lg p-4 space-y-3 border border-slate-600/50">
                <input placeholder="Nombre" value={incomeName} onChange={e => setIncomeName(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Monto" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveIncome} className="btn-primary flex-1 px-3 py-2 rounded text-sm">Guardar</button>
                  <button onClick={() => setShowIncomeForm(false)} className="btn-secondary flex-1 px-3 py-2 rounded text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          {incomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between bg-slate-700/80 rounded-lg px-3 md:px-4 py-2 border border-slate-600/50">
              <div>
                <p className="text-sm text-white">{inc.name}</p>
                <p className="text-xs text-slate-300">{formatCurrency(inc.amount)} • {inc.type}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => store.removeIncome(inc.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Ingreso', inc)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
              </div>
            </div>
          ))}
          {incomes.length === 0 && <p className="text-slate-400 text-sm text-center py-2">Sin ingresos adicionales</p>}
        </div>
      </div>

      <div className="card-solid rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-orange-400 flex items-center gap-2"><TrendingDown size={20} /> Gastos</h3>
          <button onClick={() => setShowExpenseForm(true)} className="btn-secondary flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showExpenseForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/80 rounded-lg p-4 space-y-3 border border-slate-600/50">
                <input placeholder="Nombre" value={expenseName} onChange={e => setExpenseName(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Monto" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <select value={expenseCategory} onChange={e => setExpenseCategory(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm">
                  <optgroup label="Servicios">
                    <option value="servicios_basicos">💡 Servicios Básicos</option>
                    <option value="luz">💡 Luz</option>
                    <option value="agua">💧 Agua</option>
                    <option value="servicios">📱 Internet/Teléfono</option>
                  </optgroup>
                  <optgroup label="Hogar">
                    <option value="alimenticios">🍽️ Alimenticios</option>
                    <option value="electrodomesticos">🔌 Electrodomésticos</option>
                    <option value="hogar">🏠 Hogar</option>
                  </optgroup>
                  <optgroup label="Personal">
                    <option value="transporte">🚗 Transporte</option>
                    <option value="salud">🏥 Salud</option>
                    <option value="educacion">📚 Educación</option>
                    <option value="entretenimiento">🎬 Entretenimiento</option>
                    <option value="ropa">👕 Ropa</option>
                  </optgroup>
                  <optgroup label="Otros">
                    <option value="academicos">📚 Académicos</option>
                    <option value="otros">📦 Otros</option>
                  </optgroup>
                </select>
                <select value={expenseFrequency} onChange={e => setExpenseFrequency(e.target.value as any)} className="input-solid w-full rounded-lg px-3 py-2 text-sm">
                  <option value="monthly">Mensual</option>
                  <option value="weekly">Semanal</option>
                  <option value="annual">Anual</option>
                  <option value="once">Único</option>
                </select>
                <div className="flex gap-2">
                  <button onClick={handleSaveExpense} className="btn-primary flex-1 px-3 py-2 rounded text-sm">Guardar</button>
                  <button onClick={() => setShowExpenseForm(false)} className="btn-secondary flex-1 px-3 py-2 rounded text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          {expenses.map(exp => {
            const originalAmount = exp.originalAmount || exp.amount;
            const paidAmount = exp.paidAmount || 0;
            const paidPercentage = originalAmount > 0 ? (paidAmount / originalAmount) * 100 : 0;
            const isFullyPaid = paidPercentage >= 100;

            return (
              <div key={exp.id} className="bg-slate-700/80 rounded-lg p-3 md:p-4 border border-slate-600/50">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-white">{categoryLabels[exp.category] || exp.name}</p>
                    <p className="text-xs text-slate-300">
                      {isFullyPaid ? (
                        <span className="text-emerald-400 font-semibold">✓ Pagado completamente</span>
                      ) : (
                        <>
                          Restante: {formatCurrency(exp.amount)} • {exp.frequency}
                        </>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isFullyPaid && (
                      <button onClick={() => openPaymentModal(exp, 'expense')} className="btn-secondary px-2 py-1 rounded text-xs">Pagar</button>
                    )}
                    <button onClick={() => store.removeExpense(exp.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    <button onClick={() => shareWhatsApp('Gasto', exp)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
                  </div>
                </div>
                
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
            );
          })}
          {expenses.length === 0 && <p className="text-slate-400 text-sm text-center py-2">Sin gastos registrados</p>}
        </div>
      </div>

      <div className="card-solid rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-red-400 flex items-center gap-2"><CreditCard size={20} /> Deudas</h3>
          <button onClick={() => setShowDebtForm(true)} className="btn-secondary flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showDebtForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/80 rounded-lg p-4 space-y-3 border border-slate-600/50">
                <input placeholder="Nombre" value={debtName} onChange={e => setDebtName(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <select value={debtType} onChange={e => setDebtType(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm">
                  <option value="quirografario">💳 Préstamo Quirografario</option>
                  <option value="hipotecario">🏠 Préstamo Hipotecario</option>
                  <option value="vehicular">🚗 Préstamo Vehicular</option>
                  <option value="tarjeta">💳 Tarjeta de Crédito</option>
                  <option value="electrodomestico">🔌 Electrodoméstico</option>
                  <option value="personal">👤 Préstamo Personal</option>
                  <option value="otro">📦 Otro</option>
                </select>
                <input type="number" placeholder="Monto total" value={debtTotal} onChange={e => setDebtTotal(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Pago mensual" value={debtMonthly} onChange={e => setDebtMonthly(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveDebt} className="btn-primary flex-1 px-3 py-2 rounded text-sm">Guardar</button>
                  <button onClick={() => setShowDebtForm(false)} className="btn-secondary flex-1 px-3 py-2 rounded text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-3">
          {debts.map(debt => {
            const isFullyPaid = debt.progress >= 100;
            const remainingPayments = (debt.totalMonths || 0) - (debt.paymentsMade || 0);

            return (
              <div key={debt.id} className="bg-slate-700/80 rounded-lg p-3 md:p-4 border border-slate-600/50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-semibold text-white">{debt.name}</p>
                      {debt.amortizationType && (
                        <span className={`text-xs px-2 py-0.5 rounded ${
                          debt.amortizationType === 'frances' 
                            ? 'bg-blue-500/20 text-blue-300' 
                            : 'bg-purple-500/20 text-purple-300'
                        }`}>
                          {debt.amortizationType === 'frances' ? 'Francesa' : 'Alemana'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-slate-300">
                      {debt.type === 'quirografario' && '💳'}
                      {debt.type === 'hipotecario' && '🏠'}
                      {debt.type === 'vehicular' && '🚗'}
                      {debt.type === 'tarjeta' && '💳'}
                      {debt.type === 'electrodomestico' && '🔌'}
                      {debt.type === 'personal' && '👤'}
                      {debt.type === 'otro' && '📦'}
                      {' '}{debt.type}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isFullyPaid && (
                      <button onClick={() => openPaymentModal(debt, 'debt')} className="btn-secondary px-3 py-1 rounded text-xs">Pagar</button>
                    )}
                    <button onClick={() => store.removeDebt(debt.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    <button onClick={() => shareWhatsApp('Deuda', debt)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
                  </div>
                </div>

                {/* Información detallada */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-3 text-xs">
                  <div className="bg-slate-800/50 rounded p-2">
                    <p className="text-slate-400">Total</p>
                    <p className="text-white font-semibold">{formatCurrency(debt.totalAmount)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <p className="text-slate-400">Cuota Mensual</p>
                    <p className="text-white font-semibold">{formatCurrency(debt.monthlyPayment)}</p>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <p className="text-slate-400">Plazo</p>
                    <p className="text-white font-semibold">{debt.totalMonths || '?'} meses</p>
                  </div>
                  <div className="bg-slate-800/50 rounded p-2">
                    <p className="text-slate-400">Tasa Interés</p>
                    <p className="text-white font-semibold">{debt.interestRate || 0}% anual</p>
                  </div>
                </div>

                {/* Progreso */}
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Pagos: {debt.paymentsMade || 0} de {debt.totalMonths || '?'}</span>
                    <span className={debt.progress >= 100 ? 'text-emerald-400 font-semibold' : ''}>
                      {debt.progress.toFixed(0)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-600 rounded-full h-2">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${debt.progress}%` }} 
                      className={`h-2 rounded-full ${
                        debt.progress >= 100 
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400' 
                          : 'bg-gradient-to-r from-blue-500 to-emerald-500'
                      }`} 
                    />
                  </div>
                </div>

                {/* Resumen financiero */}
                <div className="flex justify-between text-xs pt-2 border-t border-slate-600/50">
                  <div>
                    <span className="text-slate-400">Pagado: </span>
                    <span className="text-emerald-400 font-semibold">{formatCurrency(debt.paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Restante: </span>
                    <span className="text-red-400 font-semibold">{formatCurrency(debt.totalAmount - debt.paidAmount)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Faltan: </span>
                    <span className="text-blue-400 font-semibold">{remainingPayments} pagos</span>
                  </div>
                </div>
              </div>
            );
          })}
          {debts.length === 0 && <p className="text-slate-400 text-sm text-center py-2">Sin deudas registradas</p>}
        </div>
      </div>

      {showPaymentModal && selectedItem && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedItem(null);
          }}
          title={itemType === 'expense' ? 'Pagar Gasto' : 'Pagar Deuda'}
          itemName={selectedItem.name}
          totalAmount={itemType === 'expense' ? (selectedItem.originalAmount || selectedItem.amount) : selectedItem.totalAmount}
          paidAmount={itemType === 'expense' ? (selectedItem.paidAmount || 0) : selectedItem.paidAmount}
          onPayment={handlePayment}
          type={itemType}
        />
      )}
    </div>
  );
}
