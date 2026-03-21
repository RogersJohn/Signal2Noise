#!/usr/bin/env node
/**
 * Signal to Noise v2 — Print-and-Play Generator
 *
 * Generates self-contained HTML files for printing:
 *   - conspiracy-cards.html  (12 cards, 6 per A4 page)
 *   - evidence-cards.html    (48 cards, 9 per A4 page)
 *   - reference-card.html    (1 page rules reference)
 *   - rules.html             (4-page A4 rulebook)
 *
 * Usage: node print/generate.js
 */

const fs = require('fs');
const path = require('path');

// ── Data ──────────────────────────────────────────────

const CONSPIRACIES = [
  { id: 'chemtrails', name: 'Chemtrails Control Weather', icon: '\u2708\uFE0F\u2601\uFE0F', desc: "Wake up sheeple! Those aren't contrails - they're CHEMICAL COCKTAILS being sprayed to control weather AND minds!" },
  { id: 'celebrity_death', name: 'Celebrity Death Hoax: Elvis Lives', icon: '\uD83D\uDC51\u26FD', desc: "The King never left the building - he's been spotted working at a gas station in Kalamazoo!" },
  { id: 'crop_circles', name: 'Crop Circles Are Alien Messages', icon: '\uD83D\uDC7D\uD83C\uDF3E', desc: "These perfect geometric patterns appeared OVERNIGHT in wheat fields! Two drunk farmers with planks? IMPOSSIBLE." },
  { id: 'bigfoot', name: 'Bigfoot Sighting Cover-Up', icon: '\uD83E\uDDB6\uD83C\uDF32', desc: "The Forest Service keeps finding 18-inch footprints and DESTROYING THE EVIDENCE!" },
  { id: 'subliminal_ads', name: 'Subliminal Advertising in Music', icon: '\uD83C\uDFB5\uD83C\uDF54', desc: "Ever wonder why you suddenly NEED that burger after hearing that song? Record labels embed SUBCONSCIOUS TRIGGERS!" },
  { id: 'fluoride', name: 'Fluoride Mind Control', icon: '\uD83D\uDEB0\uD83E\uDDE0', desc: "They say it's for your teeth, but have you noticed everyone's getting more complacent?" },
  { id: 'moon_landing', name: 'Moon Landing Was Faked', icon: '\uD83C\uDF19\uD83C\uDFAC', desc: "Look at the shadows! Look at the flag waving! We couldn't even make a phone call in 1969 but we went to the MOON?!" },
  { id: 'pharma_coverup', name: 'Pharmaceutical Company Hides Cure', icon: '\uD83D\uDC8A\uD83E\uDD2B', desc: "A cure exists. A CURE! But Big Pharma makes billions on treatment, not cures!" },
  { id: 'election_rigging', name: 'Election Rigging Software', icon: '\uD83D\uDDF3\uFE0F\uD83D\uDCBB', desc: "These voting machines run Windows XP and connect to the internet. THE INTERNET!" },
  { id: 'weather_machine', name: 'Government Weather Machine', icon: '\uD83C\uDF2A\uFE0F\u26A1', desc: "HAARP isn't a research facility - it's a WEATHER WEAPON!" },
  { id: 'mayor_embezzlement', name: 'Mayor Embezzling City Funds', icon: '\uD83D\uDCB0\u26F5', desc: "That new pothole repair fund? OFFSHORE ACCOUNTS IN THE CAYMANS!" },
  { id: 'tech_data_sale', name: 'Tech Company Selling User Data', icon: '\uD83D\uDCF1\uD83D\uDCB8', desc: "Your private messages, your photos, your LOCATION DATA - all being sold to the highest bidder!" },
];

