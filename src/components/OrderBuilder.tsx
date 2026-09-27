import React, { useState } from 'react';
import {
  MessageCircle,
  PhoneCall,
  Plus,
  Minus,
  Sparkles,
  Truck,
  Check,
  Calendar,
} from 'lucide-react';
import { Order, OrderItem, PubSettings, Supplier } from '../types/pub';
import { triggerSuccessBurst } from '../lib/celebrate';

interface OrderBuilderProps {
  orders: Order[];
  settings: PubSettings;
  onUpdateOrderStatus: (orderId: string, status: 'draft' | 'sent', items?: OrderItem[]) => void;
}

export const OrderBuilder: React.FC<OrderBuilderProps> = ({
  orders,
  settings,
  onUpdateOrderStatus,
}) => {
  const [activeSupplierTab, setActiveSupplierTab] = useState<Supplier>('SAB');
  const [editingOrders, setEditingOrders] = useState<Record<string, OrderItem[]>>(() => {
    const map: Record<string, OrderItem[]> = {};
    orders.forEach((o) => {
      map[o.id] = [...o.items];
    });
    return map;
  });

  const [sentTimestamps, setSentTimestamps] = useState<Record<string, string>>({});

  const activeOrder = orders.find((o) => o.supplier === activeSupplierTab);

  // Stepper adjuster
  const handleAdjustCases = (orderId: string, itemIdx: number, delta: number) => {
    setEditingOrders((prev) => {
      const currentList = prev[orderId] || [];
      const updated = currentList.map((item, idx) => {
        if (idx === itemIdx) {
          const newQty = Math.max(0, item.ordered_cases + delta);
          return { ...item, ordered_cases: newQty };
        }
        return item;
      });
      return { ...prev, [orderId]: updated };
    });
  };

  const getSupplierPhone = (sup: Supplier) => {
    return sup === 'SAB' ? settings.supplier_sab_phone : settings.supplier_heineken_phone;
  };

  // Build formatted order text per user prompt F4:
  // "Hi, Cecil's Pub here. Order: 5 × Castle 750ml (12s), 4 × Black Label 750ml (12s). Delivery: Skylab St, Tlamatlama Ext, Tembisa."
  const buildOrderText = (order: Order): string => {
    const items = editingOrders[order.id] || order.items;
    const activeItems = items.filter((it) => it.ordered_cases > 0);

    const itemsText = activeItems
      .map((it) => `${it.ordered_cases} × ${it.product_name}`)
      .join(', ');

    return `Hi, Cecil's Pub here. Order: ${itemsText}. Delivery: ${settings.address}.`;
  };

  // F4: WhatsApp order dispatch with phone numbers from settings & mark sent with date/time
  const handleSendWhatsApp = (order: Order) => {
    const items = editingOrders[order.id] || order.items;
    const message = buildOrderText(order);
    const targetPhone = getSupplierPhone(order.supplier);

    const cleanPhone = targetPhone.replace(/[^0-9]/g, '');
    const waUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;

    const now = new Date();
    const formattedDate = `${now.toLocaleDateString('en-ZA', { day: 'numeric', month: 'short' })}, ${now.toLocaleTimeString('en-ZA', { hour: '2-digit', minute: '2-digit', hour12: false })}`;

    setSentTimestamps((prev) => ({
      ...prev,
      [order.id]: formattedDate,
    }));

    onUpdateOrderStatus(order.id, 'sent', items);
    triggerSuccessBurst();

    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Page Title */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111810] tracking-tight">
            Supplier Orders &amp; Restock
          </h1>
          <p className="text-xs text-[#4A5C50]">
            Auto-calculated draft orders for Cecil&apos;s Pub
          </p>
        </div>

        <div className="px-2.5 py-1 rounded-full bg-emerald-50 text-[#0A4A35] border border-emerald-200 text-xs font-bold flex items-center gap-1">
          <Sparkles className="w-3.5 h-3.5 text-[#EF9F27]" />
          <span>CoreIQ Restock Math</span>
        </div>
      </div>

      {/* F4: TWO LARGE ONE-TAP SUPPLIER CARDS (SAB & Heineken) WITH SEND & CALL ACTIONS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* SAB Card */}
        {(() => {
          const sabOrder = orders.find((o) => o.supplier === 'SAB');
          const isSent = sabOrder?.status === 'sent' || Boolean(sentTimestamps[sabOrder?.id || '']);
          const sentLabel = sentTimestamps[sabOrder?.id || ''] || 'Today';

          return (
            <div
              className={`rounded-2xl p-4 transition-all border ${
                activeSupplierTab === 'SAB'
                  ? 'bg-[#0A4A35] text-white border-[#0A4A35] shadow-md ring-2 ring-[#1D9E75]/50'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => setActiveSupplierTab('SAB')}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight">SAB Depot</span>
                    {isSent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                        Sent {sentLabel} ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EF9F27] text-[#111F1A]">
                        Draft Ready
                      </span>
                    )}
                  </div>
                  <Truck
                    className={`w-4 h-4 ${
                      activeSupplierTab === 'SAB' ? 'text-[#EF9F27]' : 'text-[#0F6E56]'
                    }`}
                  />
                </div>

                <p
                  className={`text-xs ${
                    activeSupplierTab === 'SAB' ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  Castle, Black Label, Milk Stout • Tel: {settings.supplier_sab_phone}
                </p>
              </div>

              {/* Direct Quick Supplier Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/15">
                {sabOrder ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSupplierTab('SAB');
                      handleSendWhatsApp(sabOrder);
                    }}
                    className="h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.97] transition-transform duration-150 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                    <span>WhatsApp</span>
                  </button>
                ) : null}

                <a
                  href={`tel:${settings.supplier_sab_phone}`}
                  className="h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform duration-150"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call SAB</span>
                </a>
              </div>
            </div>
          );
        })()}

        {/* Heineken Card */}
        {(() => {
          const heinekenOrder = orders.find((o) => o.supplier === 'Heineken');
          const isSent =
            heinekenOrder?.status === 'sent' || Boolean(sentTimestamps[heinekenOrder?.id || '']);
          const sentLabel = sentTimestamps[heinekenOrder?.id || ''] || 'Today';

          return (
            <div
              className={`rounded-2xl p-4 transition-all border ${
                activeSupplierTab === 'Heineken'
                  ? 'bg-[#0A4A35] text-white border-[#0A4A35] shadow-md ring-2 ring-[#1D9E75]/50'
                  : 'bg-white text-slate-800 border-slate-200 hover:border-slate-300'
              }`}
            >
              <div
                onClick={() => setActiveSupplierTab('Heineken')}
                className="cursor-pointer select-none"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-base tracking-tight">Heineken</span>
                    {isSent ? (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-400 text-emerald-950">
                        Sent {sentLabel} ✓
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#EF9F27] text-[#111F1A]">
                        Draft Ready
                      </span>
                    )}
                  </div>
                  <Truck
                    className={`w-4 h-4 ${
                      activeSupplierTab === 'Heineken' ? 'text-[#EF9F27]' : 'text-emerald-600'
                    }`}
                  />
                </div>

                <p
                  className={`text-xs ${
                    activeSupplierTab === 'Heineken' ? 'text-emerald-200' : 'text-slate-500'
                  }`}
                >
                  Heineken, Amstel, Sol • Tel: {settings.supplier_heineken_phone}
                </p>
              </div>

              {/* Direct Quick Supplier Action Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-white/15">
                {heinekenOrder ? (
                  <button
                    type="button"
                    onClick={() => {
                      setActiveSupplierTab('Heineken');
                      handleSendWhatsApp(heinekenOrder);
                    }}
                    className="h-10 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.97] transition-transform duration-150 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white stroke-none" />
                    <span>WhatsApp</span>
                  </button>
                ) : null}

                <a
                  href={`tel:${settings.supplier_heineken_phone}`}
                  className="h-10 rounded-xl bg-white/15 hover:bg-white/25 text-white border border-white/20 font-bold text-xs flex items-center justify-center gap-1.5 active:scale-[0.97] transition-transform duration-150"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call</span>
                </a>
              </div>
            </div>
          );
        })()}
      </div>

      {/* ACTIVE SUPPLIER DRAFT ORDER CARD */}
      {activeOrder ? (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-slate-200/90 space-y-4">
          {/* Order Header */}
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-bold text-base text-[#111810]">
                  {activeSupplierTab} Suggested Order
                </h2>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    activeOrder.status === 'sent' || Boolean(sentTimestamps[activeOrder.id])
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {activeOrder.status === 'sent' || Boolean(sentTimestamps[activeOrder.id])
                    ? `Sent ${sentTimestamps[activeOrder.id] || '✓'}`
                    : 'Auto Draft'}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Suggested based on weekly velocity vs current tavern stock
              </p>
            </div>

            {/* F4: Direct Call Supplier Button */}
            <a
              href={`tel:${getSupplierPhone(activeSupplierTab)}`}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 text-xs font-bold transition-all active:scale-[0.97]"
              title={`Call ${activeSupplierTab}`}
            >
              <PhoneCall className="w-4 h-4 text-[#0F6E56]" />
              <span className="hidden sm:inline">Call Depot</span>
            </a>
          </div>

          {/* Suggested Items Stepper List */}
          <div className="space-y-3">
            {(editingOrders[activeOrder.id] || activeOrder.items).map((item, idx) => (
              <div
                key={item.product_id}
                className="bg-slate-50 rounded-2xl p-3 border border-slate-200/80 space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    {/* F1: Product name wraps to two lines */}
                    <h3 className="font-bold text-sm text-[#111810] line-clamp-2 break-words leading-tight">
                      {item.product_name}
                    </h3>
                    {item.reason && (
                      <p className="text-[11px] text-emerald-700 font-medium mt-0.5 leading-snug">
                        💡 {item.reason}
                      </p>
                    )}
                  </div>

                  {/* Stepper Controls with P3 feedback */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleAdjustCases(activeOrder.id, idx, -1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold active:scale-[0.97] transition-transform shadow-2xs"
                    >
                      <Minus className="w-4 h-4" />
                    </button>

                    <div className="w-8 text-center font-mono font-extrabold text-base text-[#111810]">
                      {item.ordered_cases}
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAdjustCases(activeOrder.id, idx, 1)}
                      className="w-8 h-8 rounded-lg bg-white border border-slate-300 text-slate-700 flex items-center justify-center font-bold active:scale-[0.97] transition-transform shadow-2xs"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Total & WhatsApp Action Button */}
          <div className="pt-2 space-y-2.5">
            {/* WhatsApp Pre-written Message Preview */}
            <div className="bg-emerald-50/70 rounded-2xl p-3 border border-emerald-200 text-xs text-[#0A4A35]">
              <span className="font-bold block mb-1">Pre-written order text:</span>
              <p className="italic text-slate-700 text-[11px] leading-relaxed">
                &ldquo;{buildOrderText(activeOrder)}&rdquo;
              </p>
            </div>

            {/* F4: Big Send via WhatsApp Button with P3 feedback */}
            <button
              onClick={() => handleSendWhatsApp(activeOrder)}
              className="w-full h-14 rounded-2xl bg-[#25D366] hover:bg-[#20ba59] text-white font-extrabold text-base shadow-md active:scale-[0.97] transition-transform duration-150 flex items-center justify-center gap-2 cursor-pointer"
            >
              <MessageCircle className="w-5 h-5 fill-white stroke-none" />
              <span>Send via WhatsApp</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-3xl p-8 text-center border border-slate-200">
          <p className="text-sm text-slate-500 font-medium">
            No active draft orders for {activeSupplierTab}. All stock levels healthy.
          </p>
        </div>
      )}
    </div>
  );
};
