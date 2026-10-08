import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Clock, DollarSign, Calendar, CreditCard, AlertTriangle, TrendingUp, Filter } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { formatCurrency } from '../utils/calculations';
import type { useStore } from '../store/useStore';

type FilterType = 'all' | 'time' | 'bonus' | 'discount' | 'income' | 'expense' | 'debt' | 'holiday';

export default function Historial({ store }: { store: ReturnType<typeof useStore> }) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterType>('all');

  interface HistoryItem {
    id: string;
    date: string;
    type: string;
    description: string;
    detail: string;
    icon: string;
    color: string;
  }

  const history: HistoryItem[] = [];

  // Time entries
  store.data.timeEntries.forEach(e => {
    history.push({
      id: e.id,
      date: e.date,
      type: 'time',
      description: `Marcación: ${e.entryTime} - ${e.exitTime || 'Pendiente'}`,
      detail: `${e.hours.toFixed(2)}h trabajadas${e.isHoliday ? ' (Feriado)' : ''}`,
      icon: 'clock',
      color: 'blue',
    });
  });

  // Bonuses
  store.data.bonuses.forEach(b => {
    history.push({
      id: b.id,
      date: new Date().toISOString().split('T')[0],
      type: 'bonus',
      description: `Bono: ${b.name}`,
      detail: `${formatCurrency(b.amount)} ${b.active ? '(Activo)' : '(Inactivo)'}${b.basedOnSalary ? ` - ${b.percentage}% del sueldo` : ''}`,
      icon: 'trending',
      color: 'emerald',
    });
  });

  // Discounts
  store.data.discounts.forEach(d => {
    history.push({
      id: d.id,
      date: new Date().toISOString().split('T')[0],
      type: 'discount',
      description: `Descuento: ${d.name}`,
      detail: `${formatCurrency(d.amount)} ${d.active ? '(Activo)' : '(Inactivo)'}${d.basedOnSalary ? ` - ${d.percentage}% del sueldo` : ''}`,
      icon: 'credit',
      color: 'red',
    });
  });

  // Incomes
  store.data.incomes.forEach(i => {
    history.push({
      id: i.id,
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      description: `Ingreso: ${i.name}`,
      detail: `${formatCurrency(i.amount)} - ${i.fixed ? 'Fijo' : 'Variable'}${i.forMonthEnd ? ' (Fin de mes)' : ''}`,
      icon: 'dollar',
      color: 'green',
    });
  });

  // Expenses
  store.data.expenses.forEach(e => {
    history.push({
      id: e.id,
      date: new Date().toISOString().split('T')[0],
      type: 'expense',
      description: `Gasto: ${e.name}`,
      detail: `${formatCurrency(e.amount)} - ${e.category} (${e.frequency})`,
      icon: 'dollar',
      color: 'orange',
    });
  });

  // Debts
  store.data.debts.forEach(d => {
    history.push({
      id: d.id,
      date: new Date().toISOString().split('T')[0],
      type: 'debt',
      description: `Deuda: ${d.name}`,
      detail: `Total: ${formatCurrency(d.totalAmount)} - Pago: ${formatCurrency(d.monthlyPayment)}/mes (${d.progress.toFixed(0)}% pagado)`,
      icon: 'alert',
      color: 'rose',
    });
  });

  // Holidays
  store.data.holidays.forEach(h => {
    history.push({
      id: h.id,
      date: h.date,
      type: 'holiday',
      description: `Feriado: ${h.name}`,
      detail: format(parseISO(h.date), 'dd MMMM yyyy', { locale: es }),
      icon: 'calendar',
      color: 'yellow',
    });
  });

  // Sort by date descending
  history.sort((a, b) => b.date.localeCompare(a.date));

  // Filter
  const filtered = history.filter(item => {
    if (filter !== 'all' && item.type !== filter) return false;
    if (search && !item.description.toLowerCase().includes(search.toLowerCase()) && 
        !item.detail.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const getIcon = (icon: string) => {
    switch (icon) {
      case 'clock': return <Clock size={16} />;
      case 'trending': return <TrendingUp size={16} />;
      case 'credit': return <CreditCard size={16} />;
      case 'dollar': return <DollarSign size={16} />;
      case 'alert': return <AlertTriangle size={16} />;
      case 'calendar': return <Calendar size={16} />;
      default: return <Clock size={16} />;
    }
  };

  const getColorClass = (color: string) => {
    const colors: Record<string, string> = {
      blue: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      emerald: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      red: 'bg-red-500/20 text-red-400 border-red-500/30',
      green: 'bg-green-500/20 text-green-400 border-green-500/30',
      orange: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
      rose: 'bg-rose-500/20 text-rose-400 border-rose-500/30',
      yellow: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
    };
    return colors[color] || colors.blue;
  };

  const filterOptions: { value: FilterType; label: string }[] = [
    { value: 'all', label: 'Todo' },
    { value: 'time', label: 'Marcaciones' },
    { value: 'bonus', label: 'Bonos' },
    { value: 'discount', label: 'Descuentos' },
    { value: 'income', label: 'Ingresos' },
    { value: 'expense', label: 'Gastos' },
    { value: 'debt', label: 'Deudas' },
    { value: 'holiday', label: 'Feriados' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Historial Completo</h2>
        <span className="text-sm text-slate-400">{filtered.length} registros</span>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar en historial..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg pl-10 pr-4 py-2.5 text-white text-sm"
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 scrollbar-hide">
          {filterOptions.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition flex-shrink-0 ${
                filter === opt.value
                  ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                  : 'bg-slate-700/30 text-slate-400 hover:text-white'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* History List */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <Filter size={48} className="mx-auto mb-4 opacity-50" />
            <p>No hay registros que mostrar</p>
          </div>
        ) : (
          filtered.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.02 }}
              className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/30 rounded-xl px-4 py-3 hover:bg-slate-700/30 transition"
            >
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${getColorClass(item.color)}`}>
                {getIcon(item.icon)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{item.description}</p>
                <p className="text-xs text-slate-400 truncate">{item.detail}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-slate-500">{format(parseISO(item.date), 'dd MMM', { locale: es })}</p>
                <span className={`text-xs px-2 py-0.5 rounded-full ${getColorClass(item.color)}`}>
                  {item.type}
                </span>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
