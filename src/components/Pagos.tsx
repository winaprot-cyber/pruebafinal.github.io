import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ChevronDown, ChevronUp, Settings, DollarSign, Clock } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { applyRule45h, calculateOvertimePayment, calculateBonuses, calculateDiscounts, formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';

export default function Pagos({ store }: { store: ReturnType<typeof useStore> }) {
  const [showConfig, setShowConfig] = useState(false);
  const [baseSalary, setBaseSalary] = useState(store.data.salaryConfig.baseSalary.toString());
  const [biweeklyPayment, setBiweeklyPayment] = useState(store.data.salaryConfig.biweeklyPayment.toString());
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);

  const today = new Date();
  const monthStart = startOfMonth(today);
  const monthEnd = endOfMonth(today);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const base = store.data.salaryConfig.baseSalary;

  // Weekly breakdown
  const weeklyBreakdown = weeks.map((weekStart, i) => {
    const rule = applyRule45h(store.data.timeEntries, store.data.holidays, weekStart);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const payment = calculateOvertimePayment(rule.weekendHours50, rule.weekendHours100, base);
    const holidayEntries = store.data.timeEntries.filter(e => {
      const d = parseISO(e.date);
      return e.isHoliday && d >= weekStart && d <= weekEnd;
    });
    return {
      index: i,
      weekStart,
      weekEnd,
      ...rule,
      payment,
      holidays: holidayEntries,
      label: `${format(weekStart, 'dd MMM', { locale: es })} - ${format(weekEnd, 'dd MMM', { locale: es })}`,
    };
  });

  // Calculate totals for selected weeks or all
  const activeWeeks = selectedWeeks.length > 0 
    ? weeklyBreakdown.filter((_, i) => selectedWeeks.includes(i))
    : weeklyBreakdown;

  const totalHours50 = activeWeeks.reduce((s, w) => s + w.weekendHours50, 0);
  const totalHours100 = activeWeeks.reduce((s, w) => s + w.weekendHours100, 0);
  const totalHolidayHours = activeWeeks.reduce((s, w) => s + w.holidayHours, 0);
  const totalOvertimePayment = calculateOvertimePayment(totalHours50, totalHours100, base);
  const totalBonuses = calculateBonuses(store.data.bonuses, base);
  const totalDiscounts = calculateDiscounts(store.data.discounts, base);

  const netPayable = base + totalOvertimePayment.total + totalBonuses - totalDiscounts - store.data.salaryConfig.biweeklyPayment;

  const handleSaveConfig = () => {
    store.updateSalaryConfig({
      baseSalary: parseFloat(baseSalary) || 0,
      biweeklyPayment: parseFloat(biweeklyPayment) || 0,
    });
    setShowConfig(false);
  };

  const toggleWeek = (index: number) => {
    setSelectedWeeks(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <CreditCard size={24} className="text-blue-400" />
          Pagos y Proyección
        </h2>
        <button
          onClick={() => setShowConfig(!showConfig)}
          className="flex items-center gap-2 bg-slate-700/50 hover:bg-slate-600/50 px-3 py-2 rounded-lg text-sm transition"
        >
          <Settings size={16} /> Configurar
        </button>
      </div>

      {/* Configuration Panel */}
      <AnimatePresence>
        {showConfig && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 space-y-4">
              <h3 className="text-lg font-semibold">Configuración de Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Sueldo Base</label>
                  <input
                    type="number"
                    value={baseSalary}
                    onChange={(e) => setBaseSalary(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Quincena (Ingreso Manual)</label>
                  <input
                    type="number"
                    value={biweeklyPayment}
                    onChange={(e) => setBiweeklyPayment(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Horas Extra al 50% (manual)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="0.0"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Horas Extra al 100% (manual)</label>
                  <input
                    type="number"
                    step="0.5"
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                    placeholder="0.0"
                  />
                </div>
              </div>
              <button
                onClick={handleSaveConfig}
                className="bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-2 rounded-lg text-sm font-medium hover:from-blue-600 hover:to-purple-600 transition"
              >
                Guardar Configuración
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Monthly Projection */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-400" />
          Proyección Mensual - {format(today, 'MMMM yyyy', { locale: es })}
        </h3>

        {/* Active Bonuses & Discounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm font-medium text-emerald-400 mb-2">Bonos Activos</h4>
            <div className="space-y-1">
              {store.data.bonuses.filter(b => b.active).map(b => (
                <div key={b.id} className="flex justify-between text-sm bg-emerald-500/10 rounded px-3 py-1">
                  <span className="text-slate-300">{b.name}</span>
                  <span className="text-emerald-400">
                    {b.basedOnSalary ? `${b.percentage}% = ${formatCurrency(base * b.percentage / 100)}` : formatCurrency(b.amount)}
                  </span>
                </div>
              ))}
              {store.data.bonuses.filter(b => b.active).length === 0 && (
                <p className="text-xs text-slate-500">Sin bonos activos</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-400 mb-2">Descuentos Activos</h4>
            <div className="space-y-1">
              {store.data.discounts.filter(d => d.active).map(d => (
                <div key={d.id} className="flex justify-between text-sm bg-red-500/10 rounded px-3 py-1">
                  <span className="text-slate-300">{d.name}</span>
                  <span className="text-red-400">
                    {d.basedOnSalary ? `${d.percentage}% = ${formatCurrency(base * d.percentage / 100)}` : formatCurrency(d.amount)}
                  </span>
                </div>
              ))}
              {store.data.discounts.filter(d => d.active).length === 0 && (
                <p className="text-xs text-slate-500">Sin descuentos activos</p>
              )}
            </div>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <h4 className="text-sm font-medium text-blue-400 mb-3">Detalle por Semana (Regla 45H)</h4>
        <div className="space-y-2 mb-6">
          {weeklyBreakdown.map((week, i) => (
            <div key={i} className="bg-slate-700/30 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setExpandedWeek(expandedWeek === i ? null : i);
                  toggleWeek(i);
                }}
                className={`w-full flex items-center justify-between px-4 py-3 text-left transition ${
                  selectedWeeks.includes(i) ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedWeeks.includes(i)}
                    onChange={() => toggleWeek(i)}
                    className="rounded border-slate-500"
                  />
                  <span className="text-sm text-white">{week.label}</span>
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-yellow-300">50%: {week.weekendHours50.toFixed(1)}h</span>
                  <span className="text-red-300">100%: {week.weekendHours100.toFixed(1)}h</span>
                  <span className="text-emerald-300">Feriados: {week.holidayHours.toFixed(1)}h</span>
                  {expandedWeek === i ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </div>
              </button>
              
              <AnimatePresence>
                {expandedWeek === i && (
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: 'auto' }}
                    exit={{ height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-3 space-y-2 bg-slate-800/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-slate-400">Horas L-V</p>
                          <p className="text-white font-bold">{week.weekdayHours.toFixed(1)}h</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-slate-400">Extra 50%</p>
                          <p className="text-yellow-400 font-bold">{week.weekendHours50.toFixed(1)}h</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-slate-400">Extra 100%</p>
                          <p className="text-red-400 font-bold">{week.weekendHours100.toFixed(1)}h</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-slate-400">Feriados</p>
                          <p className="text-emerald-400 font-bold">{week.holidayHours.toFixed(1)}h</p>
                        </div>
                      </div>
                      {week.holidays.length > 0 && (
                        <div className="text-xs text-slate-400">
                          Feriados: {week.holidays.map(h => h.holidayName).join(', ')}
                        </div>
                      )}
                      <div className="text-xs text-right text-blue-300">
                        Pago extras: {formatCurrency(week.payment.total)}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-6">
          <h4 className="text-lg font-semibold mb-4">Resumen de Pago</h4>
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Sueldo Base</span>
              <span className="text-white font-medium">{formatCurrency(base)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Horas Extra 50% ({totalHours50.toFixed(1)}h)</span>
              <span className="text-yellow-400 font-medium">{formatCurrency(totalOvertimePayment.payment50)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Horas Extra 100% ({totalHours100.toFixed(1)}h)</span>
              <span className="text-red-400 font-medium">{formatCurrency(totalOvertimePayment.payment100)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Bonos Activos</span>
              <span className="text-emerald-400 font-medium">+{formatCurrency(totalBonuses)}</span>
            </div>
            <hr className="border-slate-600" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Descuentos</span>
              <span className="text-red-400 font-medium">-{formatCurrency(totalDiscounts)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Quincena</span>
              <span className="text-red-400 font-medium">-{formatCurrency(store.data.salaryConfig.biweeklyPayment)}</span>
            </div>
            <hr className="border-slate-600" />
            <div className="flex justify-between text-lg font-bold">
              <span className="text-white">Neto a Recibir</span>
              <span className="text-emerald-400">{formatCurrency(netPayable)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
