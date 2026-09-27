import React, { useState } from 'react';
import { X, Delete, Banknote, CreditCard, Smartphone, Check } from 'lucide-react';
import { formatRand } from '../../lib/format';
import { triggerSuccessBurst } from '../../lib/celebrate';

interface QuickSaleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number, method: 'cash' | 'card' | 'eft') => void;
}

export const QuickSaleModal: React.FC<QuickSaleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const [inputStr, setInputStr] = useState<string>('50');
  const [method, setMethod] = useState<'cash' | 'card' | 'eft'>('cash');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const amount = parseFloat(inputStr) || 0;

  const handleDigit = (digit: string) => {
    if (inputStr === '0') {
      setInputStr(digit);
    } else {
      if (inputStr.length < 7) {
        setInputStr(inputStr + digit);
      }
    }
  };

  const handleBackspace = () => {
    if (inputStr.length <= 1) {
      setInputStr('0');
    } else {
      setInputStr(inputStr.slice(0, -1));
    }
  };

  const handleClear = () => {
    setInputStr('0');
  };

  const handlePreset = (val: number) => {
    setInputStr(String(val));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;

    onConfirm(amount, method);
    triggerSuccessBurst();
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      setInputStr('0');
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 p-5 animate-slideUp overflow-hidden max-h-[95vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#111810]">Quick Till Sale</h2>
            <p className="text-xs text-[#4A5C50]">Record fast payment into today&apos;s till</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="py-12 flex flex-col items-center justify-center text-center animate-scaleUp">
            <div className="w-16 h-16 rounded-full bg-[#EF9F27] text-white flex items-center justify-center shadow-lg mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-extrabold text-[#111F1A]">
              {formatRand(amount)}
            </h3>
            <p className="text-sm font-semibold text-emerald-800 mt-1 capitalize">
              {method} Sale Recorded in Till ✓
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3 pt-2">
            {/* Amount Display Box */}
            <div className="bg-[#111F1A] rounded-2xl p-4 text-center text-white shadow-inner">
              <span className="text-[11px] uppercase tracking-wider text-emerald-400 font-semibold">
                Amount to Ring Up
              </span>
              <div className="text-4xl font-extrabold text-[#EF9F27] font-mono tracking-tight my-1">
                {formatRand(amount)}
              </div>
            </div>

            {/* Quick Presets */}
            <div className="grid grid-cols-5 gap-1.5">
              {[20, 50, 100, 200, 500].map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handlePreset(preset)}
                  className="py-2 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-slate-800 active:scale-95 transition-all"
                >
                  R {preset}
                </button>
              ))}
            </div>

            {/* Payment Method Pills (Cash / Card / EFT) */}
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setMethod('cash')}
                className={`py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all border ${
                  method === 'cash'
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Banknote className="w-4 h-4" />
                <span>Cash</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('card')}
                className={`py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all border ${
                  method === 'card'
                    ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Card</span>
              </button>

              <button
                type="button"
                onClick={() => setMethod('eft')}
                className={`py-3 rounded-xl flex items-center justify-center gap-1.5 font-bold text-xs transition-all border ${
                  method === 'eft'
                    ? 'bg-purple-600 text-white border-purple-600 shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Smartphone className="w-4 h-4" />
                <span>EFT</span>
              </button>
            </div>

            {/* Big Calculator Keypad */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9', 'C', '0', '⌫'].map(
                (btn) => {
                  const isAction = btn === 'C' || btn === '⌫';
                  return (
                    <button
                      key={btn}
                      type="button"
                      onClick={() => {
                        if (btn === 'C') handleClear();
                        else if (btn === '⌫') handleBackspace();
                        else handleDigit(btn);
                      }}
                      className={`h-12 rounded-xl text-lg font-bold flex items-center justify-center active:scale-95 transition-all shadow-2xs ${
                        isAction
                          ? 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          : 'bg-white text-slate-900 border border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {btn === '⌫' ? <Delete className="w-5 h-5" /> : btn}
                    </button>
                  );
                }
              )}
            </div>

            {/* Save Button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={amount <= 0}
                className="w-full h-14 rounded-xl bg-[#EF9F27] hover:bg-[#e2931e] disabled:opacity-50 text-[#111F1A] font-extrabold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Save {formatRand(amount)} ({method.toUpperCase()})</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
