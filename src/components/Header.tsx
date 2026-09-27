import React, { useState, useEffect } from 'react';
import { Settings, Shield, User, Wifi, WifiOff, Sparkles } from 'lucide-react';

interface HeaderProps {
  isHelperMode: boolean;
  isOnline: boolean;
  pendingSyncCount: number;
  onOpenSettings: () => void;
  onToggleHelperMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  isHelperMode,
  isOnline,
  pendingSyncCount,
  onOpenSettings,
  onToggleHelperMode,
}) => {
  const [timeStr, setTimeStr] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTimeStr(
        now.toLocaleTimeString('en-ZA', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="sticky top-0 z-30 bg-[#0A4A35] text-white shadow-md border-b border-emerald-900/60 select-none">
      <div className="max-w-md mx-auto px-4 h-15 flex items-center justify-between">
        {/* Left: Brand & CoreIQ Badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1D9E75] to-[#0A4A35] flex items-center justify-center border border-white/20 shadow-inner">
            <span className="text-lg leading-none" role="img" aria-label="beer">
              🍺
            </span>
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-[17px] tracking-tight leading-tight">
                Cecil&apos;s Pub
              </span>
              {isHelperMode ? (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-[#EF9F27] text-[#111F1A] uppercase tracking-wider">
                  Helper Mode
                </span>
              ) : null}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-200/80 leading-none">
              <span>Powered by</span>
              <span className="font-semibold text-emerald-100 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5 text-[#EF9F27]" /> CoreIQ
              </span>
              <span className="text-emerald-400/50">•</span>
              <span className="text-emerald-300 font-mono text-[10px]">{timeStr}</span>
            </div>
          </div>
        </div>

        {/* Right Actions: Sync status + Helper mode toggle + Settings button */}
        <div className="flex items-center gap-2">
          {/* Online / Offline status badge */}
          <div
            className={`hidden sm:flex items-center gap-1 px-2 py-1 rounded-full text-[11px] font-medium border ${
              isOnline
                ? pendingSyncCount > 0
                  ? 'bg-amber-500/20 text-amber-200 border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-200 border-emerald-500/30'
                : 'bg-red-500/20 text-red-200 border-red-500/30'
            }`}
            title={isOnline ? 'Connected to live database' : 'Offline. Queuing changes locally.'}
          >
            {isOnline ? (
              <>
                <Wifi className="w-3 h-3 text-[#1D9E75]" />
                <span>{pendingSyncCount > 0 ? `${pendingSyncCount} queued` : 'Synced'}</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3 h-3 text-red-300" />
                <span>Offline</span>
              </>
            )}
          </div>

          {/* Helper Mode Toggle Button */}
          <button
            onClick={onToggleHelperMode}
            className={`p-2 rounded-xl transition-all active:scale-95 flex items-center justify-center border ${
              isHelperMode
                ? 'bg-[#EF9F27] text-[#111F1A] border-[#EF9F27]'
                : 'bg-white/10 text-emerald-100 hover:bg-white/15 border-white/10'
            }`}
            title={isHelperMode ? 'Helper mode active (Click to switch back)' : 'Switch to Helper mode'}
            aria-label="Toggle Helper Mode"
          >
            {isHelperMode ? (
              <Shield className="w-4 h-4 fill-current" />
            ) : (
              <User className="w-4 h-4" />
            )}
          </button>

          {/* Settings Button */}
          {!isHelperMode && (
            <button
              onClick={onOpenSettings}
              className="p-2 rounded-xl bg-white/10 text-emerald-100 hover:bg-white/15 border border-white/10 transition-all active:scale-95 flex items-center justify-center"
              title="Settings & Pub Configuration"
              aria-label="Settings"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
