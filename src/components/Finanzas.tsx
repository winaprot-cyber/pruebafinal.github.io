import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Edit2, Trash2, Share2, AlertCircle, Shield, Heart, PiggyBank, Camera, X, ChevronDown } from 'lucide-react';
import { formatCurrency, generateId } from '../utils/calculations';
import { shareAsImageWhatsApp } from '../utils/shareImage';
import type { useStore } from '../store/useStore';
import type { Bonus, Discount, LoanPayment } from '../types';
import PaymentModal from './PaymentModal';

export default function Finanzas({ store }: { store: ReturnType<typeof useStore> }) {
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [editingBonus, setEditingBonus] = useState<string | null>(null);
  const [editingDiscount, setEditingDiscount] = useState<string | null>(null);

  const [bonusName, setBonusName] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [bonusBasedOnSalary, setBonusBasedOnSalary] = useState(false);
  const [bonusPercentage, setBonusPercentage] = useState('');

  const [discountName, setDiscountName] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');
  const [discountBasedOnSalary, setDiscountBasedOnSalary] = useState(false);
  const [discountPercentage, setDiscountPercentage] = useState('');
  const [discountLoanType, setDiscountLoanType] = useState('');
  const [discountTotalMonths, setDiscountTotalMonths] = useState('');
  const [discountFixedPayment, setDiscountFixedPayment] = useState(false);
  const [discountAmortizationType, setDiscountAmortizationType] = useState<'frances' | 'alemana'>('frances');
  const [discountLoanAmount, setDiscountLoanAmount] = useState('');
  const [discountInterestRate, setDiscountInterestRate] = useState('');

  const [showLoanPaymentModal, setShowLoanPaymentModal] = useState(false);
  const [selectedDiscountForPayment, setSelectedDiscountForPayment] = useState<Discount | null>(null);
  const [loanPaymentAmount, setLoanPaymentAmount] = useState('');
  const [loanPaymentDate, setLoanPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanPaymentPhoto, setLoanPaymentPhoto] = useState<string>('');

  const [expandedDiscountId, setExpandedDiscountId] = useState<string | null>(null);
  const [editingInstallments, setEditingInstallments] = useState<Record<string, number[]>>({});

  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedDiscountForPaymentModal, setSelectedDiscountForPaymentModal] = useState<Discount | null>(null);

  const base = store.getSalaryConfig().baseSalary;
  const { iessAporteActive, saludConyugeActive, fondosReservaActive } = store.getSalaryConfig();

  const handleSaveBonus = () => {
    if (!bonusName) return;
    const bonus: any = {
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
    setBonusName('');
    setBonusAmount('');
    setBonusBasedOnSalary(false);
    setBonusPercentage('');
    setShowBonusForm(false);
  };

  const handleSaveDiscount = () => {
    if (!discountName) return;
    const discount: any = {
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
      fixedPayment: discountFixedPayment,
      paymentsMade: 0,
      amortizationType: discountAmortizationType,
      loanAmount: parseFloat(discountLoanAmount) || 0,
      interestRate: parseFloat(discountInterestRate) || 0,
    };
    if (editingDiscount) {
      store.updateDiscount(editingDiscount, discount);
      setEditingDiscount(null);
    } else {
      store.addDiscount(discount);
    }
    setDiscountName('');
    setDiscountAmount('');
    setDiscountBasedOnSalary(false);
    setDiscountPercentage('');
    setDiscountLoanType('');
    setDiscountTotalMonths('');
    setDiscountFixedPayment(false);
    setDiscountAmortizationType('frances');
    setDiscountLoanAmount('');
    setDiscountInterestRate('');
    setShowDiscountForm(false);
  };

  const openLoanPaymentModal = (discount: Discount) => {
    setSelectedDiscountForPayment(discount);
    setLoanPaymentAmount(discount.amount.toString());
    setLoanPaymentDate(new Date().toISOString().split('T')[0]);
    setLoanPaymentPhoto('');
    setShowLoanPaymentModal(true);
  };

  const openDiscountPaymentModal = (discount: Discount) => {
    setSelectedDiscountForPaymentModal(discount);
    setShowPaymentModal(true);
  };

  const handleDiscountPayment = (amount: number, isFull: boolean, photo?: string) => {
    if (!selectedDiscountForPaymentModal) return;

    // Registrar el pago como un loanPayment
    const payment: LoanPayment = {
      id: generateId(),
      discountId: selectedDiscountForPaymentModal.id,
      paymentNumber: (selectedDiscountForPaymentModal.paymentsMade || 0) + 1,
      amount,
      date: new Date().toISOString().split('T')[0],
      photo,
    };

    store.addLoanPayment(selectedDiscountForPaymentModal.id, payment);
  };

  const handleSaveLoanPayment = () => {
    if (!selectedDiscountForPayment || !loanPaymentAmount) return;
    const payment: LoanPayment = {
      id: generateId(),
      discountId: selectedDiscountForPayment.id,
      paymentNumber: (selectedDiscountForPayment.paymentsMade || 0) + 1,
      amount: parseFloat(loanPaymentAmount),
      date: loanPaymentDate,
      photo: loanPaymentPhoto || undefined,
    };
    store.addLoanPayment(selectedDiscountForPayment.id, payment);
    setShowLoanPaymentModal(false);
    setLoanPaymentAmount('');
    setLoanPaymentPhoto('');
  };

  const shareWhatsApp = async (type: string, itemData: any) => {
    const receiptData = {
      title: 'Control Biométrico',
      subtitle: type,
      color: '#ef4444',
      fields: [
        { label: 'Nombre:', value: itemData.name },
        { label: 'Monto:', value: formatCurrency(itemData.amount), highlight: true },
      ],
      footer: 'by Hugo León',
    };
    await shareAsImageWhatsApp(receiptData, `${type.toLowerCase()}-${itemData.name}`);
  };

  // Función para calcular cuotas según tipo de amortización
  const calculateInstallments = (discount: Discount): number[] => {
    if (!discount.loanAmount || !discount.totalMonths || !discount.interestRate) {
      return [];
    }

    const principal = discount.loanAmount;
    const months = discount.totalMonths;
    const annualRate = discount.interestRate / 100;
    const monthlyRate = annualRate / 12;
    const installments: number[] = [];

    if (discount.amortizationType === 'alemana') {
      // Amortización Alemana: capital constante + intereses decrecientes
      const capitalPerMonth = principal / months;
      let remainingPrincipal = principal;
      
      for (let i = 0; i < months; i++) {
        const interest = remainingPrincipal * monthlyRate;
        const installment = capitalPerMonth + interest;
        installments.push(Math.round(installment * 100) / 100);
        remainingPrincipal -= capitalPerMonth;
      }
    } else {
      // Amortización Francesa: cuota fija
      if (monthlyRate === 0) {
        const fixedInstallment = principal / months;
        for (let i = 0; i < months; i++) {
          installments.push(Math.round(fixedInstallment * 100) / 100);
        }
      } else {
        const fixedInstallment = principal * (monthlyRate * Math.pow(1 + monthlyRate, months)) / (Math.pow(1 + monthlyRate, months) - 1);
        for (let i = 0; i < months; i++) {
          installments.push(Math.round(fixedInstallment * 100) / 100);
        }
      }
    }

    return installments;
  };

  // Función para guardar cuotas personalizadas
  const saveCustomInstallments = (discountId: string, installments: number[]) => {
    const discount = store.getUserDiscounts().find(d => d.id === discountId);
    if (discount) {
      store.updateDiscount(discountId, {
        customInstallments: installments,
      });
      setEditingInstallments(prev => {
        const newState = { ...prev };
        delete newState[discountId];
        return newState;
      });
    }
  };

  // Función para iniciar edición de cuotas
  const startEditingInstallments = (discount: Discount) => {
    const calculated = discount.customInstallments || calculateInstallments(discount);
    setEditingInstallments(prev => ({
      ...prev,
      [discount.id]: [...calculated],
    }));
  };

  // Función para actualizar una cuota específica
  const updateInstallment = (discountId: string, index: number, value: number) => {
    setEditingInstallments(prev => {
      const installments = [...(prev[discountId] || [])];
      installments[index] = value;
      return { ...prev, [discountId]: installments };
    });
  };

  const regularBonuses = store.getUserBonuses().filter(b => !b.isSpecial);
  const regularDiscounts = store.getUserDiscounts().filter(d => !d.isSpecial);

  return (
    <div className="space-y-4 md:space-y-6">
      <div className="card-elevated rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2 text-white">
            <Wallet size={24} className="text-emerald-400" />
            Finanzas
          </h2>
        </div>
      </div>

      {/* Bonuses Section */}
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
          {regularBonuses.map(bonus => (
            <div key={bonus.id} className="flex items-center justify-between bg-slate-700/80 rounded-lg px-3 md:px-4 py-3 border border-slate-600/50">
              <div className="flex items-center gap-3 flex-1">
                <button
                  onClick={() => store.updateBonus(bonus.id, { active: !bonus.active })}
                  className={`w-12 h-6 rounded-full transition-colors relative ${
                    bonus.active ? 'bg-emerald-500' : 'bg-slate-600'
                  }`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                    bonus.active ? 'translate-x-6' : 'translate-x-0.5'
                  }`} />
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
          {regularBonuses.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No hay bonos registrados</p>}
        </div>
      </div>

      {/* Discounts Section */}
      <div className="card-solid rounded-xl p-4 md:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base md:text-lg font-semibold text-red-400">Descuentos</h3>
          <button onClick={() => setShowDiscountForm(true)} className="btn-secondary flex items-center gap-1 px-2 md:px-3 py-1 rounded-lg text-xs md:text-sm">
            <Plus size={14} /> Agregar Descuento
          </button>
        </div>

        <AnimatePresence>
          {showDiscountForm && (
            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mb-4">
              <div className="bg-slate-700/80 rounded-lg p-4 space-y-3 border border-slate-600/50">
                <input placeholder="Nombre del descuento" value={discountName} onChange={(e) => setDiscountName(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                
                {/* Tipo de descuento */}
                <select value={discountLoanType} onChange={(e) => setDiscountLoanType(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm">
                  <option value="">Descuento Regular</option>
                  <option value="quirografario">Préstamo Quirografario</option>
                  <option value="empresarial">Préstamo Empresarial</option>
                  <option value="hipotecario">Préstamo Hipotecario</option>
                  <option value="vehicular">Préstamo Vehicular</option>
                  <option value="tarjeta">Tarjeta de Crédito</option>
                  <option value="otro">Otro</option>
                </select>

                {/* Campos para préstamos */}
                {discountLoanType && (
                  <>
                    <input type="number" placeholder="Monto Total del Préstamo" value={discountLoanAmount} onChange={(e) => setDiscountLoanAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    <input type="number" step="0.01" placeholder="Tasa de Interés Anual (%)" value={discountInterestRate} onChange={(e) => setDiscountInterestRate(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    <input type="number" placeholder="Número de Cuotas" value={discountTotalMonths} onChange={(e) => setDiscountTotalMonths(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    
                    {/* Tipo de Amortización */}
                    <div className="space-y-2">
                      <label className="label-clear text-xs">Tipo de Amortización</label>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setDiscountAmortizationType('frances')}
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
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
                          className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition ${
                            discountAmortizationType === 'alemana'
                              ? 'bg-purple-500/30 border border-purple-500/50 text-purple-300'
                              : 'bg-slate-700/50 border border-slate-600 text-slate-400 hover:bg-slate-600/50'
                          }`}
                        >
                          Alemana (Cuota Decreciente)
                        </button>
                      </div>
                      <p className="text-xs text-slate-400">
                        {discountAmortizationType === 'frances' 
                          ? 'Cuota fija durante todo el préstamo'
                          : 'Cuotas decrecientes (capital constante + intereses decrecientes)'}
                      </p>
                    </div>

                    {/* Opción de cobros manuales */}
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discountFixedPayment}
                        onChange={(e) => setDiscountFixedPayment(e.target.checked)}
                        className="rounded border-slate-500"
                      />
                      Cobros manuales (ingresar monto de cada cuota)
                    </label>
                  </>
                )}

                {/* Campos para descuentos regulares */}
                {!discountLoanType && (
                  <>
                    <input type="number" placeholder="Monto" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={discountBasedOnSalary}
                        onChange={(e) => setDiscountBasedOnSalary(e.target.checked)}
                        className="rounded border-slate-500"
                      />
                      Basado en porcentaje del sueldo
                    </label>
                    {discountBasedOnSalary && (
                      <input type="number" step="0.01" placeholder="Porcentaje (%)" value={discountPercentage} onChange={(e) => setDiscountPercentage(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                    )}
                  </>
                )}

                <div className="flex gap-2">
                  <button onClick={handleSaveDiscount} className="btn-primary flex-1 px-3 py-1 rounded text-sm">Guardar</button>
                  <button onClick={() => setShowDiscountForm(false)} className="btn-secondary flex-1 px-3 py-1 rounded text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {regularDiscounts.map(discount => (
            <div key={discount.id} className="bg-slate-700/80 rounded-lg p-3 border border-slate-600/50">
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1 cursor-pointer" onClick={() => setExpandedDiscountId(expandedDiscountId === discount.id ? null : discount.id)}>
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="text-sm font-semibold text-white">{discount.name}</p>
                    {discount.loanType && (
                      <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded">{discount.loanType}</span>
                    )}
                    {discount.amortizationType && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        discount.amortizationType === 'frances' 
                          ? 'bg-blue-500/20 text-blue-300' 
                          : 'bg-purple-500/20 text-purple-300'
                      }`}>
                        {discount.amortizationType === 'frances' ? 'Francesa' : 'Alemana'}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 mt-1">
                    {discount.loanType ? (
                      <>
                        {discount.loanAmount && discount.loanAmount > 0 && <span>Monto: {formatCurrency(discount.loanAmount)}</span>}
                        {discount.totalMonths && <span> • {discount.paymentsMade || 0}/{discount.totalMonths} cuotas</span>}
                        {discount.interestRate && discount.interestRate > 0 && <span> • {discount.interestRate}% anual</span>}
                      </>
                    ) : (
                      <>{formatCurrency(discount.amount)}</>
                    )}
                  </p>
                  {discount.loanType && discount.totalMonths && (
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
                <div className="flex items-center gap-2 ml-2">
                  <button onClick={() => openDiscountPaymentModal(discount)} className="text-emerald-400 hover:text-emerald-300 p-1 hover:bg-emerald-500/20 rounded" title="Registrar Pago"><Plus size={14} /></button>
                  <button onClick={() => store.removeDiscount(discount.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded" title="Eliminar"><Trash2 size={14} /></button>
                  <button onClick={() => shareWhatsApp('Descuento', discount)} className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded" title="Compartir"><Share2 size={14} /></button>
                </div>
              </div>
              {/* Sección de edición de cuotas para préstamos quirografarios */}
              {expandedDiscountId === discount.id && discount.loanType === 'quirografario' && discount.totalMonths && (
                <div className="mt-3 pt-3 border-t border-slate-600/50">
                  {editingInstallments[discount.id] ? (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-300 font-medium">Editar Cuotas (Manual):</p>
                        <div className="flex gap-2">
                          <button
                            onClick={() => saveCustomInstallments(discount.id, editingInstallments[discount.id])}
                            className="text-xs bg-emerald-500/20 border border-emerald-500/30 px-2 py-1 rounded text-emerald-300 hover:bg-emerald-500/30"
                          >
                            ✓ Guardar
                          </button>
                          <button
                            onClick={() => setEditingInstallments(prev => {
                              const newState = { ...prev };
                              delete newState[discount.id];
                              return newState;
                            })}
                            className="text-xs bg-slate-600/30 px-2 py-1 rounded text-slate-400 hover:bg-slate-600/50"
                          >
                            ✗ Cancelar
                          </button>
                        </div>
                      </div>
                      <div className="space-y-1 max-h-60 overflow-y-auto">
                        {editingInstallments[discount.id].map((installment, index) => (
                          <div key={index} className="flex items-center gap-2 bg-slate-700/80 rounded px-2 py-1 text-xs border border-slate-600/50">
                            <span className="text-blue-400 font-bold w-8">#{index + 1}</span>
                            <input
                              type="number"
                              step="0.01"
                              value={installment}
                              onChange={(e) => updateInstallment(discount.id, index, parseFloat(e.target.value) || 0)}
                              className="flex-1 bg-slate-800 border border-slate-600 rounded px-2 py-1 text-white text-xs"
                            />
                            <span className="text-slate-400 text-xs">USD</span>
                          </div>
                        ))}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-xs text-slate-300 font-medium">Cuotas del Préstamo:</p>
                        <button
                          onClick={() => startEditingInstallments(discount)}
                          className="text-xs bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300 hover:bg-blue-500/30"
                        >
                          ✎ Editar Cuotas
                        </button>
                      </div>
                      <div className="space-y-1 max-h-40 overflow-y-auto">
                        {(discount.customInstallments || calculateInstallments(discount)).map((installment, index) => {
                          const isPaid = index < (discount.paymentsMade || 0);
                          return (
                            <div key={index} className={`flex items-center justify-between rounded px-2 py-1 text-xs border ${
                              isPaid 
                                ? 'bg-emerald-500/10 border-emerald-500/30' 
                                : 'bg-slate-700/80 border-slate-600/50'
                            }`}>
                              <div className="flex items-center gap-2">
                                <span className={`font-bold ${isPaid ? 'text-emerald-400' : 'text-blue-400'}`}>#{index + 1}</span>
                                <span className={`font-medium ${isPaid ? 'text-emerald-300' : 'text-white'}`}>{formatCurrency(installment)}</span>
                                {isPaid && <span className="text-emerald-400 text-xs">✓ Pagado</span>}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* Pagos registrados */}
              {expandedDiscountId === discount.id && discount.loanPayments && discount.loanPayments.length > 0 && (
                <div className="mt-3 pt-3 border-t border-slate-600/50">
                  <p className="text-xs text-slate-300 font-medium mb-2">Pagos registrados:</p>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {discount.loanPayments.map((payment) => (
                      <div key={payment.id} className="flex items-center justify-between bg-slate-700/80 rounded px-2 py-1 text-xs border border-slate-600/50">
                        <div className="flex items-center gap-2">
                          <span className="text-blue-400 font-bold">#{payment.paymentNumber}</span>
                          <span className="text-white font-medium">{formatCurrency(payment.amount)}</span>
                        </div>
                        <span className="text-slate-400 text-xs">{new Date(payment.date).toLocaleDateString('es-EC')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          {regularDiscounts.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No hay descuentos registrados</p>}
        </div>
      </div>

      {/* Payment Modal for Discounts */}
      {showPaymentModal && selectedDiscountForPaymentModal && (
        <PaymentModal
          isOpen={showPaymentModal}
          onClose={() => {
            setShowPaymentModal(false);
            setSelectedDiscountForPaymentModal(null);
          }}
          title="Pagar Descuento"
          itemName={selectedDiscountForPaymentModal.name}
          totalAmount={selectedDiscountForPaymentModal.amount}
          paidAmount={selectedDiscountForPaymentModal.loanPayments?.reduce((sum, p) => sum + p.amount, 0) || 0}
          onPayment={handleDiscountPayment}
          type="discount"
        />
      )}
    </div>
  );
}
