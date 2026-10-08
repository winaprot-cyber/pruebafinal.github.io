import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Edit2, Trash2, Share2, AlertCircle, Shield, Heart, PiggyBank, Camera, X } from 'lucide-react';
import { formatCurrency, generateId } from '../utils/calculations';
import { shareAsImageWhatsApp } from '../utils/shareImage';
import type { useStore } from '../store/useStore';
import type { Bonus, Discount, LoanPayment } from '../store/useStore';

export default function Finanzas({ store }: { store: ReturnType<typeof useStore> }) {
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingBonus, setEditingBonus] = useState<string | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);

  // Bonus form state
  const [bonusName, setBonusName] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusBasedOnSalary, setBonusBasedOnSalary] = useState(false);
  const [bonusPercentage, setBonusPercentage] = useState('');

  // Discount form state
  const [discountName, setDiscountName] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountBasedOnSalary, setDiscountBasedOnSalary] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountLoanType, setDiscountLoanType] = useState('');
  const [discountTotalMonths, setDiscountTotalMonths] = useState('');
  const [discountFixedPayment, setDiscountFixedPayment] = useState(false);
  const [discountAmortizationType, setDiscountAmortizationType] = useState<'frances' | 'alemana'>('frances');
  const [discountInterestRate, setDiscountInterestRate] = useState('');
  const [discountLoanAmount, setDiscountLoanAmount] = useState('');

  // Loan payment modal state
  const [showLoanPaymentModal, setShowLoanPaymentModal] = useState(false);
  const [selectedDiscountForPayment, setSelectedDiscountForPayment] = useState<Discount | null>(null);
  const [loanPaymentAmount, setLoanPaymentAmount] = useState('');
  const [loanPaymentDate, setLoanPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanPaymentPhoto, setLoanPaymentPhoto] = useState<string>('');
  const loanPaymentPhotoRef = useRef<HTMLInputElement>(null);

  // Amortization table state
  const [showAmortizationTable, setShowAmortizationTable] = useState(false);
  const [selectedDiscountForTable, setSelectedDiscountForTable] = useState<Discount | null>(null);
  const [customInstallments, setCustomInstallments] = useState<Record<number, number>>({});

  const base = store.data.salaryConfig.baseSalary;
  const { iessAporteActive, saludConyugeActive, fondosReservaActive } = store.data.salaryConfig;

  const handleSaveBonus = () => {
    if (!bonusName) return;
    const bonus: Bonus = {
      id: editingBonus || generateId(),
      name: bonusName,
      amount: parseFloat(bonusAmount) || 0,
      active: true,
      basedOnSalary: bonusBasedOnSalary,
      percentage: parseFloat(bonusPercentage) || 0,
      type: 'bonus',
      isSpecial: false,
    };
    if (editingBonus) {
      store.updateBonus(editingBonus, bonus);
      setEditingBonus(null);
    } else {
      store.addBonus(bonus);
    }
    resetBonusForm();
  };

  const handleSaveDiscount = () => {
    if (!discountName) return;
    const existingDiscount = editingDiscount ? store.data.discounts.find(d => d.id === editingDiscount) : null;
    const discount: Discount = {
      id: editingDiscount || generateId(),
      name: discountName,
      amount: parseFloat(discountAmount) || 0,
      active: true,
      basedOnSalary: discountBasedOnSalary,
      percentage: parseFloat(discountPercentage) || 0,
      type: 'discount',
      isSpecial: false,
      loanType: discountLoanType,
      totalMonths: parseInt(discountTotalMonths) || undefined,
      currentMonth: existingDiscount?.currentMonth || 1,
      fixedPayment: discountFixedPayment,
      monthlyPaymentAmount: parseFloat(discountAmount) || 0,
      paymentsMade: existingDiscount?.paymentsMade || 0,
      amortizationType: discountAmortizationType,
      interestRate: parseFloat(discountInterestRate) || 0,
      loanAmount: parseFloat(discountLoanAmount) || 0,
    };
    if (editingDiscount) {
      store.updateDiscount(editingDiscount, discount);
      setEditingDiscount(null);
    } else {
      store.addDiscount(discount);
    }
    resetDiscountForm();
  };

  const resetBonusForm = () => {
    setBonusName('');
    setBonusAmount('');
    setBonusBasedOnSalary(false);
    setBonusPercentage('');
    setShowBonusForm(false);
  };

  const resetDiscountForm = () => {
    setDiscountName('');
    setDiscountAmount('');
    setDiscountBasedOnSalary(false);
    setDiscountPercentage('');
    setDiscountLoanType('');
    setDiscountTotalMonths('');
    setDiscountFixedPayment(false);
    setDiscountAmortizationType('frances');
    setDiscountInterestRate('');
    setDiscountLoanAmount('');
    setShowDiscountForm(false);
  };

  const startEditBonus = (b: Bonus) => {
    setEditingBonus(b.id);
    setBonusName(b.name);
    setBonusAmount(b.amount.toString());
    setBonusBasedOnSalary(b.basedOnSalary);
    setBonusPercentage(b.percentage.toString());
    setShowBonusForm(true);
  };

  const startEditDiscount = (d: Discount) => {
    setEditingDiscount(d.id);
    setDiscountName(d.name);
    setDiscountAmount(d.monthlyPaymentAmount?.toString() || d.amount.toString());
    setDiscountBasedOnSalary(d.basedOnSalary);
    setDiscountPercentage(d.percentage.toString());
    setDiscountLoanType(d.loanType || '');
    setDiscountTotalMonths(d.totalMonths?.toString() || '');
    setDiscountFixedPayment(d.fixedPayment || false);
    setDiscountAmortizationType(d.amortizationType || 'frances');
    setDiscountInterestRate(d.interestRate?.toString() || '');
    setDiscountLoanAmount(d.loanAmount?.toString() || '');
    setShowDiscountForm(true);
  };

  const shareWhatsApp = async (type: string, itemData: any) => {
    const fields = [
      { label: 'Nombre:', value: itemData.name },
      { label: 'Monto:', value: formatCurrency(itemData.amount), highlight: true },
    ];
    
    if (itemData.loanType) {
      fields.push({ label: 'Tipo:', value: itemData.loanType });
    }
    if (itemData.totalMonths) {
      fields.push({ label: 'Meses:', value: itemData.totalMonths.toString() });
    }
    fields.push({ label: 'Estado:', value: itemData.active ? 'Activo' : 'Inactivo' });

    const receiptData = {
      title: 'Control Biométrico',
      subtitle: type,
      color: '#ef4444',
      fields,
      footer: 'by Hugo León',
    };
    await shareAsImageWhatsApp(receiptData, `${type.toLowerCase()}-${itemData.name}-${Date.now()}`);
  };

  // Calcular cuota según tipo de amortización
  const calculateInstallment = (discount: Discount, paymentNumber: number): number => {
    if (!discount.loanAmount || !discount.totalMonths || !discount.interestRate) {
      return discount.monthlyPaymentAmount || discount.amount || 0;
    }

    const principal = discount.loanAmount;
    const months = discount.totalMonths;
    const annualRate = discount.interestRate / 100;
    const monthlyRate = annualRate / 12;

    if (discount.amortizationType === 'alemana') {
      // Amortización Alemana: cuota de capital constante + intereses decrecientes
      const capitalInstallment = principal / months;
      const remainingPrincipal = principal - (capitalInstallment * (paymentNumber - 1));
      const interest = remainingPrincipal * monthlyRate;
      return Math.round((capitalInstallment + interest) * 100) / 100;
    } else {
      // Amortización Francesa: cuota fija
      if (monthlyRate === 0) {
        return Math.round((principal / months) * 100) / 100;
      }
      const installment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      return Math.round(installment * 100) / 100;
    }
  };

  // Calcular tabla de amortización completa
  const calculateAmortizationTable = (discount: Discount): { number: number; amount: number; paid: boolean }[] => {
    if (!discount.loanAmount || !discount.totalMonths || !discount.interestRate) {
      return [];
    }

    const table = [];
    for (let i = 1; i <= discount.totalMonths; i++) {
      const installment = customInstallments[i] || calculateInstallment(discount, i);
      const isPaid = (discount.loanPayments?.length || 0) >= i;
      table.push({
        number: i,
        amount: installment,
        paid: isPaid,
      });
    }
    return table;
  };

  const openAmortizationTable = (discount: Discount) => {
    setSelectedDiscountForTable(discount);
    setShowAmortizationTable(true);
  };

  const handleCustomInstallmentChange = (installmentNumber: number, amount: string) => {
    setCustomInstallments(prev => ({
      ...prev,
      [installmentNumber]: parseFloat(amount) || 0,
    }));
  };

  const saveCustomInstallments = () => {
    if (!selectedDiscountForTable) return;
    
    // Actualizar el descuento con las cuotas personalizadas
    // Por ahora solo las guardamos en el estado local
    // En una implementación completa, se guardarían en el store
    setShowAmortizationTable(false);
  };

  const openLoanPaymentModal = (discount: Discount) => {
    setSelectedDiscountForPayment(discount);
    const nextPaymentNumber = (discount.loanPayments?.length || 0) + 1;
    
    // Determinar el monto sugerido
    let suggestedAmount = 0;
    
    if (discount.loanType && discount.loanAmount && discount.totalMonths) {
      // Es un préstamo, usar cálculo de cuota
      suggestedAmount = customInstallments[nextPaymentNumber] || calculateInstallment(discount, nextPaymentNumber);
    } else {
      // No es un préstamo, usar el monto del descuento
      suggestedAmount = discount.amount;
    }
    
    setLoanPaymentAmount(suggestedAmount.toString());
    setLoanPaymentDate(new Date().toISOString().split('T')[0]);
    setLoanPaymentPhoto('');
    setShowLoanPaymentModal(true);
  };

  const handleLoanPaymentPhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setLoanPaymentPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveLoanPayment = () => {
    if (!selectedDiscountForPayment || !loanPaymentAmount) return;
    
    const currentPayments = selectedDiscountForPayment.loanPayments || [];
    const nextPaymentNumber = currentPayments.length + 1;
    
    const payment: LoanPayment = {
      id: generateId(),
      discountId: selectedDiscountForPayment.id,
      paymentNumber: nextPaymentNumber,
      amount: parseFloat(loanPaymentAmount),
      date: loanPaymentDate,
      photo: loanPaymentPhoto || undefined,
    };

    console.log('Guardando pago:', payment);
    store.addLoanPayment(selectedDiscountForPayment.id, payment);
    console.log('Pago guardado exitosamente');
    
    setShowLoanPaymentModal(false);
    setSelectedDiscountForPayment(null);
    setLoanPaymentAmount('');
    setLoanPaymentDate(new Date().toISOString().split('T')[0]);
    setLoanPaymentPhoto('');
    
    alert('✅ Pago registrado exitosamente');
  };

  const handleDeleteLoanPayment = (discountId: string, paymentId: string) => {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
      store.removeLoanPayment(discountId, paymentId);
    }
  };

  const shareLoanPaymentWhatsApp = async (payment: LoanPayment, discount: Discount) => {
    const isLoan = discount.totalMonths && discount.totalMonths > 0;
    
    const receiptData = {
      title: 'Control Biométrico',
      subtitle: isLoan ? 'Pago de Préstamo' : 'Pago de Descuento',
      color: '#3b82f6',
      fields: [
        { label: isLoan ? 'Préstamo:' : 'Descuento:', value: discount.name },
        { label: 'Pago #:', value: payment.paymentNumber.toString(), highlight: true },
        { label: 'Monto:', value: formatCurrency(payment.amount), highlight: true },
        { label: 'Fecha:', value: new Date(payment.date).toLocaleDateString('es-EC') },
        ...(isLoan ? [{ 
          label: 'Progreso:', 
          value: `${discount.paymentsMade}/${discount.totalMonths} (${(((discount.paymentsMade || 0) / (discount.totalMonths || 1)) * 100).toFixed(1)}%)` 
        }] : []),
      ],
      photo: payment.photo,
      footer: 'by Hugo León',
    };
    await shareAsImageWhatsApp(receiptData, `pago-${discount.name}-${payment.paymentNumber}`);
  };

  // Check for 25% loan alerts
  const loanAlerts = store.data.discounts.filter(d => {
    if (d.loanType === 'quirografario' && d.totalMonths && d.currentMonth) {
      const progress = (d.currentMonth / d.totalMonths) * 100;
      return progress >= 25 && progress < 30;
    }
    return false;
  });

  // Regular bonuses/discounts (not special)
  const regularBonuses = store.data.bonuses.filter(b => !b.isSpecial);
  const regularDiscounts = store.data.discounts.filter(d => !d.isSpecial);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
          <Wallet size={24} className="text-emerald-400" />
          Finanzas
        </h2>
      </div>

      {/* Loan Alerts */}
      {loanAlerts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4"
        >
          <div className="flex items-center gap-2 text-yellow-400">
            <AlertCircle size={20} />
            <span className="font-medium">¡Alerta de Préstamo!</span>
          </div>
          {loanAlerts.map(d => (
            <p key={d.id} className="text-sm text-yellow-300 mt-1">
              "{d.name}" ha alcanzado el {((d.currentMonth! / d.totalMonths!) * 100).toFixed(0)}% de pago. 
              ¡Se acerca el cumplimiento del 25%!
            </p>
          ))}
        </motion.div>
      )}

      {/* Special Items Section */}
      <div className="bg-gradient-to-br from-slate-800/80 to-slate-700/50 border border-slate-600/50 rounded-xl p-4 md:p-6">
        <h3 className="text-base md:text-lg font-semibold mb-4 flex items-center gap-2">
          <Shield size={20} className="text-blue-400" />
          Items Especiales (IESS y Fondos de Reserva)
        </h3>
        <p className="text-xs text-slate-400 mb-4">
          Estos items se calculan automáticamente sobre la base de ingreso (Base + Horas Extras)
        </p>
        <div className="space-y-3">
          {/* IESS Aporte Personal */}
          <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <Shield size={20} className="text-blue-400" />
              <div>
                <p className="text-sm font-medium text-white">Aporte Personal IESS</p>
                <p className="text-xs text-slate-400">9.45% sobre (Base + Horas Extras)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={iessAporteActive}
                onChange={(e) => store.updateSalaryConfig({ iessAporteActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {/* Salud Cónyuge */}
          <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <Heart size={20} className="text-pink-400" />
              <div>
                <p className="text-sm font-medium text-white">Salud Cónyuge IESS</p>
                <p className="text-xs text-slate-400">3.41% sobre (Base + Horas Extras)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={saludConyugeActive}
                onChange={(e) => store.updateSalaryConfig({ saludConyugeActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-pink-500"></div>
            </label>
          </div>

          {/* Fondos de Reserva */}
          <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-4 py-3">
            <div className="flex items-center gap-3">
              <PiggyBank size={20} className="text-emerald-400" />
              <div>
                <p className="text-sm font-medium text-white">Fondos de Reserva</p>
                <p className="text-xs text-slate-400">8.33% sobre (Base + Horas Extras)</p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={fondosReservaActive}
                onChange={(e) => store.updateSalaryConfig({ fondosReservaActive: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-emerald-500/20 to-emerald-600/10 border border-emerald-500/30 rounded-xl p-4">
          <p className="text-sm text-emerald-300">Total Bonos Activos</p>
          <p className="text-2xl md:text-3xl font-bold text-white">
            {formatCurrency(regularBonuses.filter(b => b.active).reduce((s, b) => {
              return s + (b.basedOnSalary ? base * b.percentage / 100 : b.amount);
            }, 0))}
          </p>
        </div>
        <div className="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-xl p-4">
          <p className="text-sm text-red-300">Total Descuentos Activos</p>
          <p className="text-2xl md:text-3xl font-bold text-white">
            {formatCurrency(regularDiscounts.filter(d => d.active).reduce((s, d) => {
              return s + (d.basedOnSalary ? base * d.percentage / 100 : d.amount);
            }, 0))}
          </p>
        </div>
      </div>

      {/* Bonuses Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-emerald-400">Bonos</h3>
          <button
            onClick={() => { resetBonusForm(); setShowBonusForm(true); }}
            className="flex items-center gap-1 bg-emerald-500/20 border border-emerald-500/30 px-2 md:px-3 py-1 rounded-lg text-emerald-300 text-xs md:text-sm hover:bg-emerald-500/30"
          >
            <Plus size={14} /> Agregar Bono
          </button>
        </div>

        <AnimatePresence>
          {showBonusForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Nombre del bono"
                    value={bonusName}
                    onChange={(e) => setBonusName(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  {!bonusBasedOnSalary && (
                    <input
                      type="number"
                      placeholder="Monto"
                      value={bonusAmount}
                      onChange={(e) => setBonusAmount(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={bonusBasedOnSalary}
                      onChange={(e) => setBonusBasedOnSalary(e.target.checked)}
                      className="rounded border-slate-500"
                    />
                    Basado en sueldo
                  </label>
                  {bonusBasedOnSalary && (
                    <input
                      type="number"
                      placeholder="% del sueldo"
                      value={bonusPercentage}
                      onChange={(e) => setBonusPercentage(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-32"
                    />
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={handleSaveBonus} className="bg-emerald-500/20 border border-emerald-500/30 px-3 py-1 rounded text-emerald-300 text-sm">
                    {editingBonus ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button onClick={resetBonusForm} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {regularBonuses.map(bonus => (
            <div key={bonus.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 md:px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => store.updateBonus(bonus.id, { active: !bonus.active })}
                  className={`w-4 h-4 rounded-full border-2 ${bonus.active ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500'}`}
                />
                <div>
                  <p className={`text-sm font-medium ${bonus.active ? 'text-white' : 'text-slate-500'}`}>{bonus.name}</p>
                  <p className="text-xs text-slate-400">
                    {bonus.basedOnSalary ? `${bonus.percentage}% del sueldo = ${formatCurrency(base * bonus.percentage / 100)}` : formatCurrency(bonus.amount)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEditBonus(bonus)} className="text-blue-400 hover:text-blue-300"><Edit2 size={14} /></button>
                <button onClick={() => store.removeBonus(bonus.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Bono', bonus)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
              </div>
            </div>
          ))}
          {regularBonuses.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No hay bonos registrados</p>}
        </div>
      </div>

      {/* Discounts Section */}
      <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-red-400">Descuentos</h3>
          <button
            onClick={() => { resetDiscountForm(); setShowDiscountForm(true); }}
            className="flex items-center gap-1 bg-red-500/20 border border-red-500/30 px-2 md:px-3 py-1 rounded-lg text-red-300 text-xs md:text-sm hover:bg-red-500/30"
          >
            <Plus size={14} /> Agregar Descuento
          </button>
        </div>

        <AnimatePresence>
          {showDiscountForm && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="bg-slate-700/30 rounded-lg p-4 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <input
                    placeholder="Nombre del descuento"
                    value={discountName}
                    onChange={(e) => setDiscountName(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  {!discountBasedOnSalary && (
                    <input
                      type="number"
                      placeholder="Monto"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  )}
                </div>
                <div className="flex items-center gap-4 flex-wrap">
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={discountBasedOnSalary}
                      onChange={(e) => setDiscountBasedOnSalary(e.target.checked)}
                      className="rounded border-slate-500"
                    />
                    Basado en sueldo
                  </label>
                  {discountBasedOnSalary && (
                    <input
                      type="number"
                      placeholder="% del sueldo"
                      value={discountPercentage}
                      onChange={(e) => setDiscountPercentage(e.target.value)}
                      className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm w-32"
                    />
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Tipo de Préstamo</label>
                    <select
                      value={discountLoanType}
                      onChange={(e) => setDiscountLoanType(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    >
                      <option value="">Sin préstamo</option>
                      <option value="quirografario">Préstamo Quirografario</option>
                      <option value="empresarial">Préstamo Empresarial</option>
                      <option value="otro">Otro</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Meses Totales</label>
                    <input
                      type="number"
                      placeholder="Ej: 12"
                      value={discountTotalMonths}
                      onChange={(e) => setDiscountTotalMonths(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                  </div>
                </div>
                
                {/* Configuración de Préstamo Quirografario */}
                {discountLoanType === 'quirografario' && discountTotalMonths && (
                  <div className="space-y-3 bg-slate-700/20 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-blue-400">Configuración del Préstamo</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Monto del Préstamo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ej: 10000"
                          value={discountLoanAmount}
                          onChange={(e) => setDiscountLoanAmount(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Tasa de Interés Anual (%)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ej: 9.5"
                          value={discountInterestRate}
                          onChange={(e) => setDiscountInterestRate(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-1">Tipo de Amortización</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setDiscountAmortizationType('frances')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            discountAmortizationType === 'frances'
                              ? 'bg-blue-500/30 border border-blue-500/50 text-blue-300'
                              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:bg-slate-600/50'
                          }`}
                        >
                          Francesa (Cuota Fija)
                        </button>
                        <button
                          type="button"
                          onClick={() => setDiscountAmortizationType('alemana')}
                          className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                            discountAmortizationType === 'alemana'
                              ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:bg-slate-600/50'
                          }`}
                        >
                          Alemana (Cuota Decreciente)
                        </button>
                      </div>
                      <p className="text-xs text-slate-500 mt-1">
                        {discountAmortizationType === 'frances' 
                          ? 'Cuota fija durante todo el préstamo'
                          : 'Cuotas decrecientes (capital constante + intereses decrecientes)'}
                      </p>
                    </div>

                    {/* Vista previa de cuotas */}
                    {discountLoanAmount && discountInterestRate && discountTotalMonths && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-2">Vista previa de cuotas:</p>
                        <div className="space-y-1 max-h-32 overflow-y-auto">
                          {Array.from({ length: Math.min(5, parseInt(discountTotalMonths)) }, (_, i) => {
                            const installment = calculateInstallment(
                              { loanAmount: parseFloat(discountLoanAmount), interestRate: parseFloat(discountInterestRate), totalMonths: parseInt(discountTotalMonths), amortizationType: discountAmortizationType } as Discount,
                              i + 1
                            );
                            return (
                              <div key={i} className="flex justify-between text-xs">
                                <span className="text-slate-400">Cuota {i + 1}:</span>
                                <span className="text-white font-medium">{formatCurrency(installment)}</span>
                              </div>
                            );
                          })}
                          {parseInt(discountTotalMonths) > 5 && (
                            <p className="text-xs text-slate-500 text-center">... y {parseInt(discountTotalMonths) - 5} cuotas más</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Configuración de Préstamo Empresarial */}
                {discountLoanType === 'empresarial' && discountTotalMonths && (
                  <div className="space-y-3 bg-slate-700/20 rounded-lg p-3">
                    <h4 className="text-sm font-medium text-purple-400">Configuración del Préstamo Empresarial</h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Monto Total del Préstamo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ej: 500"
                          value={discountLoanAmount}
                          onChange={(e) => setDiscountLoanAmount(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Pago Mensual Fijo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Ej: 50"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                      </div>
                    </div>

                    {discountLoanAmount && discountAmount && discountTotalMonths && (
                      <div className="bg-slate-800/50 rounded-lg p-3">
                        <p className="text-xs text-slate-400 mb-2">Resumen:</p>
                        <div className="space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-400">Monto del préstamo:</span>
                            <span className="text-white font-medium">{formatCurrency(parseFloat(discountLoanAmount))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Pago mensual:</span>
                            <span className="text-purple-400 font-medium">{formatCurrency(parseFloat(discountAmount))}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-400">Meses:</span>
                            <span className="text-white font-medium">{discountTotalMonths}</span>
                          </div>
                          <div className="flex justify-between border-t border-slate-700 pt-1 mt-1">
                            <span className="text-slate-400">Total a pagar:</span>
                            <span className="text-emerald-400 font-bold">{formatCurrency(parseFloat(discountAmount) * parseInt(discountTotalMonths))}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  <button onClick={handleSaveDiscount} className="bg-red-500/20 border border-red-500/30 px-3 py-1 rounded text-red-300 text-sm">
                    {editingDiscount ? 'Actualizar' : 'Guardar'}
                  </button>
                  <button onClick={resetDiscountForm} className="bg-slate-600/30 px-3 py-1 rounded text-slate-400 text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {regularDiscounts.map(discount => (
            <div key={discount.id}>
              <div className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 md:px-4 py-3">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => store.updateDiscount(discount.id, { active: !discount.active })}
                  className={`w-4 h-4 rounded-full border-2 ${discount.active ? 'bg-red-500 border-red-500' : 'border-slate-500'}`}
                />
                <div>
                  <p className={`text-sm font-medium ${discount.active ? 'text-white' : 'text-slate-500'}`}>{discount.name}</p>
                  <p className="text-xs text-slate-400">
                    {(() => {
                      // Si es un préstamo con tabla de amortización, mostrar el valor del próximo pago
                      if (discount.loanType && discount.loanAmount && discount.totalMonths && discount.interestRate) {
                        const nextPaymentNumber = (discount.paymentsMade || 0) + 1;
                        const nextPaymentAmount = customInstallments[nextPaymentNumber] || calculateInstallment(discount, nextPaymentNumber);
                        return (
                          <>
                            <span className="text-purple-400 font-semibold">Cuota #{nextPaymentNumber}: {formatCurrency(nextPaymentAmount)}</span>
                            {` • ${discount.loanType}`}
                            {` • ${discount.paymentsMade || 0}/${discount.totalMonths} pagos`}
                          </>
                        );
                      }
                      // Si no es un préstamo, mostrar el monto normal
                      return (
                        <>
                          {discount.basedOnSalary ? `${discount.percentage}% del sueldo = ${formatCurrency(base * discount.percentage / 100)}` : formatCurrency(discount.amount)}
                          {discount.loanType && ` • ${discount.loanType}`}
                          {discount.totalMonths && ` • Mes ${discount.currentMonth}/${discount.totalMonths}`}
                        </>
                      );
                    })()}
                  </p>
                  {/* Barra de progreso para préstamos */}
                  {discount.loanType && discount.totalMonths && (
                    <div className="mt-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-slate-600 rounded-full h-2 w-32">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-emerald-500 h-2 rounded-full transition-all"
                              style={{ width: `${((discount.paymentsMade || 0) / discount.totalMonths) * 100}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold text-blue-400">
                            {discount.paymentsMade || 0}/{discount.totalMonths} ({(((discount.paymentsMade || 0) / discount.totalMonths) * 100).toFixed(1)}%)
                          </span>
                        </div>
                        <div className="flex gap-2">
                          {discount.amortizationType && discount.loanAmount && discount.interestRate && (
                            <button
                              onClick={() => openAmortizationTable(discount)}
                              className="text-xs bg-purple-500/20 border border-purple-500/30 px-2 py-1 rounded text-purple-300 hover:bg-purple-500/30"
                              title="Ver tabla de amortización"
                            >
                              📊 Tabla
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Lista de pagos individuales para TODOS los descuentos */}
                  {discount.loanPayments && discount.loanPayments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs text-slate-400 font-medium">Pagos registrados:</p>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {discount.loanPayments.map((payment) => (
                          <div key={payment.id} className="flex items-center justify-between bg-slate-700/30 rounded px-2 py-1 text-xs">
                            <div className="flex items-center gap-2">
                              <span className="text-blue-400 font-bold">#{payment.paymentNumber}</span>
                              <span className="text-white">{formatCurrency(payment.amount)}</span>
                              <span className="text-slate-500">{new Date(payment.date).toLocaleDateString('es-EC')}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              {payment.photo && (
                                <span className="text-green-400" title="Con foto">📷</span>
                              )}
                              <button
                                onClick={() => shareLoanPaymentWhatsApp(payment, discount)}
                                className="text-green-400 hover:text-green-300"
                                title="Compartir"
                              >
                                <Share2 size={12} />
                              </button>
                              <button
                                onClick={() => handleDeleteLoanPayment(discount.id, payment.id)}
                                className="text-red-400 hover:text-red-300"
                                title="Eliminar"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => openLoanPaymentModal(discount)} 
                  className="text-emerald-400 hover:text-emerald-300"
                  title="Registrar Pago"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"></line>
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                  </svg>
                </button>
                <button onClick={() => startEditDiscount(discount)} className="text-blue-400 hover:text-blue-300"><Edit2 size={14} /></button>
                <button onClick={() => store.removeDiscount(discount.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Descuento', discount)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
              </div>
              </div>
            </div>
          ))}
          {regularDiscounts.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No hay descuentos registrados</p>}
        </div>
      </div>

      {/* Loan Payment Modal */}
      <AnimatePresence>
        {showLoanPaymentModal && selectedDiscountForPayment && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Registrar Pago</h3>
                <button onClick={() => setShowLoanPaymentModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedDiscountForPayment.name}</p>
                <p className="text-xs text-slate-400">
                  {selectedDiscountForPayment.totalMonths 
                    ? `Pagos realizados: ${selectedDiscountForPayment.paymentsMade || 0}/${selectedDiscountForPayment.totalMonths}`
                    : `Monto regular: ${formatCurrency(selectedDiscountForPayment.amount)}`
                  }
                </p>
                <p className="text-xs text-blue-400 mt-1">
                  Siguiente pago: #{(selectedDiscountForPayment.loanPayments?.length || 0) + 1}
                </p>
                {selectedDiscountForPayment.amortizationType && (
                  <p className="text-xs text-purple-400 mt-1">
                    Tipo: {selectedDiscountForPayment.amortizationType === 'frances' ? 'Francesa (Cuota Fija)' : 'Alemana (Cuota Decreciente)'}
                  </p>
                )}
                {selectedDiscountForPayment.loanAmount && selectedDiscountForPayment.interestRate && (
                  <p className="text-xs text-emerald-400 mt-1">
                    Cuota sugerida: {formatCurrency(calculateInstallment(selectedDiscountForPayment, (selectedDiscountForPayment.loanPayments?.length || 0) + 1))}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400 block mb-1">Monto del Pago ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={loanPaymentAmount}
                    onChange={(e) => setLoanPaymentAmount(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Fecha del Pago</label>
                  <input
                    type="date"
                    value={loanPaymentDate}
                    onChange={(e) => setLoanPaymentDate(e.target.value)}
                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                </div>

                <div>
                  <label className="text-sm text-slate-400 block mb-1">Foto del Comprobante (Opcional)</label>
                  <button
                    onClick={() => loanPaymentPhotoRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm hover:bg-slate-600/50"
                  >
                    <Camera size={16} /> {loanPaymentPhoto ? 'Cambiar foto' : 'Agregar foto'}
                  </button>
                  <input
                    ref={loanPaymentPhotoRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLoanPaymentPhotoChange}
                  />
                  {loanPaymentPhoto && (
                    <div className="mt-2 relative">
                      <img src={loanPaymentPhoto} alt="Comprobante" className="w-full h-32 object-cover rounded-lg border border-slate-600" />
                      <button
                        onClick={() => setLoanPaymentPhoto('')}
                        className="absolute top-2 right-2 bg-red-500/80 p-1 rounded"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <button
                  onClick={handleSaveLoanPayment}
                  className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Guardar Pago
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Amortization Table Modal */}
      <AnimatePresence>
        {showAmortizationTable && selectedDiscountForTable && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="bg-slate-800 border border-slate-700 rounded-xl p-4 md:p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Tabla de Amortización</h3>
                  <p className="text-xs text-slate-400">{selectedDiscountForTable.name}</p>
                  <p className="text-xs text-purple-400 mt-1">
                    Tipo: {selectedDiscountForTable.amortizationType === 'frances' ? 'Francesa (Cuota Fija)' : 'Alemana (Cuota Decreciente)'}
                  </p>
                </div>
                <button onClick={() => setShowAmortizationTable(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div>
                    <p className="text-xs text-slate-400">Monto</p>
                    <p className="text-sm font-bold text-white">{formatCurrency(selectedDiscountForTable.loanAmount || 0)}</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Tasa Anual</p>
                    <p className="text-sm font-bold text-white">{selectedDiscountForTable.interestRate}%</p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Meses</p>
                    <p className="text-sm font-bold text-white">{selectedDiscountForTable.totalMonths}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-96 overflow-y-auto">
                {calculateAmortizationTable(selectedDiscountForTable).map((installment) => (
                  <div
                    key={installment.number}
                    className={`flex items-center justify-between bg-slate-700/30 rounded-lg px-3 py-2 ${
                      installment.paid ? 'opacity-50' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${
                        installment.paid 
                          ? 'bg-emerald-500/20 text-emerald-400' 
                          : 'bg-blue-500/20 text-blue-400'
                      }`}>
                        #{installment.number}
                      </span>
                      {installment.paid && (
                        <span className="text-xs text-emerald-400">✓ Pagado</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        step="0.01"
                        value={installment.amount}
                        onChange={(e) => handleCustomInstallmentChange(installment.number, e.target.value)}
                        disabled={installment.paid}
                        className={`w-28 bg-slate-700/50 border border-slate-600 rounded px-2 py-1 text-white text-sm text-right ${
                          installment.paid ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                <p className="text-xs text-blue-300">
                  💡 Puedes editar el monto de cada cuota manualmente. Los cambios se aplicarán al registrar pagos.
                </p>
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  onClick={saveCustomInstallments}
                  className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition"
                >
                  Guardar Cambios
                </button>
                <button
                  onClick={() => setShowAmortizationTable(false)}
                  className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-sm transition"
                >
                  Cerrar
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
