import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Edit2, Trash2, Share2, AlertCircle, Shield, Heart, PiggyBank } from 'lucide-react';
import { formatCurrency, generateId } from '../utils/calculations';
import type { useStore } from '../store/useStore';
import type { Bonus, Discount } from '../store/useStore';

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

  const shareWhatsApp = (type: string, itemData: any) => {
    const text = `*Control Biométrico - ${type}*\n${JSON.stringify(itemData, null, 2)}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
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
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <select
                    value={discountLoanType}
                    onChange={(e) => setDiscountLoanType(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  >
                    <option value="">Tipo (opcional)</option>
                    <option value="quirografario">Préstamo Quirografario</option>
                    <option value="otro">Otro</option>
                  </select>
                  <input
                    type="number"
                    placeholder="Meses totales"
                    value={discountTotalMonths}
                    onChange={(e) => setDiscountTotalMonths(e.target.value)}
                    className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                  />
                  <label className="flex items-center gap-2 text-sm text-slate-300">
                    <input
                      type="checkbox"
                      checked={discountFixedPayment}
                      onChange={(e) => setDiscountFixedPayment(e.target.checked)}
                      className="rounded border-slate-500"
                    />
                    Pago fijo manual
                  </label>
                </div>
                {/* Mostrar campo de pago mensual si es préstamo quirografario con pago fijo */}
                {discountLoanType === 'quirografario' && discountFixedPayment && discountTotalMonths && (
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Pago Mensual ($)</label>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="Monto mensual"
                      value={discountAmount}
                      onChange={(e) => setDiscountAmount(e.target.value)}
                      className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm"
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {discountTotalMonths} pagos de {formatCurrency(parseFloat(discountAmount) || 0)} = {formatCurrency((parseFloat(discountAmount) || 0) * parseInt(discountTotalMonths))}
                    </p>
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
            <div key={discount.id} className="flex items-center justify-between bg-slate-700/30 rounded-lg px-3 md:px-4 py-3">
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
                    <div className="mt-2 flex items-center gap-2">
                      <label className="text-xs text-slate-400">Pagos realizados:</label>
                      <input
                        type="number"
                        min="0"
                        max={discount.totalMonths}
                        value={discount.paymentsMade || 0}
                        onChange={(e) => store.updateDiscount(discount.id, { paymentsMade: parseInt(e.target.value) || 0 })}
                        className="w-16 bg-slate-700/50 border border-slate-600 rounded px-2 py-0.5 text-white text-xs"
                      />
                      <span className="text-xs text-slate-500">de {discount.totalMonths}</span>
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
          ))}
          {regularDiscounts.length === 0 && <p className="text-slate-500 text-sm text-center py-4">No hay descuentos registrados</p>}
        </div>
      </div>
    </div>
  );
}
