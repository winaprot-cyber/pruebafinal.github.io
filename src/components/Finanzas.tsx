import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet, Plus, Trash2, Share2 } from 'lucide-react';
import { formatCurrency, generateId } from '../utils/calculations';
import { shareAsImageWhatsApp } from '../utils/shareImage';
import type { useStore } from '../store/useStore';

export default function Finanzas({ store }: { store: ReturnType<typeof useStore> }) {
  const [showBonusForm, setShowBonusForm] = useState(false);
  const [showDiscountForm, setShowDiscountForm] = useState(false);
  const [bonusName, setBonusName] = useState('');
  const [bonusAmount, setBonusAmount] = useState('');
  const [discountName, setDiscountName] = useState('');
  const [discountAmount, setDiscountAmount] = useState('');

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
    store.addDiscount({
      name: discountName,
      amount: parseFloat(discountAmount) || 0,
      active: true,
      basedOnSalary: false,
      percentage: 0,
      type: 'discount',
    });
    setDiscountName('');
    setDiscountAmount('');
    setShowDiscountForm(false);
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
              <div>
                <p className="text-sm font-semibold text-white">{bonus.name}</p>
                <p className="text-xs text-slate-300 mt-1">{formatCurrency(bonus.amount)}</p>
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
                <input type="number" placeholder="Monto" value={discountAmount} onChange={(e) => setDiscountAmount(e.target.value)} className="input-solid w-full rounded-lg px-3 py-2 text-sm" />
                <div className="flex gap-2">
                  <button onClick={handleSaveDiscount} className="btn-primary flex-1 px-3 py-1 rounded text-sm">Guardar</button>
                  <button onClick={() => setShowDiscountForm(false)} className="btn-secondary flex-1 px-3 py-1 rounded text-sm">Cancelar</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {discounts.map(discount => (
            <div key={discount.id} className="bg-slate-700/80 rounded-lg px-3 md:px-4 py-3 border border-slate-600/50">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-white">{discount.name}</p>
                  <p className="text-xs text-slate-300 mt-1">{formatCurrency(discount.amount)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => store.removeDiscount(discount.id)} className="text-red-400 hover:text-red-300 p-1 hover:bg-red-500/20 rounded"><Trash2 size={14} /></button>
                  <button onClick={() => shareWhatsApp('Descuento', discount)} className="text-green-400 hover:text-green-300 p-1 hover:bg-green-500/20 rounded"><Share2 size={14} /></button>
                </div>
              </div>
            </div>
          ))}
          {discounts.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No hay descuentos registrados</p>}
        </div>
      </div>
    </div>
  );
}
