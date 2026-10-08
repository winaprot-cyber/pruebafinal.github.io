import { useState, useEffect, useCallback } from 'react';

export interface TimeEntry {
  id: string;
  date: string;
  entryTime: string;
  exitTime: string;
  entryPhoto?: string;
  exitPhoto?: string;
  hours: number;
  isHoliday: boolean;
  holidayName?: string;
}

export interface Holiday {
  id: string;
  name: string;
  date: string;
  month: number;
  year: number;
}

export interface Bonus {
  id: string;
  name: string;
  amount: number;
  active: boolean;
  basedOnSalary: boolean;
  percentage: number;
  type: 'bonus';
  isSpecial?: boolean;
  specialType?: 'fondos_reserva';
}

export interface LoanPayment {
  id: string;
  discountId: string;
  paymentNumber: number;
  amount: number;
  date: string;
  photo?: string;
}

export interface Discount {
  id: string;
  name: string;
  amount: number;
  active: boolean;
  basedOnSalary: boolean;
  percentage: number;
  type: 'discount';
  isSpecial?: boolean;
  specialType?: 'iess_aporte' | 'salud_conyuge';
  loanType?: string;
  totalMonths?: number;
  currentMonth?: number;
  fixedPayment?: boolean;
  monthlyPaymentAmount?: number; // Monto del pago mensual para préstamos quirografarios
  paymentsMade?: number; // Número de pagos realizados
  loanPayments?: LoanPayment[]; // Pagos individuales registrados
  amortizationType?: 'frances' | 'alemana'; // Tipo de amortización
  interestRate?: number; // Tasa de interés anual (%)
  loanAmount?: number; // Monto total del préstamo
}

export interface Income {
  id: string;
  name: string;
  amount: number;
  fixed: boolean;
  forMonthEnd: boolean;
  type: 'fixed' | 'extra' | 'variable';
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'weekly' | 'annual' | 'once';
}

export interface Debt {
  id: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
  type: string;
  frequency: 'monthly' | 'once';
  paidAmount: number;
  progress: number;
  paymentsMade: number; // Número de pagos realizados
  totalPayments?: number; // Total de pagos esperados
}

export interface DecimoEntry {
  id: string;
  month: number;
  year: number;
  baseSalary: number;
  overtimeHours50: number;
  overtimeHours100: number;
  total: number;
}

export interface SalaryConfig {
  baseSalary: number;
  biweeklyPayment: number;
  iessAporteActive: boolean;
  saludConyugeActive: boolean;
  fondosReservaActive: boolean;
  overtimeRate50: number; // Costo por hora extra al 50%
  overtimeRate100: number; // Costo por hora extra al 100%
}

export interface PaymentPeriod {
  id: string;
  startDate: string;
  endDate: string;
  weeks: string[];
  hours50: number;
  hours100: number;
  holidayHours: number;
}

export interface AppData {
  timeEntries: TimeEntry[];
  holidays: Holiday[];
  bonuses: Bonus[];
  discounts: Discount[];
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  decimoEntries: DecimoEntry[];
  salaryConfig: SalaryConfig;
  paymentPeriods: PaymentPeriod[];
}

const defaultData: AppData = {
  timeEntries: [],
  holidays: [],
  bonuses: [],
  discounts: [],
  incomes: [],
  expenses: [],
  debts: [],
  decimoEntries: [],
  salaryConfig: { 
    baseSalary: 0, 
    biweeklyPayment: 0,
    iessAporteActive: true,
    saludConyugeActive: false,
    fondosReservaActive: false,
    overtimeRate50: 0,
    overtimeRate100: 0,
  },
  paymentPeriods: [],
};

function loadData(): AppData {
  try {
    const stored = localStorage.getItem('controlBiometrico_data');
    if (stored) {
      const parsed = JSON.parse(stored);
      return { 
        ...defaultData, 
        ...parsed,
        salaryConfig: { ...defaultData.salaryConfig, ...(parsed.salaryConfig || {}) }
      };
    }
  } catch (e) {
    console.error('Error loading ', e);
  }
  return defaultData;
}

function saveData(dataToSave: AppData) {
  try {
    localStorage.setItem('controlBiometrico_data', JSON.stringify(dataToSave));
  } catch (e) {
    console.error('Error saving ', e);
  }
}

