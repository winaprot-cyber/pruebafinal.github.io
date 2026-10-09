import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FileText, TrendingDown, Calendar, Lock } from 'lucide-react';
import { format, startOfWeek, endOfWeek, parseISO, startOfMonth, endOfMonth, eachWeekOfInterval, addWeeks, subMonths, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { applyRule45h, formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';
import type { MonthlyReport } from '../types';

type Period = 'weekly' | 'monthly' | 'quarterly';
type ViewMode = 'current' | 'historical';

export default function Reporte({ store }: { store: ReturnType<typeof useStore> }) {
  const [period, setPeriod] = useState<Period>('weekly');
  const [monthOffset, setMonthOffset] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('current');
  const [selectedHistoricalReport, setSelectedHistoricalReport] = useState<MonthlyReport | null>(null);

  const today = new Date();
  const selectedMonth = addWeeks(startOfMonth(today), monthOffset * 4);
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const allWeeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const selectedWeeks = store.data.selectedWeeks;
  const weeks = selectedWeeks.length > 0 ? allWeeks.filter((weekStart, i) => selectedWeeks.includes(i)) : allWeeks;

  // Generar reporte del mes anterior automáticamente
  useEffect(() => {
    const lastMonth = subMonths(today, 1);
    const lastMonthNumber = lastMonth.getMonth();
    const lastMonthYear = lastMonth.getFullYear();
    
    // Verificar si ya existe un reporte para el mes anterior
    const existingReport = store.getMonthlyReport(lastMonthNumber, lastMonthYear);
    if (!existingReport) {
      store.generateMonthlyReport(lastMonthNumber, lastMonthYear);
    }
  }, []);

  // Obtener reportes históricos
  const historicalReports = store.getMonthlyReports().sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

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
      <div className="card-elevated rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
            <FileText size={24} className="text-blue-400" />
            Reporte de Marcación
          </h2>
        <div className="flex gap-2 flex-wrap">
          <button 
            onClick={() => { setViewMode('current'); setSelectedHistoricalReport(null); }}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${
              viewMode === 'current' 
                ? 'bg-blue-500/30 border border-blue-500/50 text-blue-300' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            Mes Actual
          </button>
          <button 
            onClick={() => setViewMode('historical')}
            className={`px-3 py-1.5 rounded-lg text-xs transition ${
              viewMode === 'historical' 
                ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300' 
                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-600/50'
            }`}
          >
            <Lock size={14} className="inline mr-1" />
            Meses Anteriores
          </button>
        </div>
      </div>
      </div>

      {/* Selector de reportes históricos */}
      {viewMode === 'historical' && (
        <div className="card-solid rounded-xl p-4">
          <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
            <Lock size={16} className="text-purple-400" />
            Reportes Históricos (Solo Lectura)
          </h3>
          {historicalReports.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No hay reportes históricos disponibles</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
              {historicalReports.map(report => (
                <button
                  key={report.id}
                  onClick={() => setSelectedHistoricalReport(report)}
                  className={`p-3 rounded-lg text-left transition border ${
                    selectedHistoricalReport?.id === report.id
                      ? 'bg-purple-500/20 border-purple-500/50'
                      : 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/80'
                  }`}
                >
                  <p className="text-sm font-semibold text-white">
                    {format(new Date(report.year, report.month), 'MMMM yyyy', { locale: es })}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">
                    {report.totalHours.toFixed(1)}h • {formatCurrency(report.netPayable)}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Creado: {new Date(report.createdAt).toLocaleDateString('es-EC')}
                  </p>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Controles del mes actual */}
      {viewMode === 'current' && (
        <div className="flex gap-2 flex-wrap">
          <button onClick={() => setMonthOffset(o => o - 1)} className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs hover:bg-slate-600/50">← Mes ant.</button>
          <button onClick={() => setMonthOffset(0)} className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs hover:bg-slate-600/50">Actual</button>
          <button onClick={() => setMonthOffset(o => o + 1)} className="px-3 py-1.5 bg-slate-700/50 rounded-lg text-xs hover:bg-slate-600/50">Mes sig. →</button>
        </div>
      )}

      {/* Vista de reporte histórico */}
      {viewMode === 'historical' && selectedHistoricalReport && (
        <div className="space-y-4">
          <div className="card-elevated rounded-xl p-4 border-2 border-purple-500/30">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Lock size={20} className="text-purple-400" />
                {format(new Date(selectedHistoricalReport.year, selectedHistoricalReport.month), 'MMMM yyyy', { locale: es })}
              </h3>
              <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded border border-purple-500/30">
                Solo Lectura
              </span>
            </div>
            
            {/* Estadísticas del reporte */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <p className="text-xs text-slate-400">Total Horas</p>
                <p className="text-xl font-bold text-white">{selectedHistoricalReport.totalHours.toFixed(1)}h</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <p className="text-xs text-slate-400">Horas Extra</p>
                <p className="text-xl font-bold text-yellow-400">{selectedHistoricalReport.totalOvertime.toFixed(1)}h</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <p className="text-xs text-slate-400">Marcaciones</p>
                <p className="text-xl font-bold text-blue-400">{selectedHistoricalReport.timeEntries.length}</p>
              </div>
              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <p className="text-xs text-slate-400">Neto a Recibir</p>
                <p className="text-xl font-bold text-emerald-400">{formatCurrency(selectedHistoricalReport.netPayable)}</p>
              </div>
            </div>

            {/* Detalles del reporte */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <h4 className="text-sm font-semibold text-white mb-2">Marcaciones ({selectedHistoricalReport.timeEntries.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedHistoricalReport.timeEntries.slice(0, 10).map(entry => (
                    <div key={entry.id} className="flex justify-between text-xs bg-slate-800/50 rounded px-2 py-1">
                      <span className="text-slate-300">{new Date(entry.date).toLocaleDateString('es-EC')}</span>
                      <span className="text-white font-medium">{entry.hours.toFixed(2)}h</span>
                    </div>
                  ))}
                  {selectedHistoricalReport.timeEntries.length > 10 && (
                    <p className="text-xs text-slate-500 text-center">... y {selectedHistoricalReport.timeEntries.length - 10} más</p>
                  )}
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <h4 className="text-sm font-semibold text-white mb-2">Bonos ({selectedHistoricalReport.bonuses.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedHistoricalReport.bonuses.map(bonus => (
                    <div key={bonus.id} className="flex justify-between text-xs bg-slate-800/50 rounded px-2 py-1">
                      <span className="text-slate-300">{bonus.name}</span>
                      <span className="text-emerald-400 font-medium">{formatCurrency(bonus.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <h4 className="text-sm font-semibold text-white mb-2">Descuentos ({selectedHistoricalReport.discounts.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedHistoricalReport.discounts.map(discount => (
                    <div key={discount.id} className="flex justify-between text-xs bg-slate-800/50 rounded px-2 py-1">
                      <span className="text-slate-300">{discount.name}</span>
                      <span className="text-red-400 font-medium">{formatCurrency(discount.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-700/50 rounded-lg p-3 border border-slate-600/50">
                <h4 className="text-sm font-semibold text-white mb-2">Gastos ({selectedHistoricalReport.expenses.length})</h4>
                <div className="space-y-1 max-h-32 overflow-y-auto">
                  {selectedHistoricalReport.expenses.map(expense => (
                    <div key={expense.id} className="flex justify-between text-xs bg-slate-800/50 rounded px-2 py-1">
                      <span className="text-slate-300">{expense.name}</span>
                      <span className="text-orange-400 font-medium">{formatCurrency(expense.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

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
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-300 font-medium">Total Horas Mes</p>
          <p className="text-xl md:text-2xl font-bold text-white mt-1">{monthlyHours.toFixed(1)}h</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.1 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-300 font-medium">Horas Extra Mes</p>
          <p className="text-xl md:text-2xl font-bold text-yellow-400 mt-1">{monthlyOvertime.toFixed(1)}h</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-300 font-medium">Deudas Pendientes</p>
          <p className="text-xl md:text-2xl font-bold text-red-400 mt-1">{formatCurrency(totalDebts)}</p>
        </motion.div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="card-elevated rounded-xl p-3 md:p-4">
          <p className="text-xs text-slate-300 font-medium">Pago Mensual Deudas</p>
          <p className="text-xl md:text-2xl font-bold text-orange-400 mt-1">{formatCurrency(monthlyDebtPayments)}</p>
        </motion.div>
      </div>

      {period === 'weekly' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-solid rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-white">Balance Semanal - {format(selectedMonth, 'MMMM yyyy', { locale: es })}</h3>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-solid rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-white">Resumen Mensual</h3>
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
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card-solid rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4 text-white">Resumen Trimestral</h3>
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

      <div className="card-solid rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <TrendingDown size={20} className="text-red-400" />
          Gastos y Deudas Pendientes
        </h3>
        <div className="space-y-3">
          {store.getUserDebts().map(debt => (
            <div key={debt.id} className="flex flex-col sm:flex-row sm:items-center justify-between bg-slate-700/80 rounded-lg px-4 py-3 gap-2 border border-slate-600/50">
              <div>
                <p className="text-sm font-semibold text-white">{debt.name}</p>
                <p className="text-xs text-slate-300">{debt.type} - {formatCurrency(debt.monthlyPayment)}/mes</p>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-sm font-bold text-red-400">{formatCurrency(debt.totalAmount - debt.paidAmount)}</p>
                <div className="w-full sm:w-24 bg-slate-600 rounded-full h-1.5 mt-1">
                  <motion.div initial={{ width: 0 }} animate={{ width: `${debt.progress}%` }} className="bg-red-500 h-1.5 rounded-full" />
                </div>
                <p className="text-xs text-slate-300">{debt.progress.toFixed(0)}% pagado</p>
              </div>
            </div>
          ))}
          {store.getUserDebts().length === 0 && <p className="text-slate-400 text-sm text-center py-4">No hay deudas registradas</p>}
        </div>
      </div>
    </div>
  );
}
