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
}

export const ConspiracyBoard: React.FC<ConspiracyBoardProps> = ({
  conspiracies,
  onSelect,
  selectedConspiracy,
  selectedCardId,
  currentPlayer
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
