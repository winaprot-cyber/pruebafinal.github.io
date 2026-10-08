import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Edit2, Save, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency, getMonthName, generateId, calculateOvertimePayment } from '../utils/calculations';
import type { useStore } from '../store/useStore';
import type { DecimoEntry } from '../store/useStore';

export default function Decimo({ store }: { store: ReturnType<typeof useStore> }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [baseSalary, setBaseSalary] = useState('');
  const [hours50, setHours50] = useState('');
  const [hours100, setHours100] = useState('');

  const base = store.data.salaryConfig.baseSalary;

  // Generate 12 months from December to November
  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (11 + i) % 12; // Dec=11, Jan=0, Feb=1, ...
    const year = i < 1 ? selectedYear - 1 : selectedYear;
    const entry = store.data.decimoEntries.find(e => e.month === month && e.year === year);
    return {
      month,
      year,
      entry,
      label: `${getMonthName(month).substring(0, 3)} ${year}`,
    };
  });

  // Calculate totals
  const totalDecimo = store.data.decimoEntries.reduce((sum, e) => sum + e.total, 0);
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
    const entry: DecimoEntry = {
      id: editingId || generateId(),
      month: selectedMonth,
      year: selectedYear,
      baseSalary: parseFloat(baseSalary) || base,
      overtimeHours50: parseFloat(hours50) || 0,
      overtimeHours100: parseFloat(hours100) || 0,
      total: (parseFloat(baseSalary) || base) + 
        calculateOvertimePayment(parseFloat(hours50) || 0, parseFloat(hours100) || 0, parseFloat(baseSalary) || base).total,
    };
    store.addDecimoEntry(entry);
    resetForm();
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingId(null);
    setBaseSalary('');
    setHours50('');
    setHours100('');
  };

  const startEdit = (entry: DecimoEntry) => {
    setEditingId(entry.id);
    setSelectedMonth(entry.month);
    setSelectedYear(entry.year);
    setBaseSalary(entry.baseSalary.toString());
    setHours50(entry.overtimeHours50.toString());
    setHours100(entry.overtimeHours100.toString());
    setShowForm(true);
  };

  const filledMonths = store.data.decimoEntries.length;
  const completionPercentage = (filledMonths / 12) * 100;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Calendar size={24} className="text-cyan-400" />
          Décimo Tercero
        </h2>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/30 px-3 py-2 rounded-lg text-cyan-300 text-sm"
        >
          <Plus size={14} /> Ingresar Manual
        </button>
      </div>

      {/* Main Total */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 rounded-xl p-6 text-center"
      >
        <p className="text-sm text-cyan-300 mb-1">Total a Recibir (Acumulado ÷ 12)</p>
        <p className="text-5xl font-bold text-white mb-2">{formatCurrency(monthlyDecimo)}</p>
        <p className="text-sm text-slate-400">
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
          className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6"
        >
          <h3 className="text-lg font-semibold mb-4">{editingId ? 'Editar' : 'Ingresar'} Décimo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-slate-400 block mb-1">Mes</label>
              <select
                value={selectedMonth}
                onChange={e => setSelectedMonth(parseInt(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i} value={i}>{getMonthName(i)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Año</label>
              <input
                type="number"
                value={selectedYear}
                onChange={e => setSelectedYear(parseInt(e.target.value))}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Sueldo Base</label>
              <input
                type="number"
                value={baseSalary}
                onChange={e => setBaseSalary(e.target.value)}
                placeholder={base.toString()}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Horas Extra 50%</label>
              <input
                type="number"
                step="0.5"
                value={hours50}
                onChange={e => setHours50(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400 block mb-1">Horas Extra 100%</label>
              <input
                type="number"
                step="0.5"
                value={hours100}
                onChange={e => setHours100(e.target.value)}
                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
            </div>
            <div className="flex items-end">
              <div className="bg-slate-700/30 rounded-lg px-4 py-2 w-full">
                <p className="text-xs text-slate-400">Total del mes</p>
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
              </div>
            </div>
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
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Progresión Mensual (Dic - Nov)</h3>
        <div className="h-64">
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
        <div className="h-48 mt-4">
          <p className="text-sm text-slate-400 mb-2">Acumulado</p>
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
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6">
        <h3 className="text-lg font-semibold mb-4">Detalle por Mes</h3>
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
                  <p className="text-lg font-bold text-white">{formatCurrency(m.entry.total)}</p>
                  <p className="text-xs text-slate-500">Base: {formatCurrency(m.entry.baseSalary)}</p>
                    <button
                    onClick={() => m.entry && startEdit(m.entry)}
                    className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 flex items-center gap-1"
                  >
                    <Edit2 size={10} /> Editar
                  </button>                </>
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
          <strong className="text-slate-400">Regla automática:</strong> Cada 1 de cada mes se calcula automáticamente 
          el décimo usando el sueldo base + total de horas extras del mes anterior. Los valores pueden ser editados manualmente.
          El periodo va de Diciembre a Noviembre (12 meses). El valor a recibir es el total acumulado dividido entre 12.
        </p>
      </div>
    </div>
  );
}
