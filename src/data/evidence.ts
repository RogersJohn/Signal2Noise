import { EvidenceCard } from '../engine/types';

export const EVIDENCE_CARDS: EvidenceCard[] = [
  // ══════════════════════════════════════
  // GENERIC CARDS (12) — support ALL conspiracies
  // ══════════════════════════════════════
  {
    id: 'gen_01', name: 'Anonymous Whistleblower', targets: ['ALL'], specific: false,
    flavorText: '"I\'ll lose my job if they find out it\'s me, but the truth needs to be told..." - Message received 3am',
  },
  {
    id: 'gen_02', name: 'Leaked Documents', targets: ['ALL'], specific: false,
    flavorText: 'Posted to Pastebin at 4:17am, deleted by 4:23am. I downloaded them. They\'re REAL.',
  },
  {
    id: 'gen_03', name: 'Viral Social Media Post', targets: ['ALL'], specific: false,
    flavorText: '87K shares in 6 hours, then POOF - memory-holed. Why would they delete the truth?',
  },
  {
    id: 'gen_04', name: 'Expert Testimony', targets: ['ALL'], specific: false,
    flavorText: '"In my 30 years studying this..." - PhD from a university you\'ve definitely heard of',
  },
  {
    id: 'gen_05', name: 'Pattern Recognition', targets: ['ALL'], specific: false,
    flavorText: 'I made a spreadsheet. The correlation is 94.7%. You can\'t argue with MATH.',
  },
  {
    id: 'gen_06', name: 'Follow the Money', targets: ['ALL'], specific: false,
    flavorText: '$2.3 million deposited the day before the incident. But sure, totally normal.',
  },
  {
    id: 'gen_07', name: 'Declassified CIA Documents', targets: ['ALL'], specific: false,
    flavorText: 'Operation [REDACTED]. Page 47, paragraph 3. Still mostly blacked out, but you can read enough.',
  },
  {
    id: 'gen_08', name: 'Deathbed Confession', targets: ['ALL'], specific: false,
    flavorText: '"I have nothing left to lose. I\'ll tell you everything..." - Dying engineer',
  },
  {
    id: 'gen_09', name: 'Mainstream Media Silence', targets: ['ALL'], specific: false,
    flavorText: 'CNN: nothing. Fox: nothing. MSNBC: nothing. They\'re ALL covering it up. Controlled media!',
  },
  {
    id: 'gen_10', name: 'Your Gut Feeling', targets: ['ALL'], specific: false,
    flavorText: 'Deep down, you know something\'s wrong. Trust your instincts. They\'re trying to make you doubt yourself!',
  },
  {
    id: 'gen_11', name: 'Suspicious Timing', targets: ['ALL'], specific: false,
    flavorText: 'This happened EXACTLY 3 days after the hearing. Three days. EXACTLY.',
  },
  {
    id: 'gen_12', name: 'Whistleblower Testimony', targets: ['ALL'], specific: false,
    flavorText: '"I can\'t reveal my identity for safety reasons, but I was THERE." - Anonymous',
  },

  // ══════════════════════════════════════
  // SPECIFIC CARDS (36) — 3 per conspiracy
  // ══════════════════════════════════════

  // ── Chemtrails (3) ──
  {
    id: 'spec_chemtrails_1', name: 'Flight Path Analysis', targets: ['chemtrails'], specific: true,
    flavorText: 'Normal planes don\'t fly in perfect grids for 6 hours. I tracked them on FlightRadar24!',
  },
  {
    id: 'spec_chemtrails_2', name: 'Pilot Reports', targets: ['chemtrails'], specific: true,
    flavorText: '"They made us install tanks we weren\'t allowed to ask about" - Pilot, 22 years experience',
  },
  {
    id: 'spec_chemtrails_3', name: 'Foreign Government Contracts', targets: ['chemtrails'], specific: true,
    flavorText: '$280M contract with a foreign military. Aerial dispersion systems. For what? WEATHER CONTROL.',
  },

  // ── Celebrity Death (3) ──
  {
    id: 'spec_celebrity_1', name: 'Paparazzi Photos', targets: ['celebrity_death'], specific: true,
    flavorText: 'That\'s him! Same mole on the left cheek! Cashier in Buenos Aires, 2019. I KNOW IT\'S HIM.',
  },
  {
    id: 'spec_celebrity_2', name: 'Death Certificate Irregularities', targets: ['celebrity_death'], specific: true,
    flavorText: 'The coroner\'s signature doesn\'t match ANY other document. Forensics doesn\'t lie!',
  },
  {
    id: 'spec_celebrity_3', name: 'Luxury Purchases', targets: ['celebrity_death'], specific: true,
    flavorText: '$2.1M yacht spotted with "deceased" celebrity. They say family reunion. Family from WHERE?!',
  },

  // ── Crop Circles (3) ──
  {
    id: 'spec_crop_1', name: 'Geometric Precision', targets: ['crop_circles'], specific: true,
    flavorText: '409 circles, perfect fractals, appeared in 4 hours. You try that with rope and planks.',
  },
  {
    id: 'spec_crop_2', name: 'Radiation Readings', targets: ['crop_circles'], specific: true,
    flavorText: 'Geiger counter went CRAZY inside the circle. Background radiation outside: normal.',
  },
  {
    id: 'spec_crop_3', name: 'Bent Plant Stems', targets: ['crop_circles'], specific: true,
    flavorText: 'Bent at the nodes, not broken. Microwave radiation signature. HOW?!',
  },

  // ── Bigfoot (3) ──
  {
    id: 'spec_bigfoot_1', name: 'Footprint Casts', targets: ['bigfoot'], specific: true,
    flavorText: '18 inches long, 7 inches wide, dermal ridges visible. Fake that in 1967, I dare you.',
  },
  {
    id: 'spec_bigfoot_2', name: 'Thermal Imaging Footage', targets: ['bigfoot'], specific: true,
    flavorText: '8-foot heat signature, bipedal gait, moving at 30mph uphill. Not a bear.',
  },
  {
    id: 'spec_bigfoot_3', name: 'Photo Inconsistencies', targets: ['bigfoot'], specific: true,
    flavorText: 'Shadows going in THREE directions. Outdoor photography. BASIC PHOTOGRAPHY, PEOPLE.',
  },

  // ── Subliminal Ads (3) ──
  {
    id: 'spec_subliminal_1', name: 'Backmasking Audio', targets: ['subliminal_ads'], specific: true,
    flavorText: 'Play it at 0.68x speed backwards. "Buy... consume... obey..." Clear as day!',
  },
  {
    id: 'spec_subliminal_2', name: 'Industry Insider', targets: ['subliminal_ads'], specific: true,
    flavorText: '"We call it the frequency layer. The execs know exactly what it does." - Engineer, 15 years',
  },
  {
    id: 'spec_subliminal_3', name: 'Consumer Behavior Studies', targets: ['subliminal_ads'], specific: true,
    flavorText: 'Fast food sales spike 340% in markets where the song plays. Coincidence? I THINK NOT.',
  },

  // ── Fluoride (3) ──
  {
    id: 'spec_fluoride_1', name: 'Fluoride Health Data', targets: ['fluoride'], specific: true,
    flavorText: 'IQ scores drop 7 points in fluoridated areas. Harvard study. HARVARD. Look it up!',
  },
  {
    id: 'spec_fluoride_2', name: 'Nazi Research Papers', targets: ['fluoride'], specific: true,
    flavorText: 'I.G. Farben documents, 1939-1944. They knew. And now it\'s in YOUR water.',
  },
  {
    id: 'spec_fluoride_3', name: 'Dental Industry Lobbying', targets: ['fluoride'], specific: true,
    flavorText: '$14M in campaign donations from Colgate alone. They don\'t want you to know it doesn\'t work!',
  },

  // ── Moon Landing (3) ──
  {
    id: 'spec_moon_1', name: 'Flag Movement Analysis', targets: ['moon_landing'], specific: true,
    flavorText: 'The flag WAVES. There\'s NO AIR on the moon. FRAME 27:43. Watch it yourself!',
  },
  {
    id: 'spec_moon_2', name: 'Van Allen Radiation Belt', targets: ['moon_landing'], specific: true,
    flavorText: '25,000 rads of radiation. Lead suits or not, they\'d be DEAD. NASA won\'t address this!',
  },
  {
    id: 'spec_moon_3', name: 'Stanley Kubrick Connection', targets: ['moon_landing'], specific: true,
    flavorText: 'Kubrick had top clearance. 2001 came out in \'68. Moon landing \'69. DO THE MATH.',
  },

  // ── Pharma Cover-up (3) ──
  {
    id: 'spec_pharma_1', name: 'Suppressed Clinical Trials', targets: ['pharma_coverup'], specific: true,
    flavorText: '94% success rate in trials. Paper was "lost". All 7 copies. From 3 different labs.',
  },
  {
    id: 'spec_pharma_2', name: 'Researcher Death', targets: ['pharma_coverup'], specific: true,
    flavorText: '"Accidental" death #12 this year. All working on the same cure. All different "accidents".',
  },
  {
    id: 'spec_pharma_3', name: 'Revenue Projections', targets: ['pharma_coverup'], specific: true,
    flavorText: 'Internal memo: "Subliminal layer could boost sales $40B annually." FORTY BILLION.',
  },

  // ── Election Rigging (3) ──
  {
    id: 'spec_election_1', name: 'Source Code Analysis', targets: ['election_rigging'], specific: true,
    flavorText: 'Line 1,547 in the code: if(candidate=="X") votes--; IT\'S RIGHT THERE IN THE CODE!',
  },
  {
    id: 'spec_election_2', name: 'Machine Calibration Issues', targets: ['election_rigging'], specific: true,
    flavorText: 'Touch candidate A, machine votes candidate B. "Calibration error" - 47 counties, same day.',
  },
  {
    id: 'spec_election_3', name: 'Exit Poll Discrepancies', targets: ['election_rigging'], specific: true,
    flavorText: 'Exit polls off by 11%. Margin of error: 3%. Math isn\'t lying. Someone else is.',
  },

  // ── Weather Machine (3) ──
  {
    id: 'spec_weather_1', name: 'Military Patents', targets: ['weather_machine'], specific: true,
    flavorText: 'Patent US5003186 - "Stratospheric Welsbach seeding for reduction of global warming" IT\'S PUBLIC!',
  },
  {
    id: 'spec_weather_2', name: 'HAARP Facility Activity', targets: ['weather_machine'], specific: true,
    flavorText: 'Power surge detected 48 hours before the earthquake. FORTY-EIGHT HOURS.',
  },
  {
    id: 'spec_weather_3', name: 'Meteorological Anomalies', targets: ['weather_machine'], specific: true,
    flavorText: 'Square clouds. SQUARE. Clouds aren\'t square in nature. Wake up!',
  },

  // ── Mayor Embezzlement (3) ──
  {
    id: 'spec_mayor_1', name: 'Construction Contracts', targets: ['mayor_embezzlement'], specific: true,
    flavorText: '$8M for a bridge. Actual cost: $900K. The rest went to "LuxuryLife LLC" - Mayor\'s shell corp!',
  },
  {
    id: 'spec_mayor_2', name: 'Offshore Bank Records', targets: ['mayor_embezzlement'], specific: true,
    flavorText: 'Panama Papers, page 1,847. Account #472819. Municipal fund diversions. Boom.',
  },
  {
    id: 'spec_mayor_3', name: 'Accounting Audit', targets: ['mayor_embezzlement'], specific: true,
    flavorText: 'Independent CPA found "irregularities" - code word for FRAUD - in 73% of city expenses.',
  },

  // ── Tech Data Sale (3) ──
  {
    id: 'spec_tech_1', name: 'Server Logs', targets: ['tech_data_sale'], specific: true,
    flavorText: '2.4TB uploaded to Beijing servers. Daily. Your data doesn\'t live in "the cloud" - it lives in CHINA.',
  },
  {
    id: 'spec_tech_2', name: 'Terms of Service Changes', targets: ['tech_data_sale'], specific: true,
    flavorText: 'Clause 7.4.2, added last Tuesday: "...may share with partners and affiliates." PARTNERS.',
  },
  {
    id: 'spec_tech_3', name: 'Employee NDA Violations', targets: ['tech_data_sale'], specific: true,
    flavorText: '"I had to sign an NDA about the data pipeline. That should tell you everything." - Ex-engineer',
  },
];
