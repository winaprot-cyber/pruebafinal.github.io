import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Camera, CreditCard, DollarSign } from 'lucide-react';
import { formatCurrency } from '../utils/calculations';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  itemName: string;
  totalAmount: number;
  paidAmount?: number;
  onPayment: (amount: number, isFull: boolean, photo?: string) => void;
  type: 'debt' | 'expense' | 'discount';
}

export default function PaymentModal({
  isOpen,
  onClose,
  title,
  itemName,
  totalAmount,
  paidAmount = 0,
  onPayment,
  type,
}: PaymentModalProps) {
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentPhoto, setPaymentPhoto] = useState<string>('');

  const remainingAmount = totalAmount - paidAmount;

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

  const handlePartialPayment = () => {
    const amount = parseFloat(paymentAmount);
    if (amount > 0 && amount <= remainingAmount) {
      onPayment(amount, false, paymentPhoto || undefined);
      resetAndClose();
    }
  };

  const handleFullPayment = () => {
    onPayment(remainingAmount, true, paymentPhoto || undefined);
    resetAndClose();
  };

  const resetAndClose = () => {
    setPaymentAmount('');
    setPaymentPhoto('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
        onClick={resetAndClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-slate-800 border border-slate-700 rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            <button onClick={resetAndClose} className="text-slate-400 hover:text-white">
              <X size={20} />
            </button>
          </div>

          <div className="bg-slate-700/30 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-white mb-2">{itemName}</p>
            <div className="space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Total:</span>
                <span className="text-white font-bold">{formatCurrency(totalAmount)}</span>
              </div>
              {paidAmount > 0 && (
                <>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Pagado:</span>
                    <span className="text-emerald-400 font-bold">{formatCurrency(paidAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Restante:</span>
                    <span className="text-red-400 font-bold">{formatCurrency(remainingAmount)}</span>
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="mb-4">
            <label className="text-sm text-slate-300 block mb-2">Monto a pagar</label>
            <input
              type="number"
              step="0.01"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              placeholder={`Máximo: ${formatCurrency(remainingAmount)}`}
              className="input-solid w-full rounded-lg px-3 py-2 text-sm"
            />
          </div>

          <div className="mb-4">
            <label className="text-sm text-slate-300 block mb-2">Foto de Factura (Opcional)</label>
            <label className="w-full flex items-center justify-center gap-2 bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-slate-300 text-sm hover:bg-slate-600/50 cursor-pointer">
              <Camera size={16} />
              {paymentPhoto ? 'Cambiar foto' : 'Agregar foto'}
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoChange}
              />
            </label>
            {paymentPhoto && (
              <div className="mt-2 relative">
                <img
                  src={paymentPhoto}
                  alt="Factura"
                  className="w-full h-40 object-cover rounded-lg border border-slate-600"
                />
                <button
                  onClick={() => setPaymentPhoto('')}
                  className="absolute top-2 right-2 bg-red-500/80 p-1 rounded"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <button
              onClick={handlePartialPayment}
              disabled={!paymentAmount || parseFloat(paymentAmount) <= 0 || parseFloat(paymentAmount) > remainingAmount}
              className="w-full bg-blue-500/20 border border-blue-500/30 px-3 py-2 rounded-lg text-blue-300 text-sm hover:bg-blue-500/30 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <DollarSign size={16} />
              Pagar Parcial
            </button>
            <button
              onClick={handleFullPayment}
              className="w-full bg-emerald-500/20 border border-emerald-500/30 px-3 py-2 rounded-lg text-emerald-300 text-sm hover:bg-emerald-500/30 transition flex items-center justify-center gap-2"
            >
              <CreditCard size={16} />
              Pagar Total ({formatCurrency(remainingAmount)})
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
