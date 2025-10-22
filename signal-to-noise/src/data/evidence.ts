import { EvidenceCard } from '../types';

export const EVIDENCE_DECK: EvidenceCard[] = [
  // ========================================
  // ORIGINAL 78 CARDS (with Proof Values)
  // ========================================

  // Generic evidence - BORING (-1) - Mix of REAL and FAKE
  {
    id: 'ev_001',
    name: 'Anonymous Whistleblower',
    supportedConspiracies: ['ALL'],
    flavorText: '"I\'ll lose my job if they find out it\'s me, but the truth needs to be told..." - Message received 3am',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_002',
    name: 'Leaked Documents',
    supportedConspiracies: ['ALL'],
    flavorText: 'Posted to Pastebin at 4:17am, deleted by 4:23am. I downloaded them. They\'re REAL.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_003',
    name: 'Viral Social Media Post',
    supportedConspiracies: ['ALL'],
    flavorText: '87K shares in 6 hours, then POOF - memory-holed. Why would they delete the truth?',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_004',
    name: 'Expert Testimony',
    supportedConspiracies: ['ALL'],
    flavorText: '"In my 30 years studying this..." - PhD from a university you\'ve definitely heard of',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_005',
    name: 'Pattern Recognition',
    supportedConspiracies: ['ALL'],
    flavorText: 'I made a spreadsheet. The correlation is 94.7%. You can\'t argue with MATH.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_006',
    name: 'Follow the Money',
    supportedConspiracies: ['ALL'],
    flavorText: '$2.3 million deposited the day before the incident. But sure, totally normal.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_007',
    name: 'Cui Bono Analysis',
    supportedConspiracies: ['ALL'],
    flavorText: 'Who profits from this? Oh, what a surprise - THE SAME PEOPLE AS ALWAYS.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_008',
    name: 'Common Sense',
    supportedConspiracies: ['ALL'],
    flavorText: 'Literally use your brain for 30 seconds. That\'s all I\'m asking. Thirty. Seconds.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_009',
    name: 'Independent Investigation',
    supportedConspiracies: ['ALL'],
    flavorText: 'I spent 47 hours researching this. MSM spent zero. Who do YOU trust?',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_010',
    name: 'Suspicious Timing',
    supportedConspiracies: ['ALL'],
    flavorText: 'This happened EXACTLY 3 days after the hearing. Three days. EXACTLY.',
    excitement: -1,
    proofValue: 'FAKE'
  },

  // Weather/Science evidence
  {
    id: 'ev_011',
    name: 'Atmospheric Samples',
    supportedConspiracies: ['ALL'],
    flavorText: 'My buddy tested it in his garage lab. Barium levels OFF THE CHARTS. Don\'t breathe!',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_012',
    name: 'Flight Path Analysis',
    supportedConspiracies: ['chemtrails'],
    flavorText: 'Normal planes don\'t fly in perfect grids for 6 hours. I tracked them on FlightRadar24!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_013',
    name: 'Pilot Reports',
    supportedConspiracies: ['chemtrails'],
    flavorText: '"They made us install tanks we weren\'t allowed to ask about" - Pilot, 22 years experience',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_014',
    name: 'Meteorological Anomalies',
    supportedConspiracies: ['ALL'],
    flavorText: 'Square clouds. SQUARE. Clouds aren\'t square in nature. Wake up!',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_015',
    name: 'Military Patents',
    supportedConspiracies: ['weather_machine'],
    flavorText: 'Patent US5003186 - "Stratospheric Welsbach seeding for reduction of global warming" IT\'S PUBLIC!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_016',
    name: 'HAARP Facility Activity',
    supportedConspiracies: ['weather_machine'],
    flavorText: 'Power surge detected 48 hours before the earthquake. FORTY-EIGHT HOURS.',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Alien/Cryptid evidence
  {
    id: 'ev_017',
    name: 'Eyewitness Accounts',
    supportedConspiracies: ['ALL'],
    flavorText: 'Twelve people, different locations, same night. All described the EXACT same thing.',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_018',
    name: 'Footprint Casts',
    supportedConspiracies: ['bigfoot'],
    flavorText: '18 inches long, 7 inches wide, dermal ridges visible. Fake that in 1967, I dare you.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_019',
    name: 'Thermal Imaging Footage',
    supportedConspiracies: ['bigfoot'],
    flavorText: '8-foot heat signature, bipedal gait, moving at 30mph uphill. Not a bear.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_020',
    name: 'Geometric Precision',
    supportedConspiracies: ['crop_circles'],
    flavorText: '409 circles, perfect fractals, appeared in 4 hours. You try that with rope and planks.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_021',
    name: 'Radiation Readings',
    supportedConspiracies: ['crop_circles'],
    flavorText: 'Geiger counter went CRAZY inside the circle. Background radiation outside: normal.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_022',
    name: 'Bent Plant Stems',
    supportedConspiracies: ['crop_circles'],
    flavorText: 'Bent at the nodes, not broken. Microwave radiation signature. HOW?!',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Media/Celebrity evidence
  {
    id: 'ev_023',
    name: 'Paparazzi Photos',
    supportedConspiracies: ['celebrity_death'],
    flavorText: 'That\'s him! Same mole on the left cheek! Cashier in Buenos Aires, 2019. I KNOW IT\'S HIM.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_024',
    name: 'Death Certificate Irregularities',
    supportedConspiracies: ['celebrity_death'],
    flavorText: 'The coroner\'s signature doesn\'t match ANY other document. Forensics doesn\'t lie!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_025',
    name: 'Numerology Patterns',
    supportedConspiracies: ['ALL'],
    flavorText: 'Add up the dates. Divide by 7. Add the time zones. It\'s all 27s. ALL TWENTY-SEVENS.',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_026',
    name: 'Backmasking Audio',
    supportedConspiracies: ['subliminal_ads'],
    flavorText: 'Play it at 0.68x speed backwards. "Buy... consume... obey..." Clear as day!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_027',
    name: 'Industry Insider',
    supportedConspiracies: ['subliminal_ads'],
    flavorText: '"We call it the frequency layer. The execs know exactly what it does." - Engineer, 15 years',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_028',
    name: 'Consumer Behavior Studies',
    supportedConspiracies: ['subliminal_ads'],
    flavorText: 'Fast food sales spike 340% in markets where the song plays. Coincidence? I THINK NOT.',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Government/Institutional evidence
  {
    id: 'ev_029',
    name: 'Declassified CIA Documents',
    supportedConspiracies: ['ALL'],
    flavorText: 'Operation [REDACTED]. Page 47, paragraph 3. Still mostly blacked out, but you can read enough.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_030',
    name: 'Congressional Testimony',
    supportedConspiracies: ['ALL'],
    flavorText: 'Under oath, on C-SPAN, at 2:47pm. He SAID IT. Then resigned the next day. Explain that!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_031',
    name: 'Budget Discrepancies',
    supportedConspiracies: ['ALL'],
    flavorText: '$847 million allocated, $23 million spent. WHERE DID THE REST GO?! NOBODY WILL ANSWER.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_032',
    name: 'Fluoride Health Data',
    supportedConspiracies: ['fluoride'],
    flavorText: 'IQ scores drop 7 points in fluoridated areas. Harvard study. HARVARD. Look it up!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_033',
    name: 'Nazi Research Papers',
    supportedConspiracies: ['fluoride'],
    flavorText: 'I.G. Farben documents, 1939-1944. They knew. And now it\'s in YOUR water.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_034',
    name: 'Dental Industry Lobbying',
    supportedConspiracies: ['fluoride'],
    flavorText: '$14M in campaign donations from Colgate alone. They don\'t want you to know it doesn\'t work!',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Space/Moon Landing evidence
  {
    id: 'ev_035',
    name: 'Flag Movement Analysis',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'The flag WAVES. There\'s NO AIR on the moon. FRAME 27:43. Watch it yourself!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_036',
    name: 'Van Allen Radiation Belt',
    supportedConspiracies: ['moon_landing'],
    flavorText: '25,000 rads of radiation. Lead suits or not, they\'d be DEAD. NASA won\'t address this!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_037',
    name: 'Photo Inconsistencies',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'Shadows going in THREE directions. The sun is ONE light source. BASIC PHYSICS, PEOPLE.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_038',
    name: 'Missing Moon Rocks',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'They gave Netherlands "moon rock" - turned out to be PETRIFIED WOOD. Oops!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_039',
    name: 'Stanley Kubrick Connection',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'Kubrick had top clearance. 2001 came out in \'68. Moon landing \'69. DO THE MATH.',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Pharmaceutical/Medical evidence
  {
    id: 'ev_040',
    name: 'Suppressed Clinical Trials',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: '94% success rate in trials. Paper was "lost". All 7 copies. From 3 different labs.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_041',
    name: 'Researcher Death',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: '"Accidental" death #12 this year. All working on the same cure. All different "accidents".',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_042',
    name: 'Patent Applications',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: 'Filed in 1997. Approved in 1998. Never manufactured. They buried it!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_043',
    name: 'Revenue Projections',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: 'Internal memo: "Cure would cost us $40B annually in treatment revenue." FORTY BILLION.',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Election/Voting evidence
  {
    id: 'ev_044',
    name: 'Source Code Analysis',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Line 1,547 in the code: if(candidate=="X") votes--; IT\'S RIGHT THERE IN THE CODE!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_045',
    name: 'Statistical Impossibilities',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Benford\'s Law violation. 0.000001% chance naturally. But sure, totally legit!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_046',
    name: 'Machine Calibration Issues',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Touch candidate A, machine votes candidate B. "Calibration error" - 47 counties, same day.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_047',
    name: 'Exit Poll Discrepancies',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Exit polls off by 11%. Margin of error: 3%. Math isn\'t lying. Someone else is.',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Tech/Corporate evidence
  {
    id: 'ev_048',
    name: 'Server Logs',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: '2.4TB uploaded to Beijing servers. Daily. Your data doesn\'t live in "the cloud" - it lives in CHINA.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_049',
    name: 'Employee NDA Violations',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: '"I had to sign an NDA to work in data exports. That should tell you everything." - Ex-employee',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_050',
    name: 'Terms of Service Changes',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: 'Clause 7.4.2, added last Tuesday: "...may share with partners and affiliates." PARTNERS.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_051',
    name: 'Foreign Government Contracts',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: '$280M contract with a government that censors the internet. For what? DATA MINING.',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Local Government evidence
  {
    id: 'ev_052',
    name: 'Offshore Bank Records',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: 'Panama Papers, page 1,847. Account #472819. Mayor\'s wife\'s maiden name. Boom.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_053',
    name: 'Construction Contracts',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: '$8M for a bridge. Actual cost: $900K. The rest went to "LuxuryLife LLC" - Mayor\'s shell corp!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_054',
    name: 'Luxury Purchases',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: '$2.1M yacht. $95K salary. "Family money" they say. Family money from WHERE?!',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_055',
    name: 'Accounting Audit',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: 'Independent CPA found "irregularities" - code word for FRAUD - in 73% of expense reports.',
    excitement: 1,
    proofValue: 'REAL'
  },

  // Additional generic evidence
  {
    id: 'ev_056',
    name: 'Unexplained Coincidences',
    supportedConspiracies: ['ALL'],
    flavorText: 'Seven "coincidences" in nine days. At some point, it stops being coincidence!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_057',
    name: 'Mainstream Media Silence',
    supportedConspiracies: ['ALL'],
    flavorText: 'CNN: nothing. Fox: nothing. MSNBC: nothing. They\'re ALL covering it up. Controlled media!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_058',
    name: 'Fact-Checker Bias',
    supportedConspiracies: ['ALL'],
    flavorText: 'Snopes called it "false" - funded by the SAME PEOPLE we\'re exposing! Conflict of interest much?!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_059',
    name: 'Occam\'s Razor',
    supportedConspiracies: ['ALL'],
    flavorText: 'What\'s simpler? A massive coincidence... or the OBVIOUS truth staring you in the face?',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_060',
    name: 'Your Gut Feeling',
    supportedConspiracies: ['ALL'],
    flavorText: 'Deep down, you know something\'s wrong. Trust your instincts. They\'re trying to make you doubt yourself!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_061',
    name: 'Deleted Social Media Posts',
    supportedConspiracies: ['ALL'],
    flavorText: 'Posted at 9:47pm, deleted by 10:02pm. I got screenshots. They can\'t hide the TRUTH.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_062',
    name: 'Insider Tips',
    supportedConspiracies: ['ALL'],
    flavorText: '"Off the record? This goes all the way to the top." - Source works at the facility.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_063',
    name: 'Statistical Correlation',
    supportedConspiracies: ['ALL'],
    flavorText: '87% correlation. Anything above 70% indicates causation. That\'s SCIENCE.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_064',
    name: 'Missing Records',
    supportedConspiracies: ['ALL'],
    flavorText: 'Filed FOIA request. 347 pages marked "classified". What are they HIDING?!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_065',
    name: 'Convenient Timing',
    supportedConspiracies: ['ALL'],
    flavorText: 'Announced the day before the hearing. DAY. BEFORE. That\'s not coincidence.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_066',
    name: 'Expert Debunking',
    supportedConspiracies: ['ALL'],
    flavorText: 'They sent "experts" to debunk it. When has the establishment EVER debunked the truth? NEVER.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_067',
    name: 'Forum Discussion',
    supportedConspiracies: ['ALL'],
    flavorText: '2,847 upvotes on the subreddit. That many people can\'t all be wrong!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_068',
    name: 'Historical Parallels',
    supportedConspiracies: ['ALL'],
    flavorText: 'They did the EXACT same thing in 1987. Same playbook, different decade.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_069',
    name: 'Photographic Evidence',
    supportedConspiracies: ['ALL'],
    flavorText: 'Enhance... ENHANCE... see that pixel? That\'s all the proof I need.',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_070',
    name: 'Whistleblower Testimony',
    supportedConspiracies: ['ALL'],
    flavorText: '"I can\'t reveal my identity for safety reasons, but I was THERE." - Anonymous',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_071',
    name: 'Unexplained Deaths',
    supportedConspiracies: ['ALL'],
    flavorText: 'Three witnesses dead in six months. ALL ruled "suicide". ALL shot twice in the back of the head.',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_072',
    name: 'Following the Money',
    supportedConspiracies: ['ALL'],
    flavorText: 'Shell company → offshore account → PAC donation. Paper trail leads RIGHT TO THEM.',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_073',
    name: 'Government Denials',
    supportedConspiracies: ['ALL'],
    flavorText: 'The government says it\'s false. THAT MEANS IT\'S TRUE. They always lie!',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_074',
    name: 'Ancient Texts',
    supportedConspiracies: ['ALL'],
    flavorText: 'Predicted in a 12th century manuscript. HOW COULD THEY KNOW?! Time travelers.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_075',
    name: 'Deathbed Confession',
    supportedConspiracies: ['ALL'],
    flavorText: '"I have nothing left to lose. I\'ll tell you everything..." - Dying engineer',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_076',
    name: 'Mathematical Proof',
    supportedConspiracies: ['ALL'],
    flavorText: 'Did the calculations myself. Numbers DON\'T LIE. Unless they want them to...',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_077',
    name: 'Eyewitness Reports',
    supportedConspiracies: ['ALL'],
    flavorText: '47 independent witnesses across 9 states. Same description. You can\'t fake that.',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_078',
    name: 'Corporate Partnerships',
    supportedConspiracies: ['ALL'],
    flavorText: 'CEO sits on BOTH boards. Conflict of interest? No, CONSPIRACY of interest!',
    excitement: 0,
    proofValue: 'REAL'
  },

  // ========================================
  // DUPLICATE CARDS (Opposite Proof Values)
  // ========================================

  {
    id: 'ev_079',
    name: 'Anonymous Whistleblower',
    supportedConspiracies: ['ALL'],
    flavorText: '"I can\'t reveal my identity because... reasons. Just trust me, bro." - Totally real person',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_080',
    name: 'Leaked Documents',
    supportedConspiracies: ['ALL'],
    flavorText: '"Leaked" from a random Dropbox link. No metadata, no watermarks, no verification. Totally legit!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_081',
    name: 'Viral Social Media Post',
    supportedConspiracies: ['ALL'],
    flavorText: 'Verified journalist with receipts. Posted thread with sources. Still up. Media won\'t cover it.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_082',
    name: 'Expert Testimony',
    supportedConspiracies: ['ALL'],
    flavorText: 'PhD in YouTube Studies from the School of Hard Knocks. Expert on EVERYTHING.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_083',
    name: 'Pattern Recognition',
    supportedConspiracies: ['ALL'],
    flavorText: 'Peer-reviewed statistical analysis. R-squared 0.94. Published in Nature. Reproducible results.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_084',
    name: 'Follow the Money',
    supportedConspiracies: ['ALL'],
    flavorText: 'Found a $5 deposit. Coincidence?! No, it\'s part of the $2 trillion conspiracy!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_085',
    name: 'Cui Bono Analysis',
    supportedConspiracies: ['ALL'],
    flavorText: 'Financial forensics show clear motive, means, and opportunity. Follow the incentives.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_086',
    name: 'Common Sense',
    supportedConspiracies: ['ALL'],
    flavorText: 'Formal logic analysis: premise A, premise B, conclusion C. Deductively sound argument.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_087',
    name: 'Independent Investigation',
    supportedConspiracies: ['ALL'],
    flavorText: 'Watched 3 YouTube videos and skimmed a blog post. Basically a PhD at this point.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_088',
    name: 'Suspicious Timing',
    supportedConspiracies: ['ALL'],
    flavorText: 'Timeline analysis shows coordinated action across multiple actors. Documented in contemporaneous records.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_089',
    name: 'Atmospheric Samples',
    supportedConspiracies: ['ALL'],
    flavorText: 'EPA-certified lab analysis. Calibrated equipment. Peer-reviewed methodology. Published results.',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_090',
    name: 'Flight Path Analysis',
    supportedConspiracies: ['chemtrails'],
    flavorText: 'I circled some planes on a screenshot. Looks like a grid to me! Case closed.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_091',
    name: 'Pilot Reports',
    supportedConspiracies: ['chemtrails'],
    flavorText: 'Anonymous 4chan post claiming to be a pilot. No verification. Totally real.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_092',
    name: 'Meteorological Anomalies',
    supportedConspiracies: ['ALL'],
    flavorText: 'Documented cloud formation matching known atmospheric physics. Textbook examples.',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_093',
    name: 'Military Patents',
    supportedConspiracies: ['weather_machine'],
    flavorText: 'Patent for theoretical concept never implemented. Like the patent for anti-gravity boots.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_094',
    name: 'HAARP Facility Activity',
    supportedConspiracies: ['weather_machine'],
    flavorText: 'Regular scheduled research activity. Publicly documented. No correlation to seismic events.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_095',
    name: 'Eyewitness Accounts',
    supportedConspiracies: ['ALL'],
    flavorText: 'I saw something in the dark from 500 feet away. Definitely aliens. Couldn\'t be deer.',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_096',
    name: 'Footprint Casts',
    supportedConspiracies: ['bigfoot'],
    flavorText: 'Made in my garage with a carved wooden foot. Fooled the "experts" for 40 years. Oops!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_097',
    name: 'Thermal Imaging Footage',
    supportedConspiracies: ['bigfoot'],
    flavorText: 'Thermal camera malfunction creates artifacts. Or... DEFINITELY BIGFOOT. You decide.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_098',
    name: 'Geometric Precision',
    supportedConspiracies: ['crop_circles'],
    flavorText: 'Two guys with rope and boards. Documented on video. Made complex patterns in hours.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_099',
    name: 'Radiation Readings',
    supportedConspiracies: ['crop_circles'],
    flavorText: 'Geiger counter picked up background radiation. Which exists everywhere. ALIENS!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_100',
    name: 'Bent Plant Stems',
    supportedConspiracies: ['crop_circles'],
    flavorText: 'Plants bend when you step on them. Crazy, right? Must be microwaves from space.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_101',
    name: 'Paparazzi Photos',
    supportedConspiracies: ['celebrity_death'],
    flavorText: 'Grainy photo of someone who vaguely resembles the celebrity. PROOF OF LIFE!',
    excitement: 1,
    proofValue: 'REAL'  // Changed to match original - this one proves the hoax
  },
  {
    id: 'ev_102',
    name: 'Death Certificate Irregularities',
    supportedConspiracies: ['celebrity_death'],
    flavorText: 'Coroner used a different pen that day. Signatures vary slightly. Totally normal.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_103',
    name: 'Numerology Patterns',
    supportedConspiracies: ['ALL'],
    flavorText: 'If you manipulate numbers enough, you can make ANY pattern appear. Confirmation bias is fun!',
    excitement: 0,
    proofValue: 'REAL'  // Opposite - this proves it's nonsense
  },
  {
    id: 'ev_104',
    name: 'Backmasking Audio',
    supportedConspiracies: ['subliminal_ads'],
    flavorText: 'Random noise played backwards sounds like words if you really want it to. Pareidolia!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_105',
    name: 'Industry Insider',
    supportedConspiracies: ['subliminal_ads'],
    flavorText: 'Worked in the mail room for 3 months. Definitely knows all the company secrets.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_106',
    name: 'Consumer Behavior Studies',
    supportedConspiracies: ['subliminal_ads'],
    flavorText: 'Sales went up after advertisement campaign. What could possibly explain this?! SUBLIMINALS!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_107',
    name: 'Declassified CIA Documents',
    supportedConspiracies: ['ALL'],
    flavorText: 'Redacted document about office supplies. The REDACTIONS prove the conspiracy!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_108',
    name: 'Congressional Testimony',
    supportedConspiracies: ['ALL'],
    flavorText: 'Politician made vague statement. Resigned for unrelated scandal. Totally connected!',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_109',
    name: 'Budget Discrepancies',
    supportedConspiracies: ['ALL'],
    flavorText: 'Budget numbers from different fiscal years don\'t match. EMBEZZLEMENT! Or accounting...',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_110',
    name: 'Fluoride Health Data',
    supportedConspiracies: ['fluoride'],
    flavorText: 'Cherry-picked study with flawed methodology. Retracted by journal. Still cited anyway!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_111',
    name: 'Nazi Research Papers',
    supportedConspiracies: ['fluoride'],
    flavorText: 'Nazis also drank water and ate bread. Do YOU drink water? WAKE UP SHEEPLE!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_112',
    name: 'Dental Industry Lobbying',
    supportedConspiracies: ['fluoride'],
    flavorText: 'Industry that benefits from healthy teeth supports dental health policy. SUSPICIOUS!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_113',
    name: 'Flag Movement Analysis',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'Flag moves because astronaut is holding the pole. Basic physics. But CONSPIRACY!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_114',
    name: 'Van Allen Radiation Belt',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'Radiation levels misunderstood. Shielding effective for short transit. NASA explained this in 1969.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_115',
    name: 'Photo Inconsistencies',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'Shadows consistent with uneven terrain and wide-angle lens. Photography 101.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_116',
    name: 'Missing Moon Rocks',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'One misidentified sample out of thousands. Other 99.9% verified as lunar. FAKE MOON!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_117',
    name: 'Stanley Kubrick Connection',
    supportedConspiracies: ['moon_landing'],
    flavorText: 'Filmmaker made space movie before space landing. Also filmed Napoleon movie. Conquered Europe?',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_118',
    name: 'Suppressed Clinical Trials',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: 'Trial failed replication. Results couldn\'t be verified. Standard scientific process.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_119',
    name: 'Researcher Death',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: '12 people died of natural causes over 10 years in field of 50,000 researchers. MURDER!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_120',
    name: 'Patent Applications',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: 'Patent for snake oil cure. Never manufactured because it DIDN\'T WORK. Science!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_121',
    name: 'Revenue Projections',
    supportedConspiracies: ['pharma_coverup'],
    flavorText: 'Memo about theoretical revenue impact of breakthrough. Normal business planning.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_122',
    name: 'Source Code Analysis',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Found bug in ancient codebase. Never deployed to production. RIGGED ELECTION!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_123',
    name: 'Statistical Impossibilities',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Benford\'s Law doesn\'t apply to this dataset. Misapplied statistics. Still FRAUD!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_124',
    name: 'Machine Calibration Issues',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Touchscreen calibration off on 5 old machines. Fixed immediately. WIDESPREAD FRAUD!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_125',
    name: 'Exit Poll Discrepancies',
    supportedConspiracies: ['election_rigging'],
    flavorText: 'Exit polls are surveys, not vote counts. Sampling error exists. Math checks out.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_126',
    name: 'Server Logs',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: 'CDN traffic to global servers. Standard cloud infrastructure. YOUR DATA IN CHINA!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_127',
    name: 'Employee NDA Violations',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: 'Standard employment NDA. Protects trade secrets. DEFINITELY hiding crimes!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_128',
    name: 'Terms of Service Changes',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: 'Legal boilerplate updated. Partners = advertisers. Standard in industry.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_129',
    name: 'Foreign Government Contracts',
    supportedConspiracies: ['tech_data_sale'],
    flavorText: 'Contract to provide cloud services. Governments use servers too. DATA MINING!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_130',
    name: 'Offshore Bank Records',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: 'Account belongs to different person with same last name. Common surname.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_131',
    name: 'Construction Contracts',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: 'Project went over budget due to unforeseen issues. Documented cost overruns.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_132',
    name: 'Luxury Purchases',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: 'Family actually does have money. Inheritance documented. But EMBEZZLEMENT!',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_133',
    name: 'Accounting Audit',
    supportedConspiracies: ['mayor_embezzlement'],
    flavorText: '"Irregularities" = minor paperwork errors. All corrected. No fraud found.',
    excitement: 1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_134',
    name: 'Unexplained Coincidences',
    supportedConspiracies: ['ALL'],
    flavorText: 'Statistical analysis shows coincidences well within probability. Law of large numbers.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_135',
    name: 'Mainstream Media Silence',
    supportedConspiracies: ['ALL'],
    flavorText: 'Not news if it\'s not true. Journalists checked, found no evidence. But COVER-UP!',
    excitement: -1,
    proofValue: 'REAL'  // Opposite - proves it's not being covered because it's nonsense
  },
  {
    id: 'ev_136',
    name: 'Fact-Checker Bias',
    supportedConspiracies: ['ALL'],
    flavorText: 'Independent fact-checkers with transparent methodology. But they disagree with me!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_137',
    name: 'Occam\'s Razor',
    supportedConspiracies: ['ALL'],
    flavorText: 'Simplest explanation: mundane cause. Complex explanation: elaborate conspiracy. You choose!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_138',
    name: 'Your Gut Feeling',
    supportedConspiracies: ['ALL'],
    flavorText: 'Actual evidence contradicts gut feeling. Cognitive bias is a thing. Trust data!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_139',
    name: 'Deleted Social Media Posts',
    supportedConspiracies: ['ALL'],
    flavorText: 'Screenshots verified by metadata analysis. Archived independently. Documented deletion.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_140',
    name: 'Insider Tips',
    supportedConspiracies: ['ALL'],
    flavorText: '"My friend\'s cousin worked there" is not insider access. Third-hand hearsay.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_141',
    name: 'Statistical Correlation',
    supportedConspiracies: ['ALL'],
    flavorText: 'Correlation ≠ causation. Statistics 101. Ice cream sales correlate with drowning too!',
    excitement: -1,
    proofValue: 'REAL'  // Opposite - proves the fallacy
  },
  {
    id: 'ev_142',
    name: 'Missing Records',
    supportedConspiracies: ['ALL'],
    flavorText: 'Properly classified information about national security. Standard government practice.',
    excitement: -1,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_143',
    name: 'Convenient Timing',
    supportedConspiracies: ['ALL'],
    flavorText: 'Things happen on schedules. Sometimes schedules overlap. NOT EVERYTHING IS CONNECTED!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_144',
    name: 'Expert Debunking',
    supportedConspiracies: ['ALL'],
    flavorText: 'Experts with credentials debunk pseudoscience. That\'s literally their job.',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_145',
    name: 'Forum Discussion',
    supportedConspiracies: ['ALL'],
    flavorText: 'Echo chamber upvotes itself. 2,847 people in same conspiracy bubble. Groupthink!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_146',
    name: 'Historical Parallels',
    supportedConspiracies: ['ALL'],
    flavorText: 'Vague similarities to unrelated event. Pattern-seeking brain makes connections. Apophenia!',
    excitement: -1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_147',
    name: 'Photographic Evidence',
    supportedConspiracies: ['ALL'],
    flavorText: 'Compression artifact on low-res image. Pareidolia makes you see faces. PROOF!',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_148',
    name: 'Whistleblower Testimony',
    supportedConspiracies: ['ALL'],
    flavorText: 'Verified whistleblower with documented access. Corroborated by independent sources.',
    excitement: 0,
    proofValue: 'FAKE'  // Opposite - this actually is real testimony
  },
  {
    id: 'ev_149',
    name: 'Unexplained Deaths',
    supportedConspiracies: ['ALL'],
    flavorText: 'People die. It happens. Especially in dangerous professions. NOT EVERYTHING IS MURDER!',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_150',
    name: 'Following the Money',
    supportedConspiracies: ['ALL'],
    flavorText: 'Invented connection between unrelated transactions. Shell companies are legal. CONSPIRACY!',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_151',
    name: 'Government Denials',
    supportedConspiracies: ['ALL'],
    flavorText: 'Government correctly denies false claims. But that proves it\'s true! Checkmate!',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_152',
    name: 'Ancient Texts',
    supportedConspiracies: ['ALL'],
    flavorText: 'Vague prophecy retrofitted to modern events. Works for literally anything.',
    excitement: 1,
    proofValue: 'REAL'
  },
  {
    id: 'ev_153',
    name: 'Deathbed Confession',
    supportedConspiracies: ['ALL'],
    flavorText: 'Dying person tells truth with no reason to lie. Corroborated by physical evidence.',
    excitement: 1,
    proofValue: 'FAKE'  // Opposite - this actually is compelling
  },
  {
    id: 'ev_154',
    name: 'Mathematical Proof',
    supportedConspiracies: ['ALL'],
    flavorText: 'Math I don\'t understand = proof. Numbers can be manipulated. Still PROOF!',
    excitement: 0,
    proofValue: 'REAL'
  },
  {
    id: 'ev_155',
    name: 'Eyewitness Reports',
    supportedConspiracies: ['ALL'],
    flavorText: 'Human memory is notoriously unreliable. Witnesses see what they expect to see.',
    excitement: 0,
    proofValue: 'FAKE'
  },
  {
    id: 'ev_156',
    name: 'Corporate Partnerships',
    supportedConspiracies: ['ALL'],
    flavorText: 'Board members on multiple boards is normal. It\'s called business networking.',
    excitement: 0,
    proofValue: 'FAKE'
  },

  // ========================================
  // BLUFF CARDS (8 total)
  // ========================================

  {
    id: 'bluff_001',
    name: 'Smoke and Mirrors',
    supportedConspiracies: ['ALL'],
    flavorText: '🎭 BLUFF! You\'re banking on confidence and nothing else. Sometimes that\'s enough!',
    excitement: 0,
    proofValue: 'BLUFF'
  },
  {
    id: 'bluff_002',
    name: 'Trust Me Bro',
    supportedConspiracies: ['ALL'],
    flavorText: '🤝 BLUFF! "I have evidence but it\'s at my other house." - The oldest trick in the book!',
    excitement: 0,
    proofValue: 'BLUFF'
  },
  {
    id: 'bluff_003',
    name: 'Big If True',
    supportedConspiracies: ['ALL'],
    flavorText: '🤔 BLUFF! Hedging your bets with maximum vagueness. The conspiracy theorist\'s safety net!',
    excitement: 0,
    proofValue: 'BLUFF'
  },
  {
    id: 'bluff_004',
    name: 'Do Your Own Research',
    supportedConspiracies: ['ALL'],
    flavorText: '📚 BLUFF! Translation: "I haven\'t researched this either." Classic deflection!',
    excitement: 0,
    proofValue: 'BLUFF'
  },
  {
    id: 'bluff_005',
    name: 'Just Asking Questions',
    supportedConspiracies: ['ALL'],
    flavorText: '❓ BLUFF! The JAQ-off maneuver. Implying everything, proving nothing!',
    excitement: 0,
    proofValue: 'BLUFF'
  },
  {
    id: 'bluff_006',
    name: 'I Saw a Tweet About It',
    supportedConspiracies: ['ALL'],
    flavorText: '🐦 BLUFF! Peak journalism: "Some guy on the internet said..." Pulitzer-worthy!',
    excitement: 0,
    proofValue: 'BLUFF'
  },
  {
    id: 'bluff_007',
    name: 'My Source is Military',
    supportedConspiracies: ['ALL'],
    flavorText: '🎖️ BLUFF! "My cousin\'s friend is in the Army." Close enough to classified intel, right?',
    excitement: 0,
    proofValue: 'BLUFF'
  },
  {
    id: 'bluff_008',
    name: 'Connect the Dots',
    supportedConspiracies: ['ALL'],
    flavorText: '🔴 BLUFF! Random events arranged in conspiracy order. The dots connect themselves!',
    excitement: 0,
    proofValue: 'BLUFF'
  }
];
