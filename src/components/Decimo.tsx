import { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Plus, Edit2, Save, Trash2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { formatCurrency, getMonthName, generateId } from '../utils/calculations';
import type { useStore } from '../store/useStore';
import type { DecimoEntry } from '../types';

export default function Decimo({ store }: { store: ReturnType<typeof useStore> }) {
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [baseSalary, setBaseSalary] = useState('');
  const [hours50, setHours50] = useState('');
  const [hours100, setHours100] = useState('');
  const [totalAmount, setTotalAmount] = useState('');

  const base = store.getSalaryConfig().baseSalary;
  const decimoEntries = store.getUserDecimoEntries();
  const currentYear = new Date().getFullYear();

  const months = Array.from({ length: 12 }, (_, i) => {
    const month = (11 + i) % 12;
    const year = i < 1 ? currentYear - 1 : currentYear;
    const entry = decimoEntries.find(e => e.month === month && e.year === year);
    return { month, year, entry, label: `${getMonthName(month).substring(0, 3)} ${year}` };
  });

  const totalDecimo = decimoEntries.reduce((sum, e) => sum + e.total, 0);
  const monthlyDecimo = totalDecimo / 12;

  const chartData = months.map(m => ({ name: m.label, total: m.entry?.total || 0, acumulado: 0 }));
  let acc = 0;
  chartData.forEach(d => { acc += d.total; d.acumulado = acc; });

  const handleSave = () => {
    const baseSal = parseFloat(baseSalary) || base;
    const entry: DecimoEntry = {
      id: editingId || generateId(),
      month: selectedMonth,
      year: selectedMonth === 11 ? currentYear - 1 : currentYear,
      baseSalary: baseSal,
      overtimeHours50: parseFloat(hours50) || 0,
      overtimeHours100: parseFloat(hours100) || 0,
      total: parseFloat(totalAmount) || baseSal,
    };
    store.addDecimoEntry(entry);
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

  const filledMonths = decimoEntries.length;
  const completionPercentage = (filledMonths / 12) * 100;

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
            <Calendar size={24} className="text-cyan-400" />
            Décimo Tercero
          </h2>
          <p className="text-xs text-slate-400 mt-1">Periodo: Diciembre {currentYear - 1} - Noviembre {currentYear}</p>
        </div>
        <button onClick={() => { setShowForm(true); setEditingId(null); setBaseSalary(''); setHours50(''); setHours100(''); setTotalAmount(''); }} className="flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/30 px-3 py-2 rounded-lg text-cyan-300 text-sm w-full sm:w-auto justify-center">
          <Plus size={14} /> Ingresar / Editar
        </button>
      </div>

      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-gradient-to-br from-cyan-500/20 to-blue-600/10 border border-cyan-500/30 rounded-xl p-4 md:p-6 text-center">
        <p className="text-xs md:text-sm text-cyan-300 mb-1">Total a Recibir (Acumulado ÷ 12)</p>
        <p className="text-3xl md:text-5xl font-bold text-white mb-2">{formatCurrency(monthlyDecimo)}</p>
        <p className="text-xs md:text-sm text-slate-400">Total acumulado: {formatCurrency(totalDecimo)} de 12 meses</p>
        <div className="mt-4 max-w-md mx-auto">
          <div className="flex justify-between text-xs text-slate-400 mb-1">
            <span>{filledMonths}/12 meses registrados</span>
            <span>{completionPercentage.toFixed(0)}%</span>
          </div>
          <div className="bg-slate-700/50 rounded-full h-3">
            <motion.div initial={{ width: 0 }} animate={{ width: `${completionPercentage}%` }} transition={{ duration: 1, ease: 'easeOut' }} className="bg-gradient-to-r from-cyan-400 to-blue-500 h-3 rounded-full" />
          </div>
        </div>
      </motion.div>

      {showForm && (
        <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
          <h3 className="text-base md:text-lg font-semibold mb-4">{editingId ? 'Editar' : 'Ingresar'} Décimo</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Mes</label>
              <select value={selectedMonth} onChange={e => setSelectedMonth(parseInt(e.target.value))} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm">
                {Array.from({ length: 12 }, (_, i) => {
                  const month = (11 + i) % 12;
                  const year = i < 1 ? currentYear - 1 : currentYear;
                  return <option key={i} value={month}>{getMonthName(month)} {year}</option>;
                })}
              </select>
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Sueldo Base</label>
              <input type="number" value={baseSalary} onChange={e => setBaseSalary(e.target.value)} placeholder={base.toString()} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Horas Extra 50%</label>
              <input type="number" step="0.5" value={hours50} onChange={e => setHours50(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div>
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Horas Extra 100%</label>
              <input type="number" step="0.5" value={hours100} onChange={e => setHours100(e.target.value)} className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
            <div className="md:col-span-2">
              <label className="text-xs md:text-sm text-slate-400 block mb-1">Monto Total (Manual - Opcional)</label>
              <input type="number" step="0.01" value={totalAmount} onChange={e => setTotalAmount(e.target.value)} placeholder="Dejar vacío para auto-calcular" className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm" />
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button onClick={handleSave} className="flex items-center gap-1 bg-cyan-500/20 border border-cyan-500/30 px-4 py-2 rounded-lg text-cyan-300 text-sm">
              <Save size={14} /> {editingId ? 'Actualizar' : 'Guardar'}
            </button>
            <button onClick={() => setShowForm(false)} className="bg-slate-600/30 px-4 py-2 rounded-lg text-slate-400 text-sm">Cancelar</button>
          </div>
        </motion.div>
      )}

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Progresión Mensual</h3>
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
      </div>

      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4">Detalle por Mes</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {months.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className={`rounded-lg p-3 border ${m.entry ? 'bg-cyan-500/10 border-cyan-500/30' : 'bg-slate-700/20 border-slate-700/30'}`}>
              <p className="text-xs text-slate-400">{m.label}</p>
              {m.entry ? (
                <>
                  <p className="text-base md:text-lg font-bold text-white">{formatCurrency(m.entry.total)}</p>
                  <p className="text-xs text-slate-500">Base: {formatCurrency(m.entry.baseSalary)}</p>
                  <div className="flex gap-2 mt-2">
                    <button onClick={() => startEdit(m.entry!)} className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                      <Edit2 size={10} /> Editar
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
    </div>
  );
}
