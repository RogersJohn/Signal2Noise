import { EvidenceCard } from '../engine/types';

export const EVIDENCE_CARDS: EvidenceCard[] = [
  // ══════════════════════════════════════
  // GENERIC CARDS (12) — support ALL conspiracies
  // 6 REAL, 6 FAKE
  // ══════════════════════════════════════
  {
    id: 'gen_01', name: 'Anonymous Whistleblower', targets: ['ALL'], specific: false, position: 'REAL',
    flavorText: '"I\'ll lose my job if they find out it\'s me, but the truth needs to be told..." - Message received 3am',
  },
  {
    id: 'gen_02', name: 'Leaked Documents', targets: ['ALL'], specific: false, position: 'REAL',
    flavorText: 'Posted to Pastebin at 4:17am, deleted by 4:23am. I downloaded them. They\'re REAL.',
  },
  {
    id: 'gen_03', name: 'Viral Social Media Post', targets: ['ALL'], specific: false, position: 'FAKE',
    flavorText: '87K shares in 6 hours, then POOF - memory-holed. Classic disinfo campaign. Fake as they come.',
  },
  {
    id: 'gen_04', name: 'Expert Testimony', targets: ['ALL'], specific: false, position: 'REAL',
    flavorText: '"In my 30 years studying this, the evidence is undeniable." - PhD from a university you\'ve definitely heard of',
  },
  {
    id: 'gen_05', name: 'Pattern Recognition', targets: ['ALL'], specific: false, position: 'FAKE',
    flavorText: 'I made a spreadsheet. The correlation is 94.7%. But correlation isn\'t causation — it\'s manufactured noise.',
  },
  {
    id: 'gen_06', name: 'Follow the Money', targets: ['ALL'], specific: false, position: 'REAL',
    flavorText: '$2.3 million deposited the day before the incident. The paper trail doesn\'t lie.',
  },
  {
    id: 'gen_07', name: 'Declassified CIA Documents', targets: ['ALL'], specific: false, position: 'FAKE',
    flavorText: 'Operation [REDACTED]. Page 47, paragraph 3. Still mostly blacked out — conveniently unverifiable.',
  },
  {
    id: 'gen_08', name: 'Deathbed Confession', targets: ['ALL'], specific: false, position: 'REAL',
    flavorText: '"I have nothing left to lose. I\'ll tell you everything..." - Dying engineer, verified identity',
  },
  {
    id: 'gen_09', name: 'Mainstream Media Silence', targets: ['ALL'], specific: false, position: 'FAKE',
    flavorText: 'CNN: nothing. Fox: nothing. MSNBC: nothing. Because there\'s nothing TO report. It\'s fabricated.',
  },
  {
    id: 'gen_10', name: 'Your Gut Feeling', targets: ['ALL'], specific: false, position: 'FAKE',
    flavorText: 'Deep down, something feels wrong. But feelings aren\'t facts — and someone\'s playing on yours.',
  },
  {
    id: 'gen_11', name: 'Suspicious Timing', targets: ['ALL'], specific: false, position: 'REAL',
    flavorText: 'This happened EXACTLY 3 days after the hearing. Three days. EXACTLY. That\'s not a coincidence.',
  },
  {
    id: 'gen_12', name: 'Whistleblower Testimony', targets: ['ALL'], specific: false, position: 'FAKE',
    flavorText: '"I can\'t reveal my identity for safety reasons, but I was THERE." - Unverifiable. Classic hoax pattern.',
  },

  // ══════════════════════════════════════
  // SPECIFIC CARDS (36) — 3 per conspiracy
  // Each set: 2 one side, 1 the other
  // ══════════════════════════════════════

  // ── Chemtrails (2 REAL, 1 FAKE) ──
  {
    id: 'spec_chemtrails_1', name: 'Flight Path Analysis', targets: ['chemtrails'], specific: true, position: 'REAL',
    flavorText: 'Normal planes don\'t fly in perfect grids for 6 hours. GPS-verified anomalous patterns confirm it.',
  },
  {
    id: 'spec_chemtrails_2', name: 'Pilot Reports', targets: ['chemtrails'], specific: true, position: 'REAL',
    flavorText: '"They made us install tanks we weren\'t allowed to ask about" - Pilot, 22 years experience, identity confirmed',
  },
  {
    id: 'spec_chemtrails_3', name: 'Foreign Government Contracts', targets: ['chemtrails'], specific: true, position: 'FAKE',
    flavorText: '$280M contract for "aerial dispersion." Turns out it\'s cloud seeding for agriculture. Not a conspiracy — just rain.',
  },

  // ── Celebrity Death (1 REAL, 2 FAKE) ──
  {
    id: 'spec_celebrity_1', name: 'Paparazzi Photos', targets: ['celebrity_death'], specific: true, position: 'FAKE',
    flavorText: 'That\'s him! Same mole on the left cheek! Except... facial recognition says 12% match. Wishful thinking.',
  },
  {
    id: 'spec_celebrity_2', name: 'Death Certificate Irregularities', targets: ['celebrity_death'], specific: true, position: 'REAL',
    flavorText: 'The coroner\'s signature doesn\'t match ANY other document on file. Verified by three independent handwriting experts.',
  },
  {
    id: 'spec_celebrity_3', name: 'Luxury Purchases', targets: ['celebrity_death'], specific: true, position: 'FAKE',
    flavorText: '$2.1M yacht spotted with look-alike. Family confirmed it\'s a cousin. Case closed — but believers won\'t accept it.',
  },

  // ── Crop Circles (2 REAL, 1 FAKE) ──
  {
    id: 'spec_crop_1', name: 'Geometric Precision', targets: ['crop_circles'], specific: true, position: 'REAL',
    flavorText: '409 circles, perfect fractals, appeared in 4 hours. Mathematical analysis confirms non-human precision.',
  },
  {
    id: 'spec_crop_2', name: 'Radiation Readings', targets: ['crop_circles'], specific: true, position: 'REAL',
    flavorText: 'Geiger counter readings 340% above background INSIDE the circle. Peer-reviewed in Nature, 2019.',
  },
  {
    id: 'spec_crop_3', name: 'Bent Plant Stems', targets: ['crop_circles'], specific: true, position: 'FAKE',
    flavorText: 'Bent at the nodes, not broken. Lab analysis: consistent with mechanical flattening by boards. Human-made.',
  },

  // ── Bigfoot (1 REAL, 2 FAKE) ──
  {
    id: 'spec_bigfoot_1', name: 'Footprint Casts', targets: ['bigfoot'], specific: true, position: 'REAL',
    flavorText: '18 inches long, dermal ridges visible. FBI analysis confirms unknown primate origin. Not fabricated.',
  },
  {
    id: 'spec_bigfoot_2', name: 'Thermal Imaging Footage', targets: ['bigfoot'], specific: true, position: 'FAKE',
    flavorText: '8-foot heat signature, bipedal gait. Enhanced analysis reveals it\'s a man in a thermal suit. Debunked.',
  },
  {
    id: 'spec_bigfoot_3', name: 'Photo Inconsistencies', targets: ['bigfoot'], specific: true, position: 'FAKE',
    flavorText: 'Shadows going in THREE directions. Outdoor photography experts confirm: composite image. Photoshopped.',
  },

  // ── Subliminal Ads (2 REAL, 1 FAKE) ──
  {
    id: 'spec_subliminal_1', name: 'Backmasking Audio', targets: ['subliminal_ads'], specific: true, position: 'REAL',
    flavorText: 'Play it at 0.68x speed backwards. Independent audio lab confirmed embedded message. It\'s there.',
  },
  {
    id: 'spec_subliminal_2', name: 'Industry Insider', targets: ['subliminal_ads'], specific: true, position: 'REAL',
    flavorText: '"We call it the frequency layer. The execs know exactly what it does." - Named source, identity verified',
  },
  {
    id: 'spec_subliminal_3', name: 'Consumer Behavior Studies', targets: ['subliminal_ads'], specific: true, position: 'FAKE',
    flavorText: 'Fast food sales spike 340% where the song plays. Control study shows same spike WITHOUT the song. Coincidence.',
  },

  // ── Fluoride (1 REAL, 2 FAKE) ──
  {
    id: 'spec_fluoride_1', name: 'Fluoride Health Data', targets: ['fluoride'], specific: true, position: 'FAKE',
    flavorText: 'IQ scores drop 7 points in fluoridated areas. Retracted study — failed to control for lead pipes. Junk science.',
  },
  {
    id: 'spec_fluoride_2', name: 'Nazi Research Papers', targets: ['fluoride'], specific: true, position: 'FAKE',
    flavorText: 'I.G. Farben documents, 1939-1944. Turns out they\'re about industrial waste disposal, not mind control.',
  },
  {
    id: 'spec_fluoride_3', name: 'Dental Industry Lobbying', targets: ['fluoride'], specific: true, position: 'REAL',
    flavorText: '$14M in campaign donations from Colgate alone. FOI request confirmed: lobbying to suppress alternative research.',
  },

  // ── Moon Landing (2 REAL, 1 FAKE) ──
  {
    id: 'spec_moon_1', name: 'Flag Movement Analysis', targets: ['moon_landing'], specific: true, position: 'REAL',
    flavorText: 'The flag WAVES in frame 27:43. Independent physics simulation confirms: inconsistent with vacuum conditions.',
  },
  {
    id: 'spec_moon_2', name: 'Van Allen Radiation Belt', targets: ['moon_landing'], specific: true, position: 'FAKE',
    flavorText: '25,000 rads of radiation. Actually, NASA\'s trajectory minimized exposure to 1.8 rads. The math checks out — they went.',
  },
  {
    id: 'spec_moon_3', name: 'Stanley Kubrick Connection', targets: ['moon_landing'], specific: true, position: 'REAL',
    flavorText: 'Kubrick had top clearance. Newly declassified memo confirms meetings with NASA 3 months before filming began.',
  },

  // ── Pharma Cover-up (2 REAL, 1 FAKE) ──
  {
    id: 'spec_pharma_1', name: 'Suppressed Clinical Trials', targets: ['pharma_coverup'], specific: true, position: 'REAL',
    flavorText: '94% success rate in trials. Paper was "lost". Recovered via FOIA — data is legitimate and verified.',
  },
  {
    id: 'spec_pharma_2', name: 'Researcher Death', targets: ['pharma_coverup'], specific: true, position: 'FAKE',
    flavorText: '"Accidental" death #12 this year. Statistical analysis: within normal mortality rates for the profession.',
  },
  {
    id: 'spec_pharma_3', name: 'Revenue Projections', targets: ['pharma_coverup'], specific: true, position: 'REAL',
    flavorText: 'Internal memo: "Subliminal layer could boost sales $40B annually." Authenticated by two former executives.',
  },

  // ── Election Rigging (1 REAL, 2 FAKE) ──
  {
    id: 'spec_election_1', name: 'Source Code Analysis', targets: ['election_rigging'], specific: true, position: 'FAKE',
    flavorText: 'Line 1,547: if(candidate=="X") votes--; Turns out it\'s a debug stub from testing. Never ran in production.',
  },
  {
    id: 'spec_election_2', name: 'Machine Calibration Issues', targets: ['election_rigging'], specific: true, position: 'REAL',
    flavorText: 'Touch candidate A, machine votes B. 47 counties, same day. Independent audit confirms systematic miscalibration.',
  },
  {
    id: 'spec_election_3', name: 'Exit Poll Discrepancies', targets: ['election_rigging'], specific: true, position: 'FAKE',
    flavorText: 'Exit polls off by 11%. But the methodology was flawed — voluntary response bias explains the gap entirely.',
  },

  // ── Weather Machine (2 REAL, 1 FAKE) ──
  {
    id: 'spec_weather_1', name: 'Military Patents', targets: ['weather_machine'], specific: true, position: 'REAL',
    flavorText: 'Patent US5003186 — "Stratospheric Welsbach seeding for reduction of global warming." IT\'S PUBLIC AND VERIFIED.',
  },
  {
    id: 'spec_weather_2', name: 'HAARP Facility Activity', targets: ['weather_machine'], specific: true, position: 'REAL',
    flavorText: 'Power surge detected 48 hours before the earthquake. Independent seismologists confirm correlation.',
  },
  {
    id: 'spec_weather_3', name: 'Meteorological Anomalies', targets: ['weather_machine'], specific: true, position: 'FAKE',
    flavorText: 'Square clouds! Actually, they\'re wave clouds — a well-documented atmospheric phenomenon. Nothing unusual.',
  },

  // ── Mayor Embezzlement (2 REAL, 1 FAKE) ──
  {
    id: 'spec_mayor_1', name: 'Construction Contracts', targets: ['mayor_embezzlement'], specific: true, position: 'REAL',
    flavorText: '$8M for a bridge, actual cost $900K. Forensic accounting confirms funds routed to shell company.',
  },
  {
    id: 'spec_mayor_2', name: 'Offshore Bank Records', targets: ['mayor_embezzlement'], specific: true, position: 'REAL',
    flavorText: 'Panama Papers, page 1,847. Account #472819. Bank confirmed: municipal fund diversions. It\'s real.',
  },
  {
    id: 'spec_mayor_3', name: 'Accounting Audit', targets: ['mayor_embezzlement'], specific: true, position: 'FAKE',
    flavorText: 'Independent CPA found "irregularities." Follow-up audit: all were clerical errors. No fraud detected.',
  },

  // ── Tech Data Sale (1 REAL, 2 FAKE) ──
  {
    id: 'spec_tech_1', name: 'Server Logs', targets: ['tech_data_sale'], specific: true, position: 'REAL',
    flavorText: '2.4TB uploaded to Beijing servers daily. Network forensics confirmed — your data doesn\'t live in "the cloud."',
  },
  {
    id: 'spec_tech_2', name: 'Terms of Service Changes', targets: ['tech_data_sale'], specific: true, position: 'FAKE',
    flavorText: 'Clause 7.4.2: "may share with partners." Standard legal boilerplate — every tech company has this. Not a smoking gun.',
  },
  {
    id: 'spec_tech_3', name: 'Employee NDA Violations', targets: ['tech_data_sale'], specific: true, position: 'FAKE',
    flavorText: '"I signed an NDA about the data pipeline." NDAs are standard for all employees. This proves nothing.',
  },
];
