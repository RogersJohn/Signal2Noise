#!/usr/bin/env node
/**
 * Print-and-Play Generator for Signal to Noise v2
 * Run: node print/generate.js
 * Outputs: conspiracy-cards.html, evidence-cards.html, reference-card.html, rules.html
 */

const fs = require('fs');
const path = require('path');

const CONSPIRACIES = [
  { id: 'chemtrails', name: 'Chemtrails Control Weather', icon: '✈️☁️', description: "Wake up sheeple! Those aren't contrails - they're CHEMICAL COCKTAILS being sprayed to control weather AND minds!" },
  { id: 'celebrity_death', name: 'Celebrity Death Hoax: Elvis Lives', icon: '👑⛽', description: "The King never left the building - he's been spotted working at a gas station in Kalamazoo!" },
  { id: 'crop_circles', name: 'Crop Circles Are Alien Messages', icon: '👽🌾', description: "These perfect geometric patterns appeared OVERNIGHT in wheat fields! Two drunk farmers with planks? IMPOSSIBLE." },
  { id: 'bigfoot', name: 'Bigfoot Sighting Cover-Up', icon: '🦶🌲', description: "The Forest Service keeps finding 18-inch footprints and DESTROYING THE EVIDENCE!" },
  { id: 'subliminal_ads', name: 'Subliminal Advertising in Music', icon: '🎵🍔', description: "Record labels embed SUBCONSCIOUS TRIGGERS in the mix! Play it backwards at 0.7x speed!" },
  { id: 'fluoride', name: 'Fluoride Mind Control', icon: '🚰🧠', description: "They say it's for your teeth, but have you noticed everyone's getting more complacent?" },
  { id: 'moon_landing', name: 'Moon Landing Was Faked', icon: '🌙🎬', description: "Look at the shadows! Look at the flag waving! Stanley Kubrick filmed it in Area 51." },
  { id: 'pharma_coverup', name: 'Pharmaceutical Company Hides Cure', icon: '💊🤫', description: "A cure exists. A CURE! But Big Pharma makes billions on treatment, not cures!" },
  { id: 'election_rigging', name: 'Election Rigging Software', icon: '🗳️💻', description: "These voting machines run Windows XP and connect to the internet. THE INTERNET!" },
  { id: 'weather_machine', name: 'Government Weather Machine', icon: '🌪️⚡', description: "HAARP isn't a research facility - it's a WEATHER WEAPON!" },
  { id: 'mayor_embezzlement', name: 'Mayor Embezzling City Funds', icon: '💰⛵', description: "That new pothole repair fund? OFFSHORE ACCOUNTS IN THE CAYMANS!" },
  { id: 'tech_data_sale', name: 'Tech Company Selling User Data', icon: '📱💸', description: "Your private messages, your photos, your LOCATION DATA - all being sold to the highest bidder!" },
];

const EVIDENCE = {
  generic: [
    'Anonymous Whistleblower', 'Leaked Documents', 'Viral Social Media Post',
    'Expert Testimony', 'Pattern Recognition', 'Follow the Money',
    'Declassified CIA Documents', 'Deathbed Confession', 'Mainstream Media Silence',
    'Your Gut Feeling', 'Suspicious Timing', 'Whistleblower Testimony',
  ],
  specific: {
    chemtrails: ['Flight Path Analysis', 'Pilot Reports', 'Foreign Government Contracts'],
    celebrity_death: ['Paparazzi Photos', 'Death Certificate Irregularities', 'Luxury Purchases'],
    crop_circles: ['Geometric Precision', 'Radiation Readings', 'Bent Plant Stems'],
    bigfoot: ['Footprint Casts', 'Thermal Imaging Footage', 'Photo Inconsistencies'],
    subliminal_ads: ['Backmasking Audio', 'Industry Insider', 'Consumer Behavior Studies'],
    fluoride: ['Fluoride Health Data', 'Nazi Research Papers', 'Dental Industry Lobbying'],
    moon_landing: ['Flag Movement Analysis', 'Van Allen Radiation Belt', 'Stanley Kubrick Connection'],
    pharma_coverup: ['Suppressed Clinical Trials', 'Researcher Death', 'Revenue Projections'],
    election_rigging: ['Source Code Analysis', 'Machine Calibration Issues', 'Exit Poll Discrepancies'],
    weather_machine: ['Military Patents', 'HAARP Facility Activity', 'Meteorological Anomalies'],
    mayor_embezzlement: ['Construction Contracts', 'Offshore Bank Records', 'Accounting Audit'],
    tech_data_sale: ['Server Logs', 'Terms of Service Changes', 'Employee NDA Violations'],
  }
};

