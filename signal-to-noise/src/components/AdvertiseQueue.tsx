import React from 'react';
import { AdvertiseObject, PlayerState, ConspiracyCard } from '../types';
import './AdvertiseQueue.css';

interface AdvertiseQueueProps {
  queue: AdvertiseObject[];
  players: PlayerState[];
  conspiracies: ConspiracyCard[];
}

export const AdvertiseQueue: React.FC<AdvertiseQueueProps> = ({
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
    <div className="advertise-queue">
      <h2>📢 Advertisements</h2>
      <p className="queue-description">
        Players signal which conspiracies they're interested in. This might be an opportunity... or a trap!
      </p>
      {queue.length === 0 ? (
        <p className="empty-queue">No advertisements yet this round</p>
      ) : (
        <div className="queue-list">
          {queue.map((advertise, index) => (
            <div
              key={advertise.id}
              className="advertise-item"
              style={{ borderLeftColor: getPlayerColor(advertise.playerId) }}
            >
              <div className="advertise-number">{index + 1}</div>
              <div className="advertise-content">
                {advertise.isPassed ? (
                  <div className="advertise-text">
                    <span
                      className="player-name"
                      style={{ color: getPlayerColor(advertise.playerId) }}
                    >
                      {getPlayerName(advertise.playerId)}
                    </span>
                    <span className="action">PASSED</span>
                  </div>
                ) : (
                  <div className="advertise-text">
                    <span
                      className="player-name"
                      style={{ color: getPlayerColor(advertise.playerId) }}
                    >
                      {getPlayerName(advertise.playerId)}
                    </span>
                    <span className="signal-text">signals interest in</span>
                    <span className="conspiracy-name">
                      📡 {getConspiracyName(advertise.conspiracyId)}
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
