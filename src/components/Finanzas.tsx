import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Trash2, Share2, Edit2, ChevronDown, ChevronUp, Camera, X } from 'lucide-react';
import { formatCurrency, generateId, calculateInstallment } from '../utils/calculations';
import { shareAsImageWhatsApp } from '../utils/shareImage';
import type { useStore } from '../store/useStore';
import type { Discount, LoanPayment } from '../types';

export default function Finanzas({ store }: { store: ReturnType<typeof useStore> }) {
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [expandedDiscountId, setExpandedDiscountId] = useState<string | null>(null);

  // Bonus form
  const [bonusName, setBonusName] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');

  // Discount form
  const [discountName, setDiscountName] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountType, setDiscountType] = useState<'regular' | 'quirografario' | 'hipotecario' | 'vehicular' | 'tarjeta' | 'electrodomestico' | 'personal' | 'otro'>('regular');
  const [discountLoanAmount, setDiscountLoanAmount] = useState('');
  const [discountMonths, setDiscountMonths] = useState('');
  const [discountInterestRate, setDiscountInterestRate] = useState('');
  const [discountAmortization, setDiscountAmortization] = useState<'frances' | 'alemana'>('frances');

  // Loan payment form
  const [showPaymentForm, setShowPaymentForm] = useState<string | null>(null);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentPhoto, setPaymentPhoto] = useState<string>('');

  const handleSaveBonus = () => {
    if (!bonusName) return;
    store.addBonus({
      name: bonusName,
      amount: parseFloat(bonusAmount) || 0,
      active: true,
      basedOnSalary: false,
      percentage: 0,
      type: 'bonus',
    });
    setBonusName('');
    setBonusAmount('');
    setShowBonusForm(false);
  };

  const handleSaveDiscount = () => {
    if (!discountName) return;
    
    const discount: any = {
      name: discountName,
      amount: parseFloat(discountAmount) || 0,
      active: true,
      basedOnSalary: false,
      percentage: 0,
      type: 'discount',
      loanPayments: [],
      paymentsMade: 0,
    };

    if (discountType !== 'regular') {
      discount.loanType = discountType;
      discount.loanAmount = parseFloat(discountLoanAmount) || 0;
      discount.totalMonths = parseInt(discountMonths) || 0;
      discount.interestRate = parseFloat(discountInterestRate) || 0;
      discount.amortizationType = discountAmortization;
    }

    store.addDiscount(discount);
    resetDiscountForm();
  };

  const resetDiscountForm = () => {
    setDiscountName('');
    setDiscountAmount('');
    setDiscountType('regular');
    setDiscountLoanAmount('');
    setDiscountMonths('');
    setDiscountInterestRate('');
    setDiscountAmortization('frances');
    setShowDiscountForm(false);
  };

  const handleAddPayment = (discountId: string) => {
    const discount = store.getUserDiscounts().find(d => d.id === discountId);
    if (!discount || !paymentAmount) return;

    const payment: LoanPayment = {
      id: generateId(),
      discountId,
      paymentNumber: (discount.paymentsMade || 0) + 1,
      amount: parseFloat(paymentAmount),
      date: paymentDate,
      photo: paymentPhoto || undefined,
    };

    store.addLoanPayment(discountId, payment);
    setPaymentAmount('');
    setPaymentDate(new Date().toISOString().split('T')[0]);
    setPaymentPhoto('');
    setShowPaymentForm(null);
  };

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setPaymentPhoto(ev.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const shareWhatsApp = async (type: string, itemData: any) => {
    const fields = [
      { label: 'Nombre:', value: itemData.name },
      { label: 'Monto:', value: formatCurrency(itemData.amount), highlight: true },
    ];

    if (itemData.loanType) {
      fields.push({ label: 'Tipo:', value: itemData.loanType });
      if (itemData.loanAmount) fields.push({ label: 'Monto Préstamo:', value: formatCurrency(itemData.loanAmount) });
      if (itemData.totalMonths) fields.push({ label: 'Plazo:', value: `${itemData.totalMonths} meses` });
      if (itemData.interestRate) fields.push({ label: 'Tasa:', value: `${itemData.interestRate}% anual` });
      if (itemData.amortizationType) fields.push({ label: 'Amortización:', value: itemData.amortizationType === 'frances' ? 'Francesa' : 'Alemana' });
      if (itemData.paymentsMade) fields.push({ label: 'Pagos:', value: `${itemData.paymentsMade} realizados` });
    }

    const receiptData = {
      title: 'Control Biométrico',
      subtitle: type,
      color: '#ef4444',
      fields,
      footer: 'by Hugo León',
    };
    await shareAsImageWhatsApp(receiptData, `${type.toLowerCase()}-${itemData.name}`);
  };

  const bonuses = store.getUserBonuses();
  const discounts = store.getUserDiscounts();

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="card-elevated rounded-xl p-4 md:p-6">
        <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
          <Wallet size={24} className="text-emerald-400" />
          Finanzas
        </h2>
      </div>

      {/* BONOS */}
      <div className="card-solid rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-emerald-400">Bonos</h3>
          <button onClick={() => setShowBonusForm(true)} className="btn-secondary flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
            <Plus size={14} /> Agregar Bono
          </button>
        </div>

        <AnimatePresence>
          {showBonusForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/80 rounded-lg p-4 space-y-3 border border-slate-600/50">
                <input placeholder="Nombre del bono" value={bonusName} onChange={(e) => setBonusName(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <input type="number" placeholder="Monto" value={bonusAmount} onChange={(e) => setBonusAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveBonus} className="btn-primary flex-1 px-3 py-1 rounded text-sm">Guardar</button>
                  <button onClick={() => setShowBonusForm(false)} className="btn-secondary flex-1 px-3 py-1 rounded text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {bonuses.map(bonus => (
            <div key={bonus.id} className="flex items-center justify-between bg-slate-700/80 rounded-lg px-3 md:px-4 py-3 border border-slate-600/50">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => store.updateBonus(bonus.id, { active: !bonus.active })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${bonus.active ? 'bg-emerald-500' : 'bg-slate-600'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${bonus.active ? 'translate-x-6' : 'translate-x-0.5'}`} />
                </button>
                <div>
                  <p className={`text-sm font-semibold ${bonus.active ? 'text-white' : 'text-slate-500'}`}>{bonus.name}</p>
                  <p className={`text-xs mt-1 ${bonus.active ? 'text-slate-300' : 'text-slate-500'}`}>{formatCurrency(bonus.amount)}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => store.removeBonus(bonus.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Bono', bonus)} className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded"><Share2 size={14} /></button>
              </div>
            </div>
          ))}
          {bonuses.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No hay bonos registrados</p>}
        </div>
      </div>

      {/* DESCUENTOS Y PRÉSTAMOS */}
      <div className="card-solid rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-red-400">Descuentos y Préstamos</h3>
          <button onClick={() => setShowDiscountForm(true)} className="btn-secondary flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
            <Plus size={14} /> Agregar
          </button>
        </div>

        <AnimatePresence>
          {showDiscountForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/80 rounded-lg p-4 space-y-3 border border-slate-600/50">
                <input placeholder="Nombre" value={discountName} onChange={(e) => setDiscountName(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                
                <select value={discountType} onChange={(e) => setDiscountType(e.target.value as any)} className="input-solid w-full rounded-lg px-3 py-2 text-sm">
                  <option value="regular">Descuento Regular</option>
                  <option value="quirografario">💳 Préstamo Quirografario</option>
                  <option value="hipotecario">🏠 Préstamo Hipotecario</option>
                  <option value="vehicular">🚗 Préstamo Vehicular</option>
                  <option value="tarjeta">💳 Tarjeta de Crédito</option>
                  <option value="electrodomestico">🔌 Electrodoméstico</option>
                  <option value="personal">👤 Préstamo Personal</option>
                  <option value="otro">📦 Otro</option>
                </select>

                {discountType === 'regular' ? (
                  <input type="number" placeholder="Monto" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                ) : (
                  <>
                    <input type="number" placeholder="Monto del Préstamo" value={discountLoanAmount} onChange={(e) => setDiscountLoanAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    <input type="number" placeholder="Número de Cuotas" value={discountMonths} onChange={(e) => setDiscountMonths(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    <input type="number" step="0.01" placeholder="Tasa de Interés Anual (%)" value={discountInterestRate} onChange={(e) => setDiscountInterestRate(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setDiscountAmortization('frances')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${discountAmortization === 'frances' ? 'bg-blue-500/30 border border-blue-500/50 text-blue-300' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}
                      >
                        Francesa (Cuota Fija)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDiscountAmortization('alemana')}
                        className={`px-3 py-2 rounded-lg text-sm font-medium transition ${discountAmortization === 'alemana' ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300' : 'bg-slate-700/50 border border-slate-600 text-slate-400'}`}
                      >
                        Alemana (Decreciente)
                      </button>
                    </div>
                  </>
                )}

                <div className="flex gap-2">
                  <button onClick={handleSaveDiscount} className="btn-primary flex-1 px-3 py-1 rounded text-sm">Guardar</button>
                  <button onClick={resetDiscountForm} className="btn-secondary flex-1 px-3 py-1 rounded text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {discounts.map(discount => {
            const isExpanded = expandedDiscountId === discount.id;
            const isLoan = discount.loanType && discount.loanType !== 'regular';
            
            return (
              <div key={discount.id} className="bg-slate-700/80 rounded-lg border border-slate-600/50 overflow-hidden">
                <div className="p-3 md:p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1 cursor-pointer" onClick={() => setExpandedDiscountId(isExpanded ? null : discount.id)}>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-white">{discount.name}</p>
                        {isLoan && (
                          <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">
                            {discount.loanType}
                          </span>
                        )}
                        {discount.amortizationType && (
                          <span className={`text-xs px-2 py-0.5 rounded ${discount.amortizationType === 'frances' ? 'bg-blue-500/20 text-blue-300' : 'bg-purple-500/20 text-purple-300'}`}>
                            {discount.amortizationType === 'frances' ? 'Francesa' : 'Alemana'}
                          </span>
                        )}
                        {isExpanded && <ChevronUp size={14} className="text-slate-400" />}
                        {!isExpanded && <ChevronDown size={14} className="text-slate-400" />}
                      </div>
                      <p className="text-xs text-slate-300 mt-1">
                        {isLoan ? (
                          <>
                            {discount.loanAmount && <span>Monto: {formatCurrency(discount.loanAmount)}</span>}
                            {discount.totalMonths && <span> • {discount.paymentsMade || 0}/{discount.totalMonths} cuotas</span>}
                            {discount.interestRate && discount.interestRate > 0 && <span> • {discount.interestRate}% anual</span>}
                          </>
                        ) : (
                          <>{formatCurrency(discount.amount)}</>
                        )}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      {isLoan && (
                        <button onClick={() => setShowPaymentForm(discount.id)} className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-500/20 rounded" title="Agregar Pago">
                          <Plus size={14} />
                        </button>
                      )}
                      <button onClick={() => store.removeDiscount(discount.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded"><Trash2 size={14} /></button>
                      <button onClick={() => shareWhatsApp('Descuento', discount)} className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded"><Share2 size={14} /></button>
                    </div>
                  </div>

                  {/* Barra de progreso para préstamos */}
                  {isLoan && discount.totalMonths && (
                    <div className="mt-2">
                      <div className="flex justify-between text-xs text-slate-400 mb-1">
                        <span>Progreso</span>
                        <span>{(((discount.paymentsMade || 0) / discount.totalMonths) * 100).toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-slate-600 rounded-full h-1.5">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${((discount.paymentsMade || 0) / discount.totalMonths) * 100}%` }}
                          className="bg-gradient-to-r from-blue-500 to-emerald-500 h-1.5 rounded-full"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Tabla de pagos expandible */}
                <AnimatePresence>
                  {isExpanded && isLoan && discount.loanPayments && discount.loanPayments.length > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-600/50"
                    >
                      <div className="p-3 md:p-4 bg-slate-800/50">
                        <p className="text-xs text-slate-300 font-medium mb-2">Historial de Pagos:</p>
                        <div className="space-y-1 max-h-60 overflow-y-auto">
                          {discount.loanPayments.map((payment) => (
                            <div key={payment.id} className="flex items-center justify-between bg-slate-700/80 rounded px-2 py-1 text-xs border border-slate-600/50">
                              <div className="flex items-center gap-2">
                                <span className="text-blue-400 font-bold">#{payment.paymentNumber}</span>
                                <span className="text-white font-medium">{formatCurrency(payment.amount)}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">{new Date(payment.date).toLocaleDateString('es-EC')}</span>
                                {payment.photo && <span className="text-green-400" title="Con foto">📷</span>}
                                <button
                                  onClick={() => store.removeLoanPayment(discount.id, payment.id)}
                                  className="text-red-400 hover:text-red-300"
                                  title="Eliminar pago"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Formulario de pago */}
                <AnimatePresence>
                  {showPaymentForm === discount.id && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-600/50"
                    >
                      <div className="p-3 md:p-4 bg-slate-800/50 space-y-3">
                        <p className="text-xs text-slate-300 font-medium">Agregar Pago #{(discount.paymentsMade || 0) + 1}:</p>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Monto del pago"
                          value={paymentAmount}
                          onChange={(e) => setPaymentAmount(e.target.value)}
                          className="input-solid w-full rounded-lg px-3 py-2 text-sm"
                        />
                        <input
                          type="date"
                          value={paymentDate}
                          onChange={(e) => setPaymentDate(e.target.value)}
                          className="input-solid w-full rounded-lg px-3 py-2 text-sm"
                        />
                        <label className="btn-secondary w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm cursor-pointer">
                          <Camera size={16} />
                          {paymentPhoto ? 'Cambiar foto' : 'Agregar foto (opcional)'}
                          <input type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                        </label>
                        {paymentPhoto && (
                          <div className="relative">
                            <img src={paymentPhoto} alt="Comprobante" className="w-full h-32 object-cover rounded-lg border border-slate-600" />
                            <button onClick={() => setPaymentPhoto('')} className="absolute top-2 right-2 bg-red-500/80 p-1 rounded">
                              <X size={14} />
                            </button>
                          </div>
                        )}
                        <div className="flex gap-2">
                          <button onClick={() => handleAddPayment(discount.id)} className="btn-primary flex-1 px-3 py-2 rounded text-sm">Guardar Pago</button>
                          <button onClick={() => setShowPaymentForm(null)} className="btn-secondary flex-1 px-3 py-2 rounded text-sm">Cancelar</button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
          {discounts.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No hay descuentos o préstamos registrados</p>}
        </div>
      </div>
    </div>
  );
}
