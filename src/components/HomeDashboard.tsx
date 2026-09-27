import React, { useEffect, useState } from 'react';
import {
  Zap,
  TrendingUp,
  Package,
  Boxes,
  AlertTriangle,
  Calendar,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  CheckCircle2,
  FileSpreadsheet,
} from 'lucide-react';
import { formatRand, getTimeOfDayGreeting } from '../lib/format';
import { Discrepancy, Order } from '../types/pub';
import { AnimatedNumber } from './AnimatedNumber';

interface HomeDashboardProps {
  ownerName: string;
  todayTillTotal: number;
  todaySalesCount: number;
  warehouseCases: number;
  floorBottles: number;
  lowStockCount: number;
  discrepancies: Discrepancy[];
  draftOrders: Order[];
  onOpenQuickSale: () => void;
  onOpenEOD: () => void;
  onNavigateToStock: () => void;
  onNavigateToOrders: () => void;
  onNavigateToAI: () => void;
}

export const HomeDashboard: React.FC<HomeDashboardProps> = ({
  ownerName,
  todayTillTotal,
  todaySalesCount,
  warehouseCases,
  floorBottles,
  lowStockCount,
  discrepancies,
  draftOrders,
  onOpenQuickSale,
  onOpenEOD,
  onNavigateToStock,
  onNavigateToOrders,
  onNavigateToAI,
}) => {
  const { greeting, icon } = getTimeOfDayGreeting(ownerName);

  // Next order day calculation (SAB orders typically Sunday for Monday delivery)
  const todayDay = new Date().getDay(); // 0 is Sunday
  const daysUntilSunday = todayDay === 0 ? 0 : 7 - todayDay;

  return (
    <div className="space-y-4 pb-24 animate-fadeIn">
      {/* Greeting & Subtitle */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="text-xl font-bold text-[#111810] tracking-tight flex items-center gap-1.5">
            <span>{greeting}</span>
            <span className="text-xl">{icon}</span>
          </h1>
          <p className="text-xs text-[#4A5C50] font-medium">
            Cecil&apos;s Pub • Skylab St, Tembisa
          </p>
        </div>

        {/* Nudge verify check */}
        <div className="flex items-center gap-1 px-2.5 py-1 bg-emerald-50 border border-emerald-200/80 rounded-full text-emerald-800 text-[11px] font-medium shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#1D9E75]" />
          <span>Floor Ready</span>
        </div>
      </div>

      {/* HERO CARD (#111F1A with ambient diagonal shimmer) */}
      <div className="relative overflow-hidden rounded-3xl bg-[#111F1A] text-white p-5 shadow-lg border border-emerald-950/80 hero-shimmer">
        {/* Glow ambient background sphere */}
        <div className="absolute -top-12 -right-12 w-44 h-44 rounded-full bg-[#1D9E75]/15 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 rounded-full bg-[#EF9F27]/10 blur-2xl pointer-events-none" />

        <div className="relative z-10">
          {/* Card Header: Label + Sales Count Pill */}
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[12px] uppercase tracking-wider font-bold text-emerald-400/90">
              Today&apos;s Till
            </span>
            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#EF9F27]/20 border border-[#EF9F27]/30 text-[#EF9F27] text-xs font-semibold">
              <TrendingUp className="w-3 h-3" />
              <span>{todaySalesCount} sales today</span>
            </div>
          </div>

          {/* P1: Hero Counter Number (600ms animated count up) */}
          <div className="text-[40px] sm:text-[42px] font-extrabold tracking-tight text-white font-mono leading-none my-2">
            <AnimatedNumber
              value={todayTillTotal}
              duration={600}
              formatter={(val) => formatRand(val)}
            />
          </div>

          {/* Subtext info */}
          <p className="text-xs text-emerald-200/70 mb-5 font-normal">
            Real-time tavern sales &amp; till collections
          </p>

          {/* Action Buttons: Big Amber Quick Sale + Outlined End of Day (P3: active:scale-[0.97]) */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              onClick={onOpenQuickSale}
              className="h-12 rounded-xl bg-[#EF9F27] hover:bg-[#e0921f] text-[#111F1A] font-bold text-[15px] flex items-center justify-center gap-2 shadow-md active:scale-[0.97] transition-transform duration-150 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-[#111F1A]" />
              <span>Quick Sale</span>
            </button>

            <button
              onClick={onOpenEOD}
              className="h-12 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-[15px] border border-white/20 flex items-center justify-center gap-2 active:scale-[0.97] transition-transform duration-150 cursor-pointer backdrop-blur-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-300" />
              <span>End of Day</span>
            </button>
          </div>
        </div>
      </div>

      {/* POSITIVE REINFORCEMENT WEEKLY STREAK LINE */}
      <div className="bg-gradient-to-r from-emerald-50 via-teal-50/60 to-emerald-50 rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-[#0F6E56] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
          5d
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[13px] font-semibold text-[#111810] leading-tight">
            You logged 5 days straight this week
          </p>
          <p className="text-[11px] text-[#4A5C50] leading-snug">
            Your numbers are true and your tavern stock is verified 💪
          </p>
        </div>
      </div>

      {/* LIVE TILES: Warehouse / Floor / Low-stock with P1 600ms smooth count up & P3 press */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Warehouse Tile */}
        <button
          onClick={onNavigateToStock}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 text-left hover:border-emerald-300 transition-all active:scale-[0.97] duration-150 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Warehouse
            </span>
            <Boxes className="w-4 h-4 text-[#0F6E56] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#111810] tracking-tight font-mono">
            <AnimatedNumber value={warehouseCases} duration={600} />
          </div>
          <div className="text-[11px] text-[#4A5C50] font-medium">cases stored</div>
        </button>

        {/* Floor Tile */}
        <button
          onClick={onNavigateToStock}
          className="bg-white rounded-2xl p-3.5 shadow-sm border border-slate-200/80 text-left hover:border-emerald-300 transition-all active:scale-[0.97] duration-150 cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500">
              Floor Bar
            </span>
            <Package className="w-4 h-4 text-[#1D9E75] group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-[#111810] tracking-tight font-mono">
            <AnimatedNumber value={floorBottles} duration={600} />
          </div>
          <div className="text-[11px] text-[#4A5C50] font-medium">cold units</div>
        </button>

        {/* Low Stock Alert Tile */}
        <button
          onClick={onNavigateToStock}
          className={`rounded-2xl p-3.5 shadow-sm border text-left transition-all active:scale-[0.97] duration-150 cursor-pointer group ${
            lowStockCount > 0
              ? 'bg-rose-50/80 border-rose-200 hover:border-rose-400'
              : 'bg-white border-slate-200/80 hover:border-emerald-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1.5">
            <span
              className={`text-[11px] uppercase tracking-wider font-bold ${
                lowStockCount > 0 ? 'text-[#E24B4A]' : 'text-slate-500'
              }`}
            >
              Low Stock
            </span>
            <AlertTriangle
              className={`w-4 h-4 ${
                lowStockCount > 0 ? 'text-[#E24B4A] animate-bounce' : 'text-slate-400'
              }`}
            />
          </div>
          <div
            className={`text-2xl font-bold tracking-tight font-mono ${
              lowStockCount > 0 ? 'text-[#E24B4A]' : 'text-[#111810]'
            }`}
          >
            <AnimatedNumber value={lowStockCount} duration={600} />
          </div>
          <div
            className={`text-[11px] font-medium ${
              lowStockCount > 0 ? 'text-rose-700' : 'text-[#4A5C50]'
            }`}
          >
            {lowStockCount > 0 ? 'needs reorder' : 'all levels ok'}
          </div>
        </button>
      </div>

      {/* DISCREPANCY ALERT CARD (F3: Timestamp Consistency) */}
      {discrepancies.length > 0 && (
        <div className="rounded-2xl bg-amber-50/90 border border-amber-300/80 p-3.5 shadow-2xs">
          <div className="flex items-start gap-2.5">
            <div className="p-2 rounded-lg bg-amber-500/20 text-amber-900 shrink-0">
              <ShieldAlert className="w-5 h-5 text-amber-700" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-amber-950">
                  Floor Discrepancy Detected
                </h2>
                <span className="text-[10px] uppercase font-bold text-amber-800 bg-amber-200/60 px-2 py-0.5 rounded-full">
                  Shrinkage Alert
                </span>
              </div>
              <p className="text-xs text-amber-900 mt-1 leading-snug">
                {discrepancies[0].product_name}:{' '}
                <span className="font-bold text-amber-950">
                  {discrepancies[0].missing_units} units missing
                </span>{' '}
                between picks and POS sales.
              </p>
              <div className="mt-2 text-[11px] text-amber-800/90 flex items-center justify-between">
                <span>
                  Last pick by {discrepancies[0].last_picked_by} at {discrepancies[0].last_pick_time}
                </span>
                <button
                  onClick={onNavigateToStock}
                  className="font-bold text-amber-950 underline hover:text-amber-800 ml-2 cursor-pointer active:scale-[0.97]"
                >
                  Verify &rarr;
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* DAYS UNTIL ORDER DAY CARD */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-[#0F6E56] flex items-center justify-center border border-emerald-100">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-[#111810]">
                {daysUntilSunday === 0
                  ? 'SAB Order Day (Today!)'
                  : `${daysUntilSunday} day${daysUntilSunday === 1 ? '' : 's'} until SAB Order`}
              </span>
              {draftOrders.length > 0 && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#0A4A35]">
                  Auto Draft Ready
                </span>
              )}
            </div>
            <p className="text-xs text-[#4A5C50] mt-0.5">
              Draft order prepared: Castle, Black Label &amp; Milk Stout
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToOrders}
          className="p-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-[#0A4A35] transition-all active:scale-[0.97] cursor-pointer"
          title="View draft orders"
        >
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* ASK AI QUICK TEASER BANNER */}
      <div
        onClick={onNavigateToAI}
        className="rounded-2xl bg-gradient-to-r from-[#0A4A35] to-[#0F6E56] text-white p-3.5 shadow-sm flex items-center justify-between cursor-pointer active:scale-[0.97] transition-transform duration-150"
      >
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-[#EF9F27]" />
          </div>
          <div>
            <p className="text-xs font-bold leading-tight">
              Ask Cecil&apos;s Operations AI
            </p>
            <p className="text-[11px] text-emerald-200/80 leading-snug">
              &ldquo;How many Black Labels do I have left?&rdquo;
            </p>
          </div>
        </div>
        <div className="px-3 py-1 rounded-lg bg-[#EF9F27] text-[#111F1A] text-xs font-bold shadow-2xs">
          Open Chat
        </div>
      </div>
    </div>
  );
};
