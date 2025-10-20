import React, { useState } from 'react';
import { Phase } from '../types';
import './HelpPanel.css';

interface HelpPanelProps {
  phase: Phase;
}

export const HelpPanel: React.FC<HelpPanelProps> = ({ phase }) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const getPhaseHelp = () => {
    switch (phase) {
      case 'INVESTIGATE':
        return {
          title: 'INVESTIGATE Phase',
          steps: [
            '1. Look at your evidence cards (hand)',
            '2. Click a card, then click a conspiracy to assign it',
            '3. Build strong cases: More evidence = more points if correct',
            '4. When done, click "Done Investigating" to pass to next player',
          ],
          tip: 'Strategy: Put 3-4 evidence on one conspiracy rather than spreading thin. After all players finish, everyone draws 2 cards.'
        };
      case 'BROADCAST':
        return {
          title: 'BROADCAST Phase',
          steps: [
            '1. Check the Broadcast Queue above - see what others claimed!',
            '2. Select a conspiracy YOU assigned evidence to (check "Assigned Evidence")',
            '3. Click REAL or FAKE based on whether you think they\'re right',
            '4. OR click PASS to skip and draw 1 card',
          ],
          tip: 'STRATEGY: Need 2 votes (2p) or 3 votes (3-4p) on SAME position for scoring! If 2 players agree on "REAL", you can join as 3rd to trigger scoring, or claim "FAKE" to block them.'
        };
      case 'RESOLVE':
        return {
          title: 'RESOLVE Phase',
          steps: [
            '1. Review the detailed scoring breakdown shown below',
            '2. CONSENSUS TRIGGERS SCORING: Need 2 players (2p game) or 3 players (3-4p game) claiming SAME position',
            '3. WITH consensus: Truth revealed! Correct gets points (evidence × tier★), Wrong loses 3 credibility',
            '4. NO consensus: All broadcasts discarded, no scoring, conspiracy stays hidden',
          ],
          tip: 'KEY: Only consensus causes scoring! If you broadcast alone or split votes, nothing happens. This is why you watch what others claim before you decide.'
        };
      case 'CLEANUP':
        return {
          title: 'CLEANUP Phase',
          steps: [
            '1. Revealed conspiracies are replaced with new ones',
            '2. Your assigned evidence is cleared (start fresh next round)',
            '3. Click "Next Round" to continue',
            '4. Game ends at: 6 rounds, 12 revealed, or 60 audience',
          ],
          tip: 'Check player scores before next round - highest audience wins!'
        };
    }
  };

  const help = getPhaseHelp();

  return (
    <div className={`help-panel ${isExpanded ? 'expanded' : 'collapsed'}`}>
      <div className="help-header" onClick={() => setIsExpanded(!isExpanded)}>
        <h3>❓ How to Play</h3>
        <button className="toggle-btn">{isExpanded ? '−' : '+'}</button>
      </div>

      {isExpanded && (
        <div className="help-content">
          <h4>{help.title}</h4>
          <ul>
            {help.steps.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ul>
          <div className="help-tip">
            <strong>💡 Tip:</strong> {help.tip}
          </div>
        </div>
      )}
    </div>
  );
};
