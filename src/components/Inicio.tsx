import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Clock, Camera, Calendar, Plus, Save, X, Sun, ChevronLeft, ChevronRight, Edit2 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { format, startOfWeek, endOfWeek, parseISO, addWeeks, subWeeks, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import { calculateHours, getWeeklyHours, applyRule45h, generateId, isDateHoliday } from '../utils/calculations';
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
  const [holidayDates, setHolidayDates] = useState<string[]>([]);
  const [weekOffset, setWeekOffset] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const entryPhotoRef = useRef<HTMLInputElement>(null);
  const exitPhotoRef = useRef<HTMLInputElement>(null);

  const today = new Date();
  const currentWeekStart = addWeeks(startOfWeek(today, { weekStartsOn: 1 }), weekOffset);
  const currentWeekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 });
  const timeEntries = store.getUserTimeEntries();
  const holidays = store.getUserHolidays();
  const todayEntry = timeEntries.find(e => e.date === selectedDate);
  const weekData = getWeeklyHours(timeEntries, currentWeekStart);
  const rule45 = applyRule45h(timeEntries, holidays, currentWeekStart);
  const currentMonthHolidays = holidays.filter(h => h.month === currentWeekStart.getMonth() && h.year === currentWeekStart.getFullYear());

  // Cargar datos existentes cuando cambia la fecha
  useEffect(() => {
    const existingEntry = timeEntries.find(e => e.date === selectedDate);
    if (existingEntry) {
      setEntryTime(existingEntry.entryTime);
      setExitTime(existingEntry.exitTime || '');
      setEntryPhoto(existingEntry.entryPhoto || '');
      setExitPhoto(existingEntry.exitPhoto || '');
      setIsEditing(true);
    } else {
      setEntryTime('');
      setExitTime('');
      setEntryPhoto('');
      setExitPhoto('');
      setIsEditing(false);
    }
  }, [selectedDate, timeEntries]);

  const handleSaveEntry = () => {
    if (!entryTime) return;
    const hours = calculateHours(entryTime, exitTime || entryTime);
    const isHoliday = isDateHoliday(parseISO(selectedDate), holidays);
    const holiday = holidays.find(h => h.dates?.includes(selectedDate) || h.date === selectedDate);
    store.addTimeEntry({
      id: todayEntry?.id || generateId(),
      date: selectedDate,
      entryTime,
      exitTime: exitTime || '',
      entryPhoto: entryPhoto || undefined,
      exitPhoto: exitPhoto || undefined,
      hours,
      isHoliday,
      holidayName: holiday?.name,
    });
    // No limpiar los campos inmediatamente para evitar problemas en móvil
    // El useEffect se encargará de actualizar el estado cuando cambie la fecha
    setIsEditing(true);
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

  const handleAddHoliday = () => {
    if (!holidayName || (holidayDates.length === 0 && !holidayDate)) return;
    if (holidayDates.length > 0) {
      const firstDate = parseISO(holidayDates[0]);
      store.addHoliday({
        id: generateId(),
        name: holidayName,
        date: holidayDates[0],
        dates: holidayDates,
        month: firstDate.getMonth(),
        year: firstDate.getFullYear(),
      });
    } else {
      const d = parseISO(holidayDate);
      store.addHoliday({
        id: generateId(),
        name: holidayName,
        date: holidayDate,
        month: d.getMonth(),
        year: d.getFullYear(),
      });
    }
    setHolidayName('');
    setHolidayDate('');
    setHolidayDates([]);
    setShowHolidayForm(false);
  };

  const totalWeekHours = weekData.reduce((s, d) => s + d.hours, 0);
  const percentage = Math.min((totalWeekHours / 45) * 100, 150);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="card-elevated rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
          <Clock size={24} className="text-blue-400" />
          Control Biométrico
        </h2>
      </div>

      <div className="card-solid rounded-xl p-3 md:p-4">
        <div className="flex items-center justify-between">
          <button onClick={() => setWeekOffset(o => o - 1)} className="btn-secondary flex items-center gap-1 px-3 py-2 rounded-lg text-sm">
            <ChevronLeft size={16} />
            <span className="hidden sm:inline">Anterior</span>
          </button>
          <div className="text-center">
            <p className="text-sm md:text-base font-semibold text-white">
              {format(currentWeekStart, 'dd MMM', { locale: es })} - {format(currentWeekEnd, 'dd MMM yyyy', { locale: es })}
            </p>
            <p className="text-xs text-slate-300">
              {weekOffset === 0 ? 'Semana Actual' : weekOffset < 0 ? `${Math.abs(weekOffset)} semana(s) atrás` : `${weekOffset} semana(s) adelante`}
            </p>
          </div>
          <button onClick={() => setWeekOffset(o => o + 1)} className="btn-secondary flex items-center gap-1 px-3 py-2 rounded-lg text-sm">
            <span className="hidden sm:inline">Siguiente</span>
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="card-elevated rounded-xl p-4">
          <p className="text-xs md:text-sm text-blue-400 font-semibold">Horas Semanales</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{totalWeekHours.toFixed(1)}h</p>
          <div className="mt-2 bg-slate-700 rounded-full h-2">
            <motion.div initial={{ width: 0 }} animate={{ width: `${Math.min(percentage, 100)}%` }} className="bg-gradient-to-r from-blue-400 to-blue-600 h-2 rounded-full" />
          </div>
          <p className="text-xs text-slate-300 mt-1">{percentage.toFixed(0)}% de 45h</p>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1 }} className="card-elevated rounded-xl p-4">
          <p className="text-xs md:text-sm text-purple-400 font-semibold">Horas Extra (Regla 45h)</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{rule45.totalExtra.toFixed(1)}h</p>
          <div className="flex gap-2 md:gap-3 mt-2 text-xs">
            <span className="text-yellow-400 font-medium">50%: {rule45.totalExtra50.toFixed(1)}h</span>
            <span className="text-red-400 font-medium">100%: {rule45.totalExtra100.toFixed(1)}h</span>
          </div>
        </motion.div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2 }} className="card-elevated rounded-xl p-4">
          <p className="text-xs md:text-sm text-emerald-400 font-semibold">Feriados del Mes</p>
          <p className="text-2xl md:text-3xl font-bold text-white mt-1">{currentMonthHolidays.length}</p>
          <p className="text-xs text-slate-300 mt-2 truncate">
            {currentMonthHolidays.map(h => h.name).join(', ') || 'Sin feriados'}
          </p>
        </motion.div>
      </div>

      <div className="card-solid rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <Clock size={20} className="text-blue-400" />
          Registrar Marcación
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
          <div>
            <label className="label-clear text-xs md:text-sm block mb-1">Fecha</label>
            <input 
              type="date" 
              value={selectedDate} 
              onChange={(e) => {
                const newDate = e.target.value;
                setSelectedDate(newDate);
                // Si ya existe una marcación para esta fecha, cargar los datos
                const existingEntry = timeEntries.find(entry => entry.date === newDate);
                if (existingEntry) {
                  setEntryTime(existingEntry.entryTime);
                  setExitTime(existingEntry.exitTime);
                } else {
                  setEntryTime('');
                  setExitTime('');
                }
              }} 
              className="input-solid w-full rounded-lg px-3 py-2 text-sm" 
            />
            {todayEntry && (
              <p className="text-xs text-blue-400 mt-1">✓ Ya existe una marcación para esta fecha</p>
            )}
          </div>
          <div>
            <label className="label-clear text-xs md:text-sm block mb-1">Hora de Ingreso</label>
            <input type="time" value={entryTime} onChange={(e) => setEntryTime(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="label-clear text-xs md:text-sm block mb-1">Hora de Salida</label>
            <input type="time" value={exitTime} onChange={(e) => setExitTime(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="sm:col-span-2">
            <label className="label-clear text-xs md:text-sm block mb-1">Fotos (Opcional)</label>
            <div className="flex gap-2">
              <button onClick={() => entryPhotoRef.current?.click()} className="btn-secondary flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm">
                <Camera size={16} />
                <span>Foto Ingreso</span>
              </button>
              <button onClick={() => exitPhotoRef.current?.click()} className="btn-secondary flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm">
                <Camera size={16} />
                <span>Foto Salida</span>
              </button>
              <input ref={entryPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'entry')} />
              <input ref={exitPhotoRef} type="file" accept="image/*" className="hidden" onChange={(e) => handlePhotoChange(e, 'exit')} />
            </div>
            {(entryPhoto || exitPhoto) && (
              <div className="flex gap-2 mt-2">
                {entryPhoto && (
                  <div className="relative">
                    <img src={entryPhoto} alt="Foto ingreso" className="w-20 h-20 rounded-lg object-cover border-2 border-blue-500/30" />
                    <span className="absolute -top-1 -left-1 bg-blue-500 text-white text-xs px-1 rounded">Ingreso</span>
                  </div>
                )}
                {exitPhoto && (
                  <div className="relative">
                    <img src={exitPhoto} alt="Foto salida" className="w-20 h-20 rounded-lg object-cover border-2 border-purple-500/30" />
                    <span className="absolute -top-1 -left-1 bg-purple-500 text-white text-xs px-1 rounded">Salida</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="mt-4 flex flex-col sm:flex-row items-start sm:items-center gap-3">
          {entryTime && (
            <span className="text-sm text-slate-200">
              Horas: <strong className="text-white font-bold">{calculateHours(entryTime, exitTime || entryTime).toFixed(2)}h</strong>
            </span>
          )}
          {isEditing && (
            <span className="text-xs text-yellow-400 flex items-center gap-1">
              <Edit2 size={12} />
              Editando marcación existente
            </span>
          )}
          <button onClick={handleSaveEntry} className="btn-primary sm:ml-auto w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm">
            {isEditing ? <><Save size={16} /> Actualizar</> : <><Plus size={16} /> Guardar</>}
          </button>
        </div>
      </div>

      <div className="card-solid rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2 text-white">
          <Calendar size={20} className="text-purple-400" />
          Gráfico Semanal
        </h3>
        <div className="h-48 md:h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weekData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
              <XAxis dataKey="day" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', borderRadius: '8px' }} />
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
      </div>

      <div className="card-solid rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold flex items-center gap-2 text-white">
            <Sun size={20} className="text-yellow-400" />
            Feriados ({format(currentWeekStart, 'MMMM yyyy', { locale: es })})
          </h3>
          <button onClick={() => setShowHolidayForm(!showHolidayForm)} className="btn-secondary flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>
        {showHolidayForm && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} className="mb-4 p-3 md:p-4 bg-slate-700/80 rounded-lg space-y-3">
            <input placeholder="Nombre del feriado" value={holidayName} onChange={(e) => setHolidayName(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
            <div className="flex gap-2">
              <input type="date" value={holidayDate} onChange={(e) => setHolidayDate(e.target.value)} className="input-solid flex-1 rounded-lg px-3 py-2 text-sm" />
              <button onClick={() => { if (holidayDate && !holidayDates.includes(holidayDate)) { setHolidayDates([...holidayDates, holidayDate].sort()); setHolidayDate(''); } }} disabled={!holidayDate} className="btn-secondary rounded-lg px-3 py-2 text-sm disabled:opacity-50">
                <Plus size={16} />
              </button>
            </div>
            {holidayDates.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {holidayDates.map((date) => (
                  <div key={date} className="flex items-center gap-2 bg-yellow-500/30 border border-yellow-500/50 rounded-lg px-3 py-1">
                    <span className="text-yellow-300 text-sm font-medium">{format(parseISO(date), 'dd MMM yyyy', { locale: es })}</span>
                    <button onClick={() => setHolidayDates(holidayDates.filter(d => d !== date))} className="text-yellow-300 hover:text-yellow-200">
                      <X size={14} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <div className="flex gap-2">
              <button onClick={handleAddHoliday} disabled={!holidayName || (holidayDates.length === 0 && !holidayDate)} className="btn-primary flex-1 rounded-lg px-3 py-2 text-sm disabled:opacity-50">
                Guardar Feriado {holidayDates.length > 1 ? `(${holidayDates.length} días)` : ''}
              </button>
              <button onClick={() => { setShowHolidayForm(false); setHolidayName(''); setHolidayDate(''); setHolidayDates([]); }} className="btn-secondary rounded-lg px-3 py-2 text-sm">
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
        <div className="space-y-2">
          {currentMonthHolidays.length === 0 ? (
            <p className="text-slate-400 text-sm text-center py-4">No hay feriados registrados este mes</p>
          ) : (
            currentMonthHolidays.map(h => (
              <div key={h.id} className="flex items-center justify-between bg-slate-700/80 rounded-lg px-3 md:px-4 py-2 border border-slate-600/50">
                <div className="flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-white text-sm font-semibold">{h.name}</span>
                    {h.dates && h.dates.length > 1 && (
                      <span className="text-xs bg-yellow-500/30 text-yellow-300 px-2 py-0.5 rounded font-medium">{h.dates.length} días</span>
                    )}
                  </div>
                  <div className="text-slate-300 text-xs mt-1">
                    {h.dates && h.dates.length > 0 ? (
                      <span>{h.dates.map((date, idx) => (<span key={date}>{format(parseISO(date), 'dd MMM', { locale: es })}{idx < (h.dates?.length || 0) - 1 ? ', ' : ''}</span>))}</span>
                    ) : (
                      <span>{format(parseISO(h.date), 'dd MMM yyyy', { locale: es })}</span>
                    )}
                  </div>
                </div>
                <button onClick={() => store.removeHoliday(h.id)} className="text-red-400 hover:text-red-300 ml-2 p-1 hover:bg-red-500/20 rounded">
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
