import React, { useState } from 'react';
import { GameState, BroadcastObject, AdvertiseObject } from './types';
import { initializeGame, drawCards, canSupportConspiracy, detectConsensus, checkWinCondition, determineEvidenceTruth } from './gameLogic';
import { ConspiracyBoard } from './components/ConspiracyBoard';
import { PlayerHand } from './components/PlayerHand';
import { AdvertiseQueue } from './components/AdvertiseQueue';
import { BroadcastQueue } from './components/BroadcastQueue';
import { PhaseIndicator } from './components/PhaseIndicator';
import { ActionButtons } from './components/ActionButtons';
import { GameSetup } from './components/GameSetup';
import { HelpPanel } from './components/HelpPanel';
import { ResolveResults } from './components/ResolveResults';
import { TutorialMode } from './components/TutorialMode';
import { DemoMode } from './components/DemoMode';
import { HumanVsAI } from './components/HumanVsAI';
import './App.css';

function App() {
  const [gameMode, setGameMode] = useState<'menu' | 'play' | 'demo' | 'vs-ai'>('menu');
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedConspiracy, setSelectedConspiracy] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');
  const [tutorialEnabled, setTutorialEnabled] = useState(false);
  const [broadcastsMadeThisTurn, setBroadcastsMadeThisTurn] = useState(0); // v5.0: Track broadcasts (0-2 per turn)
  const [broadcastedConspiracies, setBroadcastedConspiracies] = useState<string[]>([]); // v5.0: Track which conspiracies broadcast on
  const [lateEvidencePlayed, setLateEvidencePlayed] = useState(false); // v5.0: Track if late-breaking evidence was used

  const handleStartGame = (playerCount: number) => {
    setGameState(initializeGame(playerCount));
    setGameStarted(true);
    setGameMode('play');
  };

  if (gameMode === 'demo') {
    return <DemoMode />;
  }

  if (gameMode === 'vs-ai') {
    return <HumanVsAI />;
    return <DemoMode />;
  }

  if (!gameStarted || !gameState) {
    return <GameSetup
      onStartGame={handleStartGame}
      onStartDemo={() => setGameMode('demo')}
      onStartVsAI={() => setGameMode('vs-ai')}
    />;
  }

  const currentPlayer = gameState.players[gameState.currentPlayerIndex];

  // INVESTIGATE PHASE: Assign evidence
  const handleAssignEvidence = () => {
    if (!selectedCard || !selectedConspiracy) {
      setMessage('Select an evidence card and a conspiracy first');
      return;
    }

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

      // Remove card from hand
      player.evidenceHand = player.evidenceHand.filter(c => c.id !== selectedCard);

      // Add to assigned evidence
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

    setSelectedCard(null);
    setSelectedConspiracy(null);
    setMessage(`Assigned ${card.name} to ${selectedConspiracy}`);
  };

  // INVESTIGATE PHASE: Done investigating (cycle through players, then draw cards)
  const handleDoneInvestigating = () => {
    setGameState(prev => {
      if (!prev) return prev;

      const nextPlayerIndex = prev.currentPlayerIndex + 1;
      const isLastPlayer = nextPlayerIndex >= prev.players.length;

      // If not all players have finished, advance to next player
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
        return {
          ...prev,
          currentPlayerIndex: 0,
          firstInvestigateComplete: true
        };
      }

      // Draw cards for everyone and move to ADVERTISE
      let updatedDeck = [...prev.evidenceDeck];
      const updatedPlayers = prev.players.map(player => {
        const result = drawCards(player, updatedDeck, 3); // v5.0: Increased from 2 to 3 cards
        updatedDeck = result.updatedDeck;
        return result.updatedPlayer;
      });

      setMessage('All players drew 3 cards. Advertise phase begins - signal your interests!');

      // Determine starting player for advertise (losing player gets advantage)
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

  // ADVERTISE PHASE: Signal interest in a conspiracy
  const handleAdvertise = () => {
    if (!selectedConspiracy) {
      setMessage('Select a conspiracy to advertise interest in');
      return;
    }

    const advertise: AdvertiseObject = {
      id: `advertise_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: selectedConspiracy,
      timestamp: Date.now()
    };

    let transitioned = false;
    setGameState(prev => {
      if (!prev) return prev;

      // Give +1 audience for advertising
      const updatedPlayers = [...prev.players];
      updatedPlayers[prev.currentPlayerIndex] = {
        ...updatedPlayers[prev.currentPlayerIndex],
        audience: updatedPlayers[prev.currentPlayerIndex].audience + 1
      };

      const updatedQueue = [...prev.advertiseQueue, advertise];
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      if (allPlayersWent) {
        transitioned = true;
      }

      return {
        ...prev,
        players: updatedPlayers,
        advertiseQueue: updatedQueue,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'LATE_EVIDENCE' : 'ADVERTISE'
      };
    });

    setSelectedConspiracy(null);
    if (transitioned) {
      setMessage('Advertise phase complete. Late-breaking evidence phase begins - you may play ONE card face-up!');
    } else {
      setMessage(`${currentPlayer.name} advertised interest in ${selectedConspiracy} (+1 audience)`);
    }
  };

  // ADVERTISE PHASE: Pass
  const handleAdvertisePass = () => {
    const passAdvertise: AdvertiseObject = {
      id: `advertise_pass_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: '',
      timestamp: Date.now(),
      isPassed: true
    };

    let transitioned = false;
    setGameState(prev => {
      if (!prev) return prev;

      // Lose -1 audience for passing
      const updatedPlayers = [...prev.players];
      updatedPlayers[prev.currentPlayerIndex] = {
        ...updatedPlayers[prev.currentPlayerIndex],
        audience: Math.max(0, updatedPlayers[prev.currentPlayerIndex].audience - 1)
      };

      const updatedQueue = [...prev.advertiseQueue, passAdvertise];
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      if (allPlayersWent) {
        transitioned = true;
      }

      return {
        ...prev,
        players: updatedPlayers,
        advertiseQueue: updatedQueue,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'LATE_EVIDENCE' : 'ADVERTISE'
      };
    });

    if (transitioned) {
      setMessage('Advertise phase complete. Late-breaking evidence phase begins - you may play ONE card face-up!');
    } else {
      setMessage(`${currentPlayer.name} passed on advertising (-1 audience)`);
    }
  };

  // LATE_EVIDENCE PHASE: Play one card face-up
  const handlePlayLateEvidence = () => {
    if (!selectedCard || !selectedConspiracy) {
      setMessage('Select one evidence card and a conspiracy to play it face-up');
      return;
    }

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
      const player = { ...updatedPlayers[playerIndex] };

      // Remove card from hand
      player.evidenceHand = player.evidenceHand.filter(c => c.id !== selectedCard);

      // Add to face-up evidence
      if (!player.faceUpEvidence) {
        player.faceUpEvidence = {};
      }
      if (!player.faceUpEvidence[selectedConspiracy]) {
        player.faceUpEvidence[selectedConspiracy] = [];
      }
      player.faceUpEvidence[selectedConspiracy] = [
        ...player.faceUpEvidence[selectedConspiracy],
        card
      ];

      updatedPlayers[playerIndex] = player;

      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      return {
        ...prev,
        players: updatedPlayers,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'BROADCAST' : 'LATE_EVIDENCE'
      };
    });

    setSelectedCard(null);
    setSelectedConspiracy(null);
    setLateEvidencePlayed(true);
    setMessage(`Played ${card.name} face-up on ${selectedConspiracy}`);
  };

  const handlePassLateEvidence = () => {
    setGameState(prev => {
      if (!prev) return prev;
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      if (allPlayersWent) {
        setMessage('Late-breaking evidence phase complete. Broadcast phase begins!');
      }

      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'BROADCAST' : 'LATE_EVIDENCE'
      };
    });

    if (!gameState || (gameState.currentPlayerIndex + 1) % gameState.players.length !== 0) {
      setMessage(`${currentPlayer.name} passed on late-breaking evidence`);
    }
  };

  // BROADCAST PHASE: Make a broadcast (bluffing allowed!)
  const handleBroadcast = (position: 'REAL' | 'FAKE' | 'INCONCLUSIVE') => {
    if (!selectedConspiracy) {
      setMessage('Select a conspiracy to broadcast about');
      return;
    }

    // v5.0: Check if already broadcast on this conspiracy
    if (broadcastedConspiracies.includes(selectedConspiracy)) {
      setMessage('You already broadcast on this conspiracy! Choose a different one.');
      return;
    }

    const assignedCards = currentPlayer.assignedEvidence[selectedConspiracy] || [];
    const faceUpCards = currentPlayer.faceUpEvidence?.[selectedConspiracy] || [];
    const totalEvidence = assignedCards.length + faceUpCards.length;
    const isBandwagoning = totalEvidence === 0;

    if (position === 'INCONCLUSIVE') {
      setMessage(`${currentPlayer.name} broadcasts INCONCLUSIVE (???). Safe choice: 2 base points, no credibility risk.`);
    } else if (isBandwagoning) {
      setMessage(`⚠️ BANDWAGONING! ${currentPlayer.name} has NO evidence. Low reward: Only 1 base point vs 3 with evidence.`);
    }

    const broadcast: BroadcastObject = {
      id: `broadcast_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: selectedConspiracy,
      position,
      evidenceCount: totalEvidence,
      timestamp: Date.now()
    };

    // v5.0: Track this broadcast
    const newBroadcastCount = broadcastsMadeThisTurn + 1;
    setBroadcastsMadeThisTurn(newBroadcastCount);
    setBroadcastedConspiracies([...broadcastedConspiracies, selectedConspiracy]);

    // v5.0: Only move to next player after 2 broadcasts
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
        // Same player continues
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
      setLateEvidencePlayed(false); // v5.0: Reset late evidence flag
      setMessage(`${currentPlayer.name} completed 2 broadcasts. Next player's turn.`);
    } else {
      setMessage(`${currentPlayer.name} broadcast ${newBroadcastCount}/2: ${selectedConspiracy} is ${position}`);
    }
  };

  // BROADCAST PHASE: Done Broadcasting (Pass)
  // v5.0: Player can finish their turn after 0, 1, or 2 broadcasts
  const handlePass = () => {
    // v5.0: If player made 0 broadcasts, add a pass marker and draw 1 card
    const noBroadcastsMade = broadcastsMadeThisTurn === 0;

    setGameState(prev => {
      if (!prev) return prev;
      let updatedPlayers = [...prev.players];
      let updatedDeck = prev.evidenceDeck;
      let updatedQueue = [...prev.broadcastQueue];

      // If completely passed (0 broadcasts), add pass marker and draw 1 card
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

    // Reset broadcast tracking
    setBroadcastsMadeThisTurn(0);
    setBroadcastedConspiracies([]);
    setLateEvidencePlayed(false); // v5.0: Reset late evidence flag

    if (noBroadcastsMade) {
      setMessage(`${currentPlayer.name} passed (0 broadcasts) and drew 1 card`);
    } else {
      setMessage(`${currentPlayer.name} finished with ${broadcastsMadeThisTurn} broadcast(s)`);
    }
  };

  // RESOLVE PHASE: Process all broadcasts and check consensus
  const handleResolve = () => {
    setGameState(prev => {
      if (!prev) return prev;
      const updatedPlayers = [...prev.players];
      const revealedConspiracies: string[] = [];
      let totalRevealed = prev.totalRevealed;

      // Check each conspiracy for consensus
      prev.conspiracies.forEach(conspiracy => {
        const { consensus, position } = detectConsensus(prev.broadcastQueue, conspiracy.id, prev.players.length);

        if (consensus && position) {
          // Mark conspiracy as revealed
          const conspiracyIndex = prev.conspiracies.findIndex(c => c.id === conspiracy.id);
          if (conspiracyIndex >= 0 && !prev.conspiracies[conspiracyIndex].isRevealed) {
            revealedConspiracies.push(conspiracy.id);
            totalRevealed++;
          }

          // Get all broadcasts on this conspiracy
          const broadcasts = prev.broadcastQueue.filter(
            b => b.conspiracyId === conspiracy.id && !b.isPassed
          );

          // STEP 1: Award audience points (CONSENSUS-BASED, NO TRUTH CHECKING!)
          broadcasts.forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };
              // Merge face-down evidence (assignedEvidence) with face-up evidence (faceUpEvidence)
              const assignedCards = player.assignedEvidence[conspiracy.id] || [];
              const faceUpCards = player.faceUpEvidence?.[conspiracy.id] || [];
              const evidenceUsed = [...assignedCards, ...faceUpCards];

              // Calculate audience points using consensus-based formula
              let audiencePoints = 0;

              // BASE POINTS
              if (broadcast.position === 'INCONCLUSIVE') {
                audiencePoints = 2; // Safe option
              } else if (evidenceUsed.length > 0) {
                audiencePoints = 3; // Broadcasting with evidence
              } else {
                audiencePoints = 1; // Bandwagoning (no evidence)
              }

              // Q33: TIER BONUS (harder conspiracies with less evidence get bonus points)
              const tierBonus = conspiracy.tier; // Tier 1: +1, Tier 2: +2, Tier 3: +3
              audiencePoints += tierBonus;

              // EVIDENCE BONUS
              let evidenceBonus = 0;
              evidenceUsed.forEach((card, index) => {
                // Q27: Diminishing returns - first card full bonus, subsequent cards reduced to +1
                let specificityBonus;
                if (index === 0) {
                  // First card: full specificity bonus
                  specificityBonus = card.supportedConspiracies.includes('ALL') ? 1 : 3;
                } else {
                  // Subsequent cards: reduced to +1 (diminishing returns)
                  specificityBonus = 1;
                }

                // Excitement multiplier (FIXED: 2.0x for EXCITING)
                let excitementMult = 1.0;
                if (card.excitement === 1) excitementMult = 2.0;  // EXCITING: 2.0x multiplier
                if (card.excitement === -1) excitementMult = 0.5; // BORING: 0.5x multiplier

                // Novelty bonus (first use on this specific conspiracy, not global)
                const isNovel = !player.broadcastHistory.some(h =>
                  h.conspiracyId === conspiracy.id &&
                  h.evidenceIds.includes(card.id)
                );
                const noveltyBonus = isNovel ? 2 : 0;

                evidenceBonus += Math.round(specificityBonus * excitementMult) + noveltyBonus;
              });

              // SUBTOTAL
              const subtotal = audiencePoints + evidenceBonus;

              // CREDIBILITY MODIFIER
              let finalScore = subtotal;
              if (player.credibility >= 7) {
                finalScore = Math.round(subtotal * 1.5); // +50% bonus
              } else if (player.credibility <= 3) {
                finalScore = Math.round(subtotal * 0.75); // -25% penalty
              }

              player.audience += finalScore;

              // Add to broadcast history
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

          // STEP 2: Adjust credibility based on majority/minority
          broadcasts.forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };

              // Skip INCONCLUSIVE broadcasts
              if (broadcast.position !== 'INCONCLUSIVE') {
                // Majority side: +1 credibility
                if (broadcast.position === position) {
                  player.credibility = Math.min(10, player.credibility + 1);
                } else {
                  // Minority side: -1 credibility
                  player.credibility = Math.max(0, player.credibility - 1);
                }
              }

              updatedPlayers[playerIndex] = player;
            }
          });

          // STEP 3 (v5.0): Truth bonus/penalties based on evidence proof values
          // Collect ALL evidence assigned to this conspiracy by ALL players
          const allEvidenceOnConspiracy: any[] = [];
          updatedPlayers.forEach(player => {
            const assigned = player.assignedEvidence[conspiracy.id] || [];
            const faceUp = player.faceUpEvidence?.[conspiracy.id] || [];
            allEvidenceOnConspiracy.push(...assigned, ...faceUp);
          });

          // Determine truth based on evidence proof values
          const { truth, realCount, fakeCount, bluffCount } = determineEvidenceTruth(allEvidenceOnConspiracy);

          // Apply truth bonuses and penalties
          broadcasts.forEach(broadcast => {
            const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
            if (playerIndex >= 0) {
              const player = { ...updatedPlayers[playerIndex] };
              const assigned = player.assignedEvidence[conspiracy.id] || [];
              const faceUp = player.faceUpEvidence?.[conspiracy.id] || [];
              const evidenceUsed = [...assigned, ...faceUp];
              const hasBluffs = evidenceUsed.some(card => card.proofValue === 'BLUFF');

              if (truth === 'TIE') {
                // TIE: Everyone gets +2 audience, bluffers get -1 credibility
                player.audience += 2;
                if (hasBluffs) {
                  player.credibility = Math.max(0, player.credibility - 1);
                }
              } else {
                // Truth determined: +3 bonus for matching, -1 credibility for wrong position
                if (broadcast.position === truth) {
                  // Broadcast matches evidence truth: +3 audience bonus
                  player.audience += 3;
                } else if (broadcast.position !== 'INCONCLUSIVE') {
                  // Broadcast contradicts evidence truth: -1 credibility penalty
                  player.credibility = Math.max(0, player.credibility - 1);
                }

                // Bluff penalty: -1 credibility regardless of position
                if (hasBluffs) {
                  player.credibility = Math.max(0, player.credibility - 1);
                }
              }

              updatedPlayers[playerIndex] = player;
            }
          });

        } else {
          // No consensus - still track in history but mark as not scored
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

      // Reveal conspiracies
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

  // CLEANUP PHASE: Replace revealed conspiracies and advance round
  const handleCleanup = () => {
    setGameState(prev => {
      if (!prev) return prev;
      // Replace revealed conspiracies
      let updatedDeck = [...prev.conspiracyDeck];
      const updatedConspiracies = prev.conspiracies.map(c => {
        if (c.isRevealed && updatedDeck.length > 0) {
          const newConspiracy = updatedDeck[0];
          updatedDeck = updatedDeck.slice(1);
          return newConspiracy;
        }
        return c;
      });

      // Keep assigned evidence persistent across rounds (excitement mechanic)
      const updatedPlayers = [...prev.players];

      // Check win condition
      const winCheck = checkWinCondition({
        ...prev,
        conspiracies: updatedConspiracies,
        players: updatedPlayers,
        round: prev.round + 1
      });

      // Determine starting player for next round (highest scoring player goes first)
      // If tied on score, player with highest credibility goes first
      const startingPlayerIndex = updatedPlayers.reduce((bestIdx, player, idx, arr) => {
        const bestPlayer = arr[bestIdx];
        if (player.audience > bestPlayer.audience) return idx;
        if (player.audience === bestPlayer.audience && player.credibility > bestPlayer.credibility) return idx;
        return bestIdx;
      }, 0);

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

  if (gameState.gameOver && gameState.winner) {
    const winner = gameState.players.find(p => p.id === gameState.winner);
    return (
      <div className="App">
        <div className="game-over">
          <h1>Game Over!</h1>
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
          <button className="btn btn-primary" onClick={() => {
            setGameStarted(false);
            setGameState(null);
            setSelectedCard(null);
            setSelectedConspiracy(null);
            setMessage('');
          }}>
            New Game
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1>Signal to Noise</h1>
      </header>

      <PhaseIndicator phase={gameState.phase} round={gameState.round} />

      {/* Score Display */}
      <div className="scoreboard">
        <div className="scoreboard-title">Current Scores</div>
        <div className="scoreboard-players">
          {gameState.players.map(p => (
            <div
              key={p.id}
              className={`scoreboard-player ${p.id === currentPlayer.id ? 'current-player' : ''}`}
            >
              <span className="player-name" style={{ color: p.color }}>
                {p.name}
                {p.id === currentPlayer.id && ' ⭐'}
              </span>
              <span className="player-stats">
                <span className="stat-audience" title="Audience">
                  👥 {p.audience}
                </span>
                <span className="stat-credibility" title="Credibility">
                  ⚖️ {p.credibility}
                </span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <HelpPanel phase={gameState.phase} />

      {message && <div className="message-banner">{message}</div>}

      <ConspiracyBoard
        conspiracies={gameState.conspiracies}
        onSelect={setSelectedConspiracy}
        selectedConspiracy={selectedConspiracy}
        selectedCardId={selectedCard}
        currentPlayer={currentPlayer}
        allPlayers={gameState.players}
      />

      {(gameState.phase === 'ADVERTISE' || gameState.phase === 'LATE_EVIDENCE' || gameState.phase === 'BROADCAST') && (
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
        <>
          <PlayerHand
            player={currentPlayer}
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
            onPlayLateEvidence={handlePlayLateEvidence}
            onPass={handlePass}
            onContinue={
              gameState.phase === 'INVESTIGATE'
                ? handleDoneInvestigating
                : handleCleanup
            }
            canAssign={!!selectedCard && !!selectedConspiracy}
            canAdvertise={!!selectedConspiracy}
            canBroadcast={!!selectedConspiracy && !broadcastedConspiracies.includes(selectedConspiracy)}
            canPlayLateEvidence={!!selectedCard && !!selectedConspiracy && !lateEvidencePlayed}
            broadcastCount={broadcastsMadeThisTurn}
            lateEvidencePlayed={lateEvidencePlayed}
          />
        </>
      )}

      <TutorialMode
        phase={gameState.phase}
        round={gameState.round}
        currentPlayerName={currentPlayer.name}
        isEnabled={tutorialEnabled}
        onToggle={() => setTutorialEnabled(!tutorialEnabled)}
      />
    </div>
  );
}

export default App;
