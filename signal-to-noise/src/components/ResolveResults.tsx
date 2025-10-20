import React from 'react';
import { ConspiracyCard, PlayerState, BroadcastObject } from '../types';
import { detectConsensus } from '../gameLogic';
import './ResolveResults.css';

interface ResolveResultsProps {
  conspiracies: ConspiracyCard[];
  players: PlayerState[];
  broadcastQueue: BroadcastObject[];
  onContinue: () => void;
}

export const ResolveResults: React.FC<ResolveResultsProps> = ({
  conspiracies,
  players,
  broadcastQueue,
  onContinue
}) => {
  const getPlayerName = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player ? player.name : playerId;
  };

  const getPlayerColor = (playerId: string): string => {
    const player = players.find(p => p.id === playerId);
    return player ? player.color : '#ffffff';
  };

  // Group broadcasts by conspiracy
  const broadcastsByConspiracy = new Map<string, BroadcastObject[]>();
  broadcastQueue.forEach(broadcast => {
    if (!broadcast.isPassed) {
      const existing = broadcastsByConspiracy.get(broadcast.conspiracyId) || [];
      broadcastsByConspiracy.set(broadcast.conspiracyId, [...existing, broadcast]);
    }
  });

  const consensusThreshold = players.length === 2 ? 2 : 3;

  return (
    <div className="resolve-results">
      <h2>Round Results</h2>

      {broadcastsByConspiracy.size === 0 ? (
        <div className="no-broadcasts">
          <p>No one made any broadcasts this round!</p>
          <p className="hint">Everyone passed - no scoring occurs.</p>
        </div>
      ) : (
        <div className="conspiracy-results">
          {Array.from(broadcastsByConspiracy.entries()).map(([conspiracyId, broadcasts]) => {
            const conspiracy = conspiracies.find(c => c.id === conspiracyId);
            if (!conspiracy) return null;

            const { consensus, position } = detectConsensus(broadcastQueue, conspiracyId, players.length);

            const realCount = broadcasts.filter(b => b.position === 'REAL').length;
            const fakeCount = broadcasts.filter(b => b.position === 'FAKE').length;

            return (
              <div key={conspiracyId} className={`conspiracy-result ${consensus ? 'consensus' : 'no-consensus'}`}>
                <h3>{conspiracy.name}</h3>

                <div className="vote-summary">
                  <div className="vote-count">
                    <span className="vote-label real">REAL votes:</span>
                    <span className="vote-number">{realCount}</span>
                  </div>
                  <div className="vote-count">
                    <span className="vote-label fake">FAKE votes:</span>
                    <span className="vote-number">{fakeCount}</span>
                  </div>
                </div>

                {consensus && position ? (
                  <>
                    <div className="consensus-banner">
                      CONSENSUS REACHED! ({consensusThreshold}+ votes for {position})
                    </div>
                    <div className="truth-reveal">
                      <strong>The truth:</strong> This conspiracy is{' '}
                      <span className={`truth ${conspiracy.truthValue.toLowerCase()}`}>
                        {conspiracy.truthValue}
                      </span>
                    </div>

                    <div className="scoring-breakdown">
                      {broadcasts.map(broadcast => {
                        const player = players.find(p => p.id === broadcast.playerId);
                        const evidenceUsed = player?.assignedEvidence[conspiracy.id] || [];

                        // Calculate excitement modifier
                        let excitementModifier = 0;
                        const excitementDetails: string[] = [];

                        evidenceUsed.forEach(card => {
                          const previousUses = player?.broadcastHistory.filter(entry =>
                            entry.evidenceIds.includes(card.id) && entry.wasScored
                          ).length || 0;

                          if (card.excitement === -1 && previousUses > 0) {
                            excitementModifier -= 2;
                            excitementDetails.push(`${card.name}: -2 (repeat flexible)`);
                          } else if (card.excitement === 1 && previousUses > 0) {
                            const bonus = 2 * previousUses;
                            excitementModifier += bonus;
                            excitementDetails.push(`${card.name}: +${bonus} (${previousUses}× focused repeat)`);
                          }
                        });

                        const wasCorrect = broadcast.position === conspiracy.truthValue;
                        const basePoints = wasCorrect ? broadcast.evidenceCount * conspiracy.tier : 0;
                        const totalPoints = basePoints + excitementModifier;
                        const isBluff = broadcast.evidenceCount === 0;
                        const credLoss = wasCorrect ? 0 : (isBluff ? 6 : 3);

                        return (
                          <div
                            key={broadcast.id}
                            className={`player-result ${wasCorrect ? 'correct' : 'wrong'}`}
                          >
                            <span className="player-name" style={{ color: getPlayerColor(broadcast.playerId) }}>
                              {getPlayerName(broadcast.playerId)}
                            </span>
                            <span className="player-claim">
                              claimed {broadcast.position}
                            </span>
                            <span className="evidence-count">
                              ({broadcast.evidenceCount} evidence)
                            </span>
                            {wasCorrect ? (
                              <>
                                <span className="score-gain">
                                  +{totalPoints} audience
                                  {excitementModifier !== 0 ? (
                                    <span className="score-detail">
                                      ({broadcast.evidenceCount} × {conspiracy.tier}★
                                      <span className={excitementModifier > 0 ? 'excitement-bonus' : 'excitement-penalty'}>
                                        {' '}{excitementModifier > 0 ? '+' : ''}{excitementModifier} excitement
                                      </span>)
                                    </span>
                                  ) : (
                                    <span className="score-detail">
                                      ({broadcast.evidenceCount} × {conspiracy.tier}★)
                                    </span>
                                  )}
                                </span>
                                {excitementDetails.length > 0 && (
                                  <div className="excitement-breakdown">
                                    {excitementDetails.map((detail, i) => (
                                      <div key={i} className="excitement-detail">{detail}</div>
                                    ))}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="score-loss">
                                -{credLoss} credibility {isBluff && <span className="bluff-penalty">💀 BLUFF FAILED!</span>}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="no-consensus-banner">
                      NO CONSENSUS - Need {consensusThreshold} votes for same position
                    </div>
                    <div className="no-score">
                      <p>All broadcasts discarded - no scoring</p>
                      <p className="hint">Conspiracy remains hidden for future rounds</p>
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      )}

      <button className="btn btn-success continue-btn" onClick={onContinue}>
        Continue to Cleanup
      </button>
    </div>
  );
};
