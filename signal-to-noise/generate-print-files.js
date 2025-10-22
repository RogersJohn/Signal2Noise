const fs = require('fs');
const path = require('path');

// Import card data (we'll read and parse the TS files)
const conspiraciesFile = fs.readFileSync(path.join(__dirname, 'src/data/conspiracies.ts'), 'utf8');
const evidenceFile = fs.readFileSync(path.join(__dirname, 'src/data/evidence.ts'), 'utf8');

// Extract conspiracy cards using regex
const conspiracyMatches = [...conspiraciesFile.matchAll(/\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?description:\s*'([\s\S]*?)'[\s\S]*?tier:\s*(\d+)[\s\S]*?truthValue:\s*'([^']+)'[\s\S]*?icon:\s*'([^']+)'[\s\S]*?\}/g)];

const conspiracies = conspiracyMatches.map(match => ({
  id: match[1],
  name: match[2],
  description: match[3].replace(/\\'/g, "'"),
  tier: parseInt(match[4]),
  truthValue: match[5],
  icon: match[6]
}));

// Extract evidence cards
const evidenceMatches = [...evidenceFile.matchAll(/\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?supportedConspiracies:\s*\[([^\]]+)\][\s\S]*?flavorText:\s*'([\s\S]*?)'[\s\S]*?excitement:\s*(-?\d+)[\s\S]*?\}/g)];

const evidence = evidenceMatches.map(match => ({
  id: match[1],
  name: match[2],
  supportedConspiracies: match[3].replace(/'/g, '').split(',').map(s => s.trim()),
  flavorText: match[4].replace(/\\'/g, "'").replace(/\\n/g, ' '),
  excitement: parseInt(match[5])
}));

console.log(`Found ${conspiracies.length} conspiracy cards`);
console.log(`Found ${evidence.length} evidence cards`);

// Generate HTML files
function generateConspiracyCards() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Signal to Noise - Conspiracy Cards</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 5mm; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3mm; height: 100%; }
    .card {
      border: 2px solid #000;
      padding: 3mm;
      display: flex;
      flex-direction: column;
      background: white;
      position: relative;
    }
    .card-header {
      font-weight: bold;
      font-size: 11pt;
      border-bottom: 1px solid #000;
      padding-bottom: 2mm;
      margin-bottom: 2mm;
      min-height: 12mm;
    }
    .card-tier {
      position: absolute;
      top: 2mm;
      right: 2mm;
      font-size: 20pt;
      font-weight: bold;
    }
    .card-description {
      font-size: 8pt;
      flex-grow: 1;
      overflow: hidden;
      line-height: 1.3;
    }
    .card-footer {
      border-top: 1px solid #000;
      padding-top: 2mm;
      margin-top: 2mm;
      font-size: 7pt;
      text-align: center;
    }
    .card-back {
      background: repeating-linear-gradient(
        45deg,
        #f0f0f0,
        #f0f0f0 5mm,
        #e0e0e0 5mm,
        #e0e0e0 10mm
      );
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 24pt;
      font-weight: bold;
    }
    @media print {
      body { background: white; }
      .page { page-break-after: always; }
    }
  </style>
</head>
<body>

<!-- CONSPIRACY CARDS (FRONTS) -->
${Array.from({ length: Math.ceil(conspiracies.length / 9) }).map((_, pageIndex) => {
  const start = pageIndex * 9;
  const pageCards = conspiracies.slice(start, start + 9);

  return `<div class="page">
  <div class="card-grid">
${pageCards.map(card => `    <div class="card">
      <div class="card-tier">${'★'.repeat(card.tier)}</div>
      <div class="card-header">${card.name}</div>
      <div class="card-description">${card.description}</div>
      <div class="card-footer">CONSPIRACY CARD | ID: ${card.id}</div>
    </div>`).join('\n')}
${Array.from({ length: 9 - pageCards.length }).map(() => '    <div class="card" style="border: 1px dashed #ccc;"></div>').join('\n')}
  </div>
</div>`;
}).join('\n\n')}

<!-- CONSPIRACY CARDS (BACKS) -->
${Array.from({ length: Math.ceil(conspiracies.length / 9) }).map(() => {
  return `<div class="page">
  <div class="card-grid">
${Array.from({ length: 9 }).map(() => `    <div class="card card-back">
      SIGNAL<br>TO<br>NOISE
    </div>`).join('\n')}
  </div>
</div>`;
}).join('\n\n')}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'PRINT_Conspiracy_Cards.html'), html);
  console.log('✅ Generated PRINT_Conspiracy_Cards.html');
}

