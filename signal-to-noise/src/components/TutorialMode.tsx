import React from 'react';
import { Phase } from '../types';
import './TutorialMode.css';

interface TutorialModeProps {
  phase: Phase;
  round: number;
  currentPlayerName: string;
  isEnabled: boolean;
  onToggle: () => void;
}

export const TutorialMode: React.FC<TutorialModeProps> = ({
  phase,
  round,
  currentPlayerName,
  isEnabled,
  onToggle
}) => {
  if (!isEnabled) {
    return (
      <div className="tutorial-toggle">
        <button className="btn-tutorial-toggle" onClick={onToggle}>
          📚 Enable Tutorial Mode
        </button>
      </div>
    );
  }

  const getTutorialContent = () => {
    switch (phase) {
      case 'INVESTIGATE':
        return {
          title: '🔍 INVESTIGATE PHASE',
          steps: [
            {
              emoji: '👀',
              title: 'Look at Your Hand',
              description: 'You have evidence cards at the bottom of the screen. Each card shows what conspiracies it supports.'
            },
            {
              emoji: '🎯',
              title: 'Assign Evidence Face-Down',
              description: `${currentPlayerName}, select a card from your hand, then click a conspiracy on the board. The card is placed face-down - you know what it is, but others don't!`
            },
            {
              emoji: '👁️',
              title: 'Visible Counts, Hidden Content',
              description: 'Other players can SEE how many cards you assign to each conspiracy (e.g., "Alice: 3 cards on Moon Landing"), but they can\'t see WHAT those cards are. Are you confident or bluffing?'
            },
            {
              emoji: '🃏',
              title: 'Card Details Matter',
              description: 'Check the card\'s EXCITEMENT level (☆☆☆ boring, ★☆☆ neutral, ★★★ exciting). Exciting cards give bonus points! Also note if it supports "ALL" conspiracies or specific ones.'
            },
            {
              emoji: '💡',
              title: 'Strategy: Signal or Hide',
              description: 'Stack many cards on ONE conspiracy to signal confidence (or bluff!). Spread cards thin across MULTIPLE conspiracies to hide your true target. Others are watching!'
            },
            {
              emoji: '✅',
              title: 'When Ready',
              description: 'Click "Done Investigating" to let the next player take their turn. After all players finish, everyone draws 2 new cards!'
            }
          ],
          color: '#3b82f6'
        };

      case 'ADVERTISE':
        return {
          title: '📢 ADVERTISE PHASE',
          steps: [
            {
              emoji: '📡',
              title: 'Signal Your Interest',
              description: `${currentPlayerName}, select a conspiracy from the board to signal your interest in broadcasting about it. This tells other players where you might be going.`
            },
            {
              emoji: '🎭',
              title: 'Create Opportunities or Traps',
              description: `Your advertisement might encourage others to join you (bandwagoning for consensus), or it might make them suspicious (is it a trap with no evidence?). You're NOT revealing your position yet!`
            },
            {
              emoji: '🤔',
              title: 'Watch Other Players',
              description: `Pay attention to what conspiracies others advertise. If multiple players signal the same conspiracy, consensus might be easier to reach! But do they all have evidence, or are some bluffing?`
            },
            {
              emoji: '🔒',
              title: 'No Commitment Yet',
              description: `Advertising is NOT binding - you can still choose to broadcast on a different conspiracy (or pass) in the next phase. It's all psychological!`
            },
            {
              emoji: '🔄',
              title: 'Or Pass',
              description: `Not sure what to advertise? Click "Pass" to skip advertising. This keeps your intentions secret but might miss out on influencing others.`
            }
          ],
          color: '#a855f7'
        };

      case 'BROADCAST':
        return {
          title: '📻 BROADCAST PHASE',
          steps: [
            {
              emoji: '🎲',
              title: 'Choose a Conspiracy',
              description: `${currentPlayerName}, select a conspiracy from the board above to broadcast about.`
            },
            {
              emoji: '🎭',
              title: 'Three Position Options',
              description: `
                <div class="positions">
                  <div class="position-item"><strong>✓ REAL</strong> - Claim it's real</div>
                  <div class="position-item"><strong>✗ FAKE</strong> - Claim it's fake</div>
                  <div class="position-item"><strong>??? INCONCLUSIVE</strong> - Play it safe (2 pts, no risk)</div>
                </div>
              `
            },
            {
              emoji: '⚠️',
              title: 'Evidence vs Bandwagoning',
              description: `
                <strong>WITH EVIDENCE:</strong> 3 base points + bonuses<br>
                <strong>NO EVIDENCE (Bandwagoning):</strong> Only 1 base point<br>
                You can broadcast without evidence, but rewards are much lower!
              `
            },
            {
              emoji: '🤝',
              title: 'Consensus is Key!',
              description: `The goal is to build CONSENSUS (majority agreement). If you and enough other players agree on REAL or FAKE, consensus is reached and everyone scores! Threshold: ${round >= 1 ? 'Need majority' : 'Check player count'}.`
            },
            {
              emoji: '🔄',
              title: 'Or Pass',
              description: 'Not confident? Click "Pass" to skip broadcasting and draw 1 card instead. Safe but no points.'
            }
          ],
          color: '#10b981'
        };

      case 'RESOLVE':
        return {
          title: '⚖️ RESOLVE PHASE',
          steps: [
            {
              emoji: '🔢',
              title: 'Checking for Consensus',
              description: 'The game is now checking each conspiracy to see if enough players agreed on the same position (REAL or FAKE).'
            },
            {
              emoji: '📊',
              title: 'Consensus Calculation',
              description: `Consensus requires a MAJORITY of players to agree. INCONCLUSIVE broadcasts don't count toward consensus, but still score 2 points.`
            },
            {
              emoji: '🎁',
              title: 'Scoring Happens',
              description: `
                When consensus is reached, EVERYONE who broadcast gets points:<br>
                <strong>Base Points:</strong> 3 (with evidence) or 1 (bandwagoning) or 2 (inconclusive)<br>
                <strong>+ Evidence Bonuses:</strong> Specific cards (+3), Generic cards (+1), Excitement multiplier, Novelty bonus<br>
                <strong>× Credibility Modifier:</strong> High credibility (7+) = +50%, Low credibility (≤3) = -25%
              `
            },
            {
              emoji: '⭐',
              title: 'Credibility Adjustment',
              description: 'Majority side gets +1 credibility, minority side gets -1 credibility. INCONCLUSIVE broadcasts are safe (no change).'
            },
            {
              emoji: '🎯',
              title: 'No Truth Value',
              description: `<strong>Important:</strong> There's NO "correct" answer! The CONSENSUS (what the majority agreed on) becomes reality. This game is about persuasion, not truth.`
            }
          ],
          color: '#f59e0b'
        };

      case 'CLEANUP':
        return {
          title: '🧹 CLEANUP PHASE',
          steps: [
            {
              emoji: '🔄',
              title: 'Replace Revealed Conspiracies',
              description: 'Any conspiracies that reached consensus are replaced with new ones from the deck.'
            },
            {
              emoji: '📈',
              title: 'Check Scores',
              description: 'Look at the scoreboard! Who\'s ahead? Who needs to catch up?'
            },
            {
              emoji: '🎯',
              title: 'Evidence Persists',
              description: 'Your assigned evidence stays with those conspiracies! If you use the same evidence again next round, it might be BORING (penalty) or EXCITING (bonus) depending on the card.'
            },
            {
              emoji: '🏁',
              title: 'Win Condition',
              description: `The game ends after Round 6. Highest AUDIENCE points wins! (Round ${round}/6)`
            },
            {
              emoji: '▶️',
              title: 'Next Round',
              description: 'Click "Next Round" to start the next INVESTIGATE phase. The player with the LOWEST score goes first (comeback mechanic)!'
            }
          ],
          color: '#a855f7'
        };

      default:
        return { title: '', steps: [], color: '#6b7280' };
    }
  };

  const content = getTutorialContent();

  return (
    <div className="tutorial-mode" style={{ borderColor: content.color }}>
      <div className="tutorial-header" style={{ background: content.color }}>
        <h2>{content.title}</h2>
        <button className="btn-tutorial-close" onClick={onToggle}>
          ✕ Close Tutorial
        </button>
      </div>

      <div className="tutorial-content">
        {content.steps.map((step, index) => (
          <div key={index} className="tutorial-step">
            <div className="step-number">{index + 1}</div>
            <div className="step-emoji">{step.emoji}</div>
            <div className="step-content">
              <h3>{step.title}</h3>
              <div
                className="step-description"
                dangerouslySetInnerHTML={{ __html: step.description }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="tutorial-footer" style={{ background: content.color }}>
        <div className="tutorial-tip">
          💡 <strong>Tip:</strong> This tutorial updates for each phase. Keep it open to understand what's happening!
        </div>
      </div>
    </div>
  );
};
