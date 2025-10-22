import React from 'react';
import { PlayerState, ConspiracyCard } from '../types';
import './PlayerHand.css';

interface PlayerHandProps {
  player: PlayerState;
  conspiracies: ConspiracyCard[];
  onCardSelect?: (cardId: string) => void;
  selectedCard?: string | null;
}

export const PlayerHand: React.FC<PlayerHandProps> = ({
  player,
  conspiracies,
  onCardSelect,
  selectedCard
}) => {
  const getConspiracyName = (conspiracyId: string): string => {
    const conspiracy = conspiracies.find((c) => c.id === conspiracyId);
    return conspiracy ? conspiracy.name : conspiracyId;
  };
  return (
    <div className="player-hand">
      <div className="player-stats">
        <h2 style={{ color: player.color }}>
          {player.name}'s Turn
          <span className="hotseating-note">👁️ Others can watch evidence placement (counts visible!)</span>
        </h2>
        <div className="stats-row">
          <div className="stat">
            <span className="stat-label">Audience:</span>
            <span className="stat-value audience">{player.audience}</span>
          </div>
          <div className="stat">
            <span className="stat-label">Credibility:</span>
            <div className="credibility-bar">
              <div
                className="credibility-fill"
                style={{ width: `${(player.credibility / 10) * 100}%` }}
              />
            </div>
            <span className="stat-value">{player.credibility}/10</span>
          </div>
        </div>
      </div>

      <div className="evidence-section">
        <h3>Your Evidence Hand ({player.evidenceHand.length}/10)</h3>
        <div className="evidence-cards">
          {player.evidenceHand.length === 0 ? (
            <p className="empty-message">No cards in hand</p>
          ) : (
            player.evidenceHand.map((card) => (
              <div
                key={card.id}
                className={`evidence-card excitement-${card.excitement} ${
                  selectedCard === card.id ? 'selected' : ''
                }`}
                onClick={() => onCardSelect && onCardSelect(card.id)}
              >
                <div className="card-header">
                  <h4>{card.name}</h4>
                  {card.excitement === -1 && (
                    <span className="excitement-badge boring" title="×0.5 to specificity bonus (rounds up on odd numbers)">
                      ☆☆☆ BORING (×0.5)
                    </span>
                  )}
                  {card.excitement === 0 && (
                    <span className="excitement-badge neutral" title="×1.0 to specificity bonus (no modifier)">
                      ★☆☆ NEUTRAL (×1.0)
                    </span>
                  )}
                  {card.excitement === 1 && (
                    <span className="excitement-badge exciting" title="×2.0 to specificity bonus (doubles your points!)">
                      ★★★ EXCITING (×2.0)
                    </span>
                  )}
                </div>

                {/* v5.0: Proof Value Badge */}
                <div className={`proof-badge proof-${card.proofValue.toLowerCase()}`}>
                  {card.proofValue === 'BLUFF' ? (
                    <>🎭 BLUFF!</>
                  ) : card.proofValue === 'REAL' ? (
                    <>✓ Proof: REAL</>
                  ) : (
                    <>✗ Proof: FAKE</>
                  )}
                </div>

                <p className="flavor-text">{card.flavorText}</p>
                <div className="supported-conspiracies">
                  {card.supportedConspiracies.includes('ALL') ? (
                    <div className="supports-all">✓ Supports ALL conspiracies</div>
                  ) : (
                    <div className="supports-specific">
                      <div className="supports-label">Can assign to:</div>
                      {card.supportedConspiracies.map((conspId) => (
                        <div key={conspId} className="conspiracy-tag">
                          {getConspiracyName(conspId)}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="assigned-evidence-section">
        <h3>Assigned Evidence</h3>
        {Object.keys(player.assignedEvidence).length === 0 ? (
          <p className="empty-message">No evidence assigned yet</p>
        ) : (
          <div className="assigned-list">
            {Object.entries(player.assignedEvidence).map(
              ([conspiracyId, cards]) => (
                <div key={conspiracyId} className="assignment">
                  <span className="assignment-conspiracy">{getConspiracyName(conspiracyId)}:</span>
                  <span className="assignment-count">{cards.length} cards</span>
                </div>
              )
            )}
          </div>
        )}
      </div>
    </div>
  );
};
