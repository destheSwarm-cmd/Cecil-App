import React, { useState, useRef } from 'react';
import {
  X,
  Camera,
  Upload,
  Sparkles,
  Check,
  AlertCircle,
  Plus,
  Trash2,
  Receipt,
  Image as ImageIcon,
} from 'lucide-react';
import { formatRand } from '../../lib/format';
import { Product } from '../../types/pub';
import { triggerSuccessBurst } from '../../lib/celebrate';

interface LogSalesEODModalProps {
  products: Product[];
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (
    total: number,
    breakdown: { cash: number; card: number; eft: number },
    items: { product_id?: string; name: string; units_sold: number; rand_amount: number }[],
    source: 'pos_photo' | 'manual',
    imageUrl?: string
  ) => void;
}

export const LogSalesEODModal: React.FC<LogSalesEODModalProps> = ({
  products,
  isOpen,
  onClose,
  onConfirm,
}) => {
  if (!isOpen) return null;

  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const [activeTab, setActiveTab] = useState<'photo' | 'manual'>('photo');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [extractionNote, setExtractionNote] = useState<string | null>(null);

  const [totalRand, setTotalRand] = useState<number>(4850.0);
  const [cashAmount, setCashAmount] = useState<number>(3100.0);
  const [cardAmount, setCardAmount] = useState<number>(1250.0);
  const [eftAmount, setEftAmount] = useState<number>(500.0);

  const [lineItems, setLineItems] = useState<
    { product_id?: string; name: string; units_sold: number; rand_amount: number }[]
  >([
    {
      product_id: products[0]?.id,
      name: products[0]?.name || 'Carling Black Label 750ml',
      units_sold: 48,
      rand_amount: 1248.0,
    },
    {
      product_id: products[1]?.id,
      name: products[1]?.name || 'Castle Lager 750ml',
      units_sold: 36,
      rand_amount: 900.0,
    },
    {
      product_id: products[3]?.id,
      name: products[3]?.name || 'Heineken 330ml',
      units_sold: 24,
      rand_amount: 672.0,
    },
  ]);

  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  // Handle Photo selection and trigger Gemini Vision AI
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async () => {
      const base64Data = reader.result as string;
      setImagePreview(base64Data);
      setIsAnalyzing(true);
      setExtractionNote('CoreIQ Vision reading POS screen...');

      try {
        const res = await fetch('/api/ai/extract-pos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: base64Data,
            mimeType: file.type || 'image/jpeg',
          }),
        });

        const data = await res.json();
        if (data.total_rand) {
          setTotalRand(Number(data.total_rand));
          if (data.payment_breakdown) {
            setCashAmount(Number(data.payment_breakdown.cash || 0));
            setCardAmount(Number(data.payment_breakdown.card || 0));
            setEftAmount(Number(data.payment_breakdown.eft || 0));
          }
          if (Array.isArray(data.line_items) && data.line_items.length > 0) {
            const mappedItems = data.line_items.map((item: any) => {
              const matchedProd = products.find((p) =>
                p.name.toLowerCase().includes(item.name.toLowerCase())
              );
              return {
                product_id: matchedProd?.id,
                name: item.name,
                units_sold: Number(item.units_sold || 1),
                rand_amount: Number(item.rand_amount || 0),
              };
            });
            setLineItems(mappedItems);
          }
          setExtractionNote('POS summary successfully extracted! Review before saving.');
        }
      } catch (err) {
        console.error('Extraction error:', err);
        setExtractionNote('Could not auto-read photo. Please confirm values manually below.');
      } finally {
        setIsAnalyzing(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleAddItem = () => {
    setLineItems((prev) => [
      ...prev,
      {
        product_id: products[0]?.id,
        name: products[0]?.name || 'Beverage',
        units_sold: 12,
        rand_amount: 300,
      },
    ]);
  };

  const handleRemoveItem = (index: number) => {
    setLineItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (totalRand <= 0) return;

    onConfirm(
      totalRand,
      { cash: cashAmount, card: cardAmount, eft: eftAmount },
      lineItems,
      activeTab === 'photo' ? 'pos_photo' : 'manual',
      imagePreview || undefined
    );

    triggerSuccessBurst();
    setIsSuccess(true);

    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 900);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 p-5 animate-slideUp overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111810]">
                End of Day (EOD) POS Sales
              </h2>
              <p className="text-xs text-[#4A5C50]">
                Reconcile till totals &amp; auto-deduct floor stock
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
            <h3 className="text-xl font-extrabold text-[#0A4A35]">
              EOD Reconciled ✓
            </h3>
            <p className="text-sm font-semibold text-slate-700 mt-1">
              {formatRand(totalRand)} logged to Daily Sales
            </p>
            <p className="text-xs text-slate-500 mt-0.5">
              Floor stock balances decremented accordingly
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto pt-3 space-y-4 pr-1">
            {/* Mode Selector Tabs (Photograph vs Manual) */}
            <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => setActiveTab('photo')}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'photo'
                    ? 'bg-white text-[#0A4A35] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Camera className="w-4 h-4 text-[#1D9E75]" />
                <span>Photograph POS Screen</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('manual')}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all ${
                  activeTab === 'manual'
                    ? 'bg-white text-[#0A4A35] shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>Manual Entry</span>
              </button>
            </div>

            {/* Photo Capture Section */}
            {activeTab === 'photo' && (
              <div className="space-y-3">
                {/* Hidden inputs: Camera (with capture) & Gallery (without capture) */}
                <input
                  type="file"
                  ref={cameraInputRef}
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />
                <input
                  type="file"
                  ref={galleryInputRef}
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoSelect}
                />

                {!imagePreview ? (
                  <div className="border-2 border-dashed border-slate-300 hover:border-[#1D9E75] rounded-2xl p-4 bg-slate-50/80 transition-colors text-center">
                    <button
                      type="button"
                      onClick={() => cameraInputRef.current?.click()}
                      className="w-full flex flex-col items-center justify-center cursor-pointer group"
                    >
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-[#0F6E56] flex items-center justify-center mb-2 group-hover:scale-105 transition-transform shadow-2xs">
                        <Camera className="w-6 h-6" />
                      </div>
                      <span className="text-sm font-bold text-slate-800">
                        Capture Till / POS Screen
                      </span>
                      <span className="text-xs text-slate-500 mt-0.5 max-w-xs mx-auto">
                        Default to live camera — CoreIQ Vision reads totals automatically
                      </span>
                    </button>

                    {/* Two-option buttons: 📷 Take Photo (default) & 🖼️ Choose from Gallery */}
                    <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-200/80">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-[#0A4A35] hover:bg-[#073627] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm active:scale-[0.97] transition-all cursor-pointer"
                      >
                        <Camera className="w-4 h-4 text-emerald-300" />
                        <span>📷 Take Photo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        className="py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-700 text-xs font-bold flex items-center justify-center gap-1.5 border border-slate-300 active:scale-[0.97] transition-all cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4 text-[#0F6E56]" />
                        <span>🖼️ From Gallery</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-black max-h-44 flex items-center justify-center">
                    <img
                      src={imagePreview}
                      alt="POS Screen"
                      className="max-h-44 w-auto object-contain opacity-85"
                    />
                    <div className="absolute top-2 right-2 flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        title="Retake with camera"
                        className="p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                      >
                        <Camera className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => galleryInputRef.current?.click()}
                        title="Choose another from gallery"
                        className="p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                      >
                        <ImageIcon className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setExtractionNote(null);
                        }}
                        title="Remove photo"
                        className="p-1.5 bg-black/70 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {isAnalyzing && (
                      <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center text-white">
                        <Sparkles className="w-6 h-6 text-[#EF9F27] animate-spin mb-1" />
                        <span className="text-xs font-semibold">
                          Extracting POS Numbers...
                        </span>
                      </div>
                    )}
                  </div>
                )}

                {extractionNote && (
                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-[#0A4A35] flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-[#EF9F27] shrink-0" />
                    <span>{extractionNote}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total & Breakdown Form */}
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-3">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Total Closing Sales (ZAR)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                    R
                  </span>
                  <input
                    type="number"
                    step="0.50"
                    value={totalRand || ''}
                    onChange={(e) => setTotalRand(parseFloat(e.target.value) || 0)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-white border border-slate-300 font-bold text-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
                  />
                </div>
              </div>

              {/* Payment Split */}
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Cash
                  </label>
                  <input
                    type="number"
                    value={cashAmount || ''}
                    onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    Card
                  </label>
                  <input
                    type="number"
                    value={cardAmount || ''}
                    onChange={(e) => setCardAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-xs"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                    EFT
                  </label>
                  <input
                    type="number"
                    value={eftAmount || ''}
                    onChange={(e) => setEftAmount(parseFloat(e.target.value) || 0)}
                    className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-slate-200 font-bold text-xs"
                  />
                </div>
              </div>
            </div>

            {/* Line Items Sold Table */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  Products Sold (Floor Deduction)
                </span>
                <button
                  type="button"
                  onClick={handleAddItem}
                  className="text-xs font-bold text-[#0F6E56] flex items-center gap-1 hover:underline"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Product</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-40 overflow-y-auto">
                {lineItems.map((item, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200 text-xs"
                  >
                    <select
                      value={item.product_id || ''}
                      onChange={(e) => {
                        const sel = products.find((p) => p.id === e.target.value);
                        setLineItems((prev) =>
                          prev.map((it, i) =>
                            i === idx
                              ? {
                                  ...it,
                                  product_id: sel?.id,
                                  name: sel?.name || it.name,
                                }
                              : it
                          )
                        );
                      }}
                      className="flex-1 bg-white border border-slate-200 rounded-lg px-2 py-1 font-semibold truncate"
                    >
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>

                    <div className="flex items-center gap-1 w-24">
                      <input
                        type="number"
                        min="1"
                        value={item.units_sold}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 0;
                          setLineItems((prev) =>
                            prev.map((it, i) =>
                              i === idx ? { ...it, units_sold: val } : it
                            )
                          );
                        }}
                        className="w-14 px-2 py-1 bg-white border border-slate-200 rounded-lg text-center font-bold"
                      />
                      <span className="text-slate-400 text-[10px]">units</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemoveItem(idx)}
                      className="p-1 text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Confirm Button */}
            <div className="pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full h-13 rounded-xl bg-[#0A4A35] hover:bg-[#073627] text-white font-bold text-base shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 stroke-[2.5]" />
                <span>Confirm EOD Sales ({formatRand(totalRand)})</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
