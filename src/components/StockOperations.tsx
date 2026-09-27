import React, { useState } from 'react';
import {
  Search,
  Truck,
  ArrowDownToLine,
  FileSpreadsheet,
  AlertTriangle,
  Plus,
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  CheckCircle,
  Beer,
  Boxes,
  Package,
} from 'lucide-react';
import { Product, ProductCategory, Discrepancy, Supplier } from '../types/pub';
import { formatRand, formatStockUnits } from '../lib/format';
import { LogDeliveryModal } from './modals/LogDeliveryModal';
import { PickStockModal } from './modals/PickStockModal';
import { LogSalesEODModal } from './modals/LogSalesEODModal';
import { AddProductModal } from './modals/AddProductModal';

interface StockOperationsProps {
  products: Product[];
  warehouseCases: number;
  floorBottles: number;
  lowStockCount: number;
  discrepancies: Discrepancy[];
  isHelperMode: boolean;
  onLogDelivery: (productId: string, cases: number, supplier: Supplier) => void;
  onLogPick: (productId: string, cases: number, pickedBy?: 'Cecil' | 'Helper') => void;
  onLogEODSale: (
    total: number,
    breakdown: { cash: number; card: number; eft: number },
    items: { product_id?: string; name: string; units_sold: number; rand_amount: number }[],
    source: 'pos_photo' | 'manual',
    imageUrl?: string
  ) => void;
  onSaveProduct: (product: Product) => void;
  onResolveDiscrepancy: (id: string) => void;
}

const CATEGORIES: ProductCategory[] = [
  'Beers & Lagers',
  'Ciders & Coolers',
  'Spirits',
  'Wines',
  'Premium',
  'Non-Alcoholic',
];

