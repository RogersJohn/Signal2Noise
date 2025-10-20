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
          tip: 'EXCITEMENT MECHANIC: FLEXIBLE cards (gray) support many conspiracies but get -2 audience when reused. FOCUSED cards (gold) support fewer conspiracies but get +2 audience per reuse (stacks!). Evidence persists across rounds - build a specialty or stay flexible!'
        };
      case 'BROADCAST':
        return {
          title: 'BROADCAST Phase',
          steps: [
            '1. Check the Broadcast Queue above - see what others claimed!',
            '2. Select ANY conspiracy (even without evidence - bluffing allowed!)',
            '3. Click REAL or FAKE based on your claim',
            '4. OR click PASS to skip and draw 1 card',
          ],
          tip: '🎰 BLUFFING: Can broadcast without evidence! Wrong = -6 credibility (double penalty). Opponents can\'t see your evidence until RESOLVE. Need 2 votes (2p) or 3 votes (3-4p) on SAME position for scoring!'
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
            '2. Your assigned evidence PERSISTS (reuse next round for bonuses/penalties)',
            '3. Click "Next Round" to continue',
            '4. Game ends at: 6 rounds, 12 revealed, or 60 audience',
          ],
          tip: 'Evidence stays assigned! Reusing FOCUSED evidence gives bonuses, reusing FLEXIBLE evidence gives penalties. Plan your long-term strategy!'
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
