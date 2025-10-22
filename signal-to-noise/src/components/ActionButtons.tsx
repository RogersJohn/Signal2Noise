import React from 'react';
import { Phase } from '../types';
import './ActionButtons.css';

interface ActionButtonsProps {
  phase: Phase;
  onAssignEvidence?: () => void;
  onAdvertise?: () => void;
  onAdvertisePass?: () => void;
  onBroadcast?: (position: 'REAL' | 'FAKE' | 'INCONCLUSIVE') => void;
  onPlayLateEvidence?: () => void; // v5.0: Play face-up evidence
  onPass?: () => void;
  onNextBroadcast?: () => void;
  onContinue?: () => void;
  canAssign?: boolean;
  canAdvertise?: boolean;
  canBroadcast?: boolean;
  canPlayLateEvidence?: boolean; // v5.0: Can play late evidence
  canPass?: boolean;
  broadcastCount?: number; // v5.0: Track broadcasts made (0-2)
  lateEvidencePlayed?: boolean; // v5.0: Track if late evidence was played
}

export const ActionButtons: React.FC<ActionButtonsProps> = ({
  phase,
  onAssignEvidence,
  onAdvertise,
  onAdvertisePass,
  onBroadcast,
  onPlayLateEvidence,
  onPass,
  onNextBroadcast,
  onContinue,
  canAssign = true,
  canAdvertise = true,
  canBroadcast = true,
  canPlayLateEvidence = false,
  canPass = true,
  broadcastCount = 0,
  lateEvidencePlayed = false
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
          <div className="broadcast-counter">
            📢 Broadcasts Made: {broadcastCount}/2
            {broadcastCount === 0 && " (Can broadcast on 0-2 conspiracies)"}
            {broadcastCount === 1 && " (Can broadcast on 1 more)"}
            {broadcastCount === 2 && " (Maximum reached)"}
          </div>

          {!canBroadcast && broadcastCount < 2 && (
            <div className="button-hint">
              👆 Select a conspiracy from the board above to broadcast about
            </div>
          )}

          {broadcastCount === 2 && (
            <div className="button-hint">
              ✓ Made 2 broadcasts - your turn will automatically end
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

          {/* v5.0: Late-Breaking Evidence Button */}
          {broadcastCount > 0 && (
            <>
              <div className="late-evidence-divider">── Late-Breaking Evidence ──</div>
              {!lateEvidencePlayed && (
                <div className="button-hint">
                  💡 You can play ONE face-up evidence card on a conspiracy you broadcast on
                </div>
              )}
              {lateEvidencePlayed && (
                <div className="button-hint success">
                  ✓ Late-breaking evidence played (visible to all players)
                </div>
              )}
              <button
                className="btn btn-late-evidence"
                onClick={onPlayLateEvidence}
                disabled={!canPlayLateEvidence}
              >
                🎬 Play Late-Breaking Evidence (Face-Up)
              </button>
            </>
          )}

          <button
            className="btn btn-warning"
            onClick={onPass}
            disabled={!canPass}
          >
            {broadcastCount === 0 ? 'Pass (Skip Broadcasting & Draw 1 Card)' : `Done Broadcasting (${broadcastCount} made)`}
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
