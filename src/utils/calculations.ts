import { format, startOfWeek, endOfWeek, eachDayOfInterval, isSameDay, parseISO, addWeeks, subWeeks, getWeek } from 'date-fns';
import { es } from 'date-fns/locale';
import type { TimeEntry, Holiday, Bonus, Discount } from '../types';

export function calculateHours(entry: string, exit: string): number {
  if (!entry || !exit) return 0;
  const [eh, em] = entry.split(':').map(Number);
  const [xh, xm] = exit.split(':').map(Number);
  const entryMinutes = eh * 60 + em;
  const exitMinutes = xh * 60 + xm;
  let diff = exitMinutes - entryMinutes;
  if (diff < 0) diff += 24 * 60;
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

export function isDateHoliday(date: Date, holidays: Holiday[]): boolean {
  const dateStr = format(date, 'yyyy-MM-dd');
  return holidays.some(h => {
    if (h.dates && h.dates.length > 0) return h.dates.includes(dateStr);
    return h.date === dateStr;
  });
}

export function applyRule45h(entries: TimeEntry[], holidays: Holiday[], weekStart: Date): {
  weekdayHours: number;
  weekdayExtra50: number;
  weekendHours50: number;
  weekendHours100: number;
  holidayHours: number;
  totalExtra: number;
  totalExtra50: number;
  totalExtra100: number;
} {
  const days = getWeekDays(weekStart);
  const weekEntries = entries.filter(e => {
    const d = parseISO(e.date);
    return d >= days[0] && d <= days[6];
  });

  const weekdayEntries = weekEntries.filter(e => {
    const d = parseISO(e.date);
    const dayOfWeek = d.getDay();
    return dayOfWeek >= 1 && dayOfWeek <= 5;
  });

  const weekendEntries = weekEntries.filter(e => {
    const d = parseISO(e.date);
    return d.getDay() === 0 || d.getDay() === 6;
  });

  const holidayEntries = weekEntries.filter(e => e.isHoliday);
  const holidayHours = holidayEntries.reduce((sum, e) => sum + e.hours, 0);
  const weekdayHours = weekdayEntries.reduce((sum, e) => sum + e.hours, 0);
  const weekendHours = weekendEntries.reduce((sum, e) => sum + e.hours, 0);

  let weekdayExtra50 = 0;
  let weekendHours50 = 0;
  let weekendHours100 = 0;

  if (weekdayHours > 45) {
    weekdayExtra50 = weekdayHours - 45;
    weekendHours100 = weekendHours;
  } else {
    weekendHours50 = weekendHours;
  }

  const totalExtra50 = weekdayExtra50 + weekendHours50;
  const totalExtra100 = weekendHours100 + holidayHours;
  const totalExtra = totalExtra50 + totalExtra100;

  return {
    weekdayHours,
    weekdayExtra50,
    weekendHours50,
    weekendHours100,
    holidayHours,
    totalExtra: Math.round(totalExtra * 100) / 100,
    totalExtra50: Math.round(totalExtra50 * 100) / 100,
    totalExtra100: Math.round(totalExtra100 * 100) / 100,
  };
}

export function calculateOvertimePayment(hours50: number, hours100: number, baseSalary: number): {
  payment50: number;
  payment100: number;
  total: number;
  hourlyRate: number;
} {
  const hourlyRate = baseSalary / 240;
  const payment50 = Math.round(hours50 * hourlyRate * 1.5 * 100) / 100;
  const payment100 = Math.round(hours100 * hourlyRate * 2 * 100) / 100;
  return {
    payment50,
    payment100,
    total: Math.round((payment50 + payment100) * 100) / 100,
    hourlyRate,
  };
}

export function calculateBaseIngreso(baseSalary: number, totalOvertimePayment: number): number {
  return baseSalary + totalOvertimePayment;
}

export function calculateSpecialDiscounts(baseIngreso: number): {
  iessAporte: number;
  saludConyuge: number;
  totalSpecialDiscounts: number;
} {
  const iessAporte = Math.round(baseIngreso * 0.0945 * 100) / 100;
  const saludConyuge = Math.round(baseIngreso * 0.0341 * 100) / 100;
  return {
    iessAporte,
    saludConyuge,
    totalSpecialDiscounts: Math.round((iessAporte + saludConyuge) * 100) / 100,
  };
}

export function calculateSpecialBonuses(baseIngreso: number): { fondosReserva: number } {
  const fondosReserva = Math.round(baseIngreso * 0.0833 * 100) / 100;
  return { fondosReserva };
}

export function calculateInstallment(discount: Discount, paymentNumber: number): number {
  if (!discount.loanAmount || !discount.totalMonths || !discount.interestRate) {
    return discount.monthlyPaymentAmount || discount.amount || 0;
  }
  const principal = discount.loanAmount;
  const months = discount.totalMonths;
  const annualRate = discount.interestRate / 100;
  const monthlyRate = annualRate / 12;

  if (discount.amortizationType === 'alemana') {
    const capitalInstallment = principal / months;
    const remainingPrincipal = principal - (capitalInstallment * (paymentNumber - 1));
    const interest = remainingPrincipal * monthlyRate;
    return Math.round((capitalInstallment + interest) * 100) / 100;
  } else {
    if (monthlyRate === 0) return Math.round((principal / months) * 100) / 100;
    const installment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
    return Math.round(installment * 100) / 100;
  }
}

export function calculateBonuses(bonuses: Bonus[], baseSalary: number, baseIngreso?: number): number {
  return bonuses
    .filter(b => b.active && !b.isSpecial && b.name.toLowerCase() !== 'fondos de reserva')
    .reduce((sum, b) => {
      if (b.basedOnSalary) {
        const base = baseIngreso !== undefined ? baseIngreso : baseSalary;
        return sum + (base * b.percentage / 100);
      }
      return sum + b.amount;
    }, 0);
}

export function calculateDiscounts(discounts: Discount[], baseSalary: number, baseIngreso?: number): number {
  return discounts
    .filter(d => d.active && !d.isSpecial)
    .reduce((sum, d) => {
      if (d.loanType && d.loanAmount && d.totalMonths && d.interestRate) {
        const nextPaymentNumber = (d.paymentsMade || 0) + 1;
        return sum + calculateInstallment(d, nextPaymentNumber);
      }
      if (d.basedOnSalary) {
        const base = baseIngreso !== undefined ? baseIngreso : baseSalary;
        return sum + (base * d.percentage / 100);
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