const CARD_STYLE = `
  .page { page-break-after: always; width: 210mm; margin: 0 auto; padding: 10mm; box-sizing: border-box; }
  .card-grid { display: grid; gap: 2mm; }
  .card { border: 1px solid #333; border-radius: 3mm; padding: 3mm; box-sizing: border-box; font-family: 'Courier New', monospace; overflow: hidden; }
  .conspiracy-grid { grid-template-columns: repeat(2, 63mm); grid-template-rows: repeat(3, 88mm); }
  .evidence-grid { grid-template-columns: repeat(3, 63mm); grid-template-rows: repeat(3, 88mm); }
  .card-icon { font-size: 24px; text-align: center; margin: 2mm 0; }
  .card-name { font-weight: bold; font-size: 9pt; text-align: center; margin: 1mm 0; }
  .card-desc { font-size: 7pt; color: #444; line-height: 1.3; margin: 2mm 0; }
  .card-type { font-size: 7pt; text-align: center; border: 1px solid #888; display: inline-block; padding: 1mm 2mm; border-radius: 2mm; }
  .card-targets { font-size: 6pt; color: #666; text-align: center; margin-top: 1mm; }
  .evidence-zone { border: 1px dashed #aaa; margin-top: auto; padding: 2mm; font-size: 6pt; color: #999; text-align: center; min-height: 15mm; }
  @media print { body { margin: 0; } .page { page-break-after: always; } }
  body { background: white; color: black; }
`;

