import React, { useState } from 'react';
import { X, Plus, Beer, Check } from 'lucide-react';
import { Product, ProductCategory, Supplier } from '../../types/pub';

interface AddProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (product: Product) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Beers & Lagers',
  'Spirits',
  'Wines',
  'Ciders & Coolers',
  'Premium',
  'Non-Alcoholic',
];

const SUPPLIERS: Supplier[] = ['SAB', 'Heineken', 'Distell', 'Other'];

export const AddProductModal: React.FC<AddProductModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const [name, setName] = useState<string>('');
  const [category, setCategory] = useState<ProductCategory>('Beers & Lagers');
  const [price, setPrice] = useState<number>(26.0);
  const [warehouseStock, setWarehouseStock] = useState<number>(5);
  const [floorStock, setFloorStock] = useState<number>(12);
  const [caseSize, setCaseSize] = useState<number>(12);
  const [reorderLevel, setReorderLevel] = useState<number>(3);
  const [supplier, setSupplier] = useState<Supplier>('SAB');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const newProd: Product = {
      id: 'prod-' + Date.now(),
      name: name.trim(),
      category,
      price: Number(price) || 20,
      warehouse_stock: Number(warehouseStock) || 0,
      floor_stock: Number(floorStock) || 0,
      case_size_units: Number(caseSize) || 12,
      stock_confidence: 'exact',
      reorder_level: Number(reorderLevel) || 3,
      active: true,
      supplier,
    };

    onSave(newProd);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-md bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-slate-100 p-5 animate-slideUp overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-[#0F6E56] flex items-center justify-center">
              <Beer className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111810]">Add New Tavern Item</h2>
              <p className="text-xs text-[#4A5C50]">Add a beer, cider, or spirit to Cecil&apos;s Pub</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 pt-3 overflow-y-auto">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
              Product Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Carling Black Label 750ml"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as ProductCategory)}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Supplier
              </label>
              <select
                value={supplier}
                onChange={(e) => setSupplier(e.target.value as Supplier)}
                className="w-full px-2.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              >
                {SUPPLIERS.map((sup) => (
                  <option key={sup} value={sup}>
                    {sup}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Retail Price (Rand)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400 text-xs">
                  R
                </span>
                <input
                  type="number"
                  step="0.50"
                  required
                  value={price || ''}
                  onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                  className="w-full pl-7 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                Units Per Case
              </label>
              <select
                value={caseSize}
                onChange={(e) => setCaseSize(parseInt(e.target.value))}
                className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-bold"
              >
                <option value={12}>12 Units (Quarts / 750ml)</option>
                <option value={24}>24 Units (Dumpy / 330ml)</option>
                <option value={6}>6 Units (Packs)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Warehouse
              </label>
              <input
                type="number"
                min="0"
                value={warehouseStock}
                onChange={(e) => setWarehouseStock(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
              />
              <span className="text-[9px] text-slate-400 block text-center">cases</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Floor Bar
              </label>
              <input
                type="number"
                min="0"
                value={floorStock}
                onChange={(e) => setFloorStock(parseInt(e.target.value) || 0)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
              />
              <span className="text-[9px] text-slate-400 block text-center">bottles</span>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase text-slate-500 mb-0.5">
                Reorder Level
              </label>
              <input
                type="number"
                min="1"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(parseInt(e.target.value) || 1)}
                className="w-full px-2 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold text-center"
              />
              <span className="text-[9px] text-slate-400 block text-center">cases</span>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full h-12 rounded-xl bg-[#0F6E56] hover:bg-[#0A4A35] text-white font-bold text-sm shadow-md active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Save Product to Tavern List</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
