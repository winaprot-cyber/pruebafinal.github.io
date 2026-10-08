import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ChevronDown, ChevronUp, Settings, DollarSign, Calendar, Shield, Heart, PiggyBank } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfMonth, endOfMonth, parseISO, addWeeks, subWeeks } from 'date-fns';
import { es } from 'date-fns/locale';
import { applyRule45h, calculateOvertimePayment, calculateBonuses, calculateDiscounts, calculateBaseIngreso, calculateSpecialDiscounts, calculateSpecialBonuses, formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';

export default function Pagos({ store }: { store: ReturnType<typeof useStore> }) {
  const [showConfig, setShowConfig] = useState(false);
  const [baseSalary, setBaseSalary] = useState(store.data.salaryConfig.baseSalary.toString());
  const [biweeklyPayment, setBiweeklyPayment] = useState(store.data.salaryConfig.biweeklyPayment.toString());
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [selectedWeeks, setSelectedWeeks] = useState<number[]>([]);
  const [monthOffset, setMonthOffset] = useState(0);

  const today = new Date();
  const selectedMonth = addWeeks(startOfMonth(today), monthOffset * 4);
  const monthStart = startOfMonth(selectedMonth);
  const monthEnd = endOfMonth(selectedMonth);
  const weeks = eachWeekOfInterval({ start: monthStart, end: monthEnd }, { weekStartsOn: 1 });

  const base = store.data.salaryConfig.baseSalary;
  const { iessAporteActive, saludConyugeActive, fondosReservaActive } = store.data.salaryConfig;

  // Weekly breakdown
  const weeklyBreakdown = weeks.map((weekStart, i) => {
    const rule = applyRule45h(store.data.timeEntries, store.data.holidays, weekStart);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const payment = calculateOvertimePayment(rule.totalExtra50, rule.totalExtra100, base);
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
      label: `Sem ${i + 1}: ${format(weekStart, 'dd MMM', { locale: es })} - ${format(weekEnd, 'dd MMM', { locale: es })}`,
    };
  });

  // Calculate totals for selected weeks or all
  const activeWeeks = selectedWeeks.length > 0 
    ? weeklyBreakdown.filter((_, i) => selectedWeeks.includes(i))
    : weeklyBreakdown;

  const totalHours50 = activeWeeks.reduce((s, w) => s + w.totalExtra50, 0);
  const totalHours100 = activeWeeks.reduce((s, w) => s + w.totalExtra100, 0);
  const totalHolidayHours = activeWeeks.reduce((s, w) => s + w.holidayHours, 0);
  const totalOvertimePayment = calculateOvertimePayment(totalHours50, totalHours100, base);
  const totalBonuses = calculateBonuses(store.data.bonuses, base);
  const totalDiscounts = calculateDiscounts(store.data.discounts, base);

  // Base de ingreso = Sueldo base + horas extras
  const baseIngreso = calculateBaseIngreso(base, totalOvertimePayment.total);

  // Descuentos especiales
  const specialDiscounts = calculateSpecialDiscounts(baseIngreso);
  const specialBonuses = calculateSpecialBonuses(baseIngreso);

  // Calculate actual special amounts based on active flags
  const iessAmount = iessAporteActive ? specialDiscounts.iessAporte : 0;
  const saludAmount = saludConyugeActive ? specialDiscounts.saludConyuge : 0;
  const fondosAmount = fondosReservaActive ? specialBonuses.fondosReserva : 0;

  const totalSpecialDiscounts = iessAmount + saludAmount;
  const totalSpecialBonuses = fondosAmount;

  const netPayable = base + totalOvertimePayment.total + totalBonuses + totalSpecialBonuses 
    - totalDiscounts - totalSpecialDiscounts - store.data.salaryConfig.biweeklyPayment;

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

  const selectAllWeeks = () => {
    setSelectedWeeks(weeklyBreakdown.map((_, i) => i));
  };

  const clearWeeks = () => {
    setSelectedWeeks([]);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <CreditCard size={24} className="text-blue-400" />
          Pagos y Proyección
        </h2>
        <div className="flex gap-2 w-full sm:w-auto">
          <button
            onClick={() => setMonthOffset(o => o - 1)}
            className="px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-600/50"
          >
            ← Mes ant.
          </button>
          <button
            onClick={() => setMonthOffset(0)}
            className="px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-600/50"
          >
            Actual
          </button>
          <button
            onClick={() => setMonthOffset(o => o + 1)}
            className="px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-600/50"
          >
            Mes sig. →
          </button>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center gap-1 bg-slate-700/50 hover:bg-slate-600/50 px-3 py-2 rounded-lg text-sm transition ml-auto sm:ml-0"
          >
            <Settings size={16} /> Config
          </button>
        </div>
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
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6 space-y-4">
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
              
              {/* Special Items Toggle */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">Items Especiales (IESS y Fondos)</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-blue-400" />
                      <div>
                        <p className="text-sm text-white font-medium">Aporte Personal IESS</p>
                        <p className="text-xs text-slate-400">9.45% sobre (Base + Horas Extras)</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={iessAporteActive}
                      onChange={(e) => store.updateSalaryConfig({ iessAporteActive: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-500 accent-blue-500"
                    />
                  </label>
                  <label className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <Heart size={18} className="text-pink-400" />
                      <div>
                        <p className="text-sm text-white font-medium">Salud Cónyuge IESS</p>
                        <p className="text-xs text-slate-400">3.41% sobre (Base + Horas Extras)</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={saludConyugeActive}
                      onChange={(e) => store.updateSalaryConfig({ saludConyugeActive: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-500 accent-pink-500"
                    />
                  </label>
                  <label className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3 cursor-pointer">
                    <div className="flex items-center gap-3">
                      <PiggyBank size={18} className="text-emerald-400" />
                      <div>
                        <p className="text-sm text-white font-medium">Fondos de Reserva</p>
                        <p className="text-xs text-slate-400">8.33% sobre (Base + Horas Extras)</p>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={fondosReservaActive}
                      onChange={(e) => store.updateSalaryConfig({ fondosReservaActive: e.target.checked })}
                      className="w-5 h-5 rounded border-slate-500 accent-emerald-500"
                    />
                  </label>
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
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-emerald-400" />
          Proyección Mensual - {format(selectedMonth, 'MMMM yyyy', { locale: es })}
        </h3>

        {/* Week Selection */}
        <div className="mb-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <h4 className="text-sm font-medium text-blue-400">Seleccionar Semanas para Cobro</h4>
          <div className="flex gap-2">
            <button onClick={selectAllWeeks} className="text-xs bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300">
              Todas
            </button>
            <button onClick={clearWeeks} className="text-xs bg-slate-700/30 px-2 py-1 rounded text-slate-400">
              Ninguna
            </button>
          </div>
        </div>

        {/* Weekly Breakdown */}
        <div className="space-y-2 mb-6">
          {weeklyBreakdown.map((week, i) => (
            <div key={i} className="bg-slate-700/30 rounded-lg overflow-hidden">
              <button
                onClick={() => {
                  setExpandedWeek(expandedWeek === i ? null : i);
                  toggleWeek(i);
                }}
                className={`w-full flex flex-col sm:flex-row sm:items-center justify-between px-3 md:px-4 py-3 text-left transition gap-2 ${
                  selectedWeeks.includes(i) ? 'bg-blue-500/10 border-l-2 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={selectedWeeks.includes(i)}
                    onChange={(e) => { e.stopPropagation(); toggleWeek(i); }}
                    className="w-4 h-4 rounded border-slate-500 accent-blue-500"
                  />
                  <span className="text-sm text-white">{week.label}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs ml-7 sm:ml-0">
                  <span className="text-yellow-300">50%: {week.totalExtra50.toFixed(1)}h</span>
                  <span className="text-red-300">100%: {week.totalExtra100.toFixed(1)}h</span>
                  <span className="text-emerald-300">Fer: {week.holidayHours.toFixed(1)}h</span>
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
                    <div className="px-3 md:px-4 pb-3 space-y-2 bg-slate-800/30">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-slate-400">Horas L-V</p>
                          <p className="text-white font-bold">{week.weekdayHours.toFixed(1)}h</p>
                          {week.weekdayExtra50 > 0 && (
                            <p className="text-yellow-400 text-[10px]">Extra 50%: {week.weekdayExtra50.toFixed(1)}h</p>
                          )}
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-slate-400">Extra 50% (S-D)</p>
                          <p className="text-yellow-400 font-bold">{week.weekendHours50.toFixed(1)}h</p>
                        </div>
                        <div className="bg-slate-700/50 rounded p-2">
                          <p className="text-slate-400">Extra 100% (S-D)</p>
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

        {/* Active Bonuses & Discounts */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div>
            <h4 className="text-sm font-medium text-emerald-400 mb-2">Bonos Activos</h4>
            <div className="space-y-1">
              {store.data.bonuses.filter(b => b.active && !b.isSpecial).map(b => (
                <div key={b.id} className="flex justify-between text-xs bg-emerald-500/10 rounded px-3 py-1">
                  <span className="text-slate-300">{b.name}</span>
                  <span className="text-emerald-400">
                    {b.basedOnSalary ? `${b.percentage}% = ${formatCurrency(baseIngreso * b.percentage / 100)}` : formatCurrency(b.amount)}
                  </span>
                </div>
              ))}
              {fondosReservaActive && (
                <div className="flex justify-between text-xs bg-emerald-500/10 rounded px-3 py-1">
                  <span className="text-slate-300 flex items-center gap-1"><PiggyBank size={12} /> Fondos de Reserva</span>
                  <span className="text-emerald-400">8.33% = {formatCurrency(fondosAmount)}</span>
                </div>
              )}
              {store.data.bonuses.filter(b => b.active && !b.isSpecial).length === 0 && !fondosReservaActive && (
                <p className="text-xs text-slate-500">Sin bonos activos</p>
              )}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-red-400 mb-2">Descuentos Activos</h4>
            <div className="space-y-1">
              {store.data.discounts.filter(d => d.active && !d.isSpecial).map(d => (
                <div key={d.id} className="flex justify-between text-xs bg-red-500/10 rounded px-3 py-1">
                  <span className="text-slate-300">{d.name}</span>
                  <span className="text-red-400">
                    {d.basedOnSalary ? `${d.percentage}% = ${formatCurrency(baseIngreso * d.percentage / 100)}` : formatCurrency(d.amount)}
                  </span>
                </div>
              ))}
              {iessAporteActive && (
                <div className="flex justify-between text-xs bg-red-500/10 rounded px-3 py-1">
                  <span className="text-slate-300 flex items-center gap-1"><Shield size={12} /> IESS Aporte</span>
                  <span className="text-red-400">9.45% = {formatCurrency(iessAmount)}</span>
                </div>
              )}
              {saludConyugeActive && (
                <div className="flex justify-between text-xs bg-red-500/10 rounded px-3 py-1">
                  <span className="text-slate-300 flex items-center gap-1"><Heart size={12} /> Salud Cónyuge</span>
                  <span className="text-red-400">3.41% = {formatCurrency(saludAmount)}</span>
                </div>
              )}
              {store.data.discounts.filter(d => d.active && !d.isSpecial).length === 0 && !iessAporteActive && !saludConyugeActive && (
                <p className="text-xs text-slate-500">Sin descuentos activos</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Summary */}
        <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-xl p-4 md:p-6">
          <h4 className="text-base md:text-lg font-semibold mb-4">Resumen de Pago</h4>
          <div className="space-y-2 md:space-y-3">
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
            {fondosReservaActive && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 flex items-center gap-1"><PiggyBank size={14} /> Fondos de Reserva (8.33%)</span>
                <span className="text-emerald-400 font-medium">+{formatCurrency(fondosAmount)}</span>
              </div>
            )}
            <hr className="border-slate-600" />
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Descuentos</span>
              <span className="text-red-400 font-medium">-{formatCurrency(totalDiscounts)}</span>
            </div>
            {iessAporteActive && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 flex items-center gap-1"><Shield size={14} /> IESS Aporte (9.45%)</span>
                <span className="text-red-400 font-medium">-{formatCurrency(iessAmount)}</span>
              </div>
            )}
            {saludConyugeActive && (
              <div className="flex justify-between text-sm">
                <span className="text-slate-300 flex items-center gap-1"><Heart size={14} /> Salud Cónyuge (3.41%)</span>
                <span className="text-red-400 font-medium">-{formatCurrency(saludAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">Quincena</span>
              <span className="text-red-400 font-medium">-{formatCurrency(store.data.salaryConfig.biweeklyPayment)}</span>
            </div>
            <hr className="border-slate-600" />
            <div className="flex justify-between text-lg md:text-xl font-bold">
              <span className="text-white">Neto a Recibir</span>
              <span className="text-emerald-400">{formatCurrency(netPayable)}</span>
            </div>
            <p className="text-xs text-slate-500 text-right">
              Base de ingreso: {formatCurrency(baseIngreso)} (Base + Extras)
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
