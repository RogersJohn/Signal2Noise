import React from 'react';
import { BroadcastObject, PlayerState, ConspiracyCard } from '../types';
import './BroadcastQueue.css';

interface BroadcastQueueProps {
  queue: BroadcastObject[];
  players: PlayerState[];
  conspiracies: ConspiracyCard[];
}

export const BroadcastQueue: React.FC<BroadcastQueueProps> = ({
  queue,
  players,
  conspiracies
}) => {
  const getPlayerName = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.name : 'Unknown';
  };

  const getPlayerColor = (playerId: string): string => {
    const player = players.find((p) => p.id === playerId);
    return player ? player.color : '#6b7280';
  };

  const getConspiracyName = (conspiracyId: string): string => {
    const conspiracy = conspiracies.find((c) => c.id === conspiracyId);
    return conspiracy ? conspiracy.name : conspiracyId;
  };

  return (
    <div className="broadcast-queue">
      <h2>Broadcast Queue</h2>
      {queue.length === 0 ? (
        <p className="empty-queue">No broadcasts yet this round</p>
      ) : (
        <div className="queue-list">
          {queue.map((broadcast, index) => (
            <div
              key={broadcast.id}
              className="broadcast-item"
              style={{ borderLeftColor: getPlayerColor(broadcast.playerId) }}
            >
              <div className="broadcast-number">{index + 1}</div>
              <div className="broadcast-content">
                {broadcast.isPassed ? (
                  <div className="broadcast-text">
                    <span
                      className="player-name"
                      style={{ color: getPlayerColor(broadcast.playerId) }}
                    >
                      {getPlayerName(broadcast.playerId)}
                    </span>
                    <span className="action">PASSED</span>
                  </div>
                ) : (
                  <div className="broadcast-text">
                    <span
                      className="player-name"
                      style={{ color: getPlayerColor(broadcast.playerId) }}
                    >
                      {getPlayerName(broadcast.playerId)}:
                    </span>
                    <span className="conspiracy-name">{getConspiracyName(broadcast.conspiracyId)}</span>
                    <span className="equals">=</span>
                    <span className={`position ${broadcast.position.toLowerCase()}`}>
                      {broadcast.position}
                    </span>
                    <span className="evidence-count">
                      ({broadcast.evidenceCount} evidence)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
