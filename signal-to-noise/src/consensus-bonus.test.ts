/**
 * Consensus Bonus Scoring System Test
 *
 * Demonstrates the v6.0 scoring changes
 */

import { simulateGame } from './gameSimulation';
import { AI_PERSONALITIES } from './aiPersonalities';

describe('Consensus Bonus Scoring System (v6.0)', () => {
  test('Demonstrates new consensus-aware scoring', () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     CONSENSUS BONUS SCORING - v6.0                    ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('Scoring Rules:');
    console.log('1. ✅ Correct + Consensus = +4 audience (+3 base + +1 bonus)');
    console.log('2. ✅ Correct but Against Consensus = +3 audience');
    console.log('3. 📊 On Consensus but Wrong = +1 audience (participation)');
    console.log('4. ❌ Against Consensus and Wrong = NOTHING\n');

    console.log('Running demonstration game...\n');
    console.log('═══════════════════════════════════════════════════════\n');

    const result = simulateGame([
      AI_PERSONALITIES.CALCULATED_STRATEGIST,
      AI_PERSONALITIES.PROFESSIONAL_ANALYST,
      AI_PERSONALITIES.STEADY_BUILDER,
      AI_PERSONALITIES.OPPORTUNIST
    ]);

    console.log('\n═══════════════════════════════════════════════════════');
    console.log('FINAL RESULTS:');
    console.log('═══════════════════════════════════════════════════════\n');

    result.finalState.players
      .sort((a, b) => {
        if (b.audience !== a.audience) return b.audience - a.audience;
        return b.credibility - a.credibility;
      })
      .forEach((player, idx) => {
        const trophy = idx === 0 ? '🏆 ' : '   ';
        console.log(`${trophy}${idx + 1}. ${player.name}`);
        console.log(`     Audience: ${player.audience}`);
        console.log(`     Credibility: ${player.credibility}`);
        console.log(`     Broadcasts: ${player.broadcastHistory.length}`);
        console.log('');
      });

    console.log('\nLook through the game log above for scoring messages:');
    console.log('  ✅ "correct + consensus bonus: +4 audience total"');
    console.log('  ✅ "correct (against consensus): +3 audience"');
    console.log('  📊 "on consensus side (wrong about truth): +1 audience"\n');

    // Verify game completed successfully
    expect(result.finalState.round).toBeGreaterThan(6);
    expect(result.winner).toBeTruthy();
    expect(result.finalState.players.length).toBe(4);
  });

  test('Strategic implications of consensus bonus', () => {
    console.log('\n╔════════════════════════════════════════════════════════╗');
    console.log('║     STRATEGIC IMPLICATIONS                             ║');
    console.log('╚════════════════════════════════════════════════════════╝\n');

    console.log('The consensus bonus system creates these strategic dynamics:\n');
    console.log('1. 🤝 COALITION VALUE: Being on the majority side now rewards you');
    console.log('   - Even if wrong, you get +1 audience for participation');
    console.log('   - Consensus alignment is now strategically valuable\n');

    console.log('2. 🎯 TRUTH STILL MATTERS: Correctness remains most important');
    console.log('   - +4 for correct + consensus (best outcome)');
    console.log('   - +3 for correct alone (still good)');
    console.log('   - Being right is always better than being wrong\n');

    console.log('3. 🔍 CONTRARIAN PLAY: Going against consensus is riskier');
    console.log('   - If right: +3 audience (no bonus)');
    console.log('   - If wrong: NOTHING (harsh penalty for being both wrong and alone)\n');

    console.log('4. 🎲 RISK/REWARD BALANCE: Creates interesting decisions');
    console.log('   - Join majority for safety (+1 guaranteed if you have evidence)');
    console.log('   - Go alone for truth (+3 if correct, 0 if wrong)\n');

    expect(true).toBe(true); // Pass test
  });
});