function generateConspiracyCards() {
  const pages = [];
  for (let p = 0; p < 2; p++) {
    const cards = CONSPIRACIES.slice(p * 6, (p + 1) * 6);
    const cardsHtml = cards.map(c => `
      <div class="card" style="display:flex;flex-direction:column;">
        <div class="card-icon">${c.icon}</div>
        <div class="card-name">${c.name}</div>
        <div class="card-desc">${c.description}</div>
        <div class="evidence-zone">EVIDENCE ZONE<br>Place evidence tokens here</div>
      </div>
    `).join('');
    pages.push(`<div class="page"><div class="card-grid conspiracy-grid">${cardsHtml}</div></div>`);
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Signal to Noise — Conspiracy Cards</title>
<style>${CARD_STYLE}</style></head><body>${pages.join('')}</body></html>`;
}

function generateEvidenceCards() {
  const allCards = [];
  EVIDENCE.generic.forEach(name => allCards.push({ name, type: 'GENERIC', targets: 'ALL' }));
  Object.entries(EVIDENCE.specific).forEach(([conspiracy, names]) => {
    const cName = CONSPIRACIES.find(c => c.id === conspiracy)?.name || conspiracy;
    names.forEach(name => allCards.push({ name, type: 'SPECIFIC', targets: cName }));
  });

  const pages = [];
  for (let p = 0; p < Math.ceil(allCards.length / 9); p++) {
    const batch = allCards.slice(p * 9, (p + 1) * 9);
    const cardsHtml = batch.map(c => `
      <div class="card" style="display:flex;flex-direction:column;justify-content:center;">
        <div class="card-name">${c.name}</div>
        <div style="text-align:center;margin:2mm 0;">
          <span class="card-type">${c.type === 'SPECIFIC' ? '🎯 SPECIFIC' : '📋 GENERIC'}</span>
        </div>
        <div class="card-targets">Supports: ${c.targets}</div>
      </div>
    `).join('');
    pages.push(`<div class="page"><div class="card-grid evidence-grid">${cardsHtml}</div></div>`);
  }

  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Signal to Noise — Evidence Cards</title>
<style>${CARD_STYLE}</style></head><body>${pages.join('')}</body></html>`;
}

function generateReferenceCard() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Signal to Noise — Reference Card</title>
<style>
  body { font-family: 'Courier New', monospace; max-width: 210mm; margin: 0 auto; padding: 10mm; font-size: 9pt; }
  h1 { font-size: 14pt; text-align: center; border-bottom: 2px solid black; padding-bottom: 2mm; }
  h2 { font-size: 11pt; margin-top: 4mm; margin-bottom: 1mm; }
  table { border-collapse: collapse; width: 100%; margin: 2mm 0; }
  td, th { border: 1px solid #333; padding: 1mm 2mm; text-align: left; font-size: 8pt; }
  th { background: #eee; }
  .section { margin-bottom: 3mm; }
  ul { margin: 1mm 0; padding-left: 5mm; }
  li { margin-bottom: 1mm; }
</style></head><body>
<h1>📡 SIGNAL TO NOISE — Quick Reference</h1>
<div class="section">
  <h2>Game Flow (6 rounds)</h2>
  <p><b>1. COMMIT</b> — Secretly assign evidence to conspiracies (others see count, not cards)<br>
  <b>2. BROADCAST</b> — In turn order, declare REAL/FAKE on one conspiracy, or PASS<br>
  <b>3. RESOLVE</b> — Check consensus, score, replace resolved conspiracies, draw 2 cards</p>
</div>
<div class="section">
  <h2>Scoring</h2>
  <table>
    <tr><th>Situation</th><th>Points</th></tr>
    <tr><td>Majority + evidence</td><td>3</td></tr>
    <tr><td>...specific evidence bonus</td><td>+1</td></tr>
    <tr><td>Majority, no evidence (bandwagon)</td><td>2</td></tr>
    <tr><td>First broadcaster bonus</td><td>+1</td></tr>
    <tr><td>Per extra player on majority beyond threshold</td><td>+1 each</td></tr>
    <tr><td>Minority / No consensus / Pass</td><td>0</td></tr>
  </table>
</div>
<div class="section">
  <h2>Consensus Threshold</h2>
  <p>3-4 players: <b>2 needed</b> | 5 players: <b>3 needed</b></p>
</div>
<div class="section">
  <h2>Credibility</h2>
  <p>+1 majority, -1 minority. Range 0-10. Start at 5. <b>Tiebreaker only.</b></p>
</div>
<div class="section">
  <h2>Key Numbers</h2>
  <ul>
    <li>5 active conspiracies on the board</li>
    <li>Starting hand: 5 cards | Draw: 2/round | Max hand: 7</li>
    <li>Cards: 12 generic (any conspiracy) + 36 specific (named conspiracy)</li>
    <li>Lowest score goes first each round</li>
  </ul>
</div>
</body></html>`;
}

function generateRules() {
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Signal to Noise — Rulebook</title>
<style>
  body { font-family: 'Courier New', monospace; max-width: 210mm; margin: 0 auto; padding: 10mm; font-size: 10pt; line-height: 1.5; }
  .page { page-break-after: always; min-height: 277mm; }
  h1 { font-size: 18pt; text-align: center; }
  h2 { font-size: 13pt; border-bottom: 1px solid #333; }
  h3 { font-size: 11pt; }
  table { border-collapse: collapse; width: 100%; }
  td, th { border: 1px solid #333; padding: 2mm 3mm; }
  th { background: #eee; }
  @media print { .page { page-break-after: always; } }
</style></head><body>

<div class="page">
<h1>📡 SIGNAL TO NOISE</h1>
<p style="text-align:center;font-size:12pt;">A Social Deduction Card Game for 3-5 Players</p>
<h2>What Is This Game?</h2>
<p>You are conspiracy investigators competing to build consensus. The truth doesn't matter — only what the group agrees on. Commit secret evidence, broadcast your position, and score points when the majority sides with you.</p>
<h2>Components</h2>
<ul>
<li>12 Conspiracy cards (5 active at a time)</li>
<li>48 Evidence cards (12 generic + 36 specific)</li>
<li>Pen and paper for tracking scores and credibility</li>
</ul>
<h2>Setup</h2>
<ol>
<li>Shuffle conspiracies. Place 5 face-up in the center. Stack the rest as a draw pile.</li>
<li>Shuffle evidence cards. Deal 5 to each player.</li>
<li>Each player starts at 0 points, 5 credibility.</li>
<li>Determine first player randomly. After round 1, lowest score goes first.</li>
</ol>
</div>

<div class="page">
<h2>How to Play — 6 Rounds</h2>
<h3>Phase 1: COMMIT</h3>
<p>In turn order, each player assigns evidence cards from their hand to active conspiracies. Cards are placed face-down next to the conspiracy. Other players see <em>how many</em> cards you assigned, but not <em>which</em> cards.</p>
<ul>
<li><b>Generic cards</b> (📋) support any conspiracy.</li>
<li><b>Specific cards</b> (🎯) only support the conspiracy they name.</li>
<li>You may assign 0 or more cards. Say "done" when finished.</li>
</ul>
<h3>Phase 2: BROADCAST</h3>
<p>Players act <b>one at a time in turn order</b>. Each broadcast is immediately visible to everyone. This is the core of the game — later players have more information.</p>
<p>On your turn, either:</p>
<ul>
<li><b>Broadcast</b>: Pick one active conspiracy and declare it <b>REAL</b> or <b>FAKE</b>.</li>
<li><b>Pass</b>: Do nothing this round.</li>
</ul>
<p>You may only act once per round. No changing your mind.</p>
<h3>Phase 3: RESOLVE</h3>
<p>For each conspiracy that received broadcasts:</p>
<ol>
<li>Count REAL vs FAKE broadcasts.</li>
<li>Check if either side meets the consensus threshold (see below).</li>
<li>If consensus: score points, adjust credibility, remove and replace the conspiracy.</li>
<li>If no consensus: nobody scores. The conspiracy stays.</li>
</ol>
<p>After resolving, each player draws 2 cards (max hand size: 7).</p>
</div>

<div class="page">
<h2>Scoring</h2>
<table>
<tr><th>Situation</th><th>Points</th></tr>
<tr><td>Majority side with evidence committed</td><td><b>3</b></td></tr>
<tr><td>...and evidence is specific to this conspiracy</td><td><b>+1</b> (4 total)</td></tr>
<tr><td>Majority side without evidence (bandwagon)</td><td><b>2</b></td></tr>
<tr><td>First to broadcast on conspiracy that reaches consensus</td><td><b>+1</b></td></tr>
<tr><td>Each player on majority beyond threshold</td><td><b>+1</b> each</td></tr>
<tr><td>Minority side</td><td>0</td></tr>
<tr><td>No consensus</td><td>0</td></tr>
<tr><td>Pass</td><td>0</td></tr>
</table>
<h2>Consensus Threshold</h2>
<table>
<tr><th>Players</th><th>Threshold</th></tr>
<tr><td>3–4</td><td>2 must agree</td></tr>
<tr><td>5</td><td>3 must agree</td></tr>
</table>
<h2>Credibility</h2>
<p>Majority: +1 | Minority: -1 | Range: 0–10 | Starts at 5</p>
<p><b>Credibility is ONLY a tiebreaker.</b> It does not affect scoring.</p>
<h2>Winning</h2>
<p>After 6 rounds, highest score wins. Ties broken by credibility.</p>
<h2>Strategy Tips</h2>
<ul>
<li>The first mover bonus rewards bold broadcasts, but you act with less information.</li>
<li>Watch how many cards opponents commit — it reveals their plans.</li>
<li>Bandwagoning (2 pts, no evidence needed) is efficient but limited.</li>
<li>Specific evidence gives a bonus — focus your cards on one conspiracy.</li>
<li>Building large consensus benefits everyone on the majority side.</li>
</ul>
</div>
</body></html>`;
}

// Generate all files
const outDir = path.dirname(__filename);

fs.writeFileSync(path.join(outDir, 'conspiracy-cards.html'), generateConspiracyCards());
fs.writeFileSync(path.join(outDir, 'evidence-cards.html'), generateEvidenceCards());
fs.writeFileSync(path.join(outDir, 'reference-card.html'), generateReferenceCard());
fs.writeFileSync(path.join(outDir, 'rules.html'), generateRules());

console.log('Generated:');
console.log('  print/conspiracy-cards.html');
console.log('  print/evidence-cards.html');
console.log('  print/reference-card.html');
console.log('  print/rules.html');
