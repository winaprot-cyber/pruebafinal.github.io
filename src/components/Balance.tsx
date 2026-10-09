import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PieChart as PieIcon, Plus, Edit2, Trash2, CreditCard, Share2, TrendingUp, TrendingDown, DollarSign, X } from 'lucide-react';
import { formatCurrency, generateId, calculateBonuses, calculateDiscounts, calculateBaseIngreso, calculateSpecialDiscounts, calculateSpecialBonuses } from '../utils/calculations';
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
  const [expenseCategory, setExpenseCategory] = useState('alimenticios');
  const [expenseFrequency, setExpenseFrequency] = useState<'monthly' | 'weekly' | 'annual' | 'once'>('monthly');

  const [debtName, setDebtName] = useState('');
  const [debtTotal, setDebtTotal] = useState('');
  const [debtMonthly, setDebtMonthly] = useState('');
  const [debtType, setDebtType] = useState('personal');

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
    store.addDebt({ name: debtName, totalAmount: parseFloat(debtTotal) || 0, monthlyPayment: parseFloat(debtMonthly) || 0, type: debtType, frequency: 'monthly', paidAmount: 0, progress: 0, paymentsMade: 0 });
    setDebtName(''); setDebtTotal(''); setDebtMonthly(''); setShowDebtForm(false);
  };

  const openPaymentModal = (item: any, type: 'expense' | 'debt') => {
    setSelectedItem(item);
    setItemType(type);
    setShowPaymentModal(true);
  };

  const handlePayment = (amount: number, isFull: boolean, photo?: string) => {
    if (!selectedItem) return;

    if (itemType === 'expense') {
      // Para gastos, actualizar paidAmount y originalAmount
      const currentPaid = selectedItem.paidAmount || 0;
      const originalAmount = selectedItem.originalAmount || selectedItem.amount;
      const newPaid = currentPaid + amount;
      
      store.updateExpense(selectedItem.id, {
        paidAmount: newPaid,
        originalAmount: originalAmount,
        amount: isFull ? 0 : Math.max(0, selectedItem.amount - amount),
      });
    } else if (itemType === 'debt') {
      // Para deudas, actualizar paidAmount y progress
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
    alimenticios: '🍽️ Alimenticios', servicios: '📱 Servicios', luz: '💡 Luz/Internet', agua: '💧 Agua', transporte: '🚗 Transporte', academicos: '📚 Académicos', otros: '📦 Otros',
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
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-emerald-300">Neto a Recibir</p>
          <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(netMonthly)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-gradient-to-br from-orange-500/20 to-orange-600/10 border border-orange-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-orange-300">Gastos Mensuales</p>
          <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-red-300">Deudas Global</p>
          <p className="text-lg md:text-2xl font-bold text-white">{formatCurrency(totalDebtsRemaining)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-3 md:p-4">
          <p className="text-xs text-blue-300">Balance Personal</p>
          <p className={`text-lg md:text-2xl font-bold ${netMonthly >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>{formatCurrency(netMonthly)}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
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

      {/* Income Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-emerald-400 flex items-center gap-2"><TrendingUp size={20} /> Ingresos</h3>
          <button onClick={() => setShowIncomeForm(true)} className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-2 md:px-3 py-1 rounded-lg text-emerald-300 text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showIncomeForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <input placeholder="Nombre" value={incomeName} onChange={e => setIncomeName(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" placeholder="Monto" value={incomeAmount} onChange={e => setIncomeAmount(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveIncome} className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded text-emerald-300 text-sm">Guardar</button>
                  <button onClick={() => setShowIncomeForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-2">
          {incomes.map(inc => (
            <div key={inc.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 md:px-4 py-2">
              <div>
                <p className="text-sm text-white">{inc.name}</p>
                <p className="text-xs text-slate-400">{formatCurrency(inc.amount)} • {inc.type}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => store.removeIncome(inc.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Ingreso', inc)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
              </div>
            </div>
          ))}
          {incomes.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin ingresos adicionales</p>}
        </div>
      </div>

      {/* Expenses Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-orange-400 flex items-center gap-2"><TrendingDown size={20} /> Gastos</h3>
          <button onClick={() => setShowExpenseForm(true)} className="flex items-center gap-1 bg-orange-500/20 border border-orange-500/30 px-2 md:px-3 py-1 rounded-lg text-orange-300 text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showExpenseForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <input placeholder="Nombre" value={expenseName} onChange={e => setExpenseName(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" placeholder="Monto" value={expenseAmount} onChange={e => setExpenseAmount(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveExpense} className="bg-orange-500/20 border border-orange-500/30 px-3 py-1 rounded text-orange-300 text-sm">Guardar</button>
                  <button onClick={() => setShowExpenseForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
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
              <div key={exp.id} className="bg-slate-700/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm text-white">{categoryLabels[exp.category] || exp.name}</p>
                    <p className="text-xs text-slate-400">
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
                      <button onClick={() => openPaymentModal(exp, 'expense')} className="bg-orange-500/20 border border-orange-500/30 px-2 py-1 rounded text-orange-300 text-xs">Pagar</button>
                    )}
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
            );
          })}
          {expenses.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin gastos registrados</p>}
        </div>
      </div>

      {/* Debts Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-red-400 flex items-center gap-2"><CreditCard size={20} /> Deudas</h3>
          <button onClick={() => setShowDebtForm(true)} className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-2 md:px-3 py-1 rounded-lg text-red-300 text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        <AnimatePresence>
          {showDebtForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <input placeholder="Nombre" value={debtName} onChange={e => setDebtName(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" placeholder="Monto total" value={debtTotal} onChange={e => setDebtTotal(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                <input type="number" placeholder="Pago mensual" value={debtMonthly} onChange={e => setDebtMonthly(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveDebt} className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded text-red-300 text-sm">Guardar</button>
                  <button onClick={() => setShowDebtForm(false)} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <div className="space-y-3">
          {debts.map(debt => {
            const isFullyPaid = debt.progress >= 100;

            return (
              <div key={debt.id} className="bg-slate-700/30 rounded-lg p-3 md:p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">{debt.name}</p>
                    <p className="text-xs text-slate-400">
                      {debt.type} • {formatCurrency(debt.monthlyPayment)}/mes
                      {debt.paymentsMade > 0 && (
                        <span className="ml-2 text-blue-400">
                          • {debt.paymentsMade} pagos realizados
                        </span>
                      )}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    {!isFullyPaid && (
                      <button onClick={() => openPaymentModal(debt, 'debt')} className="bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300 text-xs">Pagar</button>
                    )}
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
                <div className="flex justify-between text-xs text-slate-500 mt-1">
                  <span>Pagado: {formatCurrency(debt.paidAmount)}</span>
                  <span>Restante: {formatCurrency(debt.totalAmount - debt.paidAmount)}</span>
                </div>
              </div>
            );
          })}
          {debts.length === 0 && <p className="text-slate-500 text-sm text-center py-2">Sin deudas registradas</p>}
        </div>
      </div>

      {/* Payment Modal */}
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
