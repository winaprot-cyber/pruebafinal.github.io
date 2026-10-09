import { useState, useEffect } from 'react';
import type { AppData, User, TimeEntry, Holiday, Bonus, Discount, Income, Expense, Debt, DecimoEntry, SalaryConfig, MonthlyReport, LoanPayment } from '../types';

const STORAGE_KEY = 'biometric_control_data';

const defaultData: AppData = {
  users: [],
  currentUser: null,
  timeEntries: [],
  holidays: [],
  bonuses: [],
  discounts: [],
  incomes: [],
  expenses: [],
  debts: [],
  decimoEntries: [],
  salaryConfigs: [],
  monthlyReports: [],
  selectedWeeks: [],
  selectedYear: new Date().getFullYear(),
};

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function generatePassword(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  for (let i = 0; i < 8; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return password;
}

export function useStore() {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsedData = JSON.parse(saved);
      if (!parsedData.users || parsedData.users.length === 0) {
        const adminUser: User = {
          id: generateId(),
          username: 'Dome4437',
          name: 'Hugo León',
          email: '',
          password: 'Jeca4437',
          role: 'admin',
          createdAt: new Date().toISOString(),
        };
        return { ...parsedData, users: [adminUser] };
      }
      return parsedData;
    }
    const adminUser: User = {
      id: generateId(),
      username: 'Dome4437',
      name: 'Hugo León',
      email: '',
      password: 'Jeca4437',
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    return { ...defaultData, users: [adminUser] };
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const register = (username: string, name: string, email?: string) => {
    if (data.users.some(u => u.username === username)) {
      return { success: false, error: 'El nombre de usuario ya existe' };
    }
    const password = generatePassword();
    const newUser: User = {
      id: generateId(),
      username,
      name,
      email,
      password,
      role: data.users.length === 0 ? 'admin' : 'user',
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({ ...prev, users: [...prev.users, newUser] }));
    return { success: true, password };
  };

  const login = (username: string, password: string): boolean => {
    const user = data.users.find(u => u.username === username && u.password === password);
    if (user) {
      setData(prev => ({ ...prev, currentUser: user }));
      return true;
    }
    return false;
  };

  const logout = () => {
    setData(prev => ({ ...prev, currentUser: null }));
  };

  const getCurrentUser = (): User | null => data.currentUser;
  const isAdmin = (): boolean => data.currentUser?.role === 'admin';

  const addTimeEntry = (entry: Partial<TimeEntry> & { date: string; entryTime: string; hours: number }) => {
    if (!data.currentUser) return;
    const newEntry: TimeEntry = {
      id: entry.id || generateId(),
      userId: data.currentUser.id,
      date: entry.date,
      entryTime: entry.entryTime,
      exitTime: entry.exitTime || '',
      entryPhoto: entry.entryPhoto,
      exitPhoto: entry.exitPhoto,
      hours: entry.hours,
      isHoliday: entry.isHoliday || false,
      holidayName: entry.holidayName,
    };
    setData(prev => ({
      ...prev,
      timeEntries: [...prev.timeEntries.filter(e => !(e.userId === data.currentUser!.id && e.date === entry.date)), newEntry],
    }));
  };

  const removeTimeEntry = (id: string) => {
    setData(prev => ({ ...prev, timeEntries: prev.timeEntries.filter(e => e.id !== id) }));
  };

  const addHoliday = (holiday: Partial<Holiday> & { name: string; date: string; month: number; year: number }) => {
    if (!data.currentUser) return;
    const newHoliday: Holiday = {
      id: holiday.id || generateId(),
      userId: data.currentUser.id,
      name: holiday.name,
      date: holiday.date,
      dates: holiday.dates,
      month: holiday.month,
      year: holiday.year,
    };
    setData(prev => ({ ...prev, holidays: [...prev.holidays, newHoliday] }));
  };

  const removeHoliday = (id: string) => {
    setData(prev => ({ ...prev, holidays: prev.holidays.filter(h => h.id !== id) }));
  };

  const addBonus = (bonus: Partial<Bonus> & { name: string; amount: number; active: boolean; basedOnSalary: boolean; percentage: number; type: 'bonus' }) => {
    if (!data.currentUser) return;
    const newBonus: Bonus = {
      id: bonus.id || generateId(),
      userId: data.currentUser.id,
      name: bonus.name,
      amount: bonus.amount,
      active: bonus.active,
      basedOnSalary: bonus.basedOnSalary,
      percentage: bonus.percentage,
      type: bonus.type,
      isSpecial: bonus.isSpecial,
    };
    setData(prev => ({ ...prev, bonuses: [...prev.bonuses, newBonus] }));
  };

  const updateBonus = (id: string, updates: Partial<Bonus>) => {
    setData(prev => ({ ...prev, bonuses: prev.bonuses.map(b => b.id === id ? { ...b, ...updates } : b) }));
  };

  const removeBonus = (id: string) => {
    setData(prev => ({ ...prev, bonuses: prev.bonuses.filter(b => b.id !== id) }));
  };

  const addDiscount = (discount: Partial<Discount> & { name: string; amount: number; active: boolean; basedOnSalary: boolean; percentage: number; type: 'discount' }) => {
    if (!data.currentUser) return;
    const newDiscount: Discount = {
      id: discount.id || generateId(),
      userId: data.currentUser.id,
      name: discount.name,
      amount: discount.amount,
      active: discount.active,
      basedOnSalary: discount.basedOnSalary,
      percentage: discount.percentage,
      type: discount.type,
      isSpecial: discount.isSpecial,
      loanType: discount.loanType,
      totalMonths: discount.totalMonths,
      currentMonth: discount.currentMonth,
      fixedPayment: discount.fixedPayment,
      monthlyPaymentAmount: discount.monthlyPaymentAmount,
      paymentsMade: discount.paymentsMade,
      amortizationType: discount.amortizationType,
      interestRate: discount.interestRate,
      loanAmount: discount.loanAmount,
      loanPayments: discount.loanPayments,
      customInstallments: discount.customInstallments,
    };
    setData(prev => ({ ...prev, discounts: [...prev.discounts, newDiscount] }));
  };

  const updateDiscount = (id: string, updates: Partial<Discount>) => {
    setData(prev => ({ ...prev, discounts: prev.discounts.map(d => d.id === id ? { ...d, ...updates } : d) }));
  };

  const removeDiscount = (id: string) => {
    setData(prev => ({ ...prev, discounts: prev.discounts.filter(d => d.id !== id) }));
  };

  const addLoanPayment = (discountId: string, payment: LoanPayment) => {
    setData(prev => ({
      ...prev,
      discounts: prev.discounts.map(d => {
        if (d.id === discountId) {
          const payments = d.loanPayments || [];
          return { ...d, loanPayments: [...payments, payment], paymentsMade: (d.paymentsMade || 0) + 1 };
        }
        return d;
      }),
    }));
  };

  const removeLoanPayment = (discountId: string, paymentId: string) => {
    setData(prev => ({
      ...prev,
      discounts: prev.discounts.map(d => {
        if (d.id === discountId) {
          const payments = (d.loanPayments || []).filter(p => p.id !== paymentId);
          return { ...d, loanPayments: payments, paymentsMade: payments.length };
        }
        return d;
      }),
    }));
  };

  const addIncome = (income: Partial<Income> & { name: string; amount: number; fixed: boolean; forMonthEnd: boolean; type: 'fixed' | 'extra' | 'variable' }) => {
    if (!data.currentUser) return;
    const newIncome: Income = {
      id: generateId(),
      userId: data.currentUser.id,
      name: income.name,
      amount: income.amount,
      fixed: income.fixed,
      forMonthEnd: income.forMonthEnd,
      type: income.type,
    };
    setData(prev => ({ ...prev, incomes: [...prev.incomes, newIncome] }));
  };

  const updateIncome = (id: string, updates: Partial<Income>) => {
    setData(prev => ({ ...prev, incomes: prev.incomes.map(i => i.id === id ? { ...i, ...updates } : i) }));
  };

  const removeIncome = (id: string) => {
    setData(prev => ({ ...prev, incomes: prev.incomes.filter(i => i.id !== id) }));
  };

  const addExpense = (expense: Partial<Expense> & { name: string; amount: number; category: string; frequency: 'monthly' | 'weekly' | 'annual' | 'once' }) => {
    if (!data.currentUser) return;
    const newExpense: Expense = {
      id: generateId(),
      userId: data.currentUser.id,
      name: expense.name,
      amount: expense.amount,
      originalAmount: expense.originalAmount || expense.amount,
      paidAmount: expense.paidAmount || 0,
      category: expense.category,
      frequency: expense.frequency,
    };
    setData(prev => ({ ...prev, expenses: [...prev.expenses, newExpense] }));
  };

  const updateExpense = (id: string, updates: Partial<Expense>) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.map(e => e.id === id ? { ...e, ...updates } : e) }));
  };

  const removeExpense = (id: string) => {
    setData(prev => ({ ...prev, expenses: prev.expenses.filter(e => e.id !== id) }));
  };

  const addDebt = (debt: Partial<Debt> & { name: string; totalAmount: number; monthlyPayment: number; type: string; frequency: 'monthly' | 'once' }) => {
    if (!data.currentUser) return;
    const newDebt: Debt = {
      id: generateId(),
      userId: data.currentUser.id,
      name: debt.name,
      totalAmount: debt.totalAmount,
      monthlyPayment: debt.monthlyPayment,
      type: debt.type,
      frequency: debt.frequency,
      paidAmount: debt.paidAmount || 0,
      progress: debt.progress || 0,
      paymentsMade: debt.paymentsMade || 0,
      totalPayments: debt.totalPayments,
      amortizationType: debt.amortizationType,
      interestRate: debt.interestRate,
      totalMonths: debt.totalMonths,
    };
    setData(prev => ({ ...prev, debts: [...prev.debts, newDebt] }));
  };

  const updateDebt = (id: string, updates: Partial<Debt>) => {
    setData(prev => ({ ...prev, debts: prev.debts.map(d => d.id === id ? { ...d, ...updates } : d) }));
  };

  const removeDebt = (id: string) => {
    setData(prev => ({ ...prev, debts: prev.debts.filter(d => d.id !== id) }));
  };

  const addDecimoEntry = (entry: Partial<DecimoEntry> & { month: number; year: number; baseSalary: number; total: number }) => {
    if (!data.currentUser) return;
    const newEntry: DecimoEntry = {
      id: entry.id || generateId(),
      userId: data.currentUser.id,
      month: entry.month,
      year: entry.year,
      baseSalary: entry.baseSalary,
      overtimeHours50: entry.overtimeHours50 || 0,
      overtimeHours100: entry.overtimeHours100 || 0,
      total: entry.total,
    };
    setData(prev => ({
      ...prev,
      decimoEntries: [...prev.decimoEntries.filter(e => !(e.userId === data.currentUser!.id && e.month === entry.month && e.year === entry.year)), newEntry],
    }));
  };

  const updateSalaryConfig = (config: Partial<SalaryConfig>) => {
    if (!data.currentUser) return;
    setData(prev => {
      const existing = prev.salaryConfigs.find(c => c.userId === data.currentUser!.id);
      if (existing) {
        return { ...prev, salaryConfigs: prev.salaryConfigs.map(c => c.userId === data.currentUser!.id ? { ...c, ...config } : c) };
      }
      return { ...prev, salaryConfigs: [...prev.salaryConfigs, { ...config, userId: data.currentUser!.id } as SalaryConfig] };
    });
  };

  const getSalaryConfig = (): SalaryConfig => {
    if (!data.currentUser) {
      return { userId: '', baseSalary: 0, biweeklyPayment: 0, iessAporteActive: true, saludConyugeActive: false, fondosReservaActive: false, overtimeRate50: 0, overtimeRate100: 0 };
    }
    return data.salaryConfigs.find(c => c.userId === data.currentUser!.id) || {
      userId: data.currentUser.id,
      baseSalary: 0,
      biweeklyPayment: 0,
      iessAporteActive: true,
      saludConyugeActive: false,
      fondosReservaActive: false,
      overtimeRate50: 0,
      overtimeRate100: 0,
    };
  };

  const updateSelectedWeeks = (weeks: number[]) => {
    setData(prev => ({ ...prev, selectedWeeks: weeks }));
  };

  const updateSelectedYear = (year: number) => {
    setData(prev => ({ ...prev, selectedYear: year }));
  };

  const generateMonthlyReport = (month: number, year: number) => {
    if (!data.currentUser) return;
    const userId = data.currentUser.id;
    const monthTimeEntries = data.timeEntries.filter(e => {
      const date = new Date(e.date);
      return e.userId === userId && date.getMonth() === month && date.getFullYear() === year;
    });
    const monthHolidays = data.holidays.filter(h => h.userId === userId && h.month === month && h.year === year);
    const monthBonuses = data.bonuses.filter(b => b.userId === userId);
    const monthDiscounts = data.discounts.filter(d => d.userId === userId);
    const monthIncomes = data.incomes.filter(i => i.userId === userId);
    const monthExpenses = data.expenses.filter(e => e.userId === userId);
    const monthDebts = data.debts.filter(d => d.userId === userId);
    const monthDecimo = data.decimoEntries.find(d => d.userId === userId && d.month === month && d.year === year);
    const totalHours = monthTimeEntries.reduce((sum, e) => sum + e.hours, 0);
    const totalOvertime = monthTimeEntries.filter(e => e.isHoliday).reduce((sum, e) => sum + e.hours, 0);
    const salaryConfig = data.salaryConfigs.find(c => c.userId === userId);
    const baseSalary = salaryConfig?.baseSalary || 0;
    const netPayable = baseSalary + totalOvertime;
    const report: MonthlyReport = {
      id: generateId(),
      userId,
      month,
      year,
      timeEntries: monthTimeEntries,
      holidays: monthHolidays,
      bonuses: monthBonuses,
      discounts: monthDiscounts,
      incomes: monthIncomes,
      expenses: monthExpenses,
      debts: monthDebts,
      decimoEntry: monthDecimo,
      totalHours,
      totalOvertime,
      netPayable,
      createdAt: new Date().toISOString(),
    };
    setData(prev => ({
      ...prev,
      monthlyReports: [...prev.monthlyReports.filter(r => !(r.userId === userId && r.month === month && r.year === year)), report],
    }));
  };

  const getMonthlyReports = (): MonthlyReport[] => {
    if (!data.currentUser) return [];
    return data.monthlyReports.filter(r => r.userId === data.currentUser!.id);
  };

  const getMonthlyReport = (month: number, year: number): MonthlyReport | null => {
    if (!data.currentUser) return null;
    return data.monthlyReports.find(r => r.userId === data.currentUser!.id && r.month === month && r.year === year) || null;
  };

  const exportAllData = (): AppData => data;
  const importAllData = (importedData: AppData) => { setData(importedData); };

  const getAllUsers = (): User[] => data.users;

  const getUserData = (userId: string) => ({
    timeEntries: data.timeEntries.filter(e => e.userId === userId),
    holidays: data.holidays.filter(h => h.userId === userId),
    bonuses: data.bonuses.filter(b => b.userId === userId),
    discounts: data.discounts.filter(d => d.userId === userId),
    incomes: data.incomes.filter(i => i.userId === userId),
    expenses: data.expenses.filter(e => e.userId === userId),
    debts: data.debts.filter(d => d.userId === userId),
    decimoEntries: data.decimoEntries.filter(d => d.userId === userId),
    salaryConfig: data.salaryConfigs.find(c => c.userId === userId),
    monthlyReports: data.monthlyReports.filter(r => r.userId === userId),
  });

  const getUserTimeEntries = (): TimeEntry[] => data.currentUser ? data.timeEntries.filter(e => e.userId === data.currentUser!.id) : [];
  const getUserHolidays = (): Holiday[] => data.currentUser ? data.holidays.filter(h => h.userId === data.currentUser!.id) : [];
  const getUserBonuses = (): Bonus[] => data.currentUser ? data.bonuses.filter(b => b.userId === data.currentUser!.id) : [];
  const getUserDiscounts = (): Discount[] => data.currentUser ? data.discounts.filter(d => d.userId === data.currentUser!.id) : [];
  const getUserIncomes = (): Income[] => data.currentUser ? data.incomes.filter(i => i.userId === data.currentUser!.id) : [];
  const getUserExpenses = (): Expense[] => data.currentUser ? data.expenses.filter(e => e.userId === data.currentUser!.id) : [];
  const getUserDebts = (): Debt[] => data.currentUser ? data.debts.filter(d => d.userId === data.currentUser!.id) : [];
  const getUserDecimoEntries = (): DecimoEntry[] => data.currentUser ? data.decimoEntries.filter(d => d.userId === data.currentUser!.id) : [];

  return {
    data,
    register,
    login,
    logout,
    getCurrentUser,
    isAdmin,
    addTimeEntry,
    removeTimeEntry,
    addHoliday,
    removeHoliday,
    addBonus,
    updateBonus,
    removeBonus,
    addDiscount,
    updateDiscount,
    removeDiscount,
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
    getSalaryConfig,
    updateSelectedWeeks,
    updateSelectedYear,
    generateMonthlyReport,
    getMonthlyReports,
    getMonthlyReport,
    exportAllData,
    importAllData,
    getAllUsers,
    getUserData,
    getUserTimeEntries,
    getUserHolidays,
    getUserBonuses,
    getUserDiscounts,
    getUserIncomes,
    getUserExpenses,
    getUserDebts,
    getUserDecimoEntries,
  };
}
