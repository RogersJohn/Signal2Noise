import React from 'react';
import { Phase } from '../types';
import './ActionButtons.css';

interface ActionButtonsProps {
  phase: Phase;
  onAssignEvidence?: () => void;
  onAdvertise?: () => void;
  onAdvertisePass?: () => void;
  onBroadcast?: (position: 'REAL' | 'FAKE' | 'INCONCLUSIVE') => void;
  onPass?: () => void;
  onNextBroadcast?: () => void;
  onContinue?: () => void;
  canAssign?: boolean;
  canAdvertise?: boolean;
  canBroadcast?: boolean;
  canPass?: boolean;
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  phase,
  onAssignEvidence,
  onAdvertise,
  onAdvertisePass,
  onBroadcast,
  onPass,
  onNextBroadcast,
  onContinue,
  canAssign = true,
  canAdvertise = true,
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

      {phase === 'ADVERTISE' && (
        <>
          {!canAdvertise && (
            <div className="button-hint">
              👆 Select a conspiracy to signal your interest (or pass)
            </div>
          )}
          <button
            className="btn btn-primary"
            onClick={onAdvertise}
            disabled={!canAdvertise}
          >
            📢 Advertise Interest
          </button>
          <button
            className="btn btn-warning"
            onClick={onAdvertisePass}
            disabled={!canPass}
          >
            Pass (No Advertisement)
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
            Broadcast: REAL ✓
          </button>
          <button
            className="btn btn-fake"
            onClick={() => onBroadcast && onBroadcast('FAKE')}
            disabled={!canBroadcast}
          >
            Broadcast: FAKE ✗
          </button>
          <button
            className="btn btn-inconclusive"
            onClick={() => onBroadcast && onBroadcast('INCONCLUSIVE')}
            disabled={!canBroadcast}
          >
            Broadcast: INCONCLUSIVE ???
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
