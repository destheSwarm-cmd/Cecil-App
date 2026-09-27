import React, { useState } from 'react';
import { X, Truck, Plus, Minus, Check, Beer } from 'lucide-react';
import { Product, Supplier } from '../../types/pub';
import { triggerSuccessBurst } from '../../lib/celebrate';

interface LogDeliveryModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (productId: string, cases: number, supplier: Supplier) => void;
}

export const LogDeliveryModal: React.FC<LogDeliveryModalProps> = ({
  products,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const [selectedProductId, setSelectedProductId] = useState<string>(
    products[0]?.id || ''
  );
  const [cases, setCases] = useState<number>(5);
  const [supplier, setSupplier] = useState<Supplier>('SAB');
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  const selectedProduct = products.find((p) => p.id === selectedProductId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || cases <= 0) return;

    onConfirm(selectedProductId, cases, supplier);
    triggerSuccessBurst();
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 p-5 animate-slideUp overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0F6E56] flex items-center justify-center">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111810]">Log Stock Delivery</h2>
              <p className="text-xs text-[#4A5C50]">Add delivered cases to warehouse</p>
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
            <h3 className="text-xl font-extrabold text-[#0A4A35]">Delivered ✓</h3>
            <p className="text-sm text-slate-600 mt-1">
              +{cases} cases added to {selectedProduct?.name} warehouse
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 overflow-y-auto">
            {/* Step 1: Select Product */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                1. Select Product
              </label>
              <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto pr-1">
                {products.map((p) => {
                  const isSelected = p.id === selectedProductId;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setSelectedProductId(p.id);
                        if (p.supplier) setSupplier(p.supplier);
                      }}
                      className={`p-2.5 rounded-xl text-left border transition-all text-xs font-semibold ${
                        isSelected
                          ? 'border-[#0F6E56] bg-emerald-50/80 text-[#0A4A35] shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                      }`}
                    >
                      <div className="truncate">{p.name}</div>
                      <div className="text-[10px] text-slate-500 mt-0.5">
                        Current: {p.warehouse_stock} cases
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Step 2: Cases Stepper */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                2. Number of Cases Delivered
              </label>
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
                    Cases ({cases * (selectedProduct?.case_size_units || 12)} units)
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setCases((c) => c + 1)}
                  className="w-12 h-12 rounded-xl bg-white border border-slate-200 text-slate-700 flex items-center justify-center font-bold text-lg active:scale-95 shadow-xs"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>

              {/* Quick Stepper Presets */}
              <div className="flex gap-2 mt-2">
                {[1, 2, 5, 10, 20].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setCases(preset)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                      cases === preset
                        ? 'bg-[#0F6E56] text-white border-[#0F6E56]'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Supplier Tag */}
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                3. Supplier
              </label>
              <div className="grid grid-cols-4 gap-2">
                {(['SAB', 'Heineken', 'Distell', 'Other'] as Supplier[]).map((sup) => (
                  <button
                    key={sup}
                    type="button"
                    onClick={() => setSupplier(sup)}
                    className={`py-2 rounded-xl text-xs font-bold border text-center transition-all ${
                      supplier === sup
                        ? 'border-[#0F6E56] bg-emerald-100 text-[#0A4A35]'
                        : 'border-slate-200 text-slate-600 bg-white hover:bg-slate-50'
                    }`}
                  >
                    {sup}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full h-13 rounded-xl bg-[#0F6E56] hover:bg-[#0A4A35] text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5" />
                <span>Confirm Delivery ({cases} Cases)</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
