import React from 'react';
import { ConspiracyCard, PlayerState } from '../types';
import { canSupportConspiracy } from '../gameLogic';
import './ConspiracyBoard.css';

interface ConspiracyBoardProps {
  conspiracies: ConspiracyCard[];
  onSelect?: (conspiracyId: string) => void;
  selectedConspiracy?: string | null;
  selectedCardId?: string | null;
  currentPlayer?: PlayerState;
  allPlayers?: PlayerState[]; // NEW: Show evidence counts from all players
}

export const ConspiracyBoard: React.FC<ConspiracyBoardProps> = ({
  conspiracies,
  onSelect,
  selectedConspiracy,
  selectedCardId,
  currentPlayer,
  allPlayers = [] // Default to empty array
}) => {
  const getTierColor = (tier: number): string => {
    switch (tier) {
      case 1:
        return '#10b981'; // green
      case 2:
        return '#f59e0b'; // yellow/orange
      case 3:
        return '#ef4444'; // red
      default:
        return '#6b7280'; // gray
    }
  };

  const getTierStars = (tier: number): string => {
    return '★'.repeat(tier);
  };

  // Find selected evidence card if any
  const selectedCard = selectedCardId && currentPlayer
    ? currentPlayer.evidenceHand.find(c => c.id === selectedCardId)
    : null;

  // Determine if conspiracy can accept the selected card
  const getConspiracyValidityClass = (conspiracyId: string): string => {
    if (!selectedCard) return '';

    const isValid = canSupportConspiracy(selectedCard, conspiracyId);
    return isValid ? 'valid-target' : 'invalid-target';
  };

  return (
    <div className="conspiracy-board">
      <h2>Active Conspiracies</h2>
      <div className="conspiracy-grid">
        {conspiracies.map((conspiracy) => (
          <div
            key={conspiracy.id}
            className={`conspiracy-card ${
              selectedConspiracy === conspiracy.id ? 'selected' : ''
            } ${getConspiracyValidityClass(conspiracy.id)}`}
            style={{ borderColor: getTierColor(conspiracy.tier) }}
            onClick={() => onSelect && onSelect(conspiracy.id)}
          >
            <div
              className="conspiracy-tier"
              style={{ backgroundColor: getTierColor(conspiracy.tier) }}
            >
              {getTierStars(conspiracy.tier)}
            </div>
            {conspiracy.icon && (
              <div className="conspiracy-icon">{conspiracy.icon}</div>
            )}
            <h3>{conspiracy.name}</h3>
            <p className="conspiracy-description">{conspiracy.description}</p>

            {/* NEW: Show evidence counts per player */}
            {allPlayers.length > 0 && (
              <div className="evidence-markers">
                {allPlayers.map(player => {
                  const evidenceCount = player.assignedEvidence[conspiracy.id]?.length || 0;
                  if (evidenceCount === 0) return null;

                  return (
                    <div key={player.id} className="player-evidence-marker" style={{ color: player.color }}>
                      <span className="player-initial">{player.name[0]}</span>
                      <span className="card-icons">{'🃏'.repeat(evidenceCount)}</span>
                    </div>
                  );
                })}
              </div>
            )}

            {/* v5.0: Show face-up evidence (late-breaking evidence) */}
            {allPlayers.length > 0 && (
              <div className="face-up-evidence-section">
                {allPlayers.map(player => {
                  const faceUpCards = player.faceUpEvidence?.[conspiracy.id] || [];
                  if (faceUpCards.length === 0) return null;

                  return faceUpCards.map((card, idx) => (
                    <div
                      key={`${player.id}-${card.id}-${idx}`}
                      className="face-up-evidence-card"
                      style={{ borderColor: player.color }}
                    >
                      <div className="face-up-header" style={{ backgroundColor: player.color }}>
                        <span className="face-up-player">{player.name}</span>
                        <span className="face-up-label">🎬 LATE-BREAKING</span>
                      </div>
                      <div className="face-up-name">{card.name}</div>
                      <div className={`face-up-proof proof-${card.proofValue.toLowerCase()}`}>
                        {card.proofValue === 'REAL' && '✓ Proof: REAL'}
                        {card.proofValue === 'FAKE' && '✗ Proof: FAKE'}
                        {card.proofValue === 'BLUFF' && '🎭 BLUFF!'}
                      </div>
                      <div className="face-up-excitement">
                        {card.excitement === 1 && '🔥 EXCITING'}
                        {card.excitement === 0 && '📰 NEUTRAL'}
                        {card.excitement === -1 && '😴 BORING'}
                      </div>
                    </div>
                  ));
                })}
              </div>
            )}

            {conspiracy.isRevealed && (
              <div
                className={`truth-value ${
                  conspiracy.truthValue === 'REAL' ? 'real' : 'fake'
                }`}
              >
                {conspiracy.truthValue === 'REAL' ? '✓ REAL' : '✗ FAKE'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