export function useStore() {
  const [data, setData] = useState<AppData>(loadData);

  useEffect(() => {
    saveData(data);
  }, [data]);

  const updateData = useCallback((updates: Partial<AppData>) => {
    setData(prev => ({ ...prev, ...updates }));
  }, []);

  const addTimeEntry = useCallback((entry: TimeEntry) => {
    setData(prev => ({
      ...prev,
      timeEntries: [...prev.timeEntries.filter(e => e.date !== entry.date), entry]
    }));
  }, []);

  const updateTimeEntry = useCallback((id: string, updates: Partial<TimeEntry>) => {
    setData(prev => ({
      ...prev,
      timeEntries: prev.timeEntries.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  }, []);

  const addHoliday = useCallback((holiday: Holiday) => {
    setData(prev => ({ ...prev, holidays: [...prev.holidays, holiday] }));
  }, []);

  const removeHoliday = useCallback((id: string) => {
    setData(prev => ({ ...prev, holidays: prev.holidays.filter(h => h.id !== id) }));
  }, []);

  const addBonus = useCallback((bonus: Bonus) => {
    setData(prev => ({ ...prev, bonuses: [...prev.bonuses, bonus] }));
  }, []);

  const updateBonus = useCallback((id: string, updates: Partial<Bonus>) => {
    setData(prev => ({
      ...prev,
      bonuses: prev.bonuses.map(b => b.id === id ? { ...b, ...updates } : b)
    }));
  }, []);

  const removeBonus = useCallback((id: string) => {
    setData(prev => ({ ...prev, bonuses: prev.bonuses.filter(b => b.id !== id) }));
  }, []);

  const addDiscount = useCallback((discount: Discount) => {
    setData(prev => ({ ...prev, discounts: [...prev.discounts, discount] }));
  }, []);

  const updateDiscount = useCallback((id: string, updates: Partial<Discount>) => {
    setData(prev => ({
      ...prev,
      discounts: prev.discounts.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  }, []);

  const removeDiscount = useCallback((id: string) => {
    setData(prev => ({ ...prev, discounts: prev.discounts.filter(d => d.id !== id) }));
  }, []);

  const removeTimeEntry = useCallback((id: string) => {
    setData(prev => ({ ...prev, timeEntries: prev.timeEntries.filter(e => e.id !== id) }));
  }, []);

  const addLoanPayment = useCallback((discountId: string, payment: LoanPayment) => {
    setData(prev => ({
      ...prev,
      discounts: prev.discounts.map(d => {
        if (d.id === discountId) {
          const currentPayments = d.loanPayments || [];
          const newPayments = [...currentPayments, payment];
          const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
          const progress = d.totalMonths ? (newPayments.length / d.totalMonths) * 100 : 0;
          return {
            ...d,
            loanPayments: newPayments,
            paymentsMade: newPayments.length,
            paidAmount: totalPaid,
            progress: progress,
          };
        }
        return d;
      })
    }));
  }, []);

  const removeLoanPayment = useCallback((discountId: string, paymentId: string) => {
    setData(prev => ({
      ...prev,
      discounts: prev.discounts.map(d => {
        if (d.id === discountId) {
          const currentPayments = d.loanPayments || [];
          const newPayments = currentPayments.filter(p => p.id !== paymentId);
          const totalPaid = newPayments.reduce((sum, p) => sum + p.amount, 0);
          const progress = d.totalMonths ? (newPayments.length / d.totalMonths) * 100 : 0;
          return {
            ...d,
            loanPayments: newPayments,
            paymentsMade: newPayments.length,
            paidAmount: totalPaid,
            progress: progress,
          };
        }
        return d;
      })
    }));
  }, []);

  const addIncome = useCallback((income: Income) => {
    setData(prev => ({ ...prev, incomes: [...prev.incomes, income] }));
  }, []);

  const updateIncome = useCallback((id: string, updates: Partial<Income>) => {
    setData(prev => ({
      ...prev,
      incomes: prev.incomes.map(i => i.id === id ? { ...i, ...updates } : i)
    }));
  }, []);

  const removeIncome = useCallback((id: string) => {
    setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
  }, []);

  const addExpense = useCallback((expense: Expense) => {
    setData(prev => ({ ...prev, expenses: [...prev.expenses, expense] }));
  }, []);

  const updateExpense = useCallback((id: string, updates: Partial<Expense>) => {
    setData(prev => ({
      ...prev,
      expenses: prev.expenses.map(e => e.id === id ? { ...e, ...updates } : e)
    }));
  }, []);

  const removeExpense = useCallback((id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  }, []);

  const addDebt = useCallback((debt: Debt) => {
    setData(prev => ({ ...prev, debts: [...prev.debts, debt] }));
  }, []);

  const updateDebt = useCallback((id: string, updates: Partial<Debt>) => {
    setData(prev => ({
      ...prev,
      debts: prev.debts.map(d => d.id === id ? { ...d, ...updates } : d)
    }));
  }, []);

  const removeDebt = useCallback((id: string) => {
    setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  }, []);

  const addDecimoEntry = useCallback((entry: DecimoEntry) => {
    setData(prev => ({
      ...prev,
      decimoEntries: [...prev.decimoEntries.filter(e => !(e.month === entry.month && e.year === entry.year)), entry]
    }));
  }, []);

  const updateSalaryConfig = useCallback((config: Partial<SalaryConfig>) => {
    setData(prev => ({ ...prev, salaryConfig: { ...prev.salaryConfig, ...config } }));
  }, []);

  const exportData = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `control_biometrico_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [data]);

  const importData = useCallback((jsonString: string) => {
    try {
      const imported = JSON.parse(jsonString);
      setData({ ...defaultData, ...imported });
    } catch (e) {
      console.error('Error importing ', e);
    }
  }, []);

  return {
    data,
    updateData,
    addTimeEntry,
    updateTimeEntry,
    addHoliday,
    removeHoliday,
    addBonus,
    updateBonus,
    removeBonus,
    addDiscount,
    updateDiscount,
    removeDiscount,
    removeTimeEntry,
    addLoanPayment,
    removeLoanPayment,
    addIncome,
    updateIncome,
    removeIncome,
    addExpense,
    updateExpense,
    removeExpense,
    addDebt,
    updateDebt,
    removeDebt,
    addDecimoEntry,
    updateSalaryConfig,
    exportData,
    importData,
  };
}
