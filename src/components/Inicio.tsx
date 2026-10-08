import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Camera, Calendar, Plus, Save, X, Sun, ChevronLeft, ChevronRight } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, addWeeks, subWeeks, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateHours, getWeeklyHours, applyRule45h, generateId } from '../utils/calculations';
import type { useStore } from '../store/useStore';

export default function Inicio({ store }: { store: ReturnType<typeof useStore> }) {
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [entryTime, setEntryTime] = useState('');
  const [exitTime, setExitTime] = useState('');
  const [entryPhoto, setEntryPhoto] = useState<string>('');
  const [exitPhoto, setExitPhoto] = useState<string>('');
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [holidayName, setHolidayName] = useState('');
  const [holidayDate, setHolidayDate] = useState('');
  const [editingEntry, setEditingEntry] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const entryPhotoRef = useRef<HTMLInputElement>(null);
  const exitPhotoRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const currentWeekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), weekOffset);
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: currentWeekStart, end: currentWeekEnd });

  const todayEntry = store.data.timeEntries.find(e => e.date === selectedDate);
  const weekEntries = store.data.timeEntries.filter(e => {
    const d = parseISO(e.date);
    return d >= currentWeekStart && d <= currentWeekEnd;
  });

  const weekData = getWeeklyHours(store.data.timeEntries, currentWeekStart);
  const rule45 = applyRule45h(store.data.timeEntries, store.data.holidays, currentWeekStart);

  const selectedMonth = currentWeekStart.getMonth();
  const selectedYear = currentWeekStart.getFullYear();
  const currentMonthHolidays = store.data.holidays.filter(h => 
    h.month === selectedMonth && h.year === selectedYear
  );

  const handlePhotoCapture = (type: 'entry' | 'exit') => {
    const ref = type === 'entry' ? entryPhotoRef : exitPhotoRef;
    ref.current?.click();
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'entry' | 'exit') => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const result = ev.target?.result as string;
        if (type === 'entry') setEntryPhoto(result);
        else setExitPhoto(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveEntry = () => {
    if (!entryTime) return;
    const hours = calculateHours(entryTime, exitTime || entryTime);
    const isHoliday = store.data.holidays.some(h => h.date === selectedDate);
    const holiday = store.data.holidays.find(h => h.date === selectedDate);

    store.addTimeEntry({
      id: todayEntry?.id || generateId(),
      date: selectedDate,
      entryTime,
      exitTime: exitTime || '',
      entryPhoto,
      exitPhoto,
      hours,
      isHoliday,
      holidayName: holiday?.name,
    });

    setEntryTime('');
    setExitTime('');
    setEntryPhoto('');
    setExitPhoto('');
  };

  const handleAddHoliday = () => {
    if (!holidayName || !holidayDate) return;
    const d = parseISO(holidayDate);
    store.addHoliday({
      id: generateId(),
      name: holidayName,
      date: holidayDate,
      month: d.getMonth(),
      year: d.getFullYear(),
    });
    setHolidayName('');
    setHolidayDate('');
    setShowHolidayForm(false);
  };

  // Projection data for next weeks - based on last 4 weeks statistics with 1% increment
  const last4Weeks = Array.from({ length: 4 }, (_, i) => {
    const pastWeekStart = subWeeks(currentWeekStart, 4 - i);
    const rule = applyRule45h(store.data.timeEntries, store.data.holidays, pastWeekStart);
    return rule.weekdayHours + rule.totalExtra;
  });
  
  const averageHours = last4Weeks.reduce((sum, h) => sum + h, 0) / 4;
  const incrementFactor = 1.01; // 1% increment
  
  const projectionData = Array.from({ length: 4 }, (_, i) => {
    const futureWeekStart = addWeeks(currentWeekStart, i + 1);
    const weekNumber = getWeek(futureWeekStart, { weekStartsOn: 1 });
    
    // Check if there are holidays in this future week
    const futureWeekEnd = endOfWeek(futureWeekStart, { weekStartsOn: 1 });
    const holidaysInWeek = store.data.holidays.filter(h => {
      const hDate = parseISO(h.date);
      return hDate >= futureWeekStart && hDate <= futureWeekEnd;
    });
    
    // Calculate projected hours with 1% increment per week
    const projectedHours = averageHours * Math.pow(incrementFactor, i + 1);
    
    // Adjust for holidays (holidays reduce working hours)
    const holidayAdjustment = holidaysInWeek.length * 8; // Assume 8h per holiday
    const adjustedHours = Math.max(0, projectedHours - holidayAdjustment);
    
    return {
      week: `Sem ${weekNumber}`,
      horas: Math.round(adjustedHours * 10) / 10,
      proyeccion: 45,
    };
  });

  const totalWeekHours = weekData.reduce((s, d) => s + d.hours, 0);
  const percentage = Math.min((totalWeekHours / 45) * 100, 150);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Week Navigation */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-3 md:p-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setWeekOffset(o => o - 1)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-600/50 transition"
          >
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <div className="text-center">
            <p className="text-sm md:text-base font-semibold text-white">
              {format(currentWeekStart, 'dd MMM', { locale: es })} - {format(currentWeekEnd, 'dd MMM yyyy', { locale: es })}
            </p>
            <p className="text-xs text-slate-400">
              {weekOffset === 0 ? 'Semana Actual' : weekOffset < 0 ? `${Math.abs(weekOffset)} semana(s) atrás` : `${weekOffset} semana(s) adelante`}
            </p>
          </div>
          <button
            onClick={() => setWeekOffset(o => o + 1)}
            className="flex items-center gap-1 px-3 py-2 bg-slate-700/50 rounded-lg text-sm hover:bg-slate-600/50 transition"
          >
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
        {weekOffset !== 0 && (
          <button
            onClick={() => setWeekOffset(0)}
            className="w-full mt-2 text-xs text-blue-400 hover:text-blue-300"
          >
            Volver a semana actual
          </button>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-xl p-4"
        >
          <p className="text-xs md:text-sm text-blue-300">Horas Semanales</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{totalWeekHours.toFixed(1)}h</p>
          <div className="mt-2 bg-slate-700/50 rounded-full h-2">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(percentage, 100)}%` }}
              className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full"
            />
          </div>
          <p className="text-xs text-slate-400 mt-1">{percentage.toFixed(0)}% de 45h</p>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 border border-purple-500/30 rounded-xl p-4"
        >
          <p className="text-xs md:text-sm text-purple-300">Horas Extra (Regla 45h)</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{rule45.totalExtra.toFixed(1)}h</p>
          <div className="flex gap-2 md:gap-3 mt-2 text-xs">
            <span className="text-yellow-300">50%: {rule45.totalExtra50.toFixed(1)}h</span>
            <span className="text-red-300">100%: {rule45.totalExtra100.toFixed(1)}h</span>
          </div>
        </motion.div>

        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4"
        >
          <p className="text-xs md:text-sm text-emerald-300">Feriados del Mes</p>
          <p className="text-2xl md:text-3xl font-bold text-white">{currentMonthHolidays.length}</p>
          <p className="text-xs text-slate-400 mt-2 truncate">
            {currentMonthHolidays.map(h => h.name).join(', ') || 'Sin feriados'}
          </p>
        </motion.div>
      </div>

      {/* Time Entry Form */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
          <Clock size={20} className="text-blue-400" />
          Registrar Marcación
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="text-xs md:text-sm text-slate-400 block mb-1">Fecha</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => {
                setSelectedDate(e.target.value);
                const existing = store.data.timeEntries.find(en => en.date === e.target.value);
                if (existing) {
                  setEntryTime(existing.entryTime);
                  setExitTime(existing.exitTime);
                  setEditingEntry(existing.id);
                } else {
                  setEntryTime('');
                  setExitTime('');
                  setEditingEntry(null);
                }
              }}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs md:text-sm text-slate-400 block mb-1">Hora de Ingreso</label>
            <input
              type="time"
              value={entryTime}
              onChange={(e) => setEntryTime(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div>
            <label className="text-xs md:text-sm text-slate-400 block mb-1">Hora de Salida</label>
            <input
              type="time"
              value={exitTime}
              onChange={(e) => setExitTime(e.target.value)}
              className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
            />
          </div>
          <div className="flex items-end gap-2">
            <button
              onClick={() => handlePhotoCapture('entry')}
              className="flex-1 flex items-center justify-center gap-1 md:gap-2 bg-blue-500/20 border border-blue-500/30 rounded-lg px-2 md:px-3 py-2 text-blue-300 hover:bg-blue-500/30 transition text-xs md:text-sm"
            >
              <Camera size={14} /> <span className="hidden sm:inline">Foto</span> Ingreso
            </button>
            <button
              onClick={() => handlePhotoCapture('exit')}
              className="flex-1 flex items-center justify-center gap-1 md:gap-2 bg-purple-500/20 border border-purple-500/30 rounded-lg px-2 md:px-3 py-2 text-purple-300 hover:bg-purple-500/30 transition text-xs md:text-sm"
            >
              <Camera size={14} /> <span className="hidden sm:inline">Foto</span> Salida
            </button>
            <input ref={entryPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'entry')} />
            <input ref={exitPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'exit')} />
          </div>
        </div>

        {(entryPhoto || exitPhoto) && (
          <div className="flex gap-3 mt-4">
            {entryPhoto && (
              <div className="relative">
                <img src={entryPhoto} alt="Foto ingreso" className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover border border-blue-500/30" />
                <span className="absolute -top-1 -left-1 bg-blue-500 text-xs px-1 rounded">Ingreso</span>
              </div>
            )}
            {exitPhoto && (
              <div className="relative">
                <img src={exitPhoto} alt="Foto salida" className="w-16 h-16 md:w-20 md:h-20 rounded-lg object-cover border border-purple-500/30" />
                <span className="absolute -top-1 -left-1 bg-purple-500 text-xs px-1 rounded">Salida</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {entryTime && (
            <span className="text-sm text-slate-300">
              Horas: <strong className="text-white">{calculateHours(entryTime, exitTime || entryTime).toFixed(2)}h</strong>
            </span>
          )}
          <button
            onClick={handleSaveEntry}
            className="sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition"
          >
            {editingEntry ? <><Save size={16} /> Actualizar</> : <><Plus size={16} /> Guardar</>}
          </button>
        </div>
      </div>

      {/* Weekly Chart */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
          <Calendar size={20} className="text-purple-400" />
          Gráfico Semanal
        </h3>

        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
                labelStyle={{ color: '#e2e8f0' }}
              />
              <Bar dataKey="hours" fill="url(#barGradient)" radius={[4, 4, 0, 0]} />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Projection */}
        <div className="mt-4 h-36 md:h-48">
          <p className="text-xs md:text-sm text-slate-400 mb-2">Proyección Semanal</p>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={projectionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="week" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }}
              />
              <Line type="monotone" dataKey="proyeccion" stroke="#f59e0b" strokeDasharray="5 5" name="Meta 45h" />
              <Line type="monotone" dataKey="horas" stroke="#3b82f6" name="Horas" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Holidays Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2">
            <Sun size={20} className="text-yellow-400" />
            Feriados ({format(currentWeekStart, 'MMMM yyyy', { locale: es })})
          </h3>
          <button
            onClick={() => setShowHolidayForm(!showHolidayForm)}
            className="flex items-center gap-1 bg-yellow-500/20 border border-yellow-500/30 px-2 md:px-3 py-1 rounded-lg text-yellow-300 text-xs md:text-sm hover:bg-yellow-500/30"
          >
            <Plus size={14} /> Agregar
          </button>
        </div>

        {showHolidayForm && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mb-4 p-3 md:p-4 bg-slate-700/30 rounded-lg"
          >
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input
                placeholder="Nombre del feriado"
                value={holidayName}
                onChange={(e) => setHolidayName(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
              <input
                type="date"
                value={holidayDate}
                onChange={(e) => setHolidayDate(e.target.value)}
                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
              />
              <button
                onClick={handleAddHoliday}
                className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg px-3 py-2 text-yellow-300 text-sm hover:bg-yellow-500/30"
              >
                Guardar Feriado
              </button>
            </div>
          </motion.div>
        )}

        <div className="space-y-2">
          {currentMonthHolidays.length === 0 ? (
            <p className="text-slate-500 text-sm">No hay feriados registrados este mes</p>
          ) : (
            currentMonthHolidays.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 md:px-4 py-2">
                <div>
                  <span className="text-white text-sm font-medium">{h.name}</span>
                  <span className="text-slate-400 text-xs ml-2">{format(parseISO(h.date), 'dd MMM yyyy', { locale: es })}</span>
                </div>
                <button
                  onClick={() => store.removeHoliday(h.id)}
                  className="text-red-400 hover:text-red-300"
                >
                  <X size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
