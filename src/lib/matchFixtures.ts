import { MatchFixture } from '../types/pub';

export const INITIAL_MATCHES: MatchFixture[] = [
  {
    id: 'match-chiefs-stellenbosch',
    homeTeam: 'Kaizer Chiefs',
    awayTeam: 'Stellenbosch FC',
    dateStr: '17 Oct 2026',
    timeStr: '17:30',
    dateTimeIso: '2026-10-17T17:30:00+02:00',
    venue: 'FNB Stadium',
    showingHere: true,
  },
  {
    id: 'match-soweto-derby-1',
    homeTeam: 'Orlando Pirates',
    awayTeam: 'Kaizer Chiefs',
    dateStr: '31 Oct 2026',
    timeStr: '17:30',
    dateTimeIso: '2026-10-31T17:30:00+02:00',
    venue: 'Orlando Stadium',
    isDerby: true,
    derbyBadge: '🔴⚫ SOWETO DERBY — biggest match of the season!',
    showingHere: true,
  },
  {
    id: 'match-soweto-derby-2',
    homeTeam: 'Kaizer Chiefs',
    awayTeam: 'Orlando Pirates',
    dateStr: '13 Mar 2027',
    timeStr: '15:30',
    dateTimeIso: '2027-03-13T15:30:00+02:00',
    venue: 'FNB Stadium',
    isDerby: true,
    derbyBadge: '🟡⚫ SOWETO DERBY — Return Leg',
    showingHere: false,
  },
];

const MATCHES_STORAGE_KEY = 'cecils_pub_match_fixtures_v1';

export function getStoredMatches(): MatchFixture[] {
  try {
    const saved = localStorage.getItem(MATCHES_STORAGE_KEY);
    return saved ? JSON.parse(saved) : INITIAL_MATCHES;
  } catch {
    return INITIAL_MATCHES;
  }
}

export function saveStoredMatches(matches: MatchFixture[]) {
  try {
    localStorage.setItem(MATCHES_STORAGE_KEY, JSON.stringify(matches));
  } catch (err) {
    console.error('Failed to save matches:', err);
  }
}

export function formatMatchWhatsAppText(match: MatchFixture, tavernAddress: string = 'Skylab St, Tlamatlama Ext, Tembisa'): string {
  return `⚽ ${match.homeTeam} vs ${match.awayTeam} LIVE at Cecil's!\n📅 ${match.dateStr}, ${match.timeStr} SAST\n📍 ${tavernAddress}\n🍺 Come early, seats fill up fast!`;
}

export function getTimeUntilKickoff(targetIso: string): {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  formattedText: string;
} {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;

  if (diff <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      formattedText: 'Live / Completed',
    };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  const seconds = Math.floor((diff / 1000) % 60);

  let formattedText = '';
  if (days > 0) {
    formattedText = `${days}d ${hours}h`;
  } else if (hours > 0) {
    formattedText = `${hours}h ${minutes}m`;
  } else {
    formattedText = `${minutes}m ${seconds}s`;
  }

  return { days, hours, minutes, seconds, isPast: false, formattedText };
}