function generateEvidenceCards() {
  // Split into chunks of 9 cards per page
  const pagesNeeded = Math.ceil(evidence.length / 9);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Signal to Noise - Evidence Cards</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 5mm; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3mm; height: 100%; }
    .card {
      border: 2px solid #000;
      padding: 3mm;
      display: flex;
      flex-direction: column;
      background: white;
      position: relative;
    }
    .card-header {
      font-weight: bold;
      font-size: 10pt;
      border-bottom: 1px solid #000;
      padding-bottom: 2mm;
      margin-bottom: 2mm;
      min-height: 10mm;
    }
    .card-excitement {
      position: absolute;
      top: 2mm;
      right: 2mm;
      font-size: 12pt;
    }
    .card-flavor {
      font-size: 7pt;
      flex-grow: 1;
      font-style: italic;
      line-height: 1.2;
      overflow: hidden;
    }
    .card-supports {
      border-top: 1px solid #000;
      padding-top: 1mm;
      margin-top: 2mm;
      font-size: 6pt;
      text-align: center;
      max-height: 8mm;
      overflow: hidden;
    }
    .card-back {
      background: repeating-linear-gradient(
        -45deg,
        #f0f0f0,
        #f0f0f0 5mm,
        #e0e0e0 5mm,
        #e0e0e0 10mm
      );
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16pt;
      font-weight: bold;
    }
    @media print {
      body { background: white; }
      .page { page-break-after: always; }
    }
  </style>
</head>
<body>

<!-- EVIDENCE CARDS (FRONTS) -->
${Array.from({ length: pagesNeeded }).map((_, pageIndex) => {
  const start = pageIndex * 9;
  const pageCards = evidence.slice(start, start + 9);

  return `<div class="page">
  <div class="card-grid">
${pageCards.map(card => {
  const excitementSymbol = card.excitement === 1 ? '★★★' : card.excitement === 0 ? '★☆☆' : '☆☆☆';
  const supportsText = card.supportedConspiracies.includes('ALL') ? 'Supports: ALL CONSPIRACIES' : `Supports: ${card.supportedConspiracies.join(', ')}`;

  return `    <div class="card">
      <div class="card-excitement">${excitementSymbol}</div>
      <div class="card-header">${card.name}</div>
      <div class="card-flavor">${card.flavorText}</div>
      <div class="card-supports">${supportsText}</div>
    </div>`;
}).join('\n')}
${Array.from({ length: 9 - pageCards.length }).map(() => '    <div class="card" style="border: 1px dashed #ccc;"></div>').join('\n')}
  </div>
</div>`;
}).join('\n\n')}

<!-- EVIDENCE CARDS (BACKS) -->
${Array.from({ length: pagesNeeded }).map(() => {
  return `<div class="page">
  <div class="card-grid">
${Array.from({ length: 9 }).map(() => `    <div class="card card-back">
      EVIDENCE<br>CARD
    </div>`).join('\n')}
  </div>
</div>`;
}).join('\n\n')}

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'PRINT_Evidence_Cards.html'), html);
  console.log('✅ Generated PRINT_Evidence_Cards.html');
}

