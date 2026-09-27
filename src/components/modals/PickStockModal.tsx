import React, { useState } from 'react';
import { X, ArrowDownToLine, Plus, Minus, Check, Beer } from 'lucide-react';
import { Product } from '../../types/pub';
import { triggerSuccessBurst } from '../../lib/celebrate';

interface PickStockModalProps {
  products: Product[];
  isOpen: boolean;
  isHelperMode: boolean;
  onClose: () => void;
  onConfirm: (productId: string, cases: number, pickedBy?: 'Cecil' | 'Helper') => void;
}

export const PickStockModal: React.FC<PickStockModalProps> = ({
  products,
  isOpen,
  isHelperMode,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  // Identify top 5 movers or first 5 products
  const topMovers = products.slice(0, 5);
  const otherProducts = products.slice(5);

  const [selectedProductId, setSelectedProductId] = useState<string>(
    topMovers[0]?.id || products[0]?.id || ''
  );
  const [cases, setCases] = useState<number>(1);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [showMore, setShowMore] = useState<boolean>(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);
  const pickedBy = isHelperMode ? 'Helper' : 'Cecil';

  const maxCasesAvailable = selectedProduct?.warehouse_stock || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || cases <= 0) return;

    onConfirm(selectedProductId, cases, pickedBy);
    triggerSuccessBurst();
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 p-5 animate-slideUp overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-teal-100 text-[#1D9E75] flex items-center justify-center">
              <ArrowDownToLine className="w-5 h-5 text-[#0F6E56]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-[#111810]">Pick Stock to Floor</h2>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-[#0A4A35]">
                  {pickedBy}
                </span>
              </div>
              <p className="text-xs text-[#4A5C50]">Move cases from warehouse to cold bar</p>
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
            <h3 className="text-xl font-extrabold text-[#0A4A35]">Picked ✓</h3>
            <p className="text-sm text-slate-600 mt-1">
              -{cases} cases from warehouse &rarr; +
              {cases * (selectedProduct?.case_size_units || 12)} cold units on floor
            </p>
            <span className="text-xs text-slate-400 mt-2 font-mono">
              Tagged: {pickedBy} • {new Date().toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-3 overflow-y-auto">
            {/* Top 5 Movers as Big Quick Buttons */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Top Movers (1-Tap Select)
                </label>
                {otherProducts.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setShowMore(!showMore)}
                    className="text-xs font-semibold text-[#0F6E56] underline"
                  >
                    {showMore ? 'Show Top 5' : `+ More (${otherProducts.length})`}
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {(showMore ? products : topMovers).map((p) => {
                  const isSelected = p.id === selectedProductId;
                  const isLow = p.warehouse_stock <= p.reorder_level;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        if (cases > p.warehouse_stock && p.warehouse_stock > 0) {
                          setCases(p.warehouse_stock);
                        }
                      }}
                      className={`p-3 rounded-xl flex items-center justify-between text-left border transition-all ${
                        isSelected
                          ? 'border-[#0F6E56] bg-emerald-50 text-[#0A4A35] shadow-xs ring-1 ring-[#0F6E56]'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Beer className="w-4 h-4 text-[#EF9F27] shrink-0" />
                        <div className="truncate">
                          <div className="font-bold text-sm leading-tight truncate">
                            {p.name}
                          </div>
                          <div className="text-[11px] text-slate-500">
                            Floor: {p.floor_stock} units
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <div
                          className={`text-xs font-bold font-mono ${
                            isLow ? 'text-rose-600' : 'text-[#0F6E56]'
                          }`}
                        >
                          {p.warehouse_stock} in stock
                        </div>
                        <div className="text-[10px] text-slate-400">cases in back</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Case Stepper */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Cases to Pick
                </label>
                <span className="text-xs text-slate-500 font-medium">
                  Available in back: <strong>{maxCasesAvailable}</strong> cases
                </span>
              </div>

              <div className="flex items-center justify-between bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setCases((c) => Math.max(1, c - 1))}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg active:scale-95 shadow-xs"
                >
                  <Minus className="w-5 h-5" />
                </button>

                <div className="text-center">
                  <div className="text-3xl font-extrabold text-[#111810] font-mono">
                    {cases}
                  </div>
                  <div className="text-[11px] text-[#4A5C50] font-semibold uppercase">
                    Cases (+{cases * (selectedProduct?.case_size_units || 12)} bottles to bar)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCases((c) => (c < maxCasesAvailable ? c + 1 : c + 1))}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg active:scale-95 shadow-xs"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Warning if cases exceed warehouse */}
              {cases > maxCasesAvailable && (
                <p className="text-xs text-amber-700 mt-1.5 font-medium">
                  ⚠️ Note: Only {maxCasesAvailable} cases recorded in warehouse. Will reconcile automatically.
                </p>
              )}
            </div>

            {/* Quick Pick Action Button */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-13 rounded-xl bg-[#0A4A35] hover:bg-[#073627] text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>
                  Confirm Pick ({cases} Case{cases === 1 ? '' : 's'})
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
