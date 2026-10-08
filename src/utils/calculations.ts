import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addWeeks, differenceInHours, differenceInMinutes } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeEntry, Holiday, Bonus, Discount } from '../store/useStore';

export function calculateHours(entry: string, exit: string): number {
  if (!entry || !exit) return 0;
  const [eh, em] = entry.split(':').map(Number);
  const [xh, xm] = exit.split(':').map(Number);
  const entryMinutes = eh * 60 + em;
  const exitMinutes = xh * 60 + xm;
  let diff = exitMinutes - entryMinutes;
  if (diff < 0) diff += 24 * 60; // overnight
  return Math.round((diff / 60) * 100) / 100;
}

export function getWeekDays(date: Date): Date[] {
  const start = startOfWeek(date, { weekStartsOn: 1 });
  const end = endOfWeek(date, { weekStartsOn: 1 });
  return eachDayOfInterval({ start, end });
}

export function getWeeklyHours(entries: TimeEntry[], weekStart: Date): { day: string; hours: number; isHoliday: boolean }[] {
  const days = getWeekDays(weekStart);
  return days.map(day => {
    const entry = entries.find(e => isSameDay(parseISO(e.date), day));
    return {
      day: format(day, 'EEE', { locale: es }),
      hours: entry ? entry.hours : 0,
      isHoliday: entry?.isHoliday || false,
    };
  });
}

export function applyRule45h(entries: TimeEntry[], holidays: Holiday[], weekStart: Date): {
  weekdayHours: number;
  weekendHours50: number;
  weekendHours100: number;
  holidayHours: number;
  totalExtra: number;
} {
  const days = getWeekDays(weekStart);
  const weekdayEntries = entries.filter(e => {
    const d = parseISO(e.date);
    const dayOfWeek = d.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5 && isSameDay(d, weekStart) || 
      (d >= days[0] && d <= days[4]);
  });
  
  const weekendEntries = entries.filter(e => {
    const d = parseISO(e.date);
    return d >= days[5] && d <= days[6];
  });

  const weekEntries = entries.filter(e => {
    const d = parseISO(e.date);
    return d >= days[0] && d <= days[6];
  });

  const weekdayHours = weekEntries
    .filter(e => {
      const d = parseISO(e.date);
      return d.getDay() >= 1 && d.getDay() <= 5;
    })
    .reduce((sum, e) => sum + e.hours, 0);

  const weekendHours = weekEntries
    .filter(e => {
      const d = parseISO(e.date);
      return d.getDay() === 0 || d.getDay() === 6;
    })
    .reduce((sum, e) => sum + e.hours, 0);

  const weekHolidayEntries = weekEntries.filter(e => e.isHoliday);
  const holidayHours = weekHolidayEntries.reduce((sum, e) => sum + e.hours, 0);
  
  // Holiday hours that fall on weekdays count toward the 45h
  const weekdayHolidayHours = weekHolidayEntries
    .filter(e => {
      const d = parseISO(e.date);
      return d.getDay() >= 1 && d.getDay() <= 5;
    })
    .reduce((sum, e) => sum + e.hours, 0);

  const effectiveWeekdayHours = weekdayHours; // includes holiday hours on weekdays
  
  let weekendHours50 = 0;
  let weekendHours100 = 0;
  let extraFromWeekday = 0;

  if (effectiveWeekdayHours > 45) {
    // All weekend hours are 100%
    weekendHours100 = weekendHours;
    extraFromWeekday = effectiveWeekdayHours - 45;
  } else {
    // Weekend hours are 50%
    weekendHours50 = weekendHours;
    const remaining = 45 - effectiveWeekdayHours;
    if (weekendHours > remaining) {
      weekendHours100 = weekendHours - remaining;
      weekendHours50 = remaining;
    }
  }

  const totalExtra = extraFromWeekday + weekendHours50 * 0.5 + weekendHours100 + holidayHours;

  return {
    weekdayHours: effectiveWeekdayHours,
    weekendHours50,
    weekendHours100,
    holidayHours,
    totalExtra: Math.round(totalExtra * 100) / 100,
  };
}

export function calculateOvertimePayment(hours50: number, hours100: number, baseSalary: number): {
  payment50: number;
  payment100: number;
  total: number;
} {
  const hourlyRate = baseSalary / 240; // Ecuador: 240 hours/month
  const payment50 = Math.round(hours50 * hourlyRate * 1.5 * 100) / 100;
  const payment100 = Math.round(hours100 * hourlyRate * 2 * 100) / 100;
  return {
    payment50,
    payment100,
    total: Math.round((payment50 + payment100) * 100) / 100,
  };
}

export function calculateBonuses(bonuses: Bonus[], baseSalary: number): number {
  return bonuses
    .filter(b => b.active)
    .reduce((sum, b) => {
      if (b.basedOnSalary) {
        return sum + (baseSalary * b.percentage / 100);
      }
      return sum + b.amount;
    }, 0);
}

export function calculateDiscounts(discounts: Discount[], baseSalary: number): number {
  return discounts
    .filter(d => d.active)
    .reduce((sum, d) => {
      if (d.basedOnSalary) {
        return sum + (baseSalary * d.percentage / 100);
      }
      return sum + d.amount;
    }, 0);
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-EC', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

export function getMonthName(month: number): string {
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
  return months[month];
}
