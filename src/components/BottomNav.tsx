import React from 'react';
import { Home, PackageCheck, ShoppingCart, MessageSquareText } from 'lucide-react';

export type NavTab = 'home' | 'stock' | 'orders' | 'ai';

interface BottomNavProps {
  activeTab: NavTab;
  onChangeTab: (tab: NavTab) => void;
  lowStockCount: number;
  draftOrdersCount: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  lowStockCount,
  draftOrdersCount,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    {
      id: 'stock' as NavTab,
      label: 'Stock',
      icon: PackageCheck,
      badge: lowStockCount > 0 ? lowStockCount : null,
      badgeColor: 'bg-[#E24B4A]',
    },
    {
      id: 'orders' as NavTab,
      label: 'Orders',
      icon: ShoppingCart,
      badge: draftOrdersCount > 0 ? 'Draft' : null,
      badgeColor: 'bg-[#EF9F27]',
    },
    {
      id: 'ai' as NavTab,
      label: 'Ask AI',
      icon: MessageSquareText,
      sparkle: true,
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-safe">
      <div className="max-w-md mx-auto h-16 flex items-center justify-around px-2">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-col items-center justify-center flex-1 h-14 min-w-[48px] rounded-xl transition-all duration-150 active:scale-95 ${
                isActive
                  ? 'text-[#0A4A35] font-semibold'
                  : 'text-slate-400 hover:text-slate-600 font-medium'
              }`}
            >
              {/* Icon Container with Badge */}
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform ${
                    isActive ? 'scale-110 text-[#0F6E56]' : ''
                  }`}
                  strokeWidth={isActive ? 2.3 : 1.8}
                />

                {/* Counter / Label Badge */}
                {tab.badge && (
                  <span
                    className={`absolute -top-1.5 -right-3 text-[10px] text-white px-1.5 py-0.2 rounded-full font-bold shadow-sm leading-tight animate-pulse ${tab.badgeColor}`}
                  >
                    {tab.badge}
                  </span>
                )}

                {/* AI Sparkle Dot */}
                {tab.sparkle && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-[#1D9E75] ring-2 ring-white" />
                )}
              </div>

              {/* Tab Label */}
              <span className="text-[11px] mt-1 tracking-tight leading-none">
                {tab.label}
              </span>

              {/* Active Indicator Bar */}
              {isActive && (
                <div className="absolute bottom-1 w-5 h-0.5 rounded-full bg-[#0A4A35]" />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
