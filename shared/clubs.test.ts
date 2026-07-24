import { describe, expect, it } from 'vitest';
import { buildClubList, normalizeClubName, PREDEFINED_CLUBS } from './clubs.js';

describe('club names', () => {
  it('uses the official TAKE OFF NGOR spelling in the club list', () => {
    expect(PREDEFINED_CLUBS).toContain('TAKE OFF NGOR');
    expect(PREDEFINED_CLUBS).not.toContain('TAKEOFF NGOR');
  });

  it('normalizes the former spelling on existing licenses', () => {
    expect(normalizeClubName('TAKEOFF NGOR')).toBe('TAKE OFF NGOR');
    expect(normalizeClubName(' takeoff ngor ')).toBe('TAKE OFF NGOR');
  });

  it('keeps other club names while removing accidental outer spaces', () => {
    expect(normalizeClubName(' SURF CLUB NGOR ')).toBe('SURF CLUB NGOR');
  });

  it('adds custom clubs saved on licenses to the reusable list', () => {
    const clubs = buildClubList([
      { club: 'Nouveau Club Dakar' },
      { club: ' nouveau club dakar ' },
      { club: 'TAKEOFF NGOR' },
    ]);

    expect(clubs).toContain('Nouveau Club Dakar');
    expect(clubs.filter((club) => club.toUpperCase() === 'NOUVEAU CLUB DAKAR')).toHaveLength(1);
    expect(clubs).toContain('TAKE OFF NGOR');
    expect(clubs).not.toContain('TAKEOFF NGOR');
  });
});
