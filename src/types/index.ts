export interface User {
  id: string;
  username: string;
  name: string;
  email?: string;
  password: string;
  role: 'admin' | 'user';
  createdAt: string;
}

export interface TimeEntry {
  id: string;
  userId: string;
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
  userId: string;
  name: string;
  date: string;
  dates?: string[];
  month: number;
  year: number;
}

export interface Bonus {
  id: string;
  userId: string;
  name: string;
  amount: number;
  active: boolean;
  basedOnSalary: boolean;
  percentage: number;
  type: 'bonus';
  isSpecial?: boolean;
}

export interface Discount {
  id: string;
  userId: string;
  name: string;
  amount: number;
  active: boolean;
  basedOnSalary: boolean;
  percentage: number;
  type: 'discount';
  isSpecial?: boolean;
  loanType?: string;
  totalMonths?: number;
  currentMonth?: number;
  fixedPayment?: boolean;
  monthlyPaymentAmount?: number;
  paymentsMade?: number;
  amortizationType?: 'frances' | 'alemana';
  interestRate?: number;
  loanAmount?: number;
  loanPayments?: LoanPayment[];
  customInstallments?: number[];
}

export interface LoanPayment {
  id: string;
  discountId: string;
  paymentNumber: number;
  amount: number;
  date: string;
  photo?: string;
}

export interface Income {
  id: string;
  userId: string;
  name: string;
  amount: number;
  fixed: boolean;
  forMonthEnd: boolean;
  type: 'fixed' | 'extra' | 'variable';
}

export interface Expense {
  id: string;
  userId: string;
  name: string;
  amount: number;
  originalAmount?: number;
  paidAmount?: number;
  category: string;
  frequency: 'monthly' | 'weekly' | 'annual' | 'once';
}

export interface Debt {
  id: string;
  userId: string;
  name: string;
  totalAmount: number;
  monthlyPayment: number;
  type: string;
  frequency: 'monthly' | 'once';
  paidAmount: number;
  progress: number;
  paymentsMade: number;
  totalPayments?: number;
}

export interface DecimoEntry {
  id: string;
  userId?: string;
  month: number;
  year: number;
  baseSalary: number;
  overtimeHours50: number;
  overtimeHours100: number;
  total: number;
}

export interface SalaryConfig {
  userId: string;
  baseSalary: number;
  biweeklyPayment: number;
  iessAporteActive: boolean;
  saludConyugeActive: boolean;
  fondosReservaActive: boolean;
  overtimeRate50: number;
  overtimeRate100: number;
}

export interface MonthlyReport {
  id: string;
  userId: string;
  month: number;
  year: number;
  timeEntries: TimeEntry[];
  holidays: Holiday[];
  bonuses: Bonus[];
  discounts: Discount[];
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  decimoEntry?: DecimoEntry;
  totalHours: number;
  totalOvertime: number;
  netPayable: number;
  createdAt: string;
}

export interface AppData {
  users: User[];
  currentUser: User | null;
  timeEntries: TimeEntry[];
  holidays: Holiday[];
  bonuses: Bonus[];
  discounts: Discount[];
  incomes: Income[];
  expenses: Expense[];
  debts: Debt[];
  decimoEntries: DecimoEntry[];
  salaryConfigs: SalaryConfig[];
  monthlyReports: MonthlyReport[];
  selectedWeeks: number[];
  selectedYear: number;
}
