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
const evidenceMatches = [...evidenceFile.matchAll(/\{[\s\S]*?id:\s*'([^']+)'[\s\S]*?name:\s*'([^']+)'[\s\S]*?supportedConspiracies:\s*\[([^\]]+)\][\s\S]*?flavorText:\s*'([\s\S]*?)',\s*excitement:\s*(-?\d+)[\s\S]*?\}/g)];

const evidence = evidenceMatches.map(match => ({
  id: match[1],
  name: match[2],
  supportedConspiracies: match[3].replace(/'/g, '').split(',').map(s => s.trim()),
  flavorText: match[4].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, ' ').trim(),
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif; background: white; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 5mm; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3mm; height: 100%; }

    .conspiracy-card {
      background: white;
      border: 3px solid #000;
      border-radius: 4mm;
      padding: 4mm;
      position: relative;
      display: flex;
      flex-direction: column;
      color: #000;
      overflow: hidden;
    }

    .tier-badge {
      position: absolute;
      top: 2mm;
      right: 2mm;
      padding: 1.5mm 3mm;
      border-radius: 2mm;
      font-weight: bold;
      font-size: 11pt;
      color: white;
      border: 2px solid #000;
      letter-spacing: 0.5pt;
      z-index: 2;
    }

    .tier-1 { background: #10b981; border-color: #10b981; }
    .tier-2 { background: #f59e0b; border-color: #f59e0b; }
    .tier-3 { background: #ef4444; border-color: #ef4444; }

    .tier-bonus {
      position: absolute;
      top: 2mm;
      left: 2mm;
      padding: 1.5mm 3mm;
      border-radius: 2mm;
      font-weight: bold;
      font-size: 10pt;
      color: white;
      background: #3b82f6;
      border: 2px solid #1e40af;
      z-index: 2;
    }

    .conspiracy-icon {
      font-size: 32pt;
      text-align: center;
      margin: 12mm 0 4mm 0;
      line-height: 1;
    }

    .conspiracy-name {
      font-weight: bold;
      font-size: 11pt;
      text-align: center;
      margin-bottom: 3mm;
      line-height: 1.3;
      min-height: 10mm;
      padding-bottom: 2mm;
      border-bottom: 2px solid #000;
      color: #000;
    }

    .conspiracy-description {
      font-size: 8pt;
      line-height: 1.4;
      flex-grow: 1;
      font-style: italic;
      color: #333;
      padding: 2mm 2mm 0 3mm;
      overflow: hidden;
      border-left: 2px solid #ccc;
    }

    .card-back {
      background: white;
      border: 3px solid #000;
      border-radius: 4mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 16pt;
      text-align: center;
      line-height: 1.5;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 3pt;
      position: relative;
      overflow: hidden;
    }

    .card-back::before {
      content: '';
      position: absolute;
      width: 120%;
      height: 120%;
      background: repeating-linear-gradient(
        45deg,
        #f0f0f0,
        #f0f0f0 5mm,
        #e5e5e5 5mm,
        #e5e5e5 10mm
      );
      transform: rotate(-45deg);
    }

    .card-back-content {
      z-index: 1;
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
${pageCards.map(card => `    <div class="conspiracy-card tier-${card.tier}">
      <div class="tier-bonus">+${card.tier} pts</div>
      <div class="tier-badge">${'★'.repeat(card.tier)}</div>
      <div class="conspiracy-icon">${card.icon}</div>
      <div class="conspiracy-name">${card.name}</div>
      <div class="conspiracy-description">${card.description}</div>
    </div>`).join('\n')}
${Array.from({ length: 9 - pageCards.length }).map(() => '    <div style="border: 1px dashed #ccc; border-radius: 4mm;"></div>').join('\n')}
  </div>
</div>`;
}).join('\n\n')}

<!-- CONSPIRACY CARDS (BACKS) -->
${Array.from({ length: Math.ceil(conspiracies.length / 9) }).map(() => {
  return `<div class="page">
  <div class="card-grid">
${Array.from({ length: 9 }).map(() => `    <div class="card-back">
      <div class="card-back-content">
        SIGNAL<br>TO<br>NOISE
      </div>
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
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', Arial, sans-serif; background: white; }
    .page { page-break-after: always; width: 210mm; height: 297mm; padding: 5mm; }
    .card-grid { display: grid; grid-template-columns: repeat(3, 1fr); grid-template-rows: repeat(3, 1fr); gap: 3mm; height: 100%; }

    .evidence-card {
      background: white;
      border: 3px solid #000;
      border-radius: 3mm;
      padding: 4mm;
      position: relative;
      display: flex;
      flex-direction: column;
      color: #000;
      min-height: 85mm;
    }

    .excitement-badge {
      position: absolute;
      bottom: 2mm;
      right: 2mm;
      font-size: 8pt;
      padding: 1mm 2mm;
      border-radius: 2mm;
      font-weight: bold;
      border: 2px solid #000;
      z-index: 10;
    }

    .excitement-exciting {
      background: #ef4444;
      color: white;
    }

    .excitement-neutral {
      background: #6b7280;
      color: white;
    }

    .excitement-boring {
      background: #d1d5db;
      color: #000;
    }

    .evidence-name {
      font-weight: bold;
      font-size: 10pt;
      margin-bottom: 2mm;
      line-height: 1.3;
      min-height: 10mm;
      border-bottom: 2px solid #000;
      padding-bottom: 2mm;
      color: #000;
      padding-right: 2mm;
    }

    .proof-badge {
      font-size: 8pt;
      padding: 1.5mm 2.5mm;
      border-radius: 2mm;
      font-weight: bold;
      margin-bottom: 2mm;
      text-align: center;
      letter-spacing: 0.3pt;
      border: 2px solid;
    }

    .proof-real {
      background: #d1fae5;
      color: #065f46;
      border-color: #10b981;
    }

    .proof-fake {
      background: #fee2e2;
      color: #991b1b;
      border-color: #ef4444;
    }

    .proof-bluff {
      background: #fef3c7;
      color: #92400e;
      border-color: #f59e0b;
    }

    .flavor-text {
      font-size: 8pt;
      line-height: 1.4;
      flex-grow: 1;
      color: #000;
      padding: 2mm 0;
      min-height: 25mm;
    }

    .supports-section {
      border-top: 2px solid #000;
      padding-top: 2mm;
      margin-top: 2mm;
      padding-bottom: 10mm;
      font-size: 7.5pt;
      line-height: 1.35;
      color: #000;
    }

    .supports-label {
      font-weight: bold;
      margin-bottom: 1mm;
      color: #000;
      font-size: 8pt;
    }

    .supports-all {
      color: #065f46;
      font-weight: bold;
      font-size: 8pt;
    }

    .supports-conspiracies {
      font-size: 7.5pt;
      line-height: 1.4;
      color: #000;
    }

    .card-back {
      background: white;
      border: 3px solid #000;
      border-radius: 3mm;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      font-weight: bold;
      font-size: 14pt;
      text-align: center;
      line-height: 1.5;
      color: #000;
      text-transform: uppercase;
      letter-spacing: 2pt;
      position: relative;
      overflow: hidden;
    }

    .card-back::before {
      content: '';
      position: absolute;
      width: 120%;
      height: 120%;
      background: repeating-linear-gradient(
        -45deg,
        #f0f0f0,
        #f0f0f0 5mm,
        #e5e5e5 5mm,
        #e5e5e5 10mm
      );
      transform: rotate(-45deg);
    }

    .card-back-content {
      z-index: 1;
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
  // Excitement badge
  let excitementClass = 'excitement-neutral';
  let excitementText = '★☆☆ NEUTRAL';
  if (card.excitement === 1) {
    excitementClass = 'excitement-exciting';
    excitementText = '★★★ EXCITING';
  } else if (card.excitement === -1) {
    excitementClass = 'excitement-boring';
    excitementText = '☆☆☆ BORING';
  }

  // Proof badge (random assignment for print - in actual game this is dynamic)
  const proofValues = ['REAL', 'FAKE', 'BLUFF'];
  const proofValue = proofValues[Math.abs(card.id.charCodeAt(3)) % 3];
  let proofBadge = '';
  if (proofValue === 'REAL') {
    proofBadge = '<div class="proof-badge proof-real">✓ Proof: REAL</div>';
  } else if (proofValue === 'FAKE') {
    proofBadge = '<div class="proof-badge proof-fake">✗ Proof: FAKE</div>';
  } else {
    proofBadge = '<div class="proof-badge proof-bluff">🎭 BLUFF!</div>';
  }

  // Supports text - make conspiracy names readable
  let supportsText = '';
  if (card.supportedConspiracies.includes('ALL')) {
    supportsText = '<div class="supports-label">Supports:</div><div class="supports-all">✓ ALL CONSPIRACIES</div>';
  } else {
    // Get conspiracy names, not IDs
    const conspNames = card.supportedConspiracies.map(id => {
      const consp = conspiracies.find(c => c.id === id);
      return consp ? consp.name : id;
    });
    const displayNames = conspNames.slice(0, 3); // Show max 3
    const remaining = conspNames.length - displayNames.length;
    supportsText = `<div class="supports-label">Supports:</div><div class="supports-conspiracies">${displayNames.join(', ')}${remaining > 0 ? ` +${remaining} more` : ''}</div>`;
  }

  return `    <div class="evidence-card">
      <div class="excitement-badge ${excitementClass}">${excitementText}</div>
      <div class="evidence-name">${card.name}</div>
      ${proofBadge}
      <div class="flavor-text">${card.flavorText}</div>
      <div class="supports-section">${supportsText}</div>
    </div>`;
}).join('\n')}
${Array.from({ length: 9 - pageCards.length }).map(() => '    <div style="border: 1px dashed #ccc; border-radius: 3mm;"></div>').join('\n')}
  </div>
</div>`;
}).join('\n\n')}

<!-- EVIDENCE CARDS (BACKS) -->
${Array.from({ length: pagesNeeded }).map(() => {
  return `<div class="page">
  <div class="card-grid">
${Array.from({ length: 9 }).map(() => `    <div class="card-back">
      <div class="card-back-content">
        EVIDENCE<br>CARD
      </div>
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
        <strong>Tier Bonus (v2.3.0):</strong><br>
        • Tier 1 (★): +1 pt (easy - lots of evidence)<br>
        • Tier 2 (★★): +2 pts (medium - some evidence)<br>
        • Tier 3 (★★★): +3 pts (hard - scarce evidence)
      </div>

      <div class="scoring-box">
        <strong>Evidence Bonuses:</strong><br>
        • Specificity: +3 (specific) or +1 (ALL)<br>
        • Diminishing Returns: 1st card full, 2nd+ = +1<br>
        • Excitement Multiplier:<br>
        &nbsp;&nbsp;★★★ EXCITING: ×2.0<br>
        &nbsp;&nbsp;★☆☆ NEUTRAL: ×1.0<br>
        &nbsp;&nbsp;☆☆☆ BORING: ×0.5<br>
        • Novelty: +2 (first use per conspiracy)
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