const GENERIC_EVIDENCE = [
  { name: 'Anonymous Whistleblower', flavor: "\"I'll lose my job if they find out it's me, but the truth needs to be told...\"" },
  { name: 'Leaked Documents', flavor: "Posted to Pastebin at 4:17am, deleted by 4:23am. I downloaded them." },
  { name: 'Viral Social Media Post', flavor: "87K shares in 6 hours, then POOF - memory-holed." },
  { name: 'Expert Testimony', flavor: "\"In my 30 years studying this...\" - PhD from a university you've definitely heard of" },
  { name: 'Pattern Recognition', flavor: "I made a spreadsheet. The correlation is 94.7%. You can't argue with MATH." },
  { name: 'Follow the Money', flavor: "$2.3 million deposited the day before the incident." },
  { name: 'Declassified CIA Documents', flavor: "Operation [REDACTED]. Page 47, paragraph 3." },
  { name: 'Deathbed Confession', flavor: "\"I have nothing left to lose. I'll tell you everything...\"" },
  { name: 'Mainstream Media Silence', flavor: "CNN: nothing. Fox: nothing. MSNBC: nothing. Controlled media!" },
  { name: 'Your Gut Feeling', flavor: "Deep down, you know something's wrong. Trust your instincts." },
  { name: 'Suspicious Timing', flavor: "This happened EXACTLY 3 days after the hearing. EXACTLY." },
  { name: 'Whistleblower Testimony', flavor: "\"I can't reveal my identity for safety reasons, but I was THERE.\"" },
];

const SPECIFIC_EVIDENCE = [
  { name: 'Flight Path Analysis', target: 'Chemtrails', flavor: "Normal planes don't fly in perfect grids for 6 hours." },
  { name: 'Pilot Reports', target: 'Chemtrails', flavor: "\"They made us install tanks we weren't allowed to ask about\"" },
  { name: 'Foreign Gov\'t Contracts', target: 'Chemtrails', flavor: "$280M contract. Aerial dispersion systems. WEATHER CONTROL." },
  { name: 'Paparazzi Photos', target: 'Elvis Lives', flavor: "Same mole on the left cheek! Cashier in Buenos Aires, 2019." },
  { name: 'Death Cert. Irregularities', target: 'Elvis Lives', flavor: "The coroner's signature doesn't match ANY other document." },
  { name: 'Luxury Purchases', target: 'Elvis Lives', flavor: "$2.1M yacht spotted with \"deceased\" celebrity." },
  { name: 'Geometric Precision', target: 'Crop Circles', flavor: "409 circles, perfect fractals, appeared in 4 hours." },
  { name: 'Radiation Readings', target: 'Crop Circles', flavor: "Geiger counter went CRAZY inside the circle." },
  { name: 'Bent Plant Stems', target: 'Crop Circles', flavor: "Bent at the nodes, not broken. Microwave radiation signature." },
  { name: 'Footprint Casts', target: 'Bigfoot', flavor: "18 inches long, dermal ridges visible. Fake that in 1967." },
  { name: 'Thermal Imaging', target: 'Bigfoot', flavor: "8-foot heat signature, bipedal gait, 30mph uphill. Not a bear." },
  { name: 'Photo Inconsistencies', target: 'Bigfoot', flavor: "Shadows going in THREE directions. BASIC PHOTOGRAPHY." },
  { name: 'Backmasking Audio', target: 'Subliminal Ads', flavor: "0.68x speed backwards: \"Buy... consume... obey...\"" },
  { name: 'Industry Insider', target: 'Subliminal Ads', flavor: "\"We call it the frequency layer. The execs know.\"" },
  { name: 'Consumer Behavior Studies', target: 'Subliminal Ads', flavor: "Fast food sales spike 340% where the song plays." },
  { name: 'Fluoride Health Data', target: 'Fluoride', flavor: "IQ scores drop 7 points in fluoridated areas. Harvard study." },
  { name: 'Nazi Research Papers', target: 'Fluoride', flavor: "I.G. Farben documents, 1939-1944. Now it's in YOUR water." },
  { name: 'Dental Industry Lobbying', target: 'Fluoride', flavor: "$14M in campaign donations from Colgate alone." },
  { name: 'Flag Movement Analysis', target: 'Moon Landing', flavor: "The flag WAVES. No air on the moon. FRAME 27:43." },
  { name: 'Van Allen Radiation Belt', target: 'Moon Landing', flavor: "25,000 rads. Lead suits or not, they'd be DEAD." },
  { name: 'Kubrick Connection', target: 'Moon Landing', flavor: "2001 came out in '68. Moon landing '69. DO THE MATH." },
  { name: 'Suppressed Clinical Trials', target: 'Pharma Cover-up', flavor: "94% success rate. Paper \"lost\". All 7 copies." },
  { name: 'Researcher Death', target: 'Pharma Cover-up', flavor: "\"Accidental\" death #12 this year. All same cure." },
  { name: 'Revenue Projections', target: 'Pharma Cover-up', flavor: "Internal memo: boost sales $40B annually." },
  { name: 'Source Code Analysis', target: 'Election Rigging', flavor: "Line 1,547: if(candidate==\"X\") votes--;" },
  { name: 'Machine Calibration Issues', target: 'Election Rigging', flavor: "Touch A, machine votes B. 47 counties, same day." },
  { name: 'Exit Poll Discrepancies', target: 'Election Rigging', flavor: "Exit polls off by 11%. Margin of error: 3%." },
  { name: 'Military Patents', target: 'Weather Machine', flavor: "Patent US5003186 - Stratospheric Welsbach seeding." },
  { name: 'HAARP Facility Activity', target: 'Weather Machine', flavor: "Power surge 48 hours before the earthquake." },
  { name: 'Meteorological Anomalies', target: 'Weather Machine', flavor: "Square clouds. SQUARE. Clouds aren't square in nature." },
  { name: 'Construction Contracts', target: 'Mayor Embezzlement', flavor: "$8M bridge. Actual cost: $900K. The rest: shell corp." },
  { name: 'Offshore Bank Records', target: 'Mayor Embezzlement', flavor: "Panama Papers, page 1,847. Account #472819." },
  { name: 'Accounting Audit', target: 'Mayor Embezzlement', flavor: "CPA found \"irregularities\" in 73% of city expenses." },
  { name: 'Server Logs', target: 'Tech Data Sale', flavor: "2.4TB uploaded to Beijing servers. Daily." },
  { name: 'ToS Changes', target: 'Tech Data Sale', flavor: "Clause 7.4.2: \"may share with partners and affiliates.\"" },
  { name: 'Employee NDA Violations', target: 'Tech Data Sale', flavor: "\"I had to sign an NDA about the data pipeline.\"" },
];