export const StockOperations: React.FC<StockOperationsProps> = ({
  products,
  warehouseCases,
  floorBottles,
  lowStockCount,
  discrepancies,
  isHelperMode,
  onLogDelivery,
  onLogPick,
  onLogEODSale,
  onSaveProduct,
  onResolveDiscrepancy,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Modals state
  const [showDeliveryModal, setShowDeliveryModal] = useState<boolean>(false);
  const [showPickModal, setShowPickModal] = useState<boolean>(false);
  const [showEODModal, setShowEODModal] = useState<boolean>(false);
  const [showAddProductModal, setShowAddProductModal] = useState<boolean>(false);

  // Toggle category section collapse
  const toggleCategory = (cat: string) => {
    setCollapsedCategories((prev) => ({
      ...prev,
      [cat]: !prev[cat],
    }));
  };

  // Filter products by search and category
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.supplier.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || p.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* 1. TOP ANIMATED SUMMARY STRIP — Three Live Tiles */}
      <div className="grid grid-cols-3 gap-2">
        {/* Warehouse total cases */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Warehouse
            </span>
            <Boxes className="w-3.5 h-3.5 text-[#0F6E56]" />
          </div>
          <div className="text-xl font-extrabold text-[#111810] font-mono leading-none">
            {warehouseCases}
          </div>
          <span className="text-[10px] text-[#4A5C50] font-medium">total cases</span>
        </div>

        {/* Floor total */}
        <div className="bg-white rounded-xl p-3 shadow-xs border border-slate-200 text-left">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] uppercase tracking-wider font-bold text-slate-500">
              Floor Bar
            </span>
            <Package className="w-3.5 h-3.5 text-[#1D9E75]" />
          </div>
          <div className="text-xl font-extrabold text-[#111810] font-mono leading-none">
            {floorBottles}
          </div>
          <span className="text-[10px] text-[#4A5C50] font-medium">cold bottles</span>
        </div>

        {/* Low-stock count with red pulse if any */}
        <div
          className={`rounded-xl p-3 shadow-xs border text-left transition-all ${
            lowStockCount > 0
              ? 'bg-rose-50/90 border-rose-200'
              : 'bg-white border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className={`text-[10px] uppercase tracking-wider font-bold ${
                lowStockCount > 0 ? 'text-[#E24B4A]' : 'text-slate-500'
              }`}
            >
              Low Stock
            </span>
            <AlertTriangle
              className={`w-3.5 h-3.5 ${
                lowStockCount > 0 ? 'text-[#E24B4A] animate-pulse' : 'text-slate-400'
              }`}
            />
          </div>
          <div
            className={`text-xl font-extrabold font-mono leading-none ${
              lowStockCount > 0 ? 'text-[#E24B4A]' : 'text-[#111810]'
            }`}
          >
            {lowStockCount}
          </div>
          <span
            className={`text-[10px] font-medium ${
              lowStockCount > 0 ? 'text-rose-700' : 'text-[#4A5C50]'
            }`}
          >
            {lowStockCount > 0 ? 'order needed' : 'all good'}
          </span>
        </div>
      </div>

      {/* 2. THREE PROMINENT ACTION BUTTONS */}
      <div className="grid grid-cols-3 gap-2">
        {/* Log Delivery Button */}
        <button
          onClick={() => setShowDeliveryModal(true)}
          className="h-14 rounded-2xl bg-[#0F6E56] hover:bg-[#0A4A35] text-white p-2 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <Truck className="w-5 h-5 text-emerald-200 mb-0.5" />
          <span className="text-xs font-bold leading-tight">Log Delivery</span>
        </button>

        {/* Pick Stock Button */}
        <button
          onClick={() => setShowPickModal(true)}
          className="h-14 rounded-2xl bg-[#1D9E75] hover:bg-[#168260] text-white p-2 flex flex-col items-center justify-center shadow-sm active:scale-95 transition-all cursor-pointer"
        >
          <ArrowDownToLine className="w-5 h-5 text-emerald-100 mb-0.5" />
          <span className="text-xs font-bold leading-tight">Pick Stock</span>
        </button>

        {/* Log Sales (EOD) Button */}
        <button
          onClick={() => setShowEODModal(true)}
          className="h-14 rounded-2xl bg-[#111F1A] hover:bg-black text-white p-2 flex flex-col items-center justify-center shadow-sm border border-emerald-900/60 active:scale-95 transition-all cursor-pointer"
        >
          <FileSpreadsheet className="w-5 h-5 text-[#EF9F27] mb-0.5" />
          <span className="text-xs font-bold leading-tight">Log Sales (EOD)</span>
        </button>
      </div>

      {/* 3. SHRINKAGE INSIGHT (Owner's Trust Feature) */}
      {discrepancies.length > 0 && !isHelperMode && (
        <div className="bg-amber-50/90 rounded-2xl p-4 border border-amber-300 shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
              <h2 className="text-sm font-bold text-amber-950">
                Shrinkage &amp; Discrepancy Insight
              </h2>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
              {discrepancies.length} Alert{discrepancies.length === 1 ? '' : 's'}
            </span>
          </div>

          <p className="text-xs text-amber-900/90 leading-relaxed">
            Gap detected between expected floor stock (picks minus POS sales) and actual
            balance. Cecil can see if stock walked:
          </p>

          <div className="space-y-2">
            {discrepancies.map((disc) => (
              <div
                key={disc.id}
                className="bg-white rounded-xl p-3 border border-amber-200 shadow-2xs flex items-center justify-between"
              >
                <div className="min-w-0 pr-2">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 truncate">
                      {disc.product_name}
                    </span>
                    <span className="text-[10px] font-extrabold text-rose-700 bg-rose-100 px-1.5 py-0.5 rounded">
                      -{disc.missing_units} units missing
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-500 mt-1">
                    Last pick by <strong>{disc.last_picked_by}</strong> at{' '}
                    <span>{disc.last_pick_time}</span>
                  </div>
                </div>

                <button
                  onClick={() => onResolveDiscrepancy(disc.id)}
                  className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0A4A35] text-[11px] font-bold shrink-0 border border-emerald-200 flex items-center gap-1 cursor-pointer"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Verify</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 4. SEARCH & CATEGORY FILTER */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search beer, spirit, cider or supplier..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-slate-200/90 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0F6E56]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 font-bold"
            >
              Clear
            </button>
          )}
        </div>

        {/* Category Pills (Horizontal scroll) */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          {['All', ...CATEGORIES].map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#0A4A35] text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* 5. ADD PRODUCT / EMPTY STATE */}
      <div className="flex items-center justify-between pt-1">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
          Tavern Inventory
        </h2>
        <button
          onClick={() => setShowAddProductModal(true)}
          className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-[#0F6E56] text-xs font-bold flex items-center gap-1 border border-emerald-200 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Product</span>
        </button>
      </div>

      {/* Empty State */}
      {products.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center border border-dashed border-slate-300">
          <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#0F6E56] flex items-center justify-center mx-auto mb-3">
            <Beer className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Add Your First Beer</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto mb-4">
            Start managing Cecil&apos;s Pub by adding Castle, Black Label, or your top
            tavern sellers.
          </p>
          <button
            onClick={() => setShowAddProductModal(true)}
            className="px-4 py-2 rounded-xl bg-[#0F6E56] text-white font-bold text-xs shadow-sm hover:bg-[#0A4A35]"
          >
            + Add First Beer
          </button>
        </div>
      ) : (
        /* Grouped in Collapsible Category Sections */
        <div className="space-y-3">
          {CATEGORIES.map((cat) => {
            const catProds = filteredProducts.filter((p) => p.category === cat);
            if (catProds.length === 0 && selectedCategory !== 'All') return null;
            if (catProds.length === 0) return null;

            const isCollapsed = Boolean(collapsedCategories[cat]);

            return (
              <div
                key={cat}
                className="bg-white rounded-2xl shadow-xs border border-slate-200/80 overflow-hidden"
              >
                {/* Category Header Bar */}
                <button
                  type="button"
                  onClick={() => toggleCategory(cat)}
                  className="w-full px-4 py-3 bg-slate-50/80 hover:bg-slate-100/80 flex items-center justify-between text-left transition-colors border-b border-slate-100"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-[#111810]">{cat}</span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/70 text-slate-600">
                      {catProds.length}
                    </span>
                  </div>

                  {isCollapsed ? (
                    <ChevronRight className="w-4 h-4 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400" />
                  )}
                </button>

                {/* Product Cards List */}
                {!isCollapsed && (
                  <div className="divide-y divide-slate-100 p-2 space-y-2">
                    {catProds.map((product) => {
                      const isLowStock = product.warehouse_stock <= product.reorder_level;
                      const isCritical = product.warehouse_stock === 0;

                      // Stock bar fill percentage (based on max 15 cases for warehouse)
                      const warehousePct = Math.min(
                        100,
                        Math.max(5, (product.warehouse_stock / 12) * 100)
                      );
                      const floorPct = Math.min(
                        100,
                        Math.max(5, (product.floor_stock / 30) * 100)
                      );

                      return (
                        <div
                          key={product.id}
                          className="relative rounded-xl p-3 bg-white hover:bg-slate-50/50 transition-all border border-slate-100"
                        >
                          {/* Left severity accent bar */}
                          <div
                            className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-md ${
                              isCritical
                                ? 'bg-[#E24B4A]'
                                : isLowStock
                                ? 'bg-[#EF9F27]'
                                : 'bg-[#1D9E75]'
                            }`}
                          />

                          <div className="pl-2">
                            {/* Title & Price & Supplier */}
                            <div className="flex items-start justify-between">
                              <div className="min-w-0 pr-2">
                                <div className="flex items-center gap-1.5">
                                  <h3 className="font-bold text-sm text-[#111810] truncate">
                                    {product.name}
                                  </h3>
                                  {product.stock_confidence === 'estimated' && (
                                    <span
                                      className="text-amber-800 bg-amber-100 px-1 rounded text-[11px] font-bold"
                                      title="Stock estimated (Missed recent verification)"
                                    >
                                      ≈
                                    </span>
                                  )}
                                </div>
                                <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                                  <span className="font-medium text-slate-600">
                                    {product.supplier}
                                  </span>
                                  <span>•</span>
                                  <span>{product.case_size_units}s case</span>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <div className="text-sm font-extrabold text-[#0A4A35] font-mono">
                                  {formatRand(product.price)}
                                </div>
                                <div className="text-[10px] text-slate-400 font-medium">
                                  per unit
                                </div>
                              </div>
                            </div>

                            {/* TWO ANIMATED STOCK BARS (Warehouse & Floor) */}
                            <div className="mt-3 space-y-2">
                              {/* Warehouse Bar */}
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                                  <span className="text-slate-600 flex items-center gap-1">
                                    <span>Warehouse</span>
                                    {isLowStock && (
                                      <span className="text-[#E24B4A] text-[10px] font-bold">
                                        (Reorder &le; {product.reorder_level})
                                      </span>
                                    )}
                                  </span>
                                  <span
                                    className={`font-mono font-bold ${
                                      isLowStock ? 'text-[#E24B4A]' : 'text-slate-800'
                                    }`}
                                  >
                                    {product.warehouse_stock} cases
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className={`h-full rounded-full transition-all duration-500 ${
                                      isCritical
                                        ? 'bg-[#E24B4A]'
                                        : isLowStock
                                        ? 'bg-[#EF9F27]'
                                        : 'bg-[#0F6E56]'
                                    }`}
                                    style={{ width: `${warehousePct}%` }}
                                  />
                                </div>
                              </div>

                              {/* Floor Stock Bar */}
                              <div>
                                <div className="flex items-center justify-between text-[11px] font-semibold mb-1">
                                  <span className="text-slate-600">Floor Bar</span>
                                  <span className="font-mono font-bold text-slate-800">
                                    {formatStockUnits(
                                      Math.floor(
                                        product.floor_stock / product.case_size_units
                                      ),
                                      product.floor_stock % product.case_size_units
                                    )}{' '}
                                    <span className="text-[10px] text-slate-400 font-normal">
                                      ({product.floor_stock} units)
                                    </span>
                                  </span>
                                </div>
                                <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                                  <div
                                    className="h-full rounded-full bg-[#1D9E75] transition-all duration-500"
                                    style={{ width: `${floorPct}%` }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

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
        isHelperMode={isHelperMode}
        onClose={() => setShowPickModal(false)}
        onConfirm={onLogPick}
      />

      <LogSalesEODModal
        products={products}
        isOpen={showEODModal}
        onClose={() => setShowEODModal(false)}
        onConfirm={onLogEODSale}
      />

      <AddProductModal
        isOpen={showAddProductModal}
        onClose={() => setShowAddProductModal(false)}
        onSave={onSaveProduct}
      />
    </div>
  );
};
