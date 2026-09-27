import React, { useState } from 'react';
import { X, Shield, Lock, Check } from 'lucide-react';

interface HelperPINModalProps {
  isOpen: boolean;
  isHelperMode: boolean;
  onClose: () => void;
  onSubmitPIN: (pin: string) => boolean;
}

export const HelperPINModal: React.FC<HelperPINModalProps> = ({
  isOpen,
  isHelperMode,
  onClose,
  onSubmitPIN,
}) => {
  if (!isOpen) return null;

  const [pin, setPin] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) {
      setErrorMsg('Please enter a 4-digit PIN');
      return;
    }

    const success = onSubmitPIN(pin);
    if (success) {
      setPin('');
      setErrorMsg(null);
      onClose();
    } else {
      setErrorMsg('Incorrect PIN. Default is 1234.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-xs bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-scaleUp text-center">
        <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
          {isHelperMode ? (
            <Lock className="w-6 h-6 text-amber-700" />
          ) : (
            <Shield className="w-6 h-6 text-amber-700" />
          )}
        </div>

        <h3 className="text-base font-bold text-slate-900">
          {isHelperMode ? 'Exit Helper Mode' : 'Switch to Helper Mode'}
        </h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          {isHelperMode
            ? "Enter Cecil's 4-digit PIN to restore full till & financial access"
            : 'Helper mode hides money & sales till; allows only Pick & Delivery'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="password"
            autoFocus
            maxLength={4}
            value={pin}
            onChange={(e) => {
              setPin(e.target.value.replace(/[^0-9]/g, ''));
              setErrorMsg(null);
            }}
            placeholder="••••"
            className="w-full text-center text-3xl font-mono tracking-widest py-2 bg-slate-50 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
          />

          {errorMsg && (
            <p className="text-xs text-rose-600 font-bold">{errorMsg}</p>
          )}

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-bold hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="py-2.5 rounded-xl bg-[#0F6E56] hover:bg-[#0A4A35] text-white text-xs font-bold flex items-center justify-center gap-1 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Confirm</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