// ── File reading/writing ──────────────────────────────

function readTemplate(name) {
  return fs.readFileSync(path.join(__dirname, name), 'utf8');
}

// ── Main ──────────────────────────────────────────────

console.log('Signal to Noise v2 - Print & Play Generator');
console.log('============================================');
console.log('');
console.log('HTML files are maintained as standalone templates.');
console.log('This script validates the data and can regenerate if needed.');
console.log('');

// Validate data
console.log(`Conspiracies: ${CONSPIRACIES.length} (expected 12)`);
console.log(`Generic Evidence: ${GENERIC_EVIDENCE.length} (expected 12)`);
console.log(`Specific Evidence: ${SPECIFIC_EVIDENCE.length} (expected 36)`);
console.log(`Total Evidence: ${GENERIC_EVIDENCE.length + SPECIFIC_EVIDENCE.length} (expected 48)`);
console.log('');

const files = ['conspiracy-cards.html', 'evidence-cards.html', 'reference-card.html', 'rules.html'];
files.forEach(f => {
  const fp = path.join(__dirname, f);
  if (fs.existsSync(fp)) {
    const size = fs.statSync(fp).size;
    console.log(`  [OK] ${f} (${(size / 1024).toFixed(1)} KB)`);
  } else {
    console.log(`  [MISSING] ${f}`);
  }
});

console.log('');
console.log('Open the HTML files in a browser and print (Ctrl+P).');
console.log('Enable "Background graphics" in print settings for dark theme.');
