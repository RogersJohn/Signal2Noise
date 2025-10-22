const fs = require('fs');
const path = require('path');

// Import card data
const conspiraciesFile = fs.readFileSync(path.join(__dirname, 'src/data/conspiracies.ts'), 'utf8');
const evidenceFile = fs.readFileSync(path.join(__dirname, 'src/data/evidence.ts'), 'utf8');

// Extract conspiracy cards
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

function generateConspiracyCards() {
  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Signal to Noise - Conspiracy Cards</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: white; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 5mm; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3mm; height: 100%; }

    .conspiracy-card {
      border: 2px solid #000;
      border-radius: 4mm;
      padding: 3mm;
      position: relative;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .tier-badge {
      position: absolute;
      top: 2mm;
      right: 2mm;
      font-weight: bold;
      font-size: 10pt;
      padding: 1mm 2mm;
      border: 1px solid #000;
      border-radius: 2mm;
      background: #f5f5f5;
    }

    .conspiracy-icon {
      font-size: 20pt;
      text-align: center;
      margin: 8mm 0 3mm 0;
      line-height: 1;
    }

    .conspiracy-name {
      font-weight: bold;
      font-size: 9pt;
      text-align: center;
      margin-bottom: 2mm;
      line-height: 1.2;
      min-height: 10mm;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2mm;
    }

    .conspiracy-description {
      font-size: 6.5pt;
      line-height: 1.3;
      flex-grow: 1;
      font-style: italic;
      color: #333;
      padding: 0 1mm;
      overflow: hidden;
    }

    .card-back {
      border: 2px solid #000;
      border-radius: 4mm;
      background: repeating-linear-gradient(
        45deg,
        #f0f0f0,
        #f0f0f0 3mm,
        #e0e0e0 3mm,
        #e0e0e0 6mm
      );
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14pt;
      text-align: center;
      line-height: 1.3;
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
${pageCards.map(card => `    <div class="conspiracy-card">
      <div class="tier-badge">${'★'.repeat(card.tier)}</div>
      <div class="conspiracy-icon">${card.icon}</div>
      <div class="conspiracy-name">${card.name}</div>
      <div class="conspiracy-description">${card.description}</div>
    </div>`).join('\n')}
${Array.from({ length: 9 - pageCards.length }).map(() => '    <div class="conspiracy-card" style="border: 1px dashed #ccc;"></div>').join('\n')}
  </div>
</div>`;
}).join('\n\n')}

<!-- CONSPIRACY CARDS (BACKS) -->
${Array.from({ length: Math.ceil(conspiracies.length / 9) }).map(() => {
  return `<div class="page">
  <div class="card-grid">
${Array.from({ length: 9 }).map(() => `    <div class="card-back">
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
  const pagesNeeded = Math.ceil(evidence.length / 9);

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Signal to Noise - Evidence Cards</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: white; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 5mm; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3mm; height: 100%; }

    .evidence-card {
      border: 2px solid #000;
      border-radius: 4mm;
      padding: 3mm;
      position: relative;
      background: white;
      display: flex;
      flex-direction: column;
    }

    .excitement-badge {
      position: absolute;
      top: 2mm;
      right: 2mm;
      font-size: 9pt;
      padding: 1mm 2mm;
      border: 1px solid #000;
      border-radius: 2mm;
      font-weight: bold;
      background: #f5f5f5;
    }

    .evidence-name {
      font-weight: bold;
      font-size: 8pt;
      padding-right: 12mm;
      margin-bottom: 2mm;
      line-height: 1.2;
      min-height: 9mm;
      border-bottom: 1px solid #ccc;
      padding-bottom: 2mm;
    }

    .flavor-text {
      font-size: 6pt;
      line-height: 1.25;
      font-style: italic;
      flex-grow: 1;
      color: #333;
      padding: 1mm 0;
      overflow: hidden;
    }

    .supports-section {
      border-top: 1px solid #ccc;
      padding-top: 1mm;
      margin-top: 1mm;
      font-size: 5.5pt;
      line-height: 1.2;
      max-height: 8mm;
      overflow: hidden;
    }

    .supports-label {
      font-weight: bold;
      margin-bottom: 0.5mm;
    }

    .card-back {
      border: 2px solid #000;
      border-radius: 4mm;
      background: repeating-linear-gradient(
        -45deg,
        #f0f0f0,
        #f0f0f0 3mm,
        #e0e0e0 3mm,
        #e0e0e0 6mm
      );
      display: flex;
      align-items: center;
      justify-center;
      font-weight: bold;
      font-size: 12pt;
      text-align: center;
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

  let supportsText = '';
  if (card.supportedConspiracies.includes('ALL')) {
    supportsText = '<div class="supports-label">Supports:</div>ALL CONSPIRACIES';
  } else {
    const ids = card.supportedConspiracies.slice(0, 5);
    supportsText = `<div class="supports-label">Supports:</div>${ids.join(', ')}${ids.length < card.supportedConspiracies.length ? '...' : ''}`;
  }

  return `    <div class="evidence-card">
      <div class="excitement-badge">${excitementSymbol}</div>
      <div class="evidence-name">${card.name}</div>
      <div class="flavor-text">${card.flavorText}</div>
      <div class="supports-section">${supportsText}</div>
    </div>`;
}).join('\n')}
${Array.from({ length: 9 - pageCards.length }).map(() => '    <div class="evidence-card" style="border: 1px dashed #ccc;"></div>').join('\n')}
  </div>
</div>`;
}).join('\n\n')}

<!-- EVIDENCE CARDS (BACKS) -->
${Array.from({ length: pagesNeeded }).map(() => {
  return `<div class="page">
  <div class="card-grid">
${Array.from({ length: 9 }).map(() => `    <div class="card-back">
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
  <title>Signal to Noise - Player Reference & Trackers</title>
  <style>
    @page { size: A4; margin: 10mm; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; background: white; color: #000; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 8mm; }

    h1 { font-size: 16pt; margin-bottom: 4mm; border-bottom: 2px solid #000; padding-bottom: 2mm; text-align: center; }
    h2 { font-size: 12pt; margin: 3mm 0 2mm 0; border-bottom: 1px solid #666; padding-bottom: 1mm; }
    h3 { font-size: 10pt; margin: 2mm 0 1mm 0; font-weight: bold; }

    .two-column { display: grid; grid-template-columns: 1fr 1fr; gap: 5mm; }
    .reference-card { border: 2px solid #000; border-radius: 3mm; padding: 4mm; background: white; }

    .phase { margin-bottom: 2mm; padding: 2mm; border-left: 3px solid #000; }
    .phase-name { font-weight: bold; font-size: 9pt; margin-bottom: 1mm; }
    .phase-desc { font-size: 7pt; line-height: 1.3; margin-left: 2mm; }

    .scoring-box { border: 2px solid #000; padding: 2mm; margin: 2mm 0; background: #f5f5f5; }
    .scoring-box strong { font-size: 8pt; }
    .scoring-box { font-size: 7pt; line-height: 1.4; }

    table { width: 100%; border-collapse: collapse; margin: 2mm 0; font-size: 8pt; }
    th, td { border: 1px solid #000; padding: 2mm; text-align: left; }
    th { background: #e0e0e0; font-weight: bold; }

    ul { margin-left: 5mm; font-size: 7pt; line-height: 1.4; }
    li { margin-bottom: 1mm; }

    .tracker-table { font-size: 9pt; }
    .tracker-table th { background: #e0e0e0; text-align: center; padding: 2mm; }
    .tracker-table td { height: 15mm; }
    .tracker-table .round-label { font-weight: bold; background: #f5f5f5; text-align: center; }

    @media print {
      body { background: white; }
      .page { page-break-after: always; }
    }
  </style>
</head>
<body>

<!-- PAGE 1: REFERENCE CARDS -->
<div class="page">
  <h1>SIGNAL TO NOISE - Quick Reference</h1>

  <div class="two-column">
    <!-- Left Column -->
    <div class="reference-card">
      <h2>Game Round Structure</h2>

      <div class="phase">
        <div class="phase-name">🔵 INVESTIGATE (Blue)</div>
        <div class="phase-desc">
          • Assign evidence to conspiracies (face-down)<br>
          • Others see COUNT, not contents<br>
          • Draw 2 new cards after all players done
        </div>
      </div>

      <div class="phase">
        <div class="phase-name">🟣 ADVERTISE (Purple)</div>
        <div class="phase-desc">
          • Signal which conspiracy interests you (or PASS)<br>
          • Public & visible - not binding<br>
          • -1 penalty if you deceive<br>
          • Then assign 1 bonus evidence card
        </div>
      </div>

      <div class="phase">
        <div class="phase-name">🟠 BROADCAST (Orange)</div>
        <div class="phase-desc">
          • Claim REAL, FAKE, or INCONCLUSIVE<br>
          • Or PASS (no claim)
        </div>
      </div>

      <div class="phase">
        <div class="phase-name">🟢 RESOLVE (Green)</div>
        <div class="phase-desc">
          • Check for consensus (majority agrees?)<br>
          • Score points & adjust credibility<br>
          • Reveal evidence if consensus reached
        </div>
      </div>

      <div class="phase">
        <div class="phase-name">⚪ CLEANUP (Gray)</div>
        <div class="phase-desc">
          • Replace revealed conspiracies<br>
          • Check win conditions
        </div>
      </div>

      <h3>Win Conditions:</h3>
      <ul>
        <li>First to 60 audience points</li>
        <li>12 conspiracies revealed</li>
        <li>6 rounds completed</li>
      </ul>
    </div>

    <!-- Right Column -->
    <div class="reference-card">
      <h2>Scoring & Credibility</h2>

      <div class="scoring-box">
        <strong>Base Points:</strong><br>
        • With Evidence: 3 pts<br>
        • Bandwagon (no evidence): 1 pt<br>
        • INCONCLUSIVE: 2 pts (safe!)
      </div>

      <div class="scoring-box">
        <strong>Evidence Bonuses:</strong><br>
        • Specificity: +3 (specific) or +1 (ALL)<br>
        • Excitement Multiplier:<br>
        &nbsp;&nbsp;★★★ EXCITING: ×2.0<br>
        &nbsp;&nbsp;★☆☆ NEUTRAL: ×1.0<br>
        &nbsp;&nbsp;☆☆☆ BORING: ×0.5<br>
        • Novelty: +2 (first use)
      </div>

      <div class="scoring-box">
        <strong>Credibility Modifier:</strong><br>
        • High (7-10): ×1.5 all points<br>
        • Medium (4-6): ×1.0<br>
        • Low (0-3): ×0.75
      </div>

      <h3>Credibility Changes:</h3>
      <table>
        <tr><th>Action</th><th>Change</th></tr>
        <tr><td>Majority in consensus</td><td>+1</td></tr>
        <tr><td>Minority in consensus</td><td>-1</td></tr>
        <tr><td>Wrong claim (alone)</td><td>-3</td></tr>
        <tr><td>Bluffing (escalating)</td><td>-2/-3/-4/-5</td></tr>
        <tr><td>INCONCLUSIVE</td><td>No change</td></tr>
      </table>

      <h3>Consensus Thresholds:</h3>
      <ul>
        <li>3 players: 2 votes needed</li>
        <li>4 players: 2 votes needed</li>
        <li>5 players: 3 votes needed</li>
      </ul>
    </div>
  </div>
</div>

<!-- PAGE 2: SCORE TRACKER -->
<div class="page">
  <h1>SCORE TRACKER (3-5 Players)</h1>

  <table class="tracker-table">
    <thead>
      <tr>
        <th style="width: 12%;">Round</th>
        <th style="width: 17.6%;">Player 1<br><span style="font-size: 7pt; font-weight: normal;">Name: _______</span></th>
        <th style="width: 17.6%;">Player 2<br><span style="font-size: 7pt; font-weight: normal;">Name: _______</span></th>
        <th style="width: 17.6%;">Player 3<br><span style="font-size: 7pt; font-weight: normal;">Name: _______</span></th>
        <th style="width: 17.6%;">Player 4<br><span style="font-size: 7pt; font-weight: normal;">Name: _______</span></th>
        <th style="width: 17.6%;">Player 5<br><span style="font-size: 7pt; font-weight: normal;">Name: _______</span></th>
      </tr>
    </thead>
    <tbody>
${Array.from({ length: 6 }, (_, i) => `      <tr>
        <td class="round-label">Round ${i + 1}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>`).join('\n')}
      <tr style="background: #e0e0e0; font-weight: bold;">
        <td class="round-label">TOTAL</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>
    </tbody>
  </table>

  <h1 style="margin-top: 8mm;">CREDIBILITY TRACKER</h1>

  <table class="tracker-table">
    <thead>
      <tr>
        <th style="width: 12%;">Round</th>
        <th style="width: 17.6%;">Player 1</th>
        <th style="width: 17.6%;">Player 2</th>
        <th style="width: 17.6%;">Player 3</th>
        <th style="width: 17.6%;">Player 4</th>
        <th style="width: 17.6%;">Player 5</th>
      </tr>
    </thead>
    <tbody>
      <tr style="background: #f5f5f5;">
        <td class="round-label">START</td>
        <td style="text-align: center; font-weight: bold;">5</td>
        <td style="text-align: center; font-weight: bold;">5</td>
        <td style="text-align: center; font-weight: bold;">5</td>
        <td style="text-align: center; font-weight: bold;">5</td>
        <td style="text-align: center; font-weight: bold;">5</td>
      </tr>
${Array.from({ length: 6 }, (_, i) => `      <tr>
        <td class="round-label">Round ${i + 1}</td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
        <td></td>
      </tr>`).join('\n')}
    </tbody>
  </table>

  <div style="margin-top: 5mm; padding: 3mm; border: 2px solid #000; background: #f5f5f5; font-size: 7pt;">
    <strong>Credibility Range:</strong> 0-10 (starting value: 5)<br>
    <strong>Effect:</strong> High (7-10): ×1.5 points | Medium (4-6): ×1.0 points | Low (0-3): ×0.75 points
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
console.log('  • PRINT_Player_Reference.html (Reference + score trackers)');
