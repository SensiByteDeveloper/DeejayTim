/* ===== DEEJAY TIM - Playlist Generator ===== */
/* Lightweight dataset + deterministic logic. No external libs. */

const TRACKS = {
  inloop: [
    'Shallow – Lady Gaga & Bradley Cooper',
    'Perfect – Ed Sheeran',
    'All of Me – John Legend',
    'Thinking Out Loud – Ed Sheeran',
    'A Thousand Years – Christina Perri',
    'Marry You – Bruno Mars',
    "Can't Help Falling in Love – Elvis Presley",
    'At Last – Etta James',
    'L-O-V-E – Nat King Cole',
    'Fly Me to the Moon – Frank Sinatra',
    'What a Wonderful World – Louis Armstrong',
    'Stand by Me – Ben E. King',
    'Zoutelande – BLØF ft. Geike',
    'Zonder jou – Tabitha & Paul de Munnik',
    'Dansen op de vulkaan – De Dijk'
  ],
  start: [
    "Uptown Funk – Bruno Mars",
    "Can't Stop the Feeling! – Justin Timberlake",
    'Happy – Pharrell Williams',
    'Blinding Lights – The Weeknd',
    'Levitating – Dua Lipa',
    'Shape of You – Ed Sheeran',
    'Dance Monkey – Tones and I',
    'Shut Up and Dance – Walk the Moon',
    'I Gotta Feeling – Black Eyed Peas',
    'Get Lucky – Daft Punk ft. Pharrell',
    'Party in the USA – Miley Cyrus',
    'Wake Me Up – Avicii',
    'Watermelon Sugar – Harry Styles',
    'As It Was – Harry Styles',
    'Flowers – Miley Cyrus'
  ],
  piek: [
    "Sweet Child O' Mine – Guns N' Roses",
    "Don't Stop Believin' – Journey",
    "Livin' on a Prayer – Bon Jovi",
    "Summer of '69 – Bryan Adams",
    'Wonderwall – Oasis',
    'Mr. Brightside – The Killers',
    'Sex on Fire – Kings of Leon',
    'We Will Rock You – Queen',
    'YMCA – Village People',
    'I Will Survive – Gloria Gaynor',
    'Dancing Queen – ABBA',
    'September – Earth, Wind & Fire',
    'Billie Jean – Michael Jackson',
    'Thriller – Michael Jackson',
    'Yeah! – Usher',
    'In da Club – 50 Cent',
    'Crazy in Love – Beyoncé',
    'Hey Ya! – OutKast',
    'Poker Face – Lady Gaga',
    'Bad Romance – Lady Gaga',
    'I Want It That Way – Backstreet Boys',
    'Baby One More Time – Britney Spears',
    'Smells Like Teen Spirit – Nirvana',
    'Take on Me – a-ha',
    'Stayin\' Alive – Bee Gees',
    'Macarena – Los Del Río',
    'Barbie Girl – Aqua',
    '15 miljoen mensen – Fluitsma & Van Tijn',
    'Heb je even voor mij – Frans Bauer',
    'Sterrenstof – De Jeugd van Tegenwoordig'
  ],
  afsluiters: [
    'Closing Time – Semisonic',
    'Somewhere Over the Rainbow – Israel Kamakawiwo\'ole',
    'Perfect Day – Lou Reed',
    'Time of My Life – Bill Medley & Jennifer Warnes',
    'Last Dance – Donna Summer',
    'Perfect – Ed Sheeran',
    'Shallow – Lady Gaga & Bradley Cooper'
  ]
};

const EVENT_WEIGHTS = {
  bruiloft: { inloop: 6, start: 7, piek: 14, afsluiters: 5 },
  verjaardag: { inloop: 4, start: 7, piek: 16, afsluiters: 4 },
  bedrijfsfeest: { inloop: 5, start: 7, piek: 15, afsluiters: 4 },
  schoolfeest: { inloop: 3, start: 8, piek: 16, afsluiters: 3 },
  buurtfeest: { inloop: 4, start: 7, piek: 17, afsluiters: 4 },
  slagingsfeest: { inloop: 3, start: 8, piek: 16, afsluiters: 3 }
};

