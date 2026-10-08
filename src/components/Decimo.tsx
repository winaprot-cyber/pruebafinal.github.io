import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Edit2, Save, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency, getMonthName, generateId, calculateOvertimePayment } from '../utils/calculations';
import type { useStore } from '../store/useStore';
import type { DecimoEntry } from '../store/useStore';

export default function Decimo({ store }: { store: ReturnType<typeof useStore> }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [baseSalary, setBaseSalary] = useState('');
  const [hours50, setHours50] = useState('');
  const [hours100, setHours100] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const base = store.data.salaryConfig.baseSalary;

  // Calcular el año base del periodo del décimo
  // El periodo va de Diciembre a Noviembre
  // Si estamos entre Enero y Noviembre, el periodo es Dic(año-1) - Nov(año)
  // Si estamos en Diciembre, el periodo es Dic(año) - Nov(año+1)
  const getCurrentDecimoPeriod = () => {
    const today = new Date();
    const currentMonth = today.getMonth(); // 0-11
    const currentYear = today.getFullYear();
    
    // Si estamos en Diciembre (11), el periodo empieza este año
    // Si estamos entre Enero (0) y Noviembre (10), el periodo empezó el año anterior
    const periodStartYear = currentMonth === 11 ? currentYear : currentYear - 1;
    
    return periodStartYear;
  };

  const periodStartYear = getCurrentDecimoPeriod();

  // Generate 12 months from December (periodStartYear) to November (periodStartYear + 1)
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (11 + i) % 12; // Dec=11, Jan=0, Feb=1, ...
    const year = i < 1 ? periodStartYear : periodStartYear + 1;
    const entry = store.data.decimoEntries.find(e => e.month === month && e.year === year);
    return {
      month,
      year,
      entry,
      label: `${getMonthName(month).substring(0, 3)} ${year}`,
    };
  });

  // Calculate totals
  const periodEntries = store.data.decimoEntries.filter(e => {
    // Filtrar solo los entries del periodo actual
    const isDecember = e.month === 11 && e.year === periodStartYear;
    const isJanToNov = e.month >= 0 && e.month <= 10 && e.year === periodStartYear + 1;
    return isDecember || isJanToNov;
  });

  const totalDecimo = periodEntries.reduce((sum, e) => sum + e.total, 0);
  const monthlyDecimo = totalDecimo / 12;

  // Chart data
  const chartData = months.map(m => ({
    name: m.label,
    total: m.entry?.total || 0,
    acumulado: 0,
  }));

  // Calculate accumulated
  let acc = 0;
  chartData.forEach(d => {
    acc += d.total;
    d.acumulado = acc;
  });

  // Auto-calculate rule: on 1st of month, use base salary + overtime
  useEffect(() => {
    const today = new Date();
    if (today.getDate() === 1) {
      const currentMonth = today.getMonth();
      const currentYear = today.getFullYear();
      const existing = store.data.decimoEntries.find(e => e.month === currentMonth && e.year === currentYear);
      if (!existing && base > 0) {
        // Get previous month's overtime
        const prevMonth = currentMonth === 0 ? 11 : currentMonth - 1;
        const prevYear = currentMonth === 0 ? currentYear - 1 : currentYear;
        const prevEntries = store.data.timeEntries.filter(e => {
          const d = new Date(e.date);
          return d.getMonth() === prevMonth && d.getFullYear() === prevYear;
        });
        const totalHours = prevEntries.reduce((s, e) => s + e.hours, 0);
        const overtime = calculateOvertimePayment(totalHours * 0.1, totalHours * 0.05, base);
        
        const entry: DecimoEntry = {
          id: generateId(),
          month: currentMonth,
          year: currentYear,
          baseSalary: base,
          overtimeHours50: totalHours * 0.1,
          overtimeHours100: totalHours * 0.05,
          total: base + overtime.total,
        };
        store.addDecimoEntry(entry);
      }
    }
  }, []);

  const handleSave = () => {
    const baseSal = parseFloat(baseSalary) || base;
    const h50 = parseFloat(hours50) || 0;
    const h100 = parseFloat(hours100) || 0;
    
    // Calculate total from hours or use manual total
    let calculatedTotal = baseSal + calculateOvertimePayment(h50, h100, baseSal).total;
    const manualTotal = parseFloat(totalAmount);
    const finalTotal = manualTotal > 0 ? manualTotal : calculatedTotal;

    const entry: DecimoEntry = {
      id: editingId || generateId(),
      month: selectedMonth,
      year: selectedMonth === 11 ? periodStartYear : periodStartYear + 1,
      baseSalary: baseSal,
      overtimeHours50: h50,
      overtimeHours100: h100,
      total: finalTotal,
    };
    store.addDecimoEntry(entry);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este registro?')) {
      const currentEntries = store.data.decimoEntries.filter(e => e.id !== id);
      store.updateData({ decimoEntries: currentEntries });
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setBaseSalary('');
    setHours50('');
    setHours100('');
    setTotalAmount('');
  };

  const startEdit = (entry: DecimoEntry) => {
    setEditingId(entry.id);
    setSelectedMonth(entry.month);
    setBaseSalary(entry.baseSalary.toString());
    setHours50(entry.overtimeHours50.toString());
    setHours100(entry.overtimeHours100.toString());
    setTotalAmount(entry.total.toString());
    setShowForm(true);
  };

  const filledMonths = periodEntries.length;
  const completionPercentage = (filledMonths / 12) * 100;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar size={24} className="text-cyan-400" />
            Décimo Tercero
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Periodo: Diciembre {periodStartYear} - Noviembre {periodStartYear + 1}
          </p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/30 px-3 py-2 rounded-lg text-cyan-300 text-sm w-full sm:w-auto justify-center"
        >
          <Plus size={14} /> Ingresar / Editar
        </button>
      </div>

      {/* Main Total */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 rounded-xl p-4 md:p-6 text-center"
      >
        <p className="text-xs md:text-sm text-cyan-300 mb-1">Total a Recibir (Acumulado ÷ 12)</p>
        <p className="text-3xl md:text-5xl font-bold text-white mb-2">{formatCurrency(monthlyDecimo)}</p>
        <p className="text-xs md:text-sm text-slate-400">
          Total acumulado: {formatCurrency(totalDecimo)} de 12 meses
        </p>
        <div className="mt-4 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{filledMonths}/12 meses registrados</span>
            <span>{completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="bg-slate-700/50 rounded-full h-3">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${completionPercentage}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full"
            />
          </div>
        </div>
      </motion.div>

      {/* Form */}
      {showForm && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6"
        >
          <h3 className="text-base md:text-lg font-semibold mb-4">{editingId ? 'Editar' : 'Ingresar'} Décimo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Mes</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (11 + i) % 12;
                  const year = i < 1 ? periodStartYear : periodStartYear + 1;
                  return (
                    <option key={i} value={month}>
                      {getMonthName(month)} {year}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Sueldo Base</label>
              <input
                type="number"
                value={baseSalary}
                onChange={e => setBaseSalary(e.target.value)}
                placeholder={base.toString()}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Horas Extra 50%</label>
              <input
                type="number"
                step="0.5"
                value={hours50}
                onChange={e => setHours50(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Horas Extra 100%</label>
              <input
                type="number"
                step="0.5"
                value={hours100}
                onChange={e => setHours100(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Monto Total (Manual - Opcional)</label>
              <input
                type="number"
                step="0.01"
                value={totalAmount}
                onChange={e => setTotalAmount(e.target.value)}
                placeholder="Dejar vacío para auto-calcular"
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
              <p className="text-xs text-slate-500 mt-1">Si se ingresa, reemplaza el cálculo automático</p>
            </div>
          </div>
          
          <div className="bg-slate-700/30 rounded-lg px-4 py-2 mt-4">
            <p className="text-xs text-slate-400">Total calculado (auto)</p>
            <p className="text-lg font-bold text-cyan-400">
              {formatCurrency(
                (parseFloat(baseSalary) || base) +
                calculateOvertimePayment(
                  parseFloat(hours50) || 0,
                  parseFloat(hours100) || 0,
                  parseFloat(baseSalary) || base
                ).total
              )}
            </p>
            {totalAmount && (
              <p className="text-xs text-yellow-400 mt-1">
                Total manual: {formatCurrency(parseFloat(totalAmount) || 0)}
              </p>
            )}
          </div>

          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 rounded-lg text-cyan-300 text-sm">
              <Save size={14} /> {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button onClick={resetForm} className="bg-slate-600/30 px-4 py-2 rounded-lg text-slate-400 text-sm">Cancelar</button>
          </div>
        </motion.div>
      )}

      {/* Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Progresión Mensual (Dic {periodStartYear} - Nov {periodStartYear + 1})</h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Bar dataKey="total" fill="#06b6d4" name="Valor Mensual" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="h-36 md:h-48 mt-4">
          <p className="text-xs md:text-sm text-slate-400 mb-2">Acumulado</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
              <YAxis stroke="#94a3b8" />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="acumulado" stroke="#8b5cf6" name="Acumulado" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Monthly Detail */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Detalle por Mes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {months.map((m, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className={`rounded-lg p-3 border ${
                m.entry
                  ? 'bg-cyan-500/10 border-cyan-500/30'
                  : 'bg-slate-700/20 border-slate-700/30'
              }`}
            >
              <p className="text-xs text-slate-400">{m.label}</p>
              {m.entry ? (
                <>
                  <p className="text-base md:text-lg font-bold text-white">{formatCurrency(m.entry.total)}</p>
                  <p className="text-xs text-slate-500">Base: {formatCurrency(m.entry.baseSalary)}</p>
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => startEdit(m.entry!)}
                      className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      <Edit2 size={10} /> Editar
                    </button>
                    <button
                      onClick={() => handleDelete(m.entry!.id)}
                      className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1"
                    >
                      <Trash2 size={10} /> Eliminar
                    </button>
                  </div>
                </>
              ) : (
                <p className="text-sm text-slate-600">Sin registrar</p>
              )}
            </motion.div>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="bg-slate-800/30 border border-slate-700/30 rounded-xl p-4">
        <p className="text-xs text-slate-500">
          <strong className="text-slate-400">Periodo anual:</strong> El décimo se calcula de Diciembre a Noviembre. 
          Cuando el año cambie a {periodStartYear + 2}, automáticamente se tomará el periodo Diciembre {periodStartYear + 1} - Noviembre {periodStartYear + 2}.
          <br /><br />
          <strong className="text-slate-400">Regla automática:</strong> Cada 1 de cada mes se calcula automáticamente 
          el décimo usando el sueldo base + total de horas extras del mes anterior.
        </p>
      </div>
    </div>
  );
}
