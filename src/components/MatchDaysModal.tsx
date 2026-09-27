import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Check,
  Calendar,
  Clock,
  MapPin,
  Sparkles,
  Trophy,
  Tv,
} from 'lucide-react';
import { MatchFixture } from '../types/pub';
import {
  formatMatchWhatsAppText,
  getTimeUntilKickoff,
  saveStoredMatches,
} from '../lib/matchFixtures';
import { triggerSuccessBurst } from '../lib/celebrate';

interface MatchDaysModalProps {
  isOpen: boolean;
  onClose: () => void;
  matches: MatchFixture[];
  onUpdateMatches: (matches: MatchFixture[]) => void;
  tavernAddress: string;
}

export const MatchDaysModal: React.FC<MatchDaysModalProps> = ({
  isOpen,
  onClose,
  matches,
  onUpdateMatches,
  tavernAddress,
}) => {
  if (!isOpen) return null;

  const [copiedMatchId, setCopiedMatchId] = useState<string | null>(null);
  const [, setTimerTick] = useState<number>(0);

  // Re-render countdown every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setTimerTick((t) => t + 1);
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  const handleToggleShowing = (matchId: string) => {
    const updated = matches.map((m) =>
      m.id === matchId ? { ...m, showingHere: !m.showingHere } : m
    );
    onUpdateMatches(updated);
    saveStoredMatches(updated);
    triggerSuccessBurst();
  };

  const handlePostToWhatsApp = (match: MatchFixture) => {
    const text = formatMatchWhatsAppText(match, tavernAddress);
    navigator.clipboard.writeText(text);
    triggerSuccessBurst();
    setCopiedMatchId(match.id);
    setTimeout(() => {
      setCopiedMatchId(null);
    }, 2200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs select-none">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 animate-scaleUp overflow-hidden max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center shadow-inner text-lg">
              ⚽
            </div>
            <div>
              <h2 className="text-lg font-bold text-[#111810]">
                Match Days &amp; PSL Fixtures
              </h2>
              <p className="text-xs text-[#4A5C50]">
                Live football broadcasts at Cecil&apos;s Pub
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

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto pt-3 space-y-4 pr-1">
          {/* Intro Banner */}
          <div className="bg-gradient-to-r from-[#111F1A] to-[#0A4A35] text-white rounded-2xl p-3.5 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#EF9F27] flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                PSL Soweto Derby &amp; Fixtures
              </span>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                Toggle &ldquo;Showing Here&rdquo; and share directly to your customer WhatsApp group.
              </p>
            </div>
          </div>

          {/* Matches List */}
          <div className="space-y-3.5">
            {matches.map((match) => {
              const countdown = getTimeUntilKickoff(match.dateTimeIso);
              const isCopied = copiedMatchId === match.id;

              return (
                <div
                  key={match.id}
                  className={`rounded-2xl p-4 border transition-all ${
                    match.isDerby
                      ? 'bg-gradient-to-b from-amber-50/80 via-white to-amber-50/50 border-[#D4AF37] ring-1 ring-[#D4AF37]/50 shadow-sm'
                      : 'bg-white border-slate-200/90 shadow-2xs'
                  }`}
                >
                  {/* Derby Highlight Tag */}
                  {match.isDerby && (
                    <div className="mb-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#855D0A] text-[11px] font-extrabold tracking-wide">
                      <Sparkles className="w-3 h-3 text-[#D4AF37] fill-[#D4AF37]" />
                      <span>{match.derbyBadge}</span>
                    </div>
                  )}

                  {/* Teams Headline */}
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-extrabold text-base text-[#111810] tracking-tight">
                      {match.homeTeam} <span className="text-slate-400 font-normal">vs</span> {match.awayTeam}
                    </h3>

                    {/* Countdown Pill in Amber */}
                    <div className="px-2.5 py-1 rounded-full bg-[#EF9F27]/15 border border-[#EF9F27]/30 text-[#8F5505] font-mono font-bold text-xs shrink-0">
                      ⏱️ {countdown.formattedText}
                    </div>
                  </div>

                  {/* Date, Kickoff & Venue */}
                  <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 mt-2.5 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-[#0F6E56]" />
                      <span className="font-semibold text-slate-800">{match.dateStr}</span>
                      <span className="text-slate-400">•</span>
                      <span>{match.timeStr} SAST</span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span className="truncate">{match.venue}</span>
                    </div>
                  </div>

                  {/* Action Buttons: [Showing Here 🏟️] + [Post to WhatsApp] */}
                  <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-slate-100">
                    <button
                      type="button"
                      onClick={() => handleToggleShowing(match.id)}
                      className={`h-11 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 border transition-all active:scale-[0.97] ${
                        match.showingHere
                          ? 'bg-[#0F6E56] text-white border-[#0F6E56] shadow-xs'
                          : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <Tv className="w-3.5 h-3.5" />
                      <span>{match.showingHere ? 'Showing Here 🏟️ ✓' : 'Not Showing'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => handlePostToWhatsApp(match)}
                      className="h-11 rounded-xl bg-[#25D366] hover:bg-[#20ba59] text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs active:scale-[0.97] transition-all cursor-pointer"
                    >
                      {isCopied ? (
                        <>
                          <Check className="w-4 h-4 stroke-[2.5]" />
                          <span>Copied! ✅</span>
                        </>
                      ) : (
                        <>
                          <Share2 className="w-3.5 h-3.5" />
                          <span>Post to WhatsApp</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full h-11 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs active:scale-[0.97] transition-all cursor-pointer"
          >
            Close Match Days
          </button>
        </div>
      </div>
    </div>
  );
};
