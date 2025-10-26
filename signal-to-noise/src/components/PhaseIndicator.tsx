import React from 'react';
import { Phase } from '../types';
import './PhaseIndicator.css';

interface PhaseIndicatorProps {
  phase: Phase;
  round: number;
}

export const PhaseIndicator: React.FC<PhaseIndicatorProps> = ({
  phase,
  round
}) => {
  const getPhaseColor = (currentPhase: Phase): string => {
    switch (currentPhase) {
      case 'INVESTIGATE':
        return '#3b82f6'; // blue
      case 'ADVERTISE':
        return '#a855f7'; // purple
      case 'LATE_EVIDENCE':
        return '#ec4899'; // pink
      case 'BROADCAST':
        return '#f59e0b'; // orange
      case 'RESOLVE':
        return '#10b981'; // green
      case 'CLEANUP':
        return '#6b7280'; // gray
      default:
        return '#6b7280';
    }
  };

  const getPhaseDescription = (currentPhase: Phase): string => {
    switch (currentPhase) {
      case 'INVESTIGATE':
        return 'Assign evidence cards to conspiracies you want to claim';
      case 'ADVERTISE':
        return 'Signal which conspiracy interests you - create opportunities or set traps!';
      case 'LATE_EVIDENCE':
        return 'Play ONE card face-up for dramatic effect - or pass to keep your hand hidden!';
      case 'BROADCAST':
        return 'See what others advertised, then make YOUR claim (or pass)';
      case 'RESOLVE':
        return 'See if consensus was reached and who scored points';
      case 'CLEANUP':
        return 'Preparing next round...';
      default:
        return '';
    }
  };

  return (
    <div className="phase-indicator" style={{ borderColor: getPhaseColor(phase) }}>
      <div
        className="phase-banner"
        style={{ backgroundColor: getPhaseColor(phase) }}
      >
        <h1>PHASE: {phase}</h1>
        <span className="round-indicator">Round {round}</span>
      </div>
      <p className="phase-description">{getPhaseDescription(phase)}</p>
    </div>
  );
};
