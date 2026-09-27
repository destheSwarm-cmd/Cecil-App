import React, { useState } from 'react';
import { X, Check, ShieldAlert, Plus, Minus, PackageCheck } from 'lucide-react';
import { Discrepancy, Product } from '../../types/pub';
import { triggerSuccessBurst } from '../../lib/celebrate';

interface VerifyShrinkageModalProps {
  discrepancy: Discrepancy | null;
  product?: Product;
  isOpen: boolean;
  onClose: () => void;
  onConfirmReconcile: (discrepancyId: string, actualFloorUnits: number) => void;
}

export const VerifyShrinkageModal: React.FC<VerifyShrinkageModalProps> = ({
  discrepancy,
  product,
  isOpen,
  onClose,
  onConfirmReconcile,
}) => {
  if (!isOpen || !discrepancy) return null;

  // Initialize count with actual_floor or product floor_stock
  const [countedUnits, setCountedUnits] = useState<number>(
    discrepancy.actual_floor ?? product?.floor_stock ?? 18
  );
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const handleConfirm = () => {
    onConfirmReconcile(discrepancy.id, countedUnits);
    triggerSuccessBurst();
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 p-5 animate-slideUp overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
              <PackageCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-[#111810]">
                Count what&apos;s actually on the floor
              </h2>
              <p className="text-xs text-[#4A5C50]">
                {discrepancy.product_name}
              </p>
            </div>
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
            <div className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg mb-3">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-xl font-extrabold text-[#0A4A35]">Floor Verified ✓</h3>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              Floor balance reconciled to {countedUnits} units. Alert cleared.
            </p>
          </div>
        ) : (
          <div className="pt-4 space-y-4">
            {/* Discrepancy Context Box */}
            <div className="bg-amber-50/90 rounded-xl p-3 border border-amber-200 text-xs text-amber-950 space-y-1">
              <div className="flex items-center justify-between font-bold">
                <span>Expected floor: {discrepancy.expected_floor} units</span>
                <span className="text-rose-700">-{discrepancy.missing_units} unaccounted</span>
              </div>
              <p className="text-[11px] text-amber-800">
                Last picked by <strong>{discrepancy.last_picked_by}</strong> at {discrepancy.last_pick_time}
              </p>
            </div>

            {/* Stepper for Counting Actual Floor Stock */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-2">
                Actual Physical Bottle Count on Bar
              </label>

              <div className="flex items-center justify-between bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setCountedUnits((c) => Math.max(0, c - 1))}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl active:scale-[0.97] transition-transform shadow-xs"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#111810] font-mono">
                    {countedUnits}
                  </div>
                  <div className="text-[11px] text-[#4A5C50] font-semibold uppercase">
                    Bottles Counted
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCountedUnits((c) => c + 1)}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-xl active:scale-[0.97] transition-transform shadow-xs"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Preset Adjustments */}
              <div className="flex gap-2 mt-2">
                {[0, 6, 12, 18, 24].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCountedUnits(preset)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-all active:scale-[0.97] ${
                      countedUnits === preset
                        ? 'bg-[#0F6E56] text-white border-[#0F6E56]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleConfirm}
                className="w-full h-13 rounded-xl bg-[#0F6E56] hover:bg-[#0A4A35] text-white font-bold text-base shadow-md active:scale-[0.97] transition-transform flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Confirm Floor Count ({countedUnits} Units)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
