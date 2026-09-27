import React, { useState } from 'react';
import { Truck, ArrowDownToLine, Shield, Lock, Beer, CheckCircle2 } from 'lucide-react';
import { Product, Supplier } from '../types/pub';
import { LogDeliveryModal } from './modals/LogDeliveryModal';
import { PickStockModal } from './modals/PickStockModal';

interface HelperModeViewProps {
  products: Product[];
  onLogDelivery: (productId: string, cases: number, supplier: Supplier) => void;
  onLogPick: (productId: string, cases: number, pickedBy?: 'Cecil' | 'Helper') => void;
  onExitHelperMode: () => void;
}

export const HelperModeView: React.FC<HelperModeViewProps> = ({
  products,
  onLogDelivery,
  onLogPick,
  onExitHelperMode,
}) => {
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [showPickModal, setShowPickModal] = useState<boolean>(false);

  return (
    <div className="space-y-5 pb-24 animate-fadeIn">
      {/* Helper Banner */}
      <div className="bg-[#EF9F27]/15 border border-[#EF9F27]/40 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-[#EF9F27] text-[#111F1A] flex items-center justify-center font-bold">
            <Shield className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="font-bold text-sm text-[#111F1A]">
                Helper Operations Mode
              </h2>
              <span className="text-[10px] uppercase font-extrabold bg-[#EF9F27] text-[#111F1A] px-1.5 py-0.2 rounded">
                Active
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Sales, till &amp; margins hidden. All picks tagged &ldquo;Helper&rdquo;.
            </p>
          </div>
        </div>

        <button
          onClick={onExitHelperMode}
          className="px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-800 text-xs font-bold hover:bg-slate-50 flex items-center gap-1 shadow-2xs"
        >
          <Lock className="w-3.5 h-3.5 text-amber-600" />
          <span>Exit</span>
        </button>
      </div>

      {/* TWO PRIMARY HELPER ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Big Pick Stock to Floor Button */}
        <button
          onClick={() => setShowPickModal(true)}
          className="h-36 rounded-3xl bg-gradient-to-br from-[#0F6E56] to-[#0A4A35] text-white p-5 flex flex-col justify-between text-left shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <ArrowDownToLine className="w-6 h-6 text-emerald-200" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">
              Pick Stock to Floor
            </div>
            <p className="text-xs text-emerald-200/80 mt-1">
              Transfer beer cases from warehouse to cold fridge bar
            </p>
          </div>
        </button>

        {/* Big Log Delivery Button */}
        <button
          onClick={() => setShowDeliveryModal(true)}
          className="h-36 rounded-3xl bg-gradient-to-br from-[#1D9E75] to-[#0F6E56] text-white p-5 flex flex-col justify-between text-left shadow-lg hover:shadow-xl active:scale-[0.98] transition-all cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/15 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <div className="text-xl font-extrabold tracking-tight">
              Log Delivery
            </div>
            <p className="text-xs text-emerald-100/90 mt-1">
              Add crates arrived from SAB, Heineken, or Distell into back warehouse
            </p>
          </div>
        </button>
      </div>

      {/* Current Stock Levels List (Quantities only, NO prices or money) */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Tavern Stock Overview (Units)
        </h3>

        <div className="divide-y divide-slate-100 max-h-80 overflow-y-auto">
          {products.map((p) => (
            <div
              key={p.id}
              className="py-2.5 flex items-center justify-between text-xs"
            >
              <div className="min-w-0 pr-2">
                <div className="font-bold text-slate-900 truncate">{p.name}</div>
                <div className="text-[11px] text-slate-400">
                  {p.case_size_units} units per case
                </div>
              </div>

              <div className="flex items-center gap-3 text-right shrink-0">
                <div>
                  <span className="font-mono font-bold text-slate-800">
                    {p.warehouse_stock}
                  </span>{' '}
                  <span className="text-[10px] text-slate-400">cases back</span>
                </div>
                <div>
                  <span className="font-mono font-bold text-[#0F6E56]">
                    {p.floor_stock}
                  </span>{' '}
                  <span className="text-[10px] text-slate-400">cold bar</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modals */}
      <LogDeliveryModal
        products={products}
        isOpen={showDeliveryModal}
        onClose={() => setShowDeliveryModal(false)}
        onConfirm={onLogDelivery}
      />

      <PickStockModal
        products={products}
        isOpen={showPickModal}
        isHelperMode={true}
        onClose={() => setShowPickModal(false)}
        onConfirm={onLogPick}
      />
    </div>
  );
};
