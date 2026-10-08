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

  // Loan payment modal state
  const [showLoanPaymentModal, setShowLoanPaymentModal] = useState(false);
  const [selectedDiscountForPayment, setSelectedDiscountForPayment] = useState<Discount | null>(null);
  const [loanPaymentAmount, setLoanPaymentAmount] = useState('');
  const [loanPaymentDate, setLoanPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [loanPaymentPhoto, setLoanPaymentPhoto] = useState<string>('');
  const loanPaymentPhotoRef = useRef<HTMLInputElement>(null);

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
    setShowDiscountForm(true);
  };

  const shareWhatsApp = async (type: string, itemData: any) => {
    // Compartir SOLO en modo foto
    const elementId = `share-discount-${itemData.id}`;
    await shareAsImageWhatsApp(elementId, `${type.toLowerCase()}-${itemData.name}-${Date.now()}`);
  };

  const openLoanPaymentModal = (discount: Discount) => {
    setSelectedDiscountForPayment(discount);
    setLoanPaymentAmount((discount.monthlyPaymentAmount || discount.amount).toString());
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
    setLoanPaymentAmount('');
    setLoanPaymentPhoto('');
  };

  const handleDeleteLoanPayment = (discountId: string, paymentId: string) => {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
      store.removeLoanPayment(discountId, paymentId);
    }
  };

  const shareLoanPaymentWhatsApp = async (payment: LoanPayment, discount: Discount) => {
    const elementId = `loan-payment-receipt-${payment.id}`;
    await shareAsImageWhatsApp(elementId, `pago-prestamo-${discount.name}-${payment.paymentNumber}`);
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
                
                {/* Pago mensual y tipo de pago */}
                {discountLoanType === 'quirografario' && discountTotalMonths && (
                  <div className="space-y-3 bg-slate-700/20 rounded-lg p-3">
                    <label className="flex items-center gap-2 text-sm text-slate-300">
                      <input
                        type="checkbox"
                        checked={discountFixedPayment}
                        onChange={(e) => setDiscountFixedPayment(e.target.checked)}
                        className="rounded border-slate-500"
                      />
                      Pago fijo manual (ingresar monto mensual)
                    </label>
                    
                    {discountFixedPayment ? (
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Pago Mensual Fijo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Monto mensual"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          {discountTotalMonths} pagos de {formatCurrency(parseFloat(discountAmount) || 0)} = Total: {formatCurrency((parseFloat(discountAmount) || 0) * parseInt(discountTotalMonths))}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <label className="text-xs text-slate-400 block mb-1">Monto Total del Préstamo ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          placeholder="Monto total"
                          value={discountAmount}
                          onChange={(e) => setDiscountAmount(e.target.value)}
                          className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                        />
                        <p className="text-xs text-slate-500 mt-1">
                          Pago mensual automático: {formatCurrency((parseFloat(discountAmount) || 0) / parseInt(discountTotalMonths || '1'))}
                        </p>
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
                    {discount.basedOnSalary ? `${discount.percentage}% del sueldo = ${formatCurrency(base * discount.percentage / 100)}` : formatCurrency(discount.amount)}
                    {discount.loanType && ` • ${discount.loanType}`}
                    {discount.totalMonths && ` • Mes ${discount.currentMonth}/${discount.totalMonths}`}
                  </p>
                  {discount.loanType === 'quirografario' && discount.totalMonths && (
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
                        <button
                          onClick={() => openLoanPaymentModal(discount)}
                          className="text-xs bg-blue-500/20 border border-blue-500/30 px-2 py-1 rounded text-blue-300 hover:bg-blue-500/30"
                        >
                          + Registrar Pago
                        </button>
                      </div>
                      
                      {/* Lista de pagos individuales */}
                      {discount.loanPayments && discount.loanPayments.length > 0 && (
                        <div className="mt-2 space-y-1 max-h-40 overflow-y-auto">
                          {discount.loanPayments.map((payment) => (
                            <div key={payment.id}>
                              <div className="flex items-center justify-between bg-slate-700/30 rounded px-2 py-1 text-xs">
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
                              {/* Hidden receipt for image capture */}
                              <div id={`loan-payment-receipt-${payment.id}`} className="hidden">
                                <div className="bg-slate-800 p-6 rounded-xl text-white" style={{ width: '400px' }}>
                                  <div className="text-center mb-4">
                                    <h2 className="text-xl font-bold text-blue-400">Control Biométrico</h2>
                                    <p className="text-sm text-slate-400">Pago de Préstamo</p>
                                  </div>
                                  <div className="border-t border-slate-700 pt-4 space-y-2">
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Préstamo:</span>
                                      <span className="font-medium">{discount.name}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Pago #:</span>
                                      <span className="font-bold">{payment.paymentNumber}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Monto:</span>
                                      <span className="text-emerald-400 font-bold">{formatCurrency(payment.amount)}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Fecha:</span>
                                      <span>{new Date(payment.date).toLocaleDateString('es-EC')}</span>
                                    </div>
                                    <div className="flex justify-between">
                                      <span className="text-slate-400">Progreso:</span>
                                      <span>{discount.paymentsMade}/{discount.totalMonths} ({(((discount.paymentsMade || 0) / (discount.totalMonths || 1)) * 100).toFixed(1)}%)</span>
                                    </div>
                                  </div>
                                  {payment.photo && (
                                    <div className="mt-4">
                                      <img src={payment.photo} alt="Comprobante" className="w-full rounded-lg" />
                                    </div>
                                  )}
                                  <div className="border-t border-slate-700 mt-4 pt-4 text-center text-xs text-slate-500">
                                    by Hugo León
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => startEditDiscount(discount)} className="text-blue-400 hover:text-blue-300"><Edit2 size={14} /></button>
                <button onClick={() => store.removeDiscount(discount.id)} className="text-red-400 hover:text-red-300"><Trash2 size={14} /></button>
                <button onClick={() => shareWhatsApp('Descuento', discount)} className="text-green-400 hover:text-green-300"><Share2 size={14} /></button>
              </div>
              </div>
              {/* Hidden receipt for image capture */}
              <div id={`share-discount-${discount.id}`} className="hidden">
                <div className="bg-slate-800 p-6 rounded-xl text-white" style={{ width: '400px' }}>
                  <div className="text-center mb-4">
                    <h2 className="text-xl font-bold text-red-400">Control Biométrico</h2>
                    <p className="text-sm text-slate-400">Descuento</p>
                  </div>
                  <div className="border-t border-slate-700 pt-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Nombre:</span>
                      <span className="font-medium">{discount.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Monto:</span>
                      <span className="text-red-400 font-bold">{formatCurrency(discount.amount)}</span>
                    </div>
                    {discount.loanType && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tipo:</span>
                        <span>{discount.loanType}</span>
                      </div>
                    )}
                    {discount.totalMonths && (
                      <div className="flex justify-between">
                        <span className="text-slate-400">Meses:</span>
                        <span>{discount.totalMonths}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span className="text-slate-400">Estado:</span>
                      <span>{discount.active ? 'Activo' : 'Inactivo'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Fecha:</span>
                      <span>{new Date().toLocaleDateString('es-EC')}</span>
                    </div>
                  </div>
                  <div className="border-t border-slate-700 mt-4 pt-4 text-center text-xs text-slate-500">
                    by Hugo León
                  </div>
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
                <h3 className="text-lg font-semibold">Registrar Pago de Préstamo</h3>
                <button onClick={() => setShowLoanPaymentModal(false)} className="text-slate-400 hover:text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="bg-slate-700/30 rounded-lg p-3 mb-4">
                <p className="text-sm text-white font-medium">{selectedDiscountForPayment.name}</p>
                <p className="text-xs text-slate-400">
                  Pagos realizados: {selectedDiscountForPayment.paymentsMade || 0}/{selectedDiscountForPayment.totalMonths}
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

              {/* Hidden receipt for image capture */}
              {(selectedDiscountForPayment.loanPayments?.length || 0) > 0 && (
                <div id={`loan-payment-receipt-${selectedDiscountForPayment.loanPayments![selectedDiscountForPayment.loanPayments!.length - 1].id}`} className="hidden">
                  <div className="bg-slate-800 p-6 rounded-xl text-white" style={{ width: '400px' }}>
                    <div className="text-center mb-4">
                      <h2 className="text-xl font-bold text-blue-400">Control Biométrico</h2>
                      <p className="text-sm text-slate-400">Pago de Préstamo</p>
                    </div>
                    <div className="border-t border-slate-700 pt-4 space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Préstamo:</span>
                        <span className="font-medium">{selectedDiscountForPayment.name}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Pago #:</span>
                        <span className="font-bold">{selectedDiscountForPayment.loanPayments![selectedDiscountForPayment.loanPayments!.length - 1].paymentNumber}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Monto:</span>
                        <span className="text-emerald-400 font-bold">{formatCurrency(selectedDiscountForPayment.loanPayments![selectedDiscountForPayment.loanPayments!.length - 1].amount)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fecha:</span>
                        <span>{new Date(selectedDiscountForPayment.loanPayments![selectedDiscountForPayment.loanPayments!.length - 1].date).toLocaleDateString('es-EC')}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Progreso:</span>
                        <span>{selectedDiscountForPayment.paymentsMade}/{selectedDiscountForPayment.totalMonths} ({(((selectedDiscountForPayment.paymentsMade || 0) / (selectedDiscountForPayment.totalMonths || 1)) * 100).toFixed(1)}%)</span>
                      </div>
                    </div>
                    {selectedDiscountForPayment.loanPayments![selectedDiscountForPayment.loanPayments!.length - 1].photo && (
                      <div className="mt-4">
                        <img src={selectedDiscountForPayment.loanPayments![selectedDiscountForPayment.loanPayments!.length - 1].photo} alt="Comprobante" className="w-full rounded-lg" />
                      </div>
                    )}
                    <div className="border-t border-slate-700 mt-4 pt-4 text-center text-xs text-slate-500">
                      by Hugo León
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