function generatePlayerAids() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Signal to Noise - Player Reference Cards</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: Arial, sans-serif; background: white; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 5mm; }
    .card-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 5mm; }
    .reference-card {
      border: 3px solid #000;
      padding: 5mm;
      background: white;
    }
    h2 { font-size: 14pt; margin-bottom: 3mm; border-bottom: 2px solid #000; padding-bottom: 2mm; }
    h3 { font-size: 11pt; margin-top: 3mm; margin-bottom: 2mm; }
    .phase { margin-bottom: 3mm; }
    .phase-name { font-weight: bold; font-size: 10pt; }
    .phase-desc { font-size: 8pt; margin-top: 1mm; line-height: 1.3; }
    table { width: 100%; border-collapse: collapse; font-size: 8pt; margin-top: 2mm; }
    th, td { border: 1px solid #000; padding: 1mm; text-align: left; }
    th { background: #e0e0e0; font-weight: bold; }
    ul { margin-left: 5mm; font-size: 8pt; line-height: 1.4; }
    .scoring-box { border: 2px solid #000; padding: 2mm; margin: 2mm 0; background: #f5f5f5; }
    .formula { font-family: monospace; font-size: 9pt; }
  </style>
</head>
<body>

<div class="page">
  <div class="card-grid">
    <!-- Player Reference Card 1 -->
    <div class="reference-card">
      <h2>SIGNAL TO NOISE - Quick Reference</h2>

      <h3>🎮 Game Round Structure</h3>

      <div class="phase">
        <div class="phase-name">🔵 INVESTIGATE (Blue)</div>
        <div class="phase-desc">• Assign evidence cards to conspiracies (face-down)<br>
        • Others see COUNT of cards, not contents<br>
        • Draw 2 new cards after all players done</div>
      </div>

      <div class="phase">
        <div class="phase-name">🟣 ADVERTISE (Purple)</div>
        <div class="phase-desc">• Signal which conspiracy interests you (or PASS)<br>
        • Public & visible to all<br>
        • Not binding, but -1 penalty if you deceive<br>
        • After ads, assign 1 bonus evidence card</div>
      </div>

      <div class="phase">
        <div class="phase-name">🟠 BROADCAST (Orange)</div>
        <div class="phase-desc">• Claim REAL, FAKE, or INCONCLUSIVE<br>
        • Or PASS (no claim this round)</div>
      </div>

      <div class="phase">
        <div class="phase-name">🟢 RESOLVE (Green)</div>
        <div class="phase-desc">• Consensus check (majority agree?)<br>
        • Score points & adjust credibility<br>
        • Reveal evidence if consensus</div>
      </div>

      <div class="phase">
        <div class="phase-name">⚪ CLEANUP (Gray)</div>
        <div class="phase-desc">• Replace revealed conspiracies<br>
        • Check win conditions</div>
      </div>

      <h3>🏆 Win Conditions</h3>
      <ul>
        <li>First to 60 audience points</li>
        <li>12 conspiracies revealed</li>
        <li>6 rounds completed</li>
      </ul>
    </div>

    <!-- Player Reference Card 2 -->
    <div class="reference-card">
      <h2>SCORING & CREDIBILITY</h2>

      <div class="scoring-box">
        <strong>Base Points:</strong><br>
        • With Evidence: 3 points<br>
        • Bandwagon (no evidence): 1 point<br>
        • INCONCLUSIVE: 2 points (safe!)
      </div>

      <div class="scoring-box">
        <strong>Evidence Bonuses (per card):</strong><br>
        • Specificity: +3 (specific) or +1 (ALL)<br>
        • Excitement Multiplier:<br>
        &nbsp;&nbsp;★★★ EXCITING: ×2.0<br>
        &nbsp;&nbsp;★☆☆ NEUTRAL: ×1.0<br>
        &nbsp;&nbsp;☆☆☆ BORING: ×0.5<br>
        • Novelty: +2 (first use of card)
      </div>

      <div class="scoring-box">
        <strong>Credibility Modifier:</strong><br>
        • High (7-10): ×1.5 to all points<br>
        • Medium (4-6): ×1.0<br>
        • Low (0-3): ×0.75
      </div>

      <h3>📉 Credibility Changes</h3>
      <table>
        <tr><th>Action</th><th>Change</th></tr>
        <tr><td>Majority in consensus</td><td>+1</td></tr>
        <tr><td>Minority in consensus</td><td>-1</td></tr>
        <tr><td>Wrong claim (alone)</td><td>-3</td></tr>
        <tr><td>Bluffing (escalating)</td><td>-2/-3/-4/-5</td></tr>
        <tr><td>INCONCLUSIVE</td><td>No change</td></tr>
      </table>

      <h3>🎯 Consensus Thresholds</h3>
      <ul>
        <li>3 players: 2 votes needed</li>
        <li>4 players: 2 votes needed</li>
        <li>5 players: 3 votes needed</li>
      </ul>

      <div class="scoring-box" style="margin-top: 3mm;">
        <strong>⚠️ Advertise Penalty:</strong><br>
        If you advertise conspiracy A but broadcast on B:<br>
        <strong>-1 audience penalty</strong>
      </div>
    </div>
  </div>
</div>

<!-- Score Trackers -->
<div class="page">
  <h2 style="text-align: center; margin-bottom: 5mm;">SCORE TRACKER (3-5 Players)</h2>

  <table style="width: 100%; font-size: 10pt;">
    <thead>
      <tr>
        <th style="width: 15%;">Round</th>
        <th style="width: 17%;">Player 1<br>Name: _______</th>
        <th style="width: 17%;">Player 2<br>Name: _______</th>
        <th style="width: 17%;">Player 3<br>Name: _______</th>
        <th style="width: 17%;">Player 4<br>Name: _______</th>
        <th style="width: 17%;">Player 5<br>Name: _______</th>
      </tr>
    </thead>
    <tbody>
      ${Array.from({ length: 6 }, (_, i) => `<tr style="height: 20mm;">
        <td style="text-align: center; font-weight: bold;">Round ${i + 1}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>`).join('\n      ')}
      <tr style="background: #e0e0e0; font-weight: bold;">
        <td style="text-align: center;">TOTAL</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <h2 style="text-align: center; margin: 10mm 0 5mm 0;">CREDIBILITY TRACKER</h2>

  <table style="width: 100%; font-size: 10pt;">
    <thead>
      <tr>
        <th style="width: 15%;">Round</th>
        <th style="width: 17%;">Player 1</th>
        <th style="width: 17%;">Player 2</th>
        <th style="width: 17%;">Player 3</th>
        <th style="width: 17%;">Player 4</th>
        <th style="width: 17%;">Player 5</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #f5f5f5; height: 15mm;">
        <td style="text-align: center; font-weight: bold;">START</td>
        <td style="text-align: center;">5</td>
        <td style="text-align: center;">5</td>
        <td style="text-align: center;">5</td>
        <td style="text-align: center;">5</td>
        <td style="text-align: center;">5</td>
      </tr>
      ${Array.from({ length: 6 }, (_, i) => `<tr style="height: 15mm;">
        <td style="text-align: center; font-weight: bold;">Round ${i + 1}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>`).join('\n      ')}
    </tbody>
  </table>

  <div style="margin-top: 10mm; padding: 5mm; border: 2px solid #000; background: #f5f5f5;">
    <strong>Credibility Reminder:</strong> Range is 0-10. Starting value is 5.<br>
    High (7-10): ×1.5 points | Medium (4-6): ×1.0 points | Low (0-3): ×0.75 points
  </div>
</div>

</body>
</html>`;

  fs.writeFileSync(path.join(__dirname, 'PRINT_Player_Reference.html'), html);
  console.log('✅ Generated PRINT_Player_Reference.html');
}

// Generate all files
generateConspiracyCards();
generateEvidenceCards();
generatePlayerAids();

console.log('\n📦 All print files generated successfully!');
console.log('\n📝 To create PDFs:');
console.log('1. Open each HTML file in Chrome/Firefox');
console.log('2. File → Print (or Ctrl+P)');
console.log('3. Select "Save as PDF"');
console.log('4. Set to Greyscale/Black & White');
console.log('5. Margins: Minimal');
console.log('6. Print backgrounds: ON');
console.log('\n📄 Files created:');
console.log('  • PRINT_Conspiracy_Cards.html (12 cards = 4 pages with backs)');
console.log(`  • PRINT_Evidence_Cards.html (${evidence.length} cards = ${Math.ceil(evidence.length / 9) * 2} pages with backs)`);
console.log('  • PRINT_Player_Reference.html (Reference cards + score trackers)');
