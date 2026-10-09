import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, AlertTriangle, Calendar, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import type { useStore } from '../store/useStore';

interface Alert {
  id: string;
  type: 'month_change' | 'loan_alert' | 'payment_due' | 'rule_alert';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'error';
  date: string;
}

export default function AlarmButton({ store }: { store: ReturnType<typeof useStore> }) {
  const [isOpen, setIsOpen] = useState(false);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [lastCheckedMonth, setLastCheckedMonth] = useState<number>(() => {
    const saved = localStorage.getItem('lastCheckedMonth');
    return saved ? parseInt(saved) : new Date().getMonth();
  });

  useEffect(() => {
    const currentMonth = new Date().getMonth();
    const newAlerts: Alert[] = [];

    if (currentMonth !== lastCheckedMonth) {
      newAlerts.push({
        id: 'month_change',
        type: 'month_change',
        title: 'Nuevo Mes',
        message: `Bienvenido a ${format(new Date(), 'MMMM yyyy', { locale: es })}. Revisa tus pagos y configuración.`,
        severity: 'info',
        date: new Date().toISOString(),
      });
      localStorage.setItem('lastCheckedMonth', currentMonth.toString());
      setLastCheckedMonth(currentMonth);
    }

    store.getUserDiscounts().forEach(discount => {
      if (discount.loanType && discount.totalMonths && discount.paymentsMade) {
        const progress = (discount.paymentsMade / discount.totalMonths) * 100;
        
        if (progress >= 25 && progress < 30) {
          newAlerts.push({
            id: `loan_25_${discount.id}`,
            type: 'loan_alert',
            title: 'Préstamo al 25%',
            message: `"${discount.name}" ha alcanzado el 25% de pago (${discount.paymentsMade}/${discount.totalMonths} cuotas).`,
            severity: 'info',
            date: new Date().toISOString(),
          });
        }

        if (progress >= 50 && progress < 55) {
          newAlerts.push({
            id: `loan_50_${discount.id}`,
            type: 'loan_alert',
            title: 'Préstamo al 50%',
            message: `"${discount.name}" ha alcanzado el 50% de pago (${discount.paymentsMade}/${discount.totalMonths} cuotas).`,
            severity: 'warning',
            date: new Date().toISOString(),
          });
        }

        if (progress >= 75 && progress < 80) {
          newAlerts.push({
            id: `loan_75_${discount.id}`,
            type: 'loan_alert',
            title: 'Préstamo al 75%',
            message: `"${discount.name}" ha alcanzado el 75% de pago (${discount.paymentsMade}/${discount.totalMonths} cuotas). ¡Casi terminas!`,
            severity: 'warning',
            date: new Date().toISOString(),
          });
        }

        if (progress >= 100) {
          newAlerts.push({
            id: `loan_100_${discount.id}`,
            type: 'loan_alert',
            title: 'Préstamo Completado',
            message: `¡Felicidades! "${discount.name}" ha sido completamente pagado.`,
            severity: 'info',
            date: new Date().toISOString(),
          });
        }
      }
    });

    store.getUserDebts().forEach(debt => {
      if (debt.totalAmount - debt.paidAmount > 0) {
        const progress = (debt.paidAmount / debt.totalAmount) * 100;
        
        if (progress >= 90 && progress < 95) {
          newAlerts.push({
            id: `debt_almost_done_${debt.id}`,
            type: 'payment_due',
            title: 'Deuda Casi Pagada',
            message: `"${debt.name}" está al ${progress.toFixed(0)}%. ¡Solo falta un poco!`,
            severity: 'warning',
            date: new Date().toISOString(),
          });
        }
      }
    });

    const timeEntries = store.getUserTimeEntries();
    const currentWeekStart = new Date();
    currentWeekStart.setDate(currentWeekStart.getDate() - currentWeekStart.getDay() + 1);
    
    const weekEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      const diffTime = entryDate.getTime() - currentWeekStart.getTime();
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      return diffDays >= 0 && diffDays < 7;
    });

    const totalHours = weekEntries.reduce((sum, entry) => sum + entry.hours, 0);
    
    if (totalHours > 45) {
      newAlerts.push({
        id: 'rule_45h_exceeded',
        type: 'rule_alert',
        title: 'Regla 45h Superada',
        message: `Has trabajado ${totalHours.toFixed(1)} horas esta semana. Las horas extras se calcularán según la regla 45h.`,
        severity: 'warning',
        date: new Date().toISOString(),
      });
    }

    setAlerts(newAlerts);
  }, [store, lastCheckedMonth]);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'info': return 'bg-blue-500/20 border-blue-500/30 text-blue-300';
      case 'warning': return 'bg-yellow-500/20 border-yellow-500/30 text-yellow-300';
      case 'error': return 'bg-red-500/20 border-red-500/30 text-red-300';
      default: return 'bg-slate-700/30 border-slate-600 text-slate-300';
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'month_change': return <Calendar size={20} />;
      case 'loan_alert': return <TrendingUp size={20} />;
      case 'payment_due': return <TrendingUp size={20} />;
      case 'rule_alert': return <AlertTriangle size={20} />;
      default: return <Bell size={20} />;
    }
  };

  if (alerts.length === 0) return null;

  return (
    <>
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 left-6 z-40 bg-gradient-to-r from-yellow-500 to-orange-500 text-white rounded-full p-4 shadow-2xl flex items-center gap-2"
      >
        <Bell size={24} className={alerts.length > 0 ? 'animate-pulse' : ''} />
        <span className="font-bold hidden sm:inline">Alertas</span>
        <span className="bg-white/20 rounded-full px-2 py-0.5 text-xs font-bold">
          {alerts.length}
        </span>
      </motion.button>

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
              <div className="p-4 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Bell size={20} className="text-yellow-400" />
                    Alertas y Notificaciones
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    {alerts.length} alerta{alerts.length !== 1 ? 's' : ''} activa{alerts.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white p-2">
                  <X size={24} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {alerts.map(alert => (
                  <div key={alert.id} className={`rounded-lg p-4 border ${getSeverityColor(alert.severity)}`}>
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        {getIcon(alert.type)}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm mb-1">{alert.title}</h4>
                        <p className="text-xs opacity-90">{alert.message}</p>
                        <p className="text-xs opacity-60 mt-2">
                          {format(new Date(alert.date), 'dd MMM yyyy, HH:mm', { locale: es })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
