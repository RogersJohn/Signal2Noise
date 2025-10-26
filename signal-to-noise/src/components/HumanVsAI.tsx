import React, { useState, useEffect, useRef } from 'react';
import { GameState, PlayerState, BroadcastObject, AdvertiseObject, Position } from '../types';
import { initializeGame, drawCards, canSupportConspiracy, detectConsensus, checkWinCondition, determineEvidenceTruth } from '../gameLogic';
import { AIPersonality, getRandomPersonality, makeAdvertiseDecision, makeAIDecision } from '../aiPersonalities';
import { ConspiracyBoard } from './ConspiracyBoard';
import { PlayerHand } from './PlayerHand';
import { AdvertiseQueue } from './AdvertiseQueue';
import { BroadcastQueue } from './BroadcastQueue';
import { PhaseIndicator } from './PhaseIndicator';
import { ActionButtons } from './ActionButtons';
import { ResolveResults } from './ResolveResults';
import './HumanVsAI.css';

interface LogEntry {
  id: string;
  timestamp: number;
  type: 'action' | 'reasoning' | 'phase';
  playerName: string;
  message: string;
  playerColor?: string;
}

export function HumanVsAI() {
  const [setupPhase, setSetupPhase] = useState(true);
  const [aiCount, setAiCount] = useState(3); // 2-4 AI opponents
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [aiPersonalities, setAiPersonalities] = useState<Map<string, AIPersonality>>(new Map());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedConspiracy, setSelectedConspiracy] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [broadcastsMadeThisTurn, setBroadcastsMadeThisTurn] = useState(0);
  const [broadcastedConspiracies, setBroadcastedConspiracies] = useState<string[]>([]);
  const [lateEvidencePlayed, setLateEvidencePlayed] = useState(false);
  const [isAiTurn, setIsAiTurn] = useState(false);
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // AI Turn Logic - Execute AI decisions automatically
  useEffect(() => {
    if (!gameState || gameState.gameOver || setupPhase) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const isHuman = currentPlayer.id === 'player_1'; // Human is always player_1

    if (!isHuman && !isAiTurn) {
      setIsAiTurn(true);

      // Delay AI action slightly for readability
      setTimeout(() => {
        executeAiTurn(currentPlayer);
      }, 800);
    }
  }, [gameState?.currentPlayerIndex, gameState?.phase, isAiTurn]);

  const addLog = (type: LogEntry['type'], playerName: string, message: string, playerColor?: string) => {
    const entry: LogEntry = {
      id: `log_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      type,
      playerName,
      message,
      playerColor
    };
    setLog(prev => [...prev, entry]);
  };

  const handleStartGame = () => {
    const totalPlayers = aiCount + 1; // Human + AIs
    const newGameState = initializeGame(totalPlayers);

    // Assign human to player_1 (index 0)
    newGameState.players[0].name = 'You';

    // Assign random AI personalities to other players
    const personalities = new Map<string, AIPersonality>();
    for (let i = 1; i < totalPlayers; i++) {
      const personality = getRandomPersonality();
      personalities.set(newGameState.players[i].id, personality);
      newGameState.players[i].name = personality.name;
    }

    setAiPersonalities(personalities);
    setGameState(newGameState);
    setSetupPhase(false);
    addLog('phase', 'Game', `Game started! You vs ${aiCount} AI opponents. Round 1 begins.`);
  };

  const executeAiTurn = (player: PlayerState) => {
    if (!gameState) return;

    const personality = aiPersonalities.get(player.id);
    if (!personality) return;

    if (gameState.phase === 'INVESTIGATE') {
      handleAiInvestigate(player, personality);
    } else if (gameState.phase === 'ADVERTISE') {
      handleAiAdvertise(player, personality);
    } else if (gameState.phase === 'BROADCAST') {
      handleAiBroadcast(player, personality);
    }
  };

  const handleAiInvestigate = (player: PlayerState, personality: AIPersonality) => {
    if (!gameState) return;

    // AI assigns 1-3 evidence cards randomly
    const assignCount = Math.floor(Math.random() * 3) + 1;
    let assignedCount = 0;

    const updatedGameState = { ...gameState };
    const playerIndex = updatedGameState.players.findIndex(p => p.id === player.id);
    if (playerIndex < 0) return;

    const updatedPlayer = { ...updatedGameState.players[playerIndex] };

    while (assignedCount < assignCount && updatedPlayer.evidenceHand.length > 0) {
      const cardIndex = Math.floor(Math.random() * updatedPlayer.evidenceHand.length);
      const card = updatedPlayer.evidenceHand[cardIndex];

      // Find conspiracies this card supports
      const supportedConspiracies = gameState.conspiracies.filter(c =>
        canSupportConspiracy(card, c.id)
      );

      if (supportedConspiracies.length > 0) {
        // Prefer high-tier if personality likes that
        let chosenConspiracy;
        if (personality.preferHighTier) {
          chosenConspiracy = supportedConspiracies.sort((a, b) => b.tier - a.tier)[0];
        } else {
          chosenConspiracy = supportedConspiracies[Math.floor(Math.random() * supportedConspiracies.length)];
        }

        // Assign card
        updatedPlayer.evidenceHand.splice(cardIndex, 1);
        if (!updatedPlayer.assignedEvidence[chosenConspiracy.id]) {
          updatedPlayer.assignedEvidence[chosenConspiracy.id] = [];
        }
        updatedPlayer.assignedEvidence[chosenConspiracy.id].push(card);

        addLog('action', player.name, `Assigned "${card.name}" to ${chosenConspiracy.id}`, player.color);
        assignedCount++;
      } else {
        break;
      }
    }

    updatedGameState.players[playerIndex] = updatedPlayer;
    setGameState(updatedGameState);

    // AI immediately finishes investigating
    setTimeout(() => {
      handleDoneInvestigating();
      setIsAiTurn(false);
    }, 500);
  };

  const handleAiAdvertise = (player: PlayerState, personality: AIPersonality) => {
    if (!gameState) return;

    const playerIndex = gameState.players.findIndex(p => p.id === player.id);
    const decision = makeAdvertiseDecision(gameState, playerIndex, personality);

    if (decision.action === 'pass') {
      addLog('action', player.name, 'Passed on advertising', player.color);
      addLog('reasoning', player.name, 'Keeping strategy hidden', player.color);
      handleAdvertisePass();
    } else {
      addLog('action', player.name, `Bet ${decision.betAmount} audience that ${decision.conspiracyId} is ${decision.position}`, player.color);

      const reasoning = decision.isTrap
        ? `Setting a trap - advertising without evidence (bluff frequency: ${(personality.bluffFrequency * 100).toFixed(0)}%)`
        : `Has evidence on this conspiracy (confidence: ${(decision.confidence * 100).toFixed(0)}%)`;

      addLog('reasoning', player.name, reasoning, player.color);

      const advertise: AdvertiseObject = {
        id: `advertise_${Date.now()}_${player.id}`,
        playerId: player.id,
        conspiracyId: decision.conspiracyId!,
        position: decision.position,
        betAmount: decision.betAmount,
        timestamp: Date.now()
      };

      setGameState(prev => {
        if (!prev) return prev;
        const updatedQueue = [...prev.advertiseQueue, advertise];
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        const allPlayersWent = nextPlayerIndex === 0;

        return {
          ...prev,
          advertiseQueue: updatedQueue,
          currentPlayerIndex: nextPlayerIndex,
          phase: allPlayersWent ? 'LATE_EVIDENCE' : 'ADVERTISE'
        };
      });
    }

    setTimeout(() => {
      setIsAiTurn(false);
    }, 500);
  };

  const handleAiBroadcast = (player: PlayerState, personality: AIPersonality) => {
    if (!gameState) return;

    const playerIndex = gameState.players.findIndex(p => p.id === player.id);
    const decision = makeAIDecision(gameState, playerIndex, personality);

    if (decision.action === 'pass') {
      addLog('action', player.name, 'Passed on broadcasting', player.color);
      addLog('reasoning', player.name, 'No good opportunities this round', player.color);
      handlePass();
      setTimeout(() => setIsAiTurn(false), 500);
      return;
    }

    // AI broadcasts
    const conspiracy = gameState.conspiracies.find(c => c.id === decision.conspiracyId);
    const assignedCards = player.assignedEvidence[decision.conspiracyId!] || [];

    addLog('action', player.name,
      `Broadcast: ${decision.conspiracyId} is ${decision.position} (${assignedCards.length} evidence)`,
      player.color
    );

    const reasoning = decision.isBluff
      ? `BLUFFING - no real evidence (risk tolerance: ${(personality.riskTolerance * 100).toFixed(0)}%)`
      : `Has ${assignedCards.length} evidence card(s) - confidence ${(decision.confidence * 100).toFixed(0)}%`;

    addLog('reasoning', player.name, reasoning, player.color);

    const broadcast: BroadcastObject = {
      id: `broadcast_${Date.now()}_${player.id}`,
      playerId: player.id,
      conspiracyId: decision.conspiracyId!,
      position: decision.position!,
      evidenceCount: assignedCards.length,
      timestamp: Date.now()
    };

    const newBroadcastCount = broadcastsMadeThisTurn + 1;
    setBroadcastsMadeThisTurn(newBroadcastCount);

    // AI makes 1-2 broadcasts
    const shouldContinue = newBroadcastCount < 2 && Math.random() < 0.6;

    setGameState(prev => {
      if (!prev) return prev;
      const updatedQueue = [...prev.broadcastQueue, broadcast];

      if (!shouldContinue) {
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        const allPlayersWent = nextPlayerIndex === 0;

        return {
          ...prev,
          broadcastQueue: updatedQueue,
          currentPlayerIndex: nextPlayerIndex,
          phase: allPlayersWent ? 'RESOLVE' : 'BROADCAST'
        };
      } else {
        return {
          ...prev,
          broadcastQueue: updatedQueue
        };
      }
    });

    if (!shouldContinue) {
      setBroadcastsMadeThisTurn(0);
      setBroadcastedConspiracies([]);
      setTimeout(() => setIsAiTurn(false), 500);
    } else {
      // AI continues broadcasting
      setTimeout(() => {
        executeAiTurn(player);
      }, 1000);
    }
  };

  // ========== HUMAN PLAYER ACTIONS ==========

  const handleAssignEvidence = () => {
    if (!selectedCard || !selectedConspiracy || !gameState) {
      setMessage('Select an evidence card and a conspiracy first');
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const card = currentPlayer.evidenceHand.find(c => c.id === selectedCard);
    if (!card) {
      setMessage('Card not found in hand');
      return;
    }

    if (!canSupportConspiracy(card, selectedConspiracy)) {
      setMessage('This evidence does not support the selected conspiracy');
      return;
    }

    setGameState(prev => {
      if (!prev) return prev;
      const updatedPlayers = [...prev.players];
      const playerIndex = prev.currentPlayerIndex;
      const player = {
        ...updatedPlayers[playerIndex],
        assignedEvidence: { ...updatedPlayers[playerIndex].assignedEvidence }
      };

      player.evidenceHand = player.evidenceHand.filter(c => c.id !== selectedCard);

      if (!player.assignedEvidence[selectedConspiracy]) {
        player.assignedEvidence[selectedConspiracy] = [];
      }
      player.assignedEvidence[selectedConspiracy] = [
        ...player.assignedEvidence[selectedConspiracy],
        card
      ];

      updatedPlayers[playerIndex] = player;
      return { ...prev, players: updatedPlayers };
    });

    addLog('action', 'You', `Assigned "${card.name}" to ${selectedConspiracy}`, currentPlayer.color);
    setSelectedCard(null);
    setSelectedConspiracy(null);
    setMessage(`Assigned ${card.name} to ${selectedConspiracy}`);
  };

  const handleDoneInvestigating = () => {
    setGameState(prev => {
      if (!prev) return prev;

      const nextPlayerIndex = prev.currentPlayerIndex + 1;
      const isLastPlayer = nextPlayerIndex >= prev.players.length;

      if (!isLastPlayer) {
        setMessage(`${prev.players[nextPlayerIndex].name}'s turn to investigate`);
        return {
          ...prev,
          currentPlayerIndex: nextPlayerIndex
        };
      }

      // All players finished investigating
      // Check if this is Round 1 and first investigate
      if (prev.round === 1 && !prev.firstInvestigateComplete) {
        // Round 1, first investigate done - go to second investigate phase
        setMessage('Round 1 - First investigation complete. Starting second investigation phase.');
        addLog('phase', 'Game', 'Second INVESTIGATE phase begins');
        return {
          ...prev,
          currentPlayerIndex: 0,
          firstInvestigateComplete: true
        };
      }

      // Draw cards and move to ADVERTISE
      let updatedDeck = [...prev.evidenceDeck];
      const updatedPlayers = prev.players.map(player => {
        const result = drawCards(player, updatedDeck, 3);
        updatedDeck = result.updatedDeck;
        return result.updatedPlayer;
      });

      setMessage('All players drew 3 cards. Advertise phase begins!');
      addLog('phase', 'Game', 'ADVERTISE phase - signal your interests');

      const startingPlayerIndex = updatedPlayers.reduce((lowestIdx, player, idx, arr) =>
        player.audience < arr[lowestIdx].audience ? idx : lowestIdx
      , 0);

      return {
        ...prev,
        players: updatedPlayers,
        evidenceDeck: updatedDeck,
        phase: 'ADVERTISE',
        currentPlayerIndex: startingPlayerIndex
      };
    });
  };

  const handleAdvertise = (position: 'REAL' | 'FAKE', betAmount: number) => {
    if (!selectedConspiracy || !gameState) {
      setMessage('Select a conspiracy to advertise interest in');
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    const advertise: AdvertiseObject = {
      id: `advertise_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: selectedConspiracy,
      position,
      betAmount,
      timestamp: Date.now()
    };

    setGameState(prev => {
      if (!prev) return prev;
      const updatedQueue = [...prev.advertiseQueue, advertise];
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      return {
        ...prev,
        advertiseQueue: updatedQueue,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'BROADCAST' : 'ADVERTISE'
      };
    });

    addLog('action', 'You', `Bet ${betAmount} audience that ${selectedConspiracy} is ${position}`, currentPlayer.color);
    setSelectedConspiracy(null);
    setMessage(`You bet ${betAmount} audience that ${selectedConspiracy} is ${position}`);
  };

  const handleAdvertisePass = () => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    const passAdvertise: AdvertiseObject = {
      id: `advertise_pass_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: '',
      timestamp: Date.now(),
      isPassed: true
    };

    setGameState(prev => {
      if (!prev) return prev;
      const updatedQueue = [...prev.advertiseQueue, passAdvertise];
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      return {
        ...prev,
        advertiseQueue: updatedQueue,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'BROADCAST' : 'ADVERTISE'
      };
    });

    setMessage('You passed on advertising');
  };

  const handleBroadcast = (position: Position) => {
    if (!selectedConspiracy || !gameState) {
      setMessage('Select a conspiracy to broadcast about');
      return;
    }

    if (broadcastedConspiracies.includes(selectedConspiracy)) {
      setMessage('You already broadcast on this conspiracy! Choose a different one.');
      return;
    }

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const assignedCards = currentPlayer.assignedEvidence[selectedConspiracy] || [];

    const broadcast: BroadcastObject = {
      id: `broadcast_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: selectedConspiracy,
      position,
      evidenceCount: assignedCards.length,
      timestamp: Date.now()
    };

    const newBroadcastCount = broadcastsMadeThisTurn + 1;
    setBroadcastsMadeThisTurn(newBroadcastCount);
    setBroadcastedConspiracies([...broadcastedConspiracies, selectedConspiracy]);

    addLog('action', 'You',
      `Broadcast: ${selectedConspiracy} is ${position} (${assignedCards.length} evidence)`,
      currentPlayer.color
    );

    const shouldMoveToNextPlayer = newBroadcastCount >= 2;

    setGameState(prev => {
      if (!prev) return prev;
      const updatedQueue = [...prev.broadcastQueue, broadcast];

      if (shouldMoveToNextPlayer) {
        const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
        const allPlayersWent = nextPlayerIndex === 0;

        return {
          ...prev,
          broadcastQueue: updatedQueue,
          currentPlayerIndex: nextPlayerIndex,
          phase: allPlayersWent ? 'RESOLVE' : 'BROADCAST'
        };
      } else {
        return {
          ...prev,
          broadcastQueue: updatedQueue
        };
      }
    });

    setSelectedConspiracy(null);

    if (shouldMoveToNextPlayer) {
      setBroadcastsMadeThisTurn(0);
      setBroadcastedConspiracies([]);
      setLateEvidencePlayed(false);
      setMessage('You completed 2 broadcasts. Next player\'s turn.');
    } else {
      setMessage(`You broadcast ${newBroadcastCount}/2`);
    }
  };

  const handlePass = () => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const noBroadcastsMade = broadcastsMadeThisTurn === 0;

    setGameState(prev => {
      if (!prev) return prev;
      let updatedPlayers = [...prev.players];
      let updatedDeck = prev.evidenceDeck;
      let updatedQueue = [...prev.broadcastQueue];

      if (noBroadcastsMade) {
        const passBroadcast: BroadcastObject = {
          id: `pass_${Date.now()}_${currentPlayer.id}`,
          playerId: currentPlayer.id,
          conspiracyId: '',
          position: 'REAL',
          evidenceCount: 0,
          timestamp: Date.now(),
          isPassed: true
        };

        const result = drawCards(currentPlayer, prev.evidenceDeck, 1);
        updatedPlayers[prev.currentPlayerIndex] = result.updatedPlayer;
        updatedDeck = result.updatedDeck;
        updatedQueue.push(passBroadcast);
      }

      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      return {
        ...prev,
        players: updatedPlayers,
        evidenceDeck: updatedDeck,
        broadcastQueue: updatedQueue,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'RESOLVE' : 'BROADCAST'
      };
    });

    setBroadcastsMadeThisTurn(0);
    setBroadcastedConspiracies([]);
    setLateEvidencePlayed(false);

    if (noBroadcastsMade) {
      setMessage('You passed (0 broadcasts) and drew 1 card');
    } else {
      setMessage(`You finished with ${broadcastsMadeThisTurn} broadcast(s)`);
    }
  };

  const handleResolve = () => {
    if (!gameState) return;

    addLog('phase', 'Game', 'RESOLVE phase - calculating scores');

    setGameState(prev => {
      if (!prev) return prev;
      const updatedPlayers = [...prev.players];
      const revealedConspiracies: string[] = [];
      let totalRevealed = prev.totalRevealed;

      prev.conspiracies.forEach(conspiracy => {
        const { consensus, position } = detectConsensus(prev.broadcastQueue, conspiracy.id, prev.players.length);

        if (consensus && position) {
          const conspiracyIndex = prev.conspiracies.findIndex(c => c.id === conspiracy.id);
          if (conspiracyIndex >= 0 && !prev.conspiracies[conspiracyIndex].isRevealed) {
            revealedConspiracies.push(conspiracy.id);
            totalRevealed++;
          }

          const broadcasts = prev.broadcastQueue.filter(
            b => b.conspiracyId === conspiracy.id && !b.isPassed
          );

          // Award audience points
          broadcasts.forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };
              const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];

              let audiencePoints = 0;

              if (broadcast.position === 'INCONCLUSIVE') {
                audiencePoints = 2;
              } else if (evidenceUsed.length > 0) {
                audiencePoints = 3;
              } else {
                audiencePoints = 1;
              }

              const tierBonus = conspiracy.tier;
              audiencePoints += tierBonus;

              let evidenceBonus = 0;
              evidenceUsed.forEach((card, index) => {
                let specificityBonus;
                if (index === 0) {
                  specificityBonus = card.supportedConspiracies.includes('ALL') ? 1 : 3;
                } else {
                  specificityBonus = 1;
                }

                let excitementMult = 1.0;
                if (card.excitement === 1) excitementMult = 2.0;
                if (card.excitement === -1) excitementMult = 0.5;

                const isNovel = !player.broadcastHistory.some(h =>
                  h.conspiracyId === conspiracy.id &&
                  h.evidenceIds.includes(card.id)
                );
                const noveltyBonus = isNovel ? 2 : 0;

                evidenceBonus += Math.round(specificityBonus * excitementMult) + noveltyBonus;
              });

              const subtotal = audiencePoints + evidenceBonus;

              let finalScore = subtotal;
              if (player.credibility >= 7) {
                finalScore = Math.round(subtotal * 1.5);
              } else if (player.credibility <= 3) {
                finalScore = Math.round(subtotal * 0.75);
              }

              player.audience += finalScore;

              player.broadcastHistory = [...player.broadcastHistory, {
                round: prev.round,
                conspiracyId: conspiracy.id,
                evidenceIds: evidenceUsed.map(e => e.id),
                position: broadcast.position,
                wasScored: true
              }];

              updatedPlayers[playerIndex] = player;
            }
          });

          // Adjust credibility
          broadcasts.forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };

              if (broadcast.position !== 'INCONCLUSIVE') {
                if (broadcast.position === position) {
                  player.credibility = Math.min(10, player.credibility + 1);
                } else {
                  player.credibility = Math.max(0, player.credibility - 1);
                }
              }

              updatedPlayers[playerIndex] = player;
            }
          });

          // Truth bonus/penalties
          const allEvidenceOnConspiracy: any[] = [];
          updatedPlayers.forEach(player => {
            const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];
            allEvidenceOnConspiracy.push(...evidenceUsed);
          });

          const { truth } = determineEvidenceTruth(allEvidenceOnConspiracy);

          broadcasts.forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };
              const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];
              const hasBluffs = evidenceUsed.some(card => card.proofValue === 'BLUFF');

              if (truth === 'TIE') {
                player.audience += 2;
                if (hasBluffs) {
                  player.credibility = Math.max(0, player.credibility - 1);
                }
              } else {
                if (broadcast.position === truth) {
                  player.audience += 3;
                } else if (broadcast.position !== 'INCONCLUSIVE') {
                  player.credibility = Math.max(0, player.credibility - 1);
                }

                if (hasBluffs) {
                  player.credibility = Math.max(0, player.credibility - 1);
                }
              }

              updatedPlayers[playerIndex] = player;
            }
          });

          // STEP 4: Pay out advertised bets
          const advertisements = prev.advertiseQueue.filter(
            a => a.conspiracyId === conspiracy.id && !a.isPassed && a.position && a.betAmount
          );

          advertisements.forEach(ad => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === ad.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };

              if (ad.position === position) {
                player.audience += ad.betAmount!;  // Won the bet
              } else {
                player.audience = Math.max(0, player.audience - ad.betAmount!);  // Lost the bet
              }

              updatedPlayers[playerIndex] = player;
            }
          });
        } else {
          // No consensus
          prev.broadcastQueue
            .filter(b => b.conspiracyId === conspiracy.id && !b.isPassed)
            .forEach(broadcast => {
              const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
              if (playerIndex >= 0) {
                const player = { ...updatedPlayers[playerIndex] };
                const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];

                player.broadcastHistory = [...player.broadcastHistory, {
                  round: prev.round,
                  conspiracyId: conspiracy.id,
                  evidenceIds: evidenceUsed.map(e => e.id),
                  position: broadcast.position,
                  wasScored: false
                }];

                updatedPlayers[playerIndex] = player;
              }
            });
        }
      });

      const updatedConspiracies = prev.conspiracies.map(c =>
        revealedConspiracies.includes(c.id) ? { ...c, isRevealed: true } : c
      );

      return {
        ...prev,
        conspiracies: updatedConspiracies,
        players: updatedPlayers,
        totalRevealed,
        phase: 'CLEANUP'
      };
    });

    setMessage('Broadcasts resolved. Check scores.');
  };

  const handleCleanup = () => {
    addLog('phase', 'Game', 'CLEANUP phase - preparing next round');

    setGameState(prev => {
      if (!prev) return prev;
      let updatedDeck = [...prev.conspiracyDeck];
      const updatedConspiracies = prev.conspiracies.map(c => {
        if (c.isRevealed && updatedDeck.length > 0) {
          const newConspiracy = updatedDeck[0];
          updatedDeck = updatedDeck.slice(1);
          return newConspiracy;
        }
        return c;
      });

      const updatedPlayers = [...prev.players];

      const winCheck = checkWinCondition({
        ...prev,
        conspiracies: updatedConspiracies,
        players: updatedPlayers,
        round: prev.round + 1
      });

      const startingPlayerIndex = updatedPlayers.reduce((lowestIdx, player, idx, arr) =>
        player.audience < arr[lowestIdx].audience ? idx : lowestIdx
      , 0);

      if (!winCheck.gameOver) {
        addLog('phase', 'Game', `Round ${prev.round + 1} begins!`);
      }

      return {
        ...prev,
        conspiracies: updatedConspiracies,
        conspiracyDeck: updatedDeck,
        players: updatedPlayers,
        advertiseQueue: [],
        broadcastQueue: [],
        phase: winCheck.gameOver ? 'CLEANUP' : 'INVESTIGATE',
        currentPlayerIndex: winCheck.gameOver ? prev.currentPlayerIndex : startingPlayerIndex,
        round: prev.round + 1,
        gameOver: winCheck.gameOver,
        winner: winCheck.winner
      };
    });

    setMessage('Cleanup complete. Next round!');
  };

  // Setup Screen
  if (setupPhase) {
    return (
      <div className="human-vs-ai-setup">
        <h1>Human vs AI</h1>
        <p className="tagline">Play against AI opponents with different personalities</p>

        <div className="ai-count-selector">
          <h2>Select Number of AI Opponents</h2>
          <div className="ai-count-options">
            {[2, 3, 4].map(count => (
              <button
                key={count}
                className={`ai-count-btn ${aiCount === count ? 'selected' : ''}`}
                onClick={() => setAiCount(count)}
              >
                {count} AI Opponents
                <span className="player-count-subtitle">({count + 1} players total)</span>
              </button>
            ))}
          </div>
        </div>

        <button className="start-btn" onClick={handleStartGame}>
          Start Game
        </button>

        <button className="back-btn" onClick={() => window.location.reload()}>
          Back to Menu
        </button>
      </div>
    );
  }

  // Game Over Screen
  if (gameState?.gameOver && gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    const youWon = winner?.id === 'player_1';

    return (
      <div className="human-vs-ai-game-over">
        <h1>{youWon ? 'Victory!' : 'Game Over'}</h1>
        <h2 style={{ color: winner?.color }}>
          {winner?.name} wins!
        </h2>
        <div className="final-scores">
          {gameState.players.map(p => (
            <div key={p.id} className="score-row">
              <span style={{ color: p.color }}>{p.name}:</span>
              <span>{p.audience} audience</span>
              <span>({p.credibility} credibility)</span>
            </div>
          ))}
        </div>
        <button className="btn-primary" onClick={() => window.location.reload()}>
          New Game
        </button>
      </div>
    );
  }

  if (!gameState) return null;

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];
  const isHumanTurn = currentPlayer.id === 'player_1';

  return (
    <div className="human-vs-ai">
      <div className="game-area">
        <header className="game-header">
          <h1>Signal to Noise - Human vs AI</h1>
        </header>

        <PhaseIndicator phase={gameState.phase} round={gameState.round} />

        {message && <div className="message-banner">{message}</div>}

        {!isHumanTurn && (
          <div className="ai-turn-indicator">
            <span style={{ color: currentPlayer.color }}>{currentPlayer.name}</span> is thinking...
          </div>
        )}

        <ConspiracyBoard
          conspiracies={gameState.conspiracies}
          onSelect={setSelectedConspiracy}
          selectedConspiracy={selectedConspiracy}
          selectedCardId={selectedCard}
          currentPlayer={isHumanTurn ? currentPlayer : gameState.players[0]}
          allPlayers={gameState.players}
        />

        {(gameState.phase === 'ADVERTISE' || gameState.phase === 'BROADCAST') && (
          <AdvertiseQueue
            queue={gameState.advertiseQueue}
            players={gameState.players}
            conspiracies={gameState.conspiracies}
          />
        )}

        <BroadcastQueue
          queue={gameState.broadcastQueue}
          players={gameState.players}
          conspiracies={gameState.conspiracies}
        />

        {gameState.phase === 'RESOLVE' ? (
          <ResolveResults
            conspiracies={gameState.conspiracies}
            players={gameState.players}
            broadcastQueue={gameState.broadcastQueue}
            onContinue={handleResolve}
          />
        ) : (
          isHumanTurn && (
            <>
              <PlayerHand
                player={gameState.players[0]}
                conspiracies={gameState.conspiracies}
                onCardSelect={setSelectedCard}
                selectedCard={selectedCard}
              />

              <ActionButtons
                phase={gameState.phase}
                onAssignEvidence={handleAssignEvidence}
                onAdvertise={handleAdvertise}
                onAdvertisePass={handleAdvertisePass}
                onBroadcast={handleBroadcast}
                onPlayLateEvidence={() => {}}
                onPass={handlePass}
                onContinue={
                  gameState.phase === 'INVESTIGATE'
                    ? handleDoneInvestigating
                    : handleCleanup
                }
                canAssign={!!selectedCard && !!selectedConspiracy}
                canAdvertise={!!selectedConspiracy}
                canBroadcast={!!selectedConspiracy && !broadcastedConspiracies.includes(selectedConspiracy)}
                canPlayLateEvidence={false}
                broadcastCount={broadcastsMadeThisTurn}
                lateEvidencePlayed={lateEvidencePlayed}
              />
            </>
          )
        )}
      </div>

      <div className="ai-log-panel">
        <h3>AI Activity Log</h3>
        <div className="log-container">
          {log.map(entry => (
            <div key={entry.id} className={`log-entry log-${entry.type}`}>
              <span className="log-player" style={{ color: entry.playerColor }}>
                {entry.playerName}:
              </span>
              <span className="log-message">{entry.message}</span>
            </div>
          ))}
          <div ref={logEndRef} />
        </div>
      </div>
    </div>
  );
}
