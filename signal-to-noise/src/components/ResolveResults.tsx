import React from 'react';
import { ConspiracyCard, PlayerState, BroadcastObject } from '../types';
import { detectConsensus, determineEvidenceTruth } from '../gameLogic';
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

  // Group ALL broadcasts (including passes) for player action report
  const allBroadcasts = [...broadcastQueue];

  // Group non-passed broadcasts by conspiracy for consensus checking
  const broadcastsByConspiracy = new Map<string, BroadcastObject[]>();
  broadcastQueue.forEach(broadcast => {
    if (!broadcast.isPassed) {
      const existing = broadcastsByConspiracy.get(broadcast.conspiracyId) || [];
      broadcastsByConspiracy.set(broadcast.conspiracyId, [...existing, broadcast]);
    }
  });

  const consensusThreshold = Math.ceil(players.length / 2);

  return (
    <div className="resolve-results">
      <h2>🔍 Resolve Phase Report</h2>

      {/* SECTION 1: Player Actions Summary */}
      <div className="player-actions-section">
        <h3>📢 What Each Player Did This Turn</h3>
        <div className="player-actions-list">
          {allBroadcasts.map(broadcast => {
            const player = players.find(p => p.id === broadcast.playerId);
            if (!player) return null;

            if (broadcast.isPassed) {
              return (
                <div key={broadcast.id} className="player-action passed">
                  <span className="player-name" style={{ color: getPlayerColor(broadcast.playerId) }}>
                    {getPlayerName(broadcast.playerId)}
                  </span>
                  <span className="action-description">
                    <strong>PASSED</strong> - Drew 1 card (no broadcast made)
                  </span>
                </div>
              );
            }

            const conspiracy = conspiracies.find(c => c.id === broadcast.conspiracyId);
            const evidenceCount = broadcast.evidenceCount;
            const hasEvidence = evidenceCount > 0;

            return (
              <div key={broadcast.id} className="player-action broadcast">
                <span className="player-name" style={{ color: getPlayerColor(broadcast.playerId) }}>
                  {getPlayerName(broadcast.playerId)}
                </span>
                <span className="action-description">
                  broadcast on <strong>{conspiracy?.name || 'Unknown'}</strong>
                </span>
                <span className={`position-badge ${broadcast.position.toLowerCase()}`}>
                  {broadcast.position === 'REAL' ? '✓ REAL' :
                   broadcast.position === 'FAKE' ? '✗ FAKE' :
                   '??? INCONCLUSIVE'}
                </span>
                <span className="evidence-indicator">
                  {hasEvidence ? (
                    <span className="has-evidence">
                      🔒 {evidenceCount} secret evidence {evidenceCount === 1 ? 'card' : 'cards'}
                    </span>
                  ) : (
                    <span className="no-evidence">
                      ⚠️ Bandwagoning (no evidence)
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
        <div className="secret-reminder">
          🔒 <strong>Secret Information:</strong> Which specific evidence cards players assigned remains hidden. Evidence persists until the conspiracy reaches consensus!
        </div>
      </div>

      {/* SECTION 2: Consensus Results & Scoring */}
      {broadcastsByConspiracy.size === 0 ? (
        <div className="no-broadcasts">
          <p>No one made any broadcasts this round!</p>
          <p className="hint">Everyone passed - no scoring occurs.</p>
        </div>
      ) : (
        <div className="conspiracy-results">
          <h3>⚖️ Consensus Results & Scoring</h3>
          {Array.from(broadcastsByConspiracy.entries()).map(([conspiracyId, broadcasts]) => {
            const conspiracy = conspiracies.find(c => c.id === conspiracyId);
            if (!conspiracy) return null;

            const { consensus, position } = detectConsensus(broadcastQueue, conspiracyId, players.length);

            const realCount = broadcasts.filter(b => b.position === 'REAL').length;
            const fakeCount = broadcasts.filter(b => b.position === 'FAKE').length;
            const inconclusiveCount = broadcasts.filter(b => b.position === 'INCONCLUSIVE').length;

            return (
              <div key={conspiracyId} className={`conspiracy-result ${consensus ? 'consensus' : 'no-consensus'}`}>
                <h4>{conspiracy.name}</h4>

                <div className="vote-summary">
                  <div className="vote-count">
                    <span className="vote-label real">✓ REAL:</span>
                    <span className="vote-number">{realCount}</span>
                  </div>
                  <div className="vote-count">
                    <span className="vote-label fake">✗ FAKE:</span>
                    <span className="vote-number">{fakeCount}</span>
                  </div>
                  <div className="vote-count">
                    <span className="vote-label inconclusive">??? INCONCLUSIVE:</span>
                    <span className="vote-number">{inconclusiveCount}</span>
                  </div>
                </div>

                {consensus && position ? (
                  <>
                    <div className="consensus-banner">
                      ✅ CONSENSUS REACHED! (Majority agreed: {position})
                    </div>
                    <div className="consensus-explanation">
                      <strong>What this means:</strong> The majority declared this conspiracy as <strong>{position}</strong>.
                      In this game, there is NO objective truth - the consensus BECOMES reality! All players who broadcast score points.
                    </div>

                    {/* v5.0: Truth Tally based on Evidence Proof Values */}
                    {(() => {
                      // Collect ALL evidence assigned to this conspiracy by ALL players
                      const allEvidenceOnConspiracy: any[] = [];
                      players.forEach(player => {
                        const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];
                        allEvidenceOnConspiracy.push(...evidenceUsed);
                      });

                      if (allEvidenceOnConspiracy.length > 0) {
                        const { truth, realCount, fakeCount, bluffCount } = determineEvidenceTruth(allEvidenceOnConspiracy);

                        return (
                          <div className="truth-tally-section">
                            <div className="truth-tally-header">🔬 Evidence Truth Analysis (v5.0)</div>
                            <div className="truth-tally-explanation">
                              All evidence on this conspiracy has been revealed and tallied:
                            </div>
                            <div className="proof-counts">
                              <div className="proof-count real">
                                <span className="proof-label">Proof: REAL</span>
                                <span className="proof-number">{realCount}</span>
                              </div>
                              <div className="proof-count fake">
                                <span className="proof-label">Proof: FAKE</span>
                                <span className="proof-number">{fakeCount}</span>
                              </div>
                              {bluffCount > 0 && (
                                <div className="proof-count bluff">
                                  <span className="proof-label">BLUFFs</span>
                                  <span className="proof-number">{bluffCount}</span>
                                </div>
                              )}
                            </div>
                            <div className={`truth-verdict ${truth.toLowerCase()}`}>
                              {truth === 'TIE' ? (
                                <>
                                  ⚖️ <strong>TIE:</strong> Equal REAL and FAKE evidence! All broadcasters get +2 audience bonus.
                                  {bluffCount > 0 && ' Bluffers get -1 credibility.'}
                                </>
                              ) : (
                                <>
                                  {truth === 'REAL' ? '✓' : '✗'} <strong>Evidence says: {truth}!</strong>
                                  {' '}Broadcasters who called {truth} get +3 audience bonus. Wrong callers get -1 credibility.
                                  {bluffCount > 0 && ' Bluffers get -1 credibility.'}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      }
                      return null;
                    })()}

                    <div className="scoring-breakdown">
                      <div className="scoring-header">💰 Scoring Breakdown</div>
                      {(() => {
                        // v5.0: Calculate truth once for all players
                        const allEvidenceOnConspiracy: any[] = [];
                        players.forEach(p => {
                          const evidenceUsed = p.assignedEvidence[conspiracy.id] || [];
                          allEvidenceOnConspiracy.push(...evidenceUsed);
                        });
                        const truthResult = allEvidenceOnConspiracy.length > 0
                          ? determineEvidenceTruth(allEvidenceOnConspiracy)
                          : null;

                        return broadcasts.map(broadcast => {
                          const player = players.find(p => p.id === broadcast.playerId);
                          if (!player) return null;

                          // Merge face-down evidence (assignedEvidence) with face-up evidence (faceUpEvidence)
                          const assignedCards = player.assignedEvidence[conspiracy.id] || [];
                          const faceUpCards = player.faceUpEvidence?.[conspiracy.id] || [];
                          const evidenceUsed = [...assignedCards, ...faceUpCards];

                        // CONSENSUS-BASED SCORING CALCULATION (matches App.tsx)
                        // BASE POINTS
                        let audiencePoints = 0;
                        if (broadcast.position === 'INCONCLUSIVE') {
                          audiencePoints = 2; // Safe option
                        } else if (evidenceUsed.length > 0) {
                          audiencePoints = 3; // Broadcasting with evidence
                        } else {
                          audiencePoints = 1; // Bandwagoning (no evidence)
                        }

                        // EVIDENCE BONUS
                        let evidenceBonus = 0;
                        const evidenceDetails: string[] = [];

                        evidenceUsed.forEach(card => {
                          // Specificity bonus
                          const specificityBonus = card.supportedConspiracies.includes('ALL') ? 1 : 3;

                          // Excitement multiplier
                          let excitementMult = 1.0;
                          if (card.excitement === 1) excitementMult = 1.5;
                          if (card.excitement === -1) excitementMult = 0.5;

                          // Novelty bonus (first use on this conspiracy)
                          const isNovel = !player.broadcastHistory.some(h =>
                            h.conspiracyId === conspiracy.id &&
                            h.evidenceIds.includes(card.id)
                          );
                          const noveltyBonus = isNovel ? 2 : 0;

                          const cardBonus = Math.round(specificityBonus * excitementMult) + noveltyBonus;
                          evidenceBonus += cardBonus;

                          // Only show card details if it was played face-up (late-breaking evidence)
                          const isFaceUp = faceUpCards.some(fc => fc.id === card.id);
                          if (isFaceUp) {
                            evidenceDetails.push(
                              `🎬 ${card.name}: +${cardBonus} (specificity: ${specificityBonus}, excitement: ×${excitementMult}, novelty: +${noveltyBonus})`
                            );
                          } else {
                            // Face-down evidence - keep it secret
                            evidenceDetails.push(
                              `🔒 Secret Evidence: +${cardBonus} points`
                            );
                          }
                        });

                        // SUBTOTAL
                        const subtotal = audiencePoints + evidenceBonus;

                        // CREDIBILITY MODIFIER
                        let finalScore = subtotal;
                        let credModifier = '×1.0';
                        if (player.credibility >= 7) {
                          finalScore = Math.round(subtotal * 1.5);
                          credModifier = '×1.5 (high credibility)';
                        } else if (player.credibility <= 3) {
                          finalScore = Math.round(subtotal * 0.75);
                          credModifier = '×0.75 (low credibility)';
                        }

                        // CREDIBILITY CHANGE
                        let credChange = 0;
                        let credChangeText = 'No change';
                        if (broadcast.position !== 'INCONCLUSIVE') {
                          if (broadcast.position === position) {
                            credChange = +1;
                            credChangeText = '+1 (majority side)';
                          } else {
                            credChange = -1;
                            credChangeText = '-1 (minority side)';
                          }
                        } else {
                          credChangeText = 'No change (INCONCLUSIVE is safe)';
                        }

                        const isMajority = broadcast.position === position;
                        const isMinority = broadcast.position !== 'INCONCLUSIVE' && !isMajority;

                        return (
                          <div
                            key={broadcast.id}
                            className={`player-result ${isMajority ? 'majority' : isMinority ? 'minority' : 'inconclusive'}`}
                          >
                            <div className="result-header">
                              <span className="player-name" style={{ color: getPlayerColor(broadcast.playerId) }}>
                                {getPlayerName(broadcast.playerId)}
                              </span>
                              <span className="player-position">
                                broadcast: <strong>{broadcast.position}</strong>
                              </span>
                              {isMajority && <span className="majority-badge">👑 MAJORITY</span>}
                              {isMinority && <span className="minority-badge">⚠️ MINORITY</span>}
                            </div>

                            <div className="scoring-details">
                              <div className="score-line">
                                <span className="label">Base Points:</span>
                                <span className="value">{audiencePoints} pts</span>
                                <span className="explanation">
                                  {broadcast.position === 'INCONCLUSIVE' ? '(INCONCLUSIVE = 2 pts)' :
                                   evidenceUsed.length > 0 ? '(with evidence = 3 pts)' :
                                   '(bandwagoning = 1 pt)'}
                                </span>
                              </div>

                              {evidenceBonus > 0 && (
                                <div className="score-line">
                                  <span className="label">Evidence Bonus:</span>
                                  <span className="value">+{evidenceBonus} pts</span>
                                  <span className="explanation">({evidenceUsed.length} cards)</span>
                                </div>
                              )}

                              {evidenceDetails.length > 0 && (
                                <div className="evidence-breakdown">
                                  {evidenceDetails.map((detail, i) => (
                                    <div key={i} className="evidence-detail">🔒 {detail}</div>
                                  ))}
                                </div>
                              )}

                              <div className="score-line">
                                <span className="label">Subtotal:</span>
                                <span className="value">{subtotal} pts</span>
                              </div>

                              <div className="score-line">
                                <span className="label">Credibility Modifier:</span>
                                <span className="value">{credModifier}</span>
                                <span className="explanation">(credibility: {player.credibility})</span>
                              </div>

                              <div className="score-line final-score">
                                <span className="label">Final Audience Score:</span>
                                <span className="value highlight">+{finalScore} pts</span>
                              </div>

                              <div className="score-line credibility-change">
                                <span className="label">Credibility Change:</span>
                                <span className={`value ${credChange > 0 ? 'positive' : credChange < 0 ? 'negative' : ''}`}>
                                  {credChangeText}
                                </span>
                              </div>

                              {/* v5.0: Truth Bonus/Penalty Display */}
                              {truthResult && (
                                <>
                                  {truthResult.truth === 'TIE' ? (
                                    <div className="score-line truth-bonus">
                                      <span className="label">Truth Bonus (TIE):</span>
                                      <span className="value positive">+2 pts</span>
                                      <span className="explanation">(equal REAL/FAKE evidence)</span>
                                    </div>
                                  ) : broadcast.position === truthResult.truth ? (
                                    <div className="score-line truth-bonus">
                                      <span className="label">Truth Bonus:</span>
                                      <span className="value positive">+3 pts</span>
                                      <span className="explanation">(broadcast matches evidence!)</span>
                                    </div>
                                  ) : broadcast.position !== 'INCONCLUSIVE' && (
                                    <div className="score-line truth-penalty">
                                      <span className="label">Truth Penalty:</span>
                                      <span className="value negative">-1 credibility</span>
                                      <span className="explanation">(broadcast contradicts evidence)</span>
                                    </div>
                                  )}

                                  {evidenceUsed.some(card => card.proofValue === 'BLUFF') && (
                                    <div className="score-line bluff-penalty">
                                      <span className="label">Bluff Penalty:</span>
                                      <span className="value negative">-1 credibility</span>
                                      <span className="explanation">(used BLUFF cards)</span>
                                    </div>
                                  )}
                                </>
                              )}
                            </div>
                          </div>
                        );
                      });
                      })()}
                    </div>

                    <div className="persistence-reminder">
                      🔒 <strong>Evidence Persistence:</strong> All evidence assigned to this conspiracy has now been revealed and scored.
                      The conspiracy will be replaced during cleanup. Evidence assigned to other conspiracies remains secret and persists!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="no-consensus-banner">
                      ❌ NO CONSENSUS - Need {consensusThreshold} votes for same position (REAL or FAKE)
                    </div>
                    <div className="no-score">
                      <p>No majority agreement reached - no one scores points for this conspiracy.</p>
                      <p className="hint">All broadcasts are discarded. The conspiracy remains on the board for future rounds.</p>
                      <p className="hint">Secret evidence remains assigned and persistent for next time!</p>
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
