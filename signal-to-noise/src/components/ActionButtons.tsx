import React from 'react';
import { Phase } from '../types';
import './ActionButtons.css';

interface ActionButtonsProps {
  phase: Phase;
  onAssignEvidence?: () => void;
  onBroadcast?: (position: 'REAL' | 'FAKE') => void;
  onPass?: () => void;
  onNextBroadcast?: () => void;
  onContinue?: () => void;
  canAssign?: boolean;
  canBroadcast?: boolean;
  canPass?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  phase,
  onAssignEvidence,
  onBroadcast,
  onPass,
  onNextBroadcast,
  onContinue,
  canAssign = true,
  canBroadcast = true,
  canPass = true
}) => {
  return (
    <div className="action-buttons">
      {phase === 'INVESTIGATE' && (
        <>
          {!canAssign && (
            <div className="button-hint">
              👆 Select an evidence card from your hand, then select a conspiracy
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={onAssignEvidence}
            disabled={!canAssign}
          >
            Assign Evidence
          </button>
          <button className="btn btn-success" onClick={onContinue}>
            Done Investigating
          </button>
        </>
      )}

      {phase === 'BROADCAST' && (
        <>
          {!canBroadcast && (
            <div className="button-hint">
              👆 Select a conspiracy from the board above to broadcast about
            </div>
          )}
          <button
            className="btn btn-real"
            onClick={() => onBroadcast && onBroadcast('REAL')}
            disabled={!canBroadcast}
          >
            Broadcast: REAL
          </button>
          <button
            className="btn btn-fake"
            onClick={() => onBroadcast && onBroadcast('FAKE')}
            disabled={!canBroadcast}
          >
            Broadcast: FAKE
          </button>
          <button
            className="btn btn-warning"
            onClick={onPass}
            disabled={!canPass}
          >
            Pass (Draw 1 Card)
          </button>
        </>
      )}

      {phase === 'RESOLVE' && (
        <>
          <button className="btn btn-primary" onClick={onNextBroadcast}>
            Next Broadcast
          </button>
          <button className="btn btn-success" onClick={onContinue}>
            Continue to Cleanup
          </button>
        </>
      )}

      {phase === 'CLEANUP' && (
        <button className="btn btn-success" onClick={onContinue}>
          Next Round
        </button>
      )}
    </div>
  );
};
