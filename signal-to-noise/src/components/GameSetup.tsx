import React, { useState } from 'react';
import './GameSetup.css';

interface GameSetupProps {
  onStartGame: (playerCount: number) => void;
}

export const GameSetup: React.FC<GameSetupProps> = ({ onStartGame }) => {
  const [selectedCount, setSelectedCount] = useState<number>(4);

  return (
    <div className="game-setup">
      <h1>Signal to Noise</h1>
      <p className="tagline">
        Separate fact from fiction. Build your audience. Destroy your credibility.
      </p>

      <div className="setup-content">
        <h2>Select Player Count</h2>
        <div className="player-count-options">
          {[3, 4, 5].map((count) => (
            <button
              key={count}
              className={`player-count-btn ${
                selectedCount === count ? 'selected' : ''
              }`}
              onClick={() => setSelectedCount(count)}
            >
              {count} Players
            </button>
          ))}
        </div>

        <div className="game-info">
          <h3>How to Play</h3>
          <ul>
            <li>
              <strong>INVESTIGATE:</strong> Draw cards and assign evidence to conspiracies
            </li>
            <li>
              <strong>BROADCAST:</strong> Claim a conspiracy is REAL or FAKE (or pass)
            </li>
            <li>
              <strong>RESOLVE:</strong> When {selectedCount === 5 ? '3' : '2'}+ players agree, reveal truth and score
            </li>
            <li>
              <strong>WIN:</strong> Most audience after 6 rounds or 12 revealed conspiracies
            </li>
          </ul>

          <div className="scoring-info">
            <p>
              <strong>Correct:</strong> Gain audience = (evidence cards × conspiracy tier)
            </p>
            <p>
              <strong>Wrong:</strong> Lose 3 credibility
            </p>
          </div>
        </div>

        <button className="start-btn" onClick={() => onStartGame(selectedCount)}>
          Start Game
        </button>
      </div>
    </div>
  );
};
