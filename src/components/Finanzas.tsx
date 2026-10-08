import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Edit2, Trash2, Share2, AlertCircle, Shield, Heart, PiggyBank, Camera, X, ChevronDown } from 'lucide-react';
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

  // Expanded discount state - para mostrar/ocultar pagos registrados
  const [expandedDiscountId, setExpandedDiscountId] = useState<string | null>(null);

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

    store.addLoanPayment(selectedDiscountForPayment.id, payment);
    setShowLoanPaymentModal(false);
    setSelectedDiscountForPayment(null);
    setLoanPaymentAmount('');
    setLoanPaymentDate(new Date().toISOString().split('T')[0]);
    setLoanPaymentPhoto('');
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
      const capitalInstallment = principal / months;
      const remainingPrincipal = principal - (capitalInstallment * (paymentNumber - 1));
      const interest = remainingPrincipal * monthlyRate;
      return Math.round((capitalInstallment + interest) * 100) / 100;
    } else {
      if (monthlyRate === 0) {
        return Math.round((principal / months) * 100) / 100;
      }
      const installment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
      return Math.round(installment * 100) / 100;
    }
  };

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

        <div className="space-y-2">
          {regularDiscounts.map(discount => {
            const isExpanded = expandedDiscountId === discount.id;
            
            return (
              <div key={discount.id} className="bg-slate-700/30 rounded-lg p-3">
                <div className="flex items-start justify-between mb-2">
                  <div 
                    className="flex items-center gap-2 flex-1 cursor-pointer"
                    onClick={() => setExpandedDiscountId(isExpanded ? null : discount.id)}
                  >
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        store.updateDiscount(discount.id, { active: !discount.active });
                      }}
                      className={`w-4 h-4 rounded-full border-2 ${discount.active ? 'bg-red-500 border-red-500' : 'border-slate-500'}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className={`text-sm font-medium ${discount.active ? 'text-white' : 'text-slate-500'}`}>{discount.name}</p>
                        {discount.loanPayments && discount.loanPayments.length > 0 && (
                          <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded">
                            {discount.loanPayments.length} pagos
                          </span>
                        )}
                        {isExpanded && <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {(() => {
                          if (discount.loanType && discount.loanAmount && discount.totalMonths && discount.interestRate) {
                            const nextPaymentNumber = (discount.paymentsMade || 0) + 1;
                            const nextPaymentAmount = calculateInstallment(discount, nextPaymentNumber);
                            return (
                              <>
                                <span className="text-purple-400 font-semibold">Cuota #{nextPaymentNumber}: {formatCurrency(nextPaymentAmount)}</span>
                                {` • ${discount.loanType}`}
                                {` • ${discount.paymentsMade || 0}/${discount.totalMonths} pagos`}
                              </>
                            );
                          }
                          return (
                            <>
                              {discount.basedOnSalary ? `${discount.percentage}% del sueldo = ${formatCurrency(base * discount.percentage / 100)}` : formatCurrency(discount.amount)}
                              {discount.loanType && ` • ${discount.loanType}`}
                              {discount.totalMonths && ` • Mes ${discount.currentMonth}/${discount.totalMonths}`}
                            </>
                          );
                        })()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        openLoanPaymentModal(discount);
                      }}
                      className="text-emerald-400 hover:text-emerald-300"
                      title="Registrar Pago"
                    >
                      <Plus size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); startEditDiscount(discount); }} className="text-blue-400 hover:text-blue-300"><Edit2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); store.removeDiscount(discount.id); }} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                    <button onClick={(e) => { e.stopPropagation(); shareWhatsApp('Descuento', discount); }} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
                  </div>
                </div>
                
                {/* Lista de pagos individuales - Solo visible cuando está expandido */}
                {isExpanded && discount.loanPayments && discount.loanPayments.length > 0 && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="mt-3 pt-3 border-t border-slate-600/50"
                  >
                    <p className="text-xs text-slate-400 font-medium mb-2">Pagos registrados:</p>
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
                  </motion.div>
                )}
              </div>
            );
          })}
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
    </div>
  );
}
