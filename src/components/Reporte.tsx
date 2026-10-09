import { useState } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingDown, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, parseISO, startOfMonth, endOfMonth, eachWeekOfInterval, addWeeks, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { applyRule45h, formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';

type Period = 'weekly' | 'monthly' | 'quarterly';

export default function Reporte({ store }: { store: ReturnType<typeof useStore> }) {
  const [period, setPeriod] = useState<Period>('weekly');
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const selectedMonth = addWeeks(startOfMonth(today), monthOffset * 4);
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const allWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const selectedWeeks = store.data.selectedWeeks;
  const weeks = selectedWeeks.length > 0 ? allWeeks.filter((weekStart, i) => selectedWeeks.includes(i)) : allWeeks;

  const weeklyData = weeks.map((weekStart, i) => {
    const rule = applyRule45h(store.getUserTimeEntries(), store.getUserHolidays(), weekStart);
    const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
    return { name: `Sem ${weekNumber}`, horas: rule.weekdayHours, extra50: rule.totalExtra50, extra100: rule.totalExtra100, feriados: rule.holidayHours, total: rule.weekdayHours + rule.totalExtra };
  });

  const monthlyHours = selectedWeeks.length > 0
    ? weeks.reduce((sum, w) => { const rule = applyRule45h(store.getUserTimeEntries(), store.getUserHolidays(), w); return sum + rule.weekdayHours + rule.totalExtra; }, 0)
    : store.getUserTimeEntries().filter(e => { const d = parseISO(e.date); return d >= monthStart && d <= monthEnd; }).reduce((sum, e) => sum + e.hours, 0);

  const monthlyOvertime = weeks.reduce((sum, w) => { const rule = applyRule45h(store.getUserTimeEntries(), store.getUserHolidays(), w); return sum + rule.totalExtra; }, 0);

  const quarterlyData = Array.from({ length: 3 }, (_, i) => {
    const month = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 2 + i, 1);
    const mStart = startOfMonth(month);
    const mEnd = endOfMonth(month);
    const hours = store.getUserTimeEntries().filter(e => { const d = parseISO(e.date); return d >= mStart && d <= mEnd; }).reduce((sum, e) => sum + e.hours, 0);
    return { name: format(month, 'MMM', { locale: es }), horas: hours };
  });

  const totalDebts = store.getUserDebts().reduce((sum, d) => sum + (d.totalAmount - d.paidAmount), 0);
  const monthlyDebtPayments = store.getUserDebts().reduce((sum, d) => sum + d.monthlyPayment, 0);

  const pieData = [
    { name: 'Horas Regulares', value: monthlyHours - monthlyOvertime, color: '#3b82f6' },
    { name: 'Horas Extra', value: monthlyOvertime, color: '#f59e0b' },
    { name: 'Deudas Pendientes', value: totalDebts, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <FileText size={24} className="text-blue-400" />
          Reporte de Marcación
        </h2>
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setMonthOffset(o => o - 1)} className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs hover:bg-slate-600/50">← Mes ant.</button>
          <button onClick={() => setMonthOffset(0)} className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs hover:bg-slate-600/50">Actual</button>
          <button onClick={() => setMonthOffset(o => o + 1)} className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs hover:bg-slate-600/50">Mes sig. →</button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1">
          {(['weekly', 'monthly', 'quarterly'] as Period[]).map(p => (
            <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition ${period === p ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30' : 'bg-slate-700/30 text-slate-400 hover:text-white'}`}>
              {p === 'weekly' ? 'Semanal' : p === 'monthly' ? 'Mensual' : 'Trimestral'}
            </button>
          ))}
        </div>
        {selectedWeeks.length > 0 && (
          <div className="text-xs text-blue-400 bg-blue-500/10 border border-blue-500/30 rounded-lg px-3 py-1.5">
            Mostrando {selectedWeeks.length} semana(s) seleccionada(s) en Pagos
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-400">Total Horas Mes</p>
          <p className="text-xl md:text-2xl font-bold text-white">{monthlyHours.toFixed(1)}h</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-400">Horas Extra Mes</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-400">{monthlyOvertime.toFixed(1)}h</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-400">Deudas Pendientes</p>
          <p className="text-xl md:text-2xl font-bold text-red-400">{formatCurrency(totalDebts)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-400">Pago Mensual Deudas</p>
          <p className="text-xl md:text-2xl font-bold text-orange-400">{formatCurrency(monthlyDebtPayments)}</p>
        </motion.div>
      </div>

      {period === 'weekly' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Balance Semanal - {format(selectedMonth, 'MMMM yyyy', { locale: es })}</h3>
          <div className="h-56 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                <Bar dataKey="horas" stackId="a" fill="#3b82f6" name="Horas Regulares" />
                <Bar dataKey="extra50" stackId="a" fill="#f59e0b" name="Extra 50%" />
                <Bar dataKey="extra100" stackId="a" fill="#ef4444" name="Extra 100%" />
                <Bar dataKey="feriados" stackId="a" fill="#10b981" name="Feriados" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      {period === 'monthly' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Resumen Mensual</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                  <YAxis stroke="#94a3b8" fontSize={12} />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                  <Bar dataKey="total" fill="#8b5cf6" name="Total Horas" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="h-56 md:h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                    {pieData.map((entry, index) => <Cell key={index} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </motion.div>
      )}

      {period === 'quarterly' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">Resumen Trimestral</h3>
          <div className="h-56 md:h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={quarterlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
                <Bar dataKey="horas" fill="#06b6d4" name="Horas Totales" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      )}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingDown size={20} className="text-red-400" />
          Gastos y Deudas Pendientes
        </h3>
        <div className="space-y-3">
          {store.getUserDebts().map(debt => (
            <div key={debt.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3 gap-2">
              <div>
                <p className="text-sm font-medium text-white">{debt.name}</p>
                <p className="text-xs text-slate-400">{debt.type} - {formatCurrency(debt.monthlyPayment)}/mes</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-red-400">{formatCurrency(debt.totalAmount - debt.paidAmount)}</p>
                <div className="w-full sm:w-24 bg-slate-600 rounded-full h-1.5 mt-1">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${debt.progress}%` }} className="bg-red-500 h-1.5 rounded-full" />
                </div>
                <p className="text-xs text-slate-500">{debt.progress.toFixed(0)}% pagado</p>
              </div>
            </div>
          ))}
          {store.getUserDebts().length === 0 && <p className="text-slate-500 text-sm text-center py-4">No hay deudas registradas</p>}
        </div>
      </div>
    </div>
  );
}
