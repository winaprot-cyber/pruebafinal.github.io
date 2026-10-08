import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, X, ChevronDown, ChevronUp, Check, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';

interface FloatingPaymentsButtonProps {
  store: ReturnType<typeof useStore>;
}

export default function FloatingPaymentsButton({ store }: FloatingPaymentsButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showExpensePayment, setShowExpensePayment] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<any>(null);
  const [expensePaymentAmount, setExpensePaymentAmount] = useState('');

  const activeDebts = store.data.debts.filter(d => d.totalAmount - d.paidAmount > 0);
  const totalDebtRemaining = activeDebts.reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);
  const monthlyDebtPayments = activeDebts.reduce((sum, d) => sum + d.monthlyPayment, 0);

  // Gastos mensuales
  const monthlyExpenses = store.data.expenses.filter(e => e.frequency === 'monthly' || e.frequency === 'weekly');
  const totalMonthlyExpenses = monthlyExpenses.reduce((sum, e) => {
    if (e.frequency === 'weekly') return sum + e.amount * 4;
    return sum + e.amount;
  }, 0);

  const handleQuickPayment = (debtId: string, amount: number) => {
    const debt = store.data.debts.find(d => d.id === debtId);
    if (!debt) return;

    const newPaid = debt.paidAmount + amount;
    const progress = (newPaid / debt.totalAmount) * 100;
    const newPaymentsMade = (debt.paymentsMade || 0) + 1;

    store.updateDebt(debtId, {
      paidAmount: newPaid,
      progress,
      paymentsMade: newPaymentsMade,
    });
  };

  const openExpensePayment = (expense: any) => {
    setSelectedExpense(expense);
    setExpensePaymentAmount(expense.amount.toString());
    setShowExpensePayment(true);
  };

  const handleExpensePayment = (expenseId: string, amount: number, isFull: boolean) => {
    const expense = store.data.expenses.find(e => e.id === expenseId);
    if (!expense) return;

    if (isFull) {
      // Pago total - eliminar el gasto
      store.removeExpense(expenseId);
    } else {
      // Abono parcial - reducir el monto
      const newAmount = expense.amount - amount;
      if (newAmount <= 0) {
        store.removeExpense(expenseId);
      } else {
        store.updateExpense(expenseId, { amount: newAmount });
      }
    }
    setShowExpensePayment(false);
    setSelectedExpense(null);
    setExpensePaymentAmount('');
  };

  const totalItems = activeDebts.length + monthlyExpenses.length;
  if (totalItems === 0) return null;

  return (
    <>
      {/* Floating Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-full p-4 shadow-2xl flex items-center gap-2"
      >
        <CreditCard size={24} />
        <span className="font-bold hidden sm:inline">Pagos</span>
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">
          {totalItems}
        </span>
      </motion.button>

      {/* Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
            onClick={() => setIsOpen(false)}
          >
            <motion.div
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-2xl w-full sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <CreditCard size={20} className="text-blue-400" />
                    Pagos Pendientes
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Deudas: <span className="text-red-400 font-bold">{formatCurrency(totalDebtRemaining)}</span>
                  </p>
                  <p className="text-xs text-slate-400">
                    Gastos mensuales: <span className="text-orange-400 font-bold">{formatCurrency(totalMonthlyExpenses)}</span>
                  </p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white p-2"
                >
                  <X size={24} />
                </button>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {/* Deudas */}
                {activeDebts.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-red-400 mb-2 flex items-center gap-2">
                      <CreditCard size={16} />
                      Deudas ({activeDebts.length})
                    </h4>
                    <div className="space-y-3">
                      {activeDebts.map(debt => (
                        <div key={debt.id} className="bg-slate-700/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{debt.name}</p>
                              <p className="text-xs text-slate-400">{debt.type}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-red-400">
                                {formatCurrency(debt.totalAmount - debt.paidAmount)}
                              </p>
                              <p className="text-xs text-slate-500">
                                {debt.paymentsMade || 0}/{debt.totalPayments || '?'} pagos
                              </p>
                            </div>
                          </div>

                          {/* Progress Bar */}
                          <div className="mb-3">
                            <div className="flex justify-between text-xs text-slate-400 mb-1">
                              <span>{debt.progress.toFixed(0)}% pagado</span>
                              <span>{formatCurrency(debt.paidAmount)} / {formatCurrency(debt.totalAmount)}</span>
                            </div>
                            <div className="w-full bg-slate-600 rounded-full h-2">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${debt.progress}%` }}
                                className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full"
                              />
                            </div>
                          </div>

                          {/* Quick Payment Buttons */}
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleQuickPayment(debt.id, debt.monthlyPayment)}
                              className="flex-1 bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-lg text-blue-300 text-xs hover:bg-blue-500/30 transition"
                            >
                              Abono: {formatCurrency(debt.monthlyPayment)}
                            </button>
                            <button
                              onClick={() => handleQuickPayment(debt.id, debt.totalAmount - debt.paidAmount)}
                              className="flex-1 bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-300 text-xs hover:bg-emerald-500/30 transition"
                            >
                              <Check size={12} className="inline mr-1" />
                              Pagar Total
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Gastos Mensuales */}
                {monthlyExpenses.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-orange-400 mb-2 flex items-center gap-2">
                      <DollarSign size={16} />
                      Gastos Mensuales ({monthlyExpenses.length})
                    </h4>
                    <div className="space-y-3">
                      {monthlyExpenses.map(expense => (
                        <div key={expense.id} className="bg-slate-700/30 rounded-lg p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-white">{expense.name}</p>
                              <p className="text-xs text-slate-400">{expense.category} • {expense.frequency}</p>
                            </div>
                            <p className="text-sm font-bold text-orange-400">
                              {formatCurrency(expense.amount)}
                            </p>
                          </div>
                          
                          {/* Botón de Pago */}
                          <button
                            onClick={() => openExpensePayment(expense)}
                            className="w-full bg-orange-500/20 border border-orange-500/30 px-3 py-2 rounded-lg text-orange-300 text-xs hover:bg-orange-500/30 transition"
                          >
                            Pagar Gasto
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modal de Pago de Gastos */}
      <AnimatePresence>
        {showExpensePayment && selectedExpense && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4"
            onClick={() => setShowExpensePayment(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-800 border border-slate-700 rounded-2xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Pagar Gasto</h3>
                <button
                  onClick={() => setShowExpensePayment(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
                <p className="text-sm font-medium text-white mb-1">{selectedExpense.name}</p>
                <p className="text-xs text-slate-400 mb-2">{selectedExpense.category} • {selectedExpense.frequency}</p>
                <p className="text-lg font-bold text-orange-400">{formatCurrency(selectedExpense.amount)}</p>
              </div>

              <div className="mb-4">
                <label className="text-sm text-slate-400 block mb-2">Monto a pagar</label>
                <input
                  type="number"
                  value={expensePaymentAmount}
                  onChange={(e) => setExpensePaymentAmount(e.target.value)}
                  className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                  placeholder="0.00"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleExpensePayment(selectedExpense.id, parseFloat(expensePaymentAmount) || 0, false)}
                  className="flex-1 bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-lg text-blue-300 text-sm hover:bg-blue-500/30 transition"
                >
                  Abonar
                </button>
                <button
                  onClick={() => handleExpensePayment(selectedExpense.id, selectedExpense.amount, true)}
                  className="flex-1 bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-300 text-sm hover:bg-emerald-500/30 transition"
                >
                  <Check size={14} className="inline mr-1" />
                  Pagar Total
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
