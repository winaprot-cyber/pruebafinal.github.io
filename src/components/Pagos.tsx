import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ChevronDown, ChevronUp, Settings, DollarSign, Calendar, Shield, Heart, PiggyBank, ListChecks } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear, parseISO, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { applyRule45h, calculateBonuses, calculateDiscounts, calculateBaseIngreso, calculateSpecialDiscounts, calculateSpecialBonuses, formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';

export default function Pagos({ store }: { store: ReturnType<typeof useStore> }) {
  const [showConfig, setShowConfig] = useState(false);
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [baseSalary, setBaseSalary] = useState(store.data.salaryConfig.baseSalary.toString());
  const [biweeklyPayment, setBiweeklyPayment] = useState(store.data.salaryConfig.biweeklyPayment.toString());
  const [overtimeRate50, setOvertimeRate50] = useState(store.data.salaryConfig.overtimeRate50.toString());
  const [overtimeRate100, setOvertimeRate100] = useState(store.data.salaryConfig.overtimeRate100.toString());
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  
  // Usar el estado global del store
  const selectedWeeks = store.data.selectedWeeks;
  const selectedYear = store.data.selectedYear;

  const today = new Date();
  const yearStart = startOfYear(new Date(selectedYear, 0, 1));
  const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
  const allWeeksOfYear = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 });

  const base = store.data.salaryConfig.baseSalary;
  const { iessAporteActive, saludConyugeActive, fondosReservaActive, overtimeRate50: rate50, overtimeRate100: rate100 } = store.data.salaryConfig;
  
  // Weekly breakdown for ALL weeks of the year
  const weeklyBreakdown = allWeeksOfYear.map((weekStart, i) => {
    const rule = applyRule45h(store.data.timeEntries, store.data.holidays, weekStart);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const holidayEntries = store.data.timeEntries.filter(e => {
      const d = parseISO(e.date);
      return e.isHoliday && d >= weekStart && d <= weekEnd;
    });
    
    // Get week number of the year
    const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
    
    // Calculate payment using custom rates or default formula
    const hourlyRate = base / 240;
    const customRate50 = rate50 > 0 ? rate50 : hourlyRate * 1.5;
    const customRate100 = rate100 > 0 ? rate100 : hourlyRate * 2;
    
    const payment50 = Math.round(rule.totalExtra50 * customRate50 * 100) / 100;
    const payment100 = Math.round(rule.totalExtra100 * customRate100 * 100) / 100;
    const paymentTotal = payment50 + payment100;

    return {
      index: i,
      weekStart,
      weekEnd,
      weekNumber,
      ...rule,
      payment: { payment50, payment100, total: paymentTotal, hourlyRate },
      holidays: holidayEntries,
      label: `Sem ${weekNumber}: ${format(weekStart, 'dd MMM', { locale: es })} - ${format(weekEnd, 'dd MMM', { locale: es })}`,
      shortLabel: `Sem ${weekNumber}`,
      period: `${format(weekStart, 'dd/MM', { locale: es })} - ${format(weekEnd, 'dd/MM', { locale: es })}`,
    };
  });

  // Filter to only weeks that have data or are selected
  const weeksWithData = weeklyBreakdown.filter(w => 
    w.weekdayHours > 0 || w.totalExtra50 > 0 || w.totalExtra100 > 0 || selectedWeeks.includes(w.index)
  );

  // Calculate totals for selected weeks or all with data
  const activeWeeks = selectedWeeks.length > 0 
    ? weeklyBreakdown.filter((_, i) => selectedWeeks.includes(i))
    : weeksWithData;

  const totalHours50 = activeWeeks.reduce((s, w) => s + w.totalExtra50, 0);
  const totalHours100 = activeWeeks.reduce((s, w) => s + w.totalExtra100, 0);
  const totalHolidayHours = activeWeeks.reduce((s, w) => s + w.holidayHours, 0);
  
  // Calculate overtime payment using custom rates
  const customRate50 = rate50 > 0 ? rate50 : (base / 240) * 1.5;
  const customRate100 = rate100 > 0 ? rate100 : (base / 240) * 2;
  const payment50Total = Math.round(totalHours50 * customRate50 * 100) / 100;
  const payment100Total = Math.round(totalHours100 * customRate100 * 100) / 100;
  const totalOvertimePaymentTotal = payment50Total + payment100Total;
  
  const totalOvertimePayment = {
    payment50: payment50Total,
    payment100: payment100Total,
    total: totalOvertimePaymentTotal,
    hourlyRate: base / 240,
  };

  const totalBonuses = calculateBonuses(store.data.bonuses, base);
  const totalDiscounts = calculateDiscounts(store.data.discounts, base);

  // Base de ingreso = Sueldo base + horas extras
  const baseIngreso = calculateBaseIngreso(base, totalOvertimePayment.total);

  // Descuentos especiales
  const specialDiscounts = calculateSpecialDiscounts(baseIngreso);
  const specialBonuses = calculateSpecialBonuses(baseIngreso);

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
      overtimeRate50: parseFloat(overtimeRate50) || 0,
      overtimeRate100: parseFloat(overtimeRate100) || 0,
    });
    setShowConfig(false);
  };

  const toggleWeek = (index: number) => {
    const newWeeks = selectedWeeks.includes(index)
      ? selectedWeeks.filter(i => i !== index)
      : [...selectedWeeks, index];
    store.updateSelectedWeeks(newWeeks);
  };

  const selectAllWeeks = () => {
    store.updateSelectedWeeks(weeksWithData.map(w => w.index));
  };

  const clearWeeks = () => {
    store.updateSelectedWeeks([]);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <CreditCard size={24} className="text-blue-400" />
          Pagos y Proyección
        </h2>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <select
            value={selectedYear}
            onChange={(e) => {
              store.updateSelectedYear(parseInt(e.target.value));
              store.updateSelectedWeeks([]);
            }}
            className="px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-600/50"
          >
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
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
              
              {/* Basic Config */}
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

              {/* Overtime Rates */}
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-300 mb-3">💰 Costo por Hora Extra (Personalizado)</h4>
                <p className="text-xs text-slate-500 mb-3">
                  Si se deja en 0, se calculará automáticamente (Base/240 × 1.5 o × 2)
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Costo Hora Extra 50% ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={overtimeRate50}
                      onChange={(e) => setOvertimeRate50(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Automático"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Auto: {formatCurrency((base / 240) * 1.5)}/h
                    </p>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400 block mb-1">Costo Hora Extra 100% ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={overtimeRate100}
                      onChange={(e) => setOvertimeRate100(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white"
                      placeholder="Automático"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      Auto: {formatCurrency((base / 240) * 2)}/h
                    </p>
                  </div>
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
          Proyección - {format(new Date(), 'MMMM yyyy', { locale: es })}
        </h3>

        {/* Week Selection Dropdown */}
        <div className="mb-4">
          <button
            onClick={() => setShowWeekSelector(!showWeekSelector)}
            className="w-full flex items-center justify-between bg-slate-700/30 border border-slate-600/50 rounded-lg px-4 py-3 text-left hover:bg-slate-700/50 transition"
          >
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-blue-400" />
              <span className="text-sm text-white">
                {selectedWeeks.length === 0 
                  ? 'Seleccionar semanas del año para cobro' 
                  : `${selectedWeeks.length} semana(s) seleccionada(s)`}
              </span>
            </div>
            <ChevronDown size={18} className={`text-slate-400 transition-transform ${showWeekSelector ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showWeekSelector && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-slate-800/50 border border-slate-700/50 rounded-b-lg p-3 space-y-2">
                  <div className="flex gap-2 mb-3">
                    <button onClick={selectAllWeeks} className="text-xs bg-blue-500/20 border border-blue-500/30 px-3 py-1.5 rounded text-blue-300 hover:bg-blue-500/30">
                      ✓ Seleccionar Todas con Datos
                    </button>
                    <button onClick={clearWeeks} className="text-xs bg-slate-700/30 px-3 py-1.5 rounded text-slate-400 hover:bg-slate-600/30">
                      ✗ Limpiar
                    </button>
                  </div>
                  
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {weeksWithData.map((week) => (
                      <label
                        key={week.index}
                        className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition ${
                          selectedWeeks.includes(week.index) 
                            ? 'bg-blue-500/10 border border-blue-500/30' 
                            : 'bg-slate-700/20 border border-transparent hover:bg-slate-700/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <input
                            type="checkbox"
                            checked={selectedWeeks.includes(week.index)}
                            onChange={() => toggleWeek(week.index)}
                            className="w-4 h-4 rounded border-slate-500 accent-blue-500"
                          />
                          <div>
                            <p className="text-sm font-medium text-white">
                              Semana {week.weekNumber}
                            </p>
                            <p className="text-xs text-slate-400">
                              {week.period}
                            </p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-yellow-300">{week.totalExtra50.toFixed(1)}h @50%</p>
                          <p className="text-red-300">{week.totalExtra100.toFixed(1)}h @100%</p>
                        </div>
                      </label>
                    ))}
                    {weeksWithData.length === 0 && (
                      <p className="text-center text-slate-500 text-sm py-4">
                        No hay semanas con datos registrados en {selectedYear}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Selected Weeks Summary */}
        {selectedWeeks.length > 0 && (
          <div className="mb-4 bg-blue-500/5 border border-blue-500/20 rounded-lg p-3">
            <p className="text-xs text-blue-300 mb-2">Semanas seleccionadas:</p>
            <div className="flex flex-wrap gap-2">
              {selectedWeeks.sort((a, b) => a - b).map(i => {
                const week = weeklyBreakdown[i];
                return (
                  <span key={i} className="text-xs bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300">
                    Sem {week.weekNumber} ({week.period})
                  </span>
                );
              })}
            </div>
          </div>
        )}

        {/* Weekly Details (Expandable) */}
        <div className="space-y-2 mb-6">
          {(selectedWeeks.length > 0 ? weeklyBreakdown.filter((_, i) => selectedWeeks.includes(i)) : weeksWithData).map((week) => {
            const i = week.index;
            const totalExtraPayment = week.payment.total;
            const hasHolidays = week.holidayHours > 0;
            
            return (
              <div key={i} className="bg-slate-700/30 rounded-lg overflow-hidden">
                <button
                  onClick={() => setExpandedWeek(expandedWeek === i ? null : i)}
                  className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-3 md:px-4 py-3 text-left transition gap-2"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/20 px-2 py-1 rounded">
                      Sem {week.weekNumber}
                    </span>
                    <span className="text-sm text-white">{week.period}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs ml-0 sm:ml-0">
                    <span className="text-emerald-400 font-semibold">
                      Extras: {formatCurrency(totalExtraPayment)}
                    </span>
                    {hasHolidays && (
                      <span className="text-yellow-300">
                        🎉 Fer: {week.holidayHours.toFixed(1)}h
                      </span>
                    )}
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
            );
          })}
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
              <span className="text-slate-300">
                Horas Extra 50% ({totalHours50.toFixed(1)}h × {formatCurrency(customRate50)})
              </span>
              <span className="text-yellow-400 font-medium">{formatCurrency(totalOvertimePayment.payment50)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-slate-300">
                Horas Extra 100% ({totalHours100.toFixed(1)}h × {formatCurrency(customRate100)})
              </span>
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
