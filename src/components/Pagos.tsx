import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CreditCard, ChevronDown, ChevronUp, Settings, DollarSign, Shield, Heart, PiggyBank, ListChecks } from 'lucide-react';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, startOfYear, endOfYear, parseISO, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { applyRule45h, calculateBaseIngreso, calculateSpecialDiscounts, calculateSpecialBonuses, formatCurrency, calculateBonuses, calculateDiscounts } from '../utils/calculations';
import type { useStore } from '../store/useStore';

export default function Pagos({ store }: { store: ReturnType<typeof useStore> }) {
  const [showConfig, setShowConfig] = useState(false);
  const [showWeekSelector, setShowWeekSelector] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState<number | null>(null);
  const [showBonusesDetail, setShowBonusesDetail] = useState(false);
  const [showDiscountsDetail, setShowDiscountsDetail] = useState(false);
  const [baseSalary, setBaseSalary] = useState(store.getSalaryConfig().baseSalary.toString());
  const [biweeklyPayment, setBiweeklyPayment] = useState(store.getSalaryConfig().biweeklyPayment.toString());
  const [overtimeRate50, setOvertimeRate50] = useState(store.getSalaryConfig().overtimeRate50.toString());
  const [overtimeRate100, setOvertimeRate100] = useState(store.getSalaryConfig().overtimeRate100.toString());
  
  const selectedWeeks = store.data.selectedWeeks;
  const selectedYear = store.data.selectedYear;
  const timeEntries = store.getUserTimeEntries();
  const holidays = store.getUserHolidays();

  const yearStart = startOfYear(new Date(selectedYear, 0, 1));
  const yearEnd = endOfYear(new Date(selectedYear, 0, 1));
  const allWeeksOfYear = eachWeekOfInterval({ start: yearStart, end: yearEnd }, { weekStartsOn: 1 });

  const config = store.getSalaryConfig();
  const base = config.baseSalary;
  const { iessAporteActive, saludConyugeActive, fondosReservaActive, overtimeRate50: rate50, overtimeRate100: rate100 } = config;
  
  const weeklyBreakdown = allWeeksOfYear.map((weekStart, i) => {
    const rule = applyRule45h(timeEntries, holidays, weekStart);
    const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 });
    const weekNumber = getWeek(weekStart, { weekStartsOn: 1 });
    const hourlyRate = base / 240;
    const customRate50 = rate50 > 0 ? rate50 : hourlyRate * 1.5;
    const customRate100 = rate100 > 0 ? rate100 : hourlyRate * 2;
    const payment50 = Math.round(rule.totalExtra50 * customRate50 * 100) / 100;
    const payment100 = Math.round(rule.totalExtra100 * customRate100 * 100) / 100;

    return {
      index: i,
      weekStart,
      weekEnd,
      weekNumber,
      ...rule,
      payment: { payment50, payment100, total: payment50 + payment100, hourlyRate },
      holidays: holidays.filter(h => {
        const hDate = parseISO(h.date);
        return hDate >= weekStart && hDate <= weekEnd;
      }),
      period: `${format(weekStart, 'dd/MM', { locale: es })} - ${format(weekEnd, 'dd/MM', { locale: es })}`,
    };
  });

  const weeksWithData = weeklyBreakdown.filter(w => w.weekdayHours > 0 || w.totalExtra50 > 0 || w.totalExtra100 > 0 || selectedWeeks.includes(w.index));
  const activeWeeks = selectedWeeks.length > 0 ? weeklyBreakdown.filter((_, i) => selectedWeeks.includes(i)) : weeksWithData;

  const totalHours50 = activeWeeks.reduce((s, w) => s + w.totalExtra50, 0);
  const totalHours100 = activeWeeks.reduce((s, w) => s + w.totalExtra100, 0);
  const customRate50 = rate50 > 0 ? rate50 : (base / 240) * 1.5;
  const customRate100 = rate100 > 0 ? rate100 : (base / 240) * 2;
  const payment50Total = Math.round(totalHours50 * customRate50 * 100) / 100;
  const payment100Total = Math.round(totalHours100 * customRate100 * 100) / 100;
  const totalOvertimePayment = { payment50: payment50Total, payment100: payment100Total, total: payment50Total + payment100Total, hourlyRate: base / 240 };

  const bonuses = store.getUserBonuses();
  const discounts = store.getUserDiscounts();
  const baseIngreso = calculateBaseIngreso(base, totalOvertimePayment.total);
  const totalBonuses = calculateBonuses(bonuses, base, baseIngreso);
  const totalDiscounts = calculateDiscounts(discounts, base, baseIngreso);
  const specialDiscounts = calculateSpecialDiscounts(baseIngreso);
  const specialBonuses = calculateSpecialBonuses(baseIngreso);
  const iessAmount = iessAporteActive ? specialDiscounts.iessAporte : 0;
  const saludAmount = saludConyugeActive ? specialDiscounts.saludConyuge : 0;
  const fondosAmount = fondosReservaActive ? specialBonuses.fondosReserva : 0;
  const netPayable = base + totalOvertimePayment.total + totalBonuses + fondosAmount - totalDiscounts - iessAmount - saludAmount - config.biweeklyPayment;

  const handleSaveConfig = () => {
    store.updateSalaryConfig({
      baseSalary: parseFloat(baseSalary) || 0,
      biweeklyPayment: parseFloat(biweeklyPayment) || 0,
      overtimeRate50: parseFloat(overtimeRate50) || 0,
      overtimeRate100: parseFloat(overtimeRate100) || 0,
      iessAporteActive,
      saludConyugeActive,
      fondosReservaActive,
    });
    setShowConfig(false);
  };

  const toggleWeek = (index: number) => {
    const newWeeks = selectedWeeks.includes(index) ? selectedWeeks.filter(i => i !== index) : [...selectedWeeks, index];
    store.updateSelectedWeeks(newWeeks);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="card-elevated rounded-xl p-4 md:p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
            <CreditCard size={24} className="text-blue-400" />
            Pagos y Proyección - {format(new Date(), 'MMMM yyyy', { locale: es })}
          </h2>
        <div className="flex gap-2 flex-wrap w-full sm:w-auto">
          <select value={selectedYear} onChange={(e) => { store.updateSelectedYear(parseInt(e.target.value)); store.updateSelectedWeeks([]); }} className="px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-600/50">
            <option value={2025}>2025</option>
            <option value={2026}>2026</option>
            <option value={2027}>2027</option>
          </select>
          <button onClick={() => setShowConfig(!showConfig)} className="flex items-center gap-1 bg-slate-700/50 hover:bg-slate-600/50 px-3 py-2 rounded-lg text-sm transition ml-auto sm:ml-0">
            <Settings size={16} /> Config
          </button>
        </div>
      </div>
      </div>

      <AnimatePresence>
        {showConfig && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="card-solid rounded-xl p-4 md:p-6 space-y-4">
              <h3 className="text-lg font-semibold text-white">Configuración de Pago</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="label-clear text-sm block mb-1">Sueldo Base</label>
                  <input type="number" value={baseSalary} onChange={(e) => setBaseSalary(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="label-clear text-sm block mb-1">Quincena</label>
                  <input type="number" value={biweeklyPayment} onChange={(e) => setBiweeklyPayment(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" placeholder="0.00" />
                </div>
                <div>
                  <label className="label-clear text-sm block mb-1">Costo Hora Extra 50% ($)</label>
                  <input type="number" step="0.01" value={overtimeRate50} onChange={(e) => setOvertimeRate50(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" placeholder="Automático" />
                  <p className="text-xs text-slate-400 mt-1">Auto: {formatCurrency((base / 240) * 1.5)}/h</p>
                </div>
                <div>
                  <label className="label-clear text-sm block mb-1">Costo Hora Extra 100% ($)</label>
                  <input type="number" step="0.01" value={overtimeRate100} onChange={(e) => setOvertimeRate100(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" placeholder="Automático" />
                  <p className="text-xs text-slate-400 mt-1">Auto: {formatCurrency((base / 240) * 2)}/h</p>
                </div>
              </div>
              <div className="border-t border-slate-700 pt-4">
                <h4 className="text-sm font-medium text-slate-200 mb-3">Items Especiales</h4>
                <div className="space-y-3">
                  <label className="flex items-center justify-between bg-slate-700/80 rounded-lg px-4 py-3 cursor-pointer border border-slate-600/50 hover:bg-slate-700">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className="text-blue-400" />
                      <div>
                        <p className="text-sm text-white font-medium">Aporte Personal IESS</p>
                        <p className="text-xs text-slate-300">9.45% sobre (Base + Horas Extras)</p>
                      </div>
                    </div>
                    <input type="checkbox" checked={iessAporteActive} onChange={(e) => store.updateSalaryConfig({ ...config, iessAporteActive: e.target.checked })} className="w-5 h-5 rounded border-slate-500 accent-blue-500" />
                  </label>
                  <label className="flex items-center justify-between bg-slate-700/80 rounded-lg px-4 py-3 cursor-pointer border border-slate-600/50 hover:bg-slate-700">
                    <div className="flex items-center gap-3">
                      <Heart size={18} className="text-pink-400" />
                      <div>
                        <p className="text-sm text-white font-medium">Salud Cónyuge IESS</p>
                        <p className="text-xs text-slate-300">3.41% sobre (Base + Horas Extras)</p>
                      </div>
                    </div>
                    <input type="checkbox" checked={saludConyugeActive} onChange={(e) => store.updateSalaryConfig({ ...config, saludConyugeActive: e.target.checked })} className="w-5 h-5 rounded border-slate-500 accent-pink-500" />
                  </label>
                  <label className="flex items-center justify-between bg-slate-700/80 rounded-lg px-4 py-3 cursor-pointer border border-slate-600/50 hover:bg-slate-700">
                    <div className="flex items-center gap-3">
                      <PiggyBank size={18} className="text-emerald-400" />
                      <div>
                        <p className="text-sm text-white font-medium">Fondos de Reserva</p>
                        <p className="text-xs text-slate-300">8.33% sobre (Base + Horas Extras)</p>
                      </div>
                    </div>
                    <input type="checkbox" checked={fondosReservaActive} onChange={(e) => store.updateSalaryConfig({ ...config, fondosReservaActive: e.target.checked })} className="w-5 h-5 rounded border-slate-500 accent-emerald-500" />
                  </label>
                </div>
              </div>
              <button onClick={handleSaveConfig} className="btn-primary w-full px-4 py-2 rounded-lg text-sm">Guardar Configuración</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="card-solid rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <DollarSign size={20} className="text-emerald-400" />
          Proyección del Mes Actual
        </h3>

        <div className="mb-4">
          <button onClick={() => setShowWeekSelector(!showWeekSelector)} className="w-full flex items-center justify-between bg-slate-700/80 border border-slate-600/50 rounded-lg px-4 py-3 text-left hover:bg-slate-700 transition">
            <div className="flex items-center gap-2">
              <ListChecks size={18} className="text-blue-400" />
              <span className="text-sm text-white font-medium">{selectedWeeks.length === 0 ? 'Seleccionar semanas del año para cobro' : `${selectedWeeks.length} semana(s) seleccionada(s)`}</span>
            </div>
            <ChevronDown size={18} className={`text-slate-300 transition-transform ${showWeekSelector ? 'rotate-180' : ''}`} />
          </button>

          <AnimatePresence>
            {showWeekSelector && (
              <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                <div className="bg-slate-800 rounded-b-lg p-3 space-y-2 border-t border-slate-700">
                  <div className="flex gap-2 mb-3">
                    <button onClick={() => store.updateSelectedWeeks(weeksWithData.map(w => w.index))} className="btn-secondary text-xs px-3 py-1.5 rounded">✓ Seleccionar Todas con Datos</button>
                    <button onClick={() => store.updateSelectedWeeks([])} className="btn-secondary text-xs px-3 py-1.5 rounded">✗ Limpiar</button>
                  </div>
                  <div className="space-y-1 max-h-96 overflow-y-auto">
                    {weeksWithData.map((week) => (
                      <label key={week.index} className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition border ${selectedWeeks.includes(week.index) ? 'bg-blue-500/20 border-blue-500/50' : 'bg-slate-700/50 border-slate-600/50 hover:bg-slate-700/80'}`}>
                        <div className="flex items-center gap-3">
                          <input type="checkbox" checked={selectedWeeks.includes(week.index)} onChange={() => toggleWeek(week.index)} className="w-4 h-4 rounded border-slate-500 accent-blue-500" />
                          <div>
                            <p className="text-sm font-semibold text-white">Semana {week.weekNumber}</p>
                            <p className="text-xs text-slate-300">{week.period}</p>
                          </div>
                        </div>
                        <div className="text-right text-xs">
                          <p className="text-yellow-400 font-medium">{week.totalExtra50.toFixed(1)}h @50%</p>
                          <p className="text-red-400 font-medium">{week.totalExtra100.toFixed(1)}h @100%</p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {selectedWeeks.length > 0 && (
          <div className="mb-4 bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
            <p className="text-xs text-blue-300 font-medium mb-2">Semanas seleccionadas:</p>
            <div className="flex flex-wrap gap-2">
              {selectedWeeks.sort((a, b) => a - b).map(i => {
                const week = weeklyBreakdown[i];
                return <span key={i} className="text-xs bg-blue-500/30 border border-blue-500/50 px-2 py-1 rounded text-blue-200 font-medium">Sem {week.weekNumber} ({week.period})</span>;
              })}
            </div>
          </div>
        )}

        <div className="space-y-2 mb-6">
          {(selectedWeeks.length > 0 ? weeklyBreakdown.filter((_, i) => selectedWeeks.includes(i)) : weeksWithData).map((week) => {
            const i = week.index;
            return (
              <div key={i} className="bg-slate-700/80 rounded-lg overflow-hidden border border-slate-600/50">
                <button onClick={() => setExpandedWeek(expandedWeek === i ? null : i)} className="w-full flex flex-col sm:flex-row sm:items-center justify-between px-3 md:px-4 py-3 text-left transition gap-2 hover:bg-slate-700">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-blue-400 bg-blue-500/30 px-2 py-1 rounded border border-blue-500/50">Sem {week.weekNumber}</span>
                    <span className="text-sm text-white font-medium">{week.period}</span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 md:gap-4 text-xs">
                    <span className="text-emerald-400 font-semibold">Extras: {formatCurrency(week.payment.total)}</span>
                    {week.holidayHours > 0 && <span className="text-yellow-400 font-medium">🎉 Fer: {week.holidayHours.toFixed(1)}h</span>}
                    {expandedWeek === i ? <ChevronUp size={16} className="text-slate-300" /> : <ChevronDown size={16} className="text-slate-300" />}
                  </div>
                </button>
                <AnimatePresence>
                  {expandedWeek === i && (
                    <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                      <div className="px-3 md:px-4 pb-3 space-y-2 bg-slate-800 border-t border-slate-700">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                          <div className="bg-slate-700/80 rounded p-2 border border-slate-600/50">
                            <p className="text-slate-300">Horas L-V</p>
                            <p className="text-white font-bold mt-1">{week.weekdayHours.toFixed(1)}h</p>
                          </div>
                          <div className="bg-slate-700/80 rounded p-2 border border-slate-600/50">
                            <p className="text-slate-300">Extra 50%</p>
                            <p className="text-yellow-400 font-bold mt-1">{week.weekendHours50.toFixed(1)}h</p>
                          </div>
                          <div className="bg-slate-700/80 rounded p-2 border border-slate-600/50">
                            <p className="text-slate-300">Extra 100%</p>
                            <p className="text-red-400 font-bold mt-1">{week.weekendHours100.toFixed(1)}h</p>
                          </div>
                          <div className="bg-slate-700/80 rounded p-2 border border-slate-600/50">
                            <p className="text-slate-300">Feriados</p>
                            <p className="text-emerald-400 font-bold mt-1">{week.holidayHours.toFixed(1)}h</p>
                          </div>
                        </div>
                        <div className="text-xs text-right text-blue-300 font-medium pt-2 border-t border-slate-700">Pago extras: {formatCurrency(week.payment.total)}</div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

        <div className="card-elevated rounded-xl p-4 md:p-6 border-2 border-blue-500/30">
          <h4 className="text-base md:text-lg font-bold mb-4 text-white flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-400" />
            Resumen de Pago
          </h4>
          <div className="space-y-2 md:space-y-3">
            <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
              <span className="text-slate-200 font-medium">Sueldo Base</span>
              <span className="text-white font-bold">{formatCurrency(base)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
              <span className="text-slate-200 font-medium">Horas Extra 50% ({totalHours50.toFixed(1)}h)</span>
              <span className="text-yellow-400 font-bold">{formatCurrency(totalOvertimePayment.payment50)}</span>
            </div>
            <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
              <span className="text-slate-200 font-medium">Horas Extra 100% ({totalHours100.toFixed(1)}h)</span>
              <span className="text-red-400 font-bold">{formatCurrency(totalOvertimePayment.payment100)}</span>
            </div>
            <div className="py-2 border-b border-slate-700/50">
              <button 
                onClick={() => setShowBonusesDetail(!showBonusesDetail)}
                className="w-full flex justify-between items-center text-sm hover:bg-slate-700/30 px-2 py-1 rounded transition-colors"
              >
                <span className="text-slate-200 font-medium flex items-center gap-1">
                  Bonos Activos
                  <ChevronDown size={14} className={`transition-transform ${showBonusesDetail ? 'rotate-180' : ''}`} />
                </span>
                <span className="text-emerald-400 font-bold">+{formatCurrency(totalBonuses)}</span>
              </button>
              <AnimatePresence>
                {showBonusesDetail && bonuses.filter(b => b.active && !b.isSpecial).length > 0 && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden mt-2 ml-4 space-y-1"
                  >
                    {bonuses.filter(b => b.active && !b.isSpecial).map(bonus => (
                      <div key={bonus.id} className="flex justify-between text-xs bg-emerald-500/10 rounded px-2 py-1">
                        <span className="text-slate-300">{bonus.name}</span>
                        <span className="text-emerald-400">
                          {bonus.basedOnSalary ? `${bonus.percentage}% = ${formatCurrency(baseIngreso * bonus.percentage / 100)}` : formatCurrency(bonus.amount)}
                        </span>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
            {fondosReservaActive && (
              <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                <span className="text-slate-200 font-medium flex items-center gap-1"><PiggyBank size={14} className="text-emerald-400" /> Fondos de Reserva</span>
                <span className="text-emerald-400 font-bold">+{formatCurrency(fondosAmount)}</span>
              </div>
            )}
            <div className="pt-2">
              <p className="text-xs text-slate-400 font-semibold mb-2">DESCUENTOS</p>
              <div className="py-2 border-b border-slate-700/50">
                <button 
                  onClick={() => setShowDiscountsDetail(!showDiscountsDetail)}
                  className="w-full flex justify-between items-center text-sm hover:bg-slate-700/30 px-2 py-1 rounded transition-colors"
                >
                  <span className="text-slate-200 font-medium flex items-center gap-1">
                    Descuentos
                    <ChevronDown size={14} className={`transition-transform ${showDiscountsDetail ? 'rotate-180' : ''}`} />
                  </span>
                  <span className="text-red-400 font-bold">-{formatCurrency(totalDiscounts)}</span>
                </button>
                <AnimatePresence>
                  {showDiscountsDetail && discounts.filter(d => d.active && !d.isSpecial).length > 0 && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="overflow-hidden mt-2 ml-4 space-y-1"
                    >
                      {discounts.filter(d => d.active && !d.isSpecial).map(discount => (
                        <div key={discount.id} className="flex justify-between text-xs bg-red-500/10 rounded px-2 py-1">
                          <span className="text-slate-300">{discount.name}</span>
                          <span className="text-red-400">
                            {discount.basedOnSalary ? `${discount.percentage}% = ${formatCurrency(baseIngreso * discount.percentage / 100)}` : formatCurrency(discount.amount)}
                          </span>
                        </div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
              {iessAporteActive && (
                <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                  <span className="text-slate-200 font-medium flex items-center gap-1"><Shield size={14} className="text-blue-400" /> IESS Aporte</span>
                  <span className="text-red-400 font-bold">-{formatCurrency(iessAmount)}</span>
                </div>
              )}
              {saludConyugeActive && (
                <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                  <span className="text-slate-200 font-medium flex items-center gap-1"><Heart size={14} className="text-pink-400" /> Salud Cónyuge</span>
                  <span className="text-red-400 font-bold">-{formatCurrency(saludAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm py-2 border-b border-slate-700/50">
                <span className="text-slate-200 font-medium">Quincena</span>
                <span className="text-red-400 font-bold">-{formatCurrency(config.biweeklyPayment)}</span>
              </div>
            </div>
            <div className="flex justify-between text-lg md:text-xl font-bold pt-4 mt-2 border-t-2 border-emerald-500/50">
              <span className="text-white">Neto a Recibir</span>
              <span className="text-emerald-400">{formatCurrency(netPayable)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
