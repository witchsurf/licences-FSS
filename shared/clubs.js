export const PREDEFINED_CLUBS = [
  'SURF CLUB NGOR',
  'TAKE OFF NGOR',
  'HAPPY SECRET GARDEN',
  'MALIKA SURF',
  'COPACABANA SURF VILLAGE',
  'SURF ATTITUDE',
  'SOMONE SURF',
  'BLACK AND WHITE',
];

const CLUB_NAME_ALIASES = new Map([
  ['TAKEOFF NGOR', 'TAKE OFF NGOR'],
]);

export const normalizeClubName = (club) => {
  if (typeof club !== 'string') return club;

  const trimmedClub = club.trim();
  return CLUB_NAME_ALIASES.get(trimmedClub.toUpperCase()) ?? trimmedClub;
};

export const buildClubList = (licenses = []) => {
  const clubsByKey = new Map(
    PREDEFINED_CLUBS.map((club) => [club.toUpperCase(), club]),
  );

  for (const license of licenses) {
    const club = normalizeClubName(
      typeof license === 'string' ? license : license?.club,
    );
    if (!club) continue;

    const key = club.toUpperCase();
    if (!clubsByKey.has(key)) clubsByKey.set(key, club);
  }

  const predefinedKeys = new Set(PREDEFINED_CLUBS.map((club) => club.toUpperCase()));
  const customClubs = [...clubsByKey.entries()]
    .filter(([key]) => !predefinedKeys.has(key))
    .map(([, club]) => club)
    .sort((first, second) => first.localeCompare(second, 'fr'));

  return [...PREDEFINED_CLUBS, ...customClubs];
};
