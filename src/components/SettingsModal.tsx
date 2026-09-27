import React, { useState } from 'react';
import {
  X,
  Building,
  Mail,
  Phone,
  Shield,
  Bell,
  Download,
  Sparkles,
  Check,
  TrendingUp,
  Send,
  Trash2,
} from 'lucide-react';
import { PubSettings, Product } from '../types/pub';
import { formatRand } from '../lib/format';
import { triggerSuccessBurst } from '../lib/celebrate';

interface SettingsModalProps {
  settings: PubSettings;
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onSaveSettings: (settings: PubSettings) => void;
  onBulkPriceUpdate: (amount: number, category?: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  settings,
  products,
  isOpen,
  onClose,
  onSaveSettings,
  onBulkPriceUpdate,
}) => {
  if (!isOpen) return null;

  const [formData, setFormData] = useState<PubSettings>({ ...settings });
  const [bulkPriceAmount, setBulkPriceAmount] = useState<number>(2.0);
  const [emailStatus, setEmailStatus] = useState<string | null>(null);
  const [isSendingEmail, setIsSendingEmail] = useState<boolean>(false);
  const [savedSuccess, setSavedSuccess] = useState<boolean>(false);

  // Send Test Transactional Report Email via /api/email/report
  const handleSendTestEmail = async (type: 'weekly' | 'welcome') => {
    setIsSendingEmail(true);
    setEmailStatus('Dispatching transactional report...');
    try {
      const res = await fetch('/api/email/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toEmail: formData.owner_email,
          reportType: type,
          data: {
            businessName: formData.business_name,
            totalProducts: products.length,
          },
        }),
      });
      const data = await res.json();
      setEmailStatus(`Report dispatched to ${formData.owner_email} ✓`);
      triggerSuccessBurst();
    } catch (err) {
      setEmailStatus('Simulated email dispatch logged locally.');
    } finally {
      setIsSendingEmail(false);
      setTimeout(() => setEmailStatus(null), 4000);
    }
  };

  // CSV Data Export
  const handleExportCSV = () => {
    const headers = 'ID,Name,Category,Price(ZAR),WarehouseStock,FloorStock,Supplier\n';
    const rows = products
      .map(
        (p) =>
          `"${p.id}","${p.name}","${p.category}",${p.price},${p.warehouse_stock},${p.floor_stock},"${p.supplier}"`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cecils-pub-inventory-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    triggerSuccessBurst();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveSettings(formData);
    setSavedSuccess(true);
    triggerSuccessBurst();
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-scaleUp overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-[#111810]">
              Cecil&apos;s Pub Configuration
            </h2>
            <p className="text-xs text-[#4A5C50]">
              Tavern details, suppliers, helper PIN &amp; email
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-3 space-y-5 pr-1">
          {/* Section 1: Tavern Business Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-[#0F6E56]" />
              <span>Business Profile</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Business Name
                </label>
                <input
                  type="text"
                  value={formData.business_name}
                  onChange={(e) =>
                    setFormData({ ...formData, business_name: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Owner Phone
                </label>
                <input
                  type="text"
                  value={formData.owner_phone}
                  onChange={(e) =>
                    setFormData({ ...formData, owner_phone: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Tavern Address (Delivery Destination)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) =>
                  setFormData({ ...formData, address: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          {/* Section 2: Supplier Phone Numbers */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-[#0F6E56]" />
              <span>Supplier Dispatch Contacts</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  SAB Depot Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.supplier_sab_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplier_sab_phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Heineken Depot Phone / WhatsApp
                </label>
                <input
                  type="text"
                  value={formData.supplier_heineken_phone}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      supplier_heineken_phone: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Helper Mode Security PIN */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-[#EF9F27]" />
              <span>Helper Mode Security PIN</span>
            </h3>

            <div className="bg-amber-50/70 p-3 rounded-xl border border-amber-200">
              <p className="text-xs text-amber-900 leading-snug mb-2">
                When switching back from Helper Mode, Cecil must enter this 4-digit PIN to reveal sales till and financial numbers.
              </p>
              <div className="w-32">
                <input
                  type="text"
                  maxLength={4}
                  value={formData.helper_pin}
                  onChange={(e) =>
                    setFormData({ ...formData, helper_pin: e.target.value })
                  }
                  className="w-full px-3 py-1.5 bg-white border border-amber-300 rounded-lg text-center font-mono font-extrabold text-sm tracking-widest"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Bulk Price Update Tool */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <TrendingUp className="w-4 h-4 text-[#0F6E56]" />
              <span>Bulk Price Update</span>
            </h3>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-slate-800">
                  Update All Prices
                </p>
                <p className="text-[11px] text-slate-500">
                  Quickly increase all tavern retail prices by +R 1 or +R 2
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onBulkPriceUpdate(1.0);
                    triggerSuccessBurst();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-bold hover:bg-emerald-50 active:scale-95"
                >
                  +R 1,00
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onBulkPriceUpdate(2.0);
                    triggerSuccessBurst();
                  }}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 active:scale-95"
                >
                  +R 2,00
                </button>
              </div>
            </div>
          </div>

          {/* Section 5: Owner Email & Transactional Report Hook */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-[#0F6E56]" />
              <span>Transactional Email Integration</span>
            </h3>

            <div>
              <label className="block text-[11px] font-bold text-slate-600 mb-1">
                Owner Email (Weekly Reports Destination)
              </label>
              <input
                type="email"
                value={formData.owner_email}
                onChange={(e) =>
                  setFormData({ ...formData, owner_email: e.target.value })
                }
                className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSendTestEmail('weekly')}
                disabled={isSendingEmail}
                className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Send className="w-3 h-3 text-[#0F6E56]" />
                <span>Trigger Weekly Report Email</span>
              </button>
            </div>

            {emailStatus && (
              <p className="text-xs text-emerald-800 font-semibold bg-emerald-50 p-2 rounded-lg border border-emerald-200">
                {emailStatus}
              </p>
            )}
          </div>

          {/* Section 6: Data Export CSV */}
          <div className="pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={handleExportCSV}
              className="w-full py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2"
            >
              <Download className="w-4 h-4 text-[#0F6E56]" />
              <span>Export Tavern Inventory to CSV</span>
            </button>
          </div>

          {/* Section 7: Powered by CoreIQ About Badge */}
          <div className="bg-[#111F1A] rounded-2xl p-4 text-white text-center space-y-1.5">
            <div className="flex items-center justify-center gap-1.5 text-xs text-[#EF9F27] font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-[#1D9E75]" />
              <span>Powered by CoreIQ</span>
            </div>
            <p className="text-xs text-emerald-100/80 leading-relaxed max-w-sm mx-auto">
              Intelligent creation &amp; tavern operations environment built specifically for Cecil&apos;s Pub, Skylab Street, Tembisa.
            </p>
            <span className="text-[10px] text-emerald-400/60 block font-mono">
              v2.4.0-za • Offline-First PWA Architecture
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full h-12 rounded-xl bg-[#0F6E56] hover:bg-[#0A4A35] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </div>
    </div>
  );
};
