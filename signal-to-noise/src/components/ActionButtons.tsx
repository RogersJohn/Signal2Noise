import React from 'react';
import { Phase } from '../types';
import './ActionButtons.css';

interface ActionButtonsProps {
  phase: Phase;
  onAssignEvidence?: () => void;
  onAdvertise?: (position: 'REAL' | 'FAKE', betAmount: number) => void;
  onAdvertisePass?: () => void;
  onBroadcast?: (position: 'REAL' | 'FAKE' | 'INCONCLUSIVE') => void;
  onPlayLateEvidence?: () => void;
  onPass?: () => void;
  onNextBroadcast?: () => void;
  onContinue?: () => void;
  canAssign?: boolean;
  canAdvertise?: boolean;
  canBroadcast?: boolean;
  canPlayLateEvidence?: boolean;
  canPass?: boolean;
  broadcastCount?: number;
  lateEvidencePlayed?: boolean;
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
              👆 Select a conspiracy, then choose your bet position and amount
            </div>
          )}
          <div className="advertise-betting">
            <div className="betting-hint">
              💰 Bet on whether the conspiracy is REAL or FAKE. Your bet pays out when consensus is reached!
            </div>
            <div className="bet-grid">
              <div className="bet-column">
                <h4 className="bet-header real-header">Bet REAL ✓</h4>
                <button
                  className="btn btn-bet bet-real"
                  onClick={() => onAdvertise && onAdvertise('REAL', 1)}
                  disabled={!canAdvertise}
                >
                  Bet 1 Audience
                </button>
                <button
                  className="btn btn-bet bet-real"
                  onClick={() => onAdvertise && onAdvertise('REAL', 2)}
                  disabled={!canAdvertise}
                >
                  Bet 2 Audience
                </button>
                <button
                  className="btn btn-bet bet-real"
                  onClick={() => onAdvertise && onAdvertise('REAL', 3)}
                  disabled={!canAdvertise}
                >
                  Bet 3 Audience
                </button>
              </div>
              <div className="bet-column">
                <h4 className="bet-header fake-header">Bet FAKE ✗</h4>
                <button
                  className="btn btn-bet bet-fake"
                  onClick={() => onAdvertise && onAdvertise('FAKE', 1)}
                  disabled={!canAdvertise}
                >
                  Bet 1 Audience
                </button>
                <button
                  className="btn btn-bet bet-fake"
                  onClick={() => onAdvertise && onAdvertise('FAKE', 2)}
                  disabled={!canAdvertise}
                >
                  Bet 2 Audience
                </button>
                <button
                  className="btn btn-bet bet-fake"
                  onClick={() => onAdvertise && onAdvertise('FAKE', 3)}
                  disabled={!canAdvertise}
                >
                  Bet 3 Audience
                </button>
              </div>
            </div>
          </div>
          <button
            className="btn btn-warning"
            onClick={onAdvertisePass}
            disabled={!canPass}
          >
            Pass (No Advertisement)
          </button>
        </>
      )}

      {phase === 'LATE_EVIDENCE' && (
        <>
          <div className="button-hint">
            🎲 Late-Breaking Evidence Phase - Play ONE card face-up or pass
          </div>

          {!lateEvidencePlayed && canPlayLateEvidence && (
            <button
              className="btn btn-primary"
              onClick={onPlayLateEvidence}
              disabled={!canPlayLateEvidence}
            >
              Play Card Face-Up
            </button>
          )}

          <button
            className="btn btn-warning"
            onClick={onPass}
            disabled={lateEvidencePlayed}
          >
            {lateEvidencePlayed ? 'Already Played Evidence' : 'Pass (No Late Evidence)'}
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