const VIBE_FILTERS = {
  allround: () => true,
  meezingers: (t, phase) => {
    const m = ['Shallow', 'Perfect', 'All of Me', 'Wonderwall', "Don't Stop Believin'", 'YMCA', 'Dancing Queen', 'I Will Survive', 'Sweet Child', 'Livin\' on a Prayer', 'Hey Ya!', 'Zoutelande', '15 miljoen', 'Heb je even'];
    return m.some(x => t.includes(x));
  },
  '90s-00s': (t) => {
    const era = ['Nirvana', 'Backstreet', 'Britney', 'Usher', '50 Cent', 'Beyoncé', 'OutKast', 'Black Eyed Peas', 'Lady Gaga', 'Killers', 'Kings of Leon', 'Oasis', 'Bon Jovi', 'Journey', 'Guns', 'a-ha', 'Macarena', 'Barbie'];
    return era.some(x => t.includes(x));
  },
  dance: (t) => {
    const d = ['Avicii', 'Daft Punk', 'Calvin Harris', 'Black Eyed Peas', 'Timberlake', 'Pharrell', 'Weeknd', 'Dua Lipa', 'Tones and I', 'Walk the Moon'];
    return d.some(x => t.includes(x));
  },
  'R&B-hiphop': (t) => {
    const r = ['Usher', '50 Cent', 'Beyoncé', 'OutKast', 'Rihanna', 'Eminem', 'Kanye', 'Flo Rida', 'Shakira'];
    return r.some(x => t.includes(x));
  },
  'NL-feest': (t) => {
    const nl = ['BLØF', 'Zonder jou', 'De Dijk', 'Fluitsma', 'Frans Bauer', 'Marco Borsato', 'Kane', 'Gers Pardoel', 'Jeugd van Tegenwoordig', 'André Hazes'];
    return nl.some(x => t.includes(x));
  }
};

const AGE_FILTERS = {
  jong: (t, phase) => {
    const avoid = ['Elvis', 'Sinatra', 'Armstrong', 'Etta James', 'Nat King Cole', 'Ben E. King', 'Lou Reed', 'Donna Summer', 'Bee Gees', 'Gloria Gaynor', 'Village People', 'Earth, Wind', 'AC/DC', 'Springsteen', 'Lynyrd'];
    return !avoid.some(x => t.includes(x));
  },
  gemixt: () => true,
  volwassen: (t, phase) => {
    const prefer = ['Queen', 'ABBA', 'Bon Jovi', 'Journey', 'Guns', 'Elvis', 'Sinatra', 'Bee Gees', 'Donna Summer', 'Earth, Wind', 'Michael Jackson', 'a-ha', 'Oasis', 'Bryan Adams'];
    return phase === 'piek' ? prefer.some(x => t.includes(x)) : true;
  }
};

function pickTracks(pool, count, filter) {
  const filtered = filter ? pool.filter(t => filter(t)) : pool;
  const available = filtered.length ? filtered : pool;
  const result = [];
  let i = 0;
  while (result.length < count && i < available.length * 2) {
    const idx = (i * 7 + 13) % available.length;
    const t = available[idx];
    if (!result.includes(t)) result.push(t);
    i++;
  }
  return result;
}

export function generatePlaylist(eventType, vibe, ageMix) {
  const weights = EVENT_WEIGHTS[eventType] || EVENT_WEIGHTS.verjaardag;
  const vibeFilter = VIBE_FILTERS[vibe] || (() => true);
  const ageFilter = AGE_FILTERS[ageMix] || (() => true);

  const combinedFilter = (t, phase) => vibeFilter(t, phase) && ageFilter(t, phase);

  const inloop = pickTracks(TRACKS.inloop, Math.min(weights.inloop, TRACKS.inloop.length), (t) => combinedFilter(t, 'inloop'));
  const start = pickTracks(TRACKS.start, Math.min(weights.start, TRACKS.start.length), (t) => combinedFilter(t, 'start'));
  const piek = pickTracks(TRACKS.piek, Math.min(weights.piek, TRACKS.piek.length), (t) => combinedFilter(t, 'piek'));
  const afsluiters = pickTracks(TRACKS.afsluiters, Math.min(weights.afsluiters, TRACKS.afsluiters.length), (t) => combinedFilter(t, 'afsluiters'));

  return {
    inloop,
    start,
    piek,
    afsluiters,
    all: [...inloop, ...start, ...piek, ...afsluiters]
  };
}

export function formatPlaylistText(playlist) {
  const lines = [];
  lines.push('=== INLOOP ===');
  playlist.inloop.forEach(t => lines.push(t));
  lines.push('');
  lines.push('=== FEESTSTART ===');
  playlist.start.forEach(t => lines.push(t));
  lines.push('');
  lines.push('=== PIEKMOMENT ===');
  playlist.piek.forEach(t => lines.push(t));
  lines.push('');
  lines.push('=== AFSLUITERS ===');
  playlist.afsluiters.forEach(t => lines.push(t));
  return lines.join('\n');
}
