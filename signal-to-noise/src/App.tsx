import React, { useState } from 'react';
import { GameState, BroadcastObject } from './types';
import { initializeGame, drawCards, canSupportConspiracy, detectConsensus, checkWinCondition } from './gameLogic';
import { ConspiracyBoard } from './components/ConspiracyBoard';
import { PlayerHand } from './components/PlayerHand';
import { BroadcastQueue } from './components/BroadcastQueue';
import { PhaseIndicator } from './components/PhaseIndicator';
import { ActionButtons } from './components/ActionButtons';
import { GameSetup } from './components/GameSetup';
import { HelpPanel } from './components/HelpPanel';
import { ResolveResults } from './components/ResolveResults';
import './App.css';

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [selectedConspiracy, setSelectedConspiracy] = useState<string | null>(null);
  const [message, setMessage] = useState<string>('');

  const handleStartGame = (playerCount: number) => {
    setGameState(initializeGame(playerCount));
    setGameStarted(true);
  };

  if (!gameStarted || !gameState) {
    return <GameSetup onStartGame={handleStartGame} />;
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

      // All players finished - draw cards for everyone and move to BROADCAST
      let updatedDeck = [...prev.evidenceDeck];
      const updatedPlayers = prev.players.map(player => {
        const result = drawCards(player, updatedDeck, 2);
        updatedDeck = result.updatedDeck;
        return result.updatedPlayer;
      });

      setMessage('All players drew 2 cards. Broadcast phase begins.');

      // Determine starting player for broadcast (losing player gets advantage)
      const startingPlayerIndex = updatedPlayers.reduce((lowestIdx, player, idx, arr) =>
        player.audience < arr[lowestIdx].audience ? idx : lowestIdx
      , 0);

      return {
        ...prev,
        players: updatedPlayers,
        evidenceDeck: updatedDeck,
        phase: 'BROADCAST',
        currentPlayerIndex: startingPlayerIndex
      };
    });
  };

  // BROADCAST PHASE: Make a broadcast (bluffing allowed!)
  const handleBroadcast = (position: 'REAL' | 'FAKE') => {
    if (!selectedConspiracy) {
      setMessage('Select a conspiracy to broadcast about');
      return;
    }

    const assignedCards = currentPlayer.assignedEvidence[selectedConspiracy] || [];
    const isBluffing = assignedCards.length === 0;

    if (isBluffing) {
      setMessage(`⚠️ BLUFFING! ${currentPlayer.name} has NO evidence for this conspiracy. Risk: Double penalty if wrong (-6 credibility)`);
    }

    const broadcast: BroadcastObject = {
      id: `broadcast_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: selectedConspiracy,
      position,
      evidenceCount: assignedCards.length,
      timestamp: Date.now()
    };

    setGameState(prev => {
      if (!prev) return prev;
      const updatedQueue = [...prev.broadcastQueue, broadcast];
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      return {
        ...prev,
        broadcastQueue: updatedQueue,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'RESOLVE' : 'BROADCAST'
      };
    });

    setSelectedConspiracy(null);
    setMessage(`${currentPlayer.name} broadcast: ${selectedConspiracy} is ${position}`);
  };

  // BROADCAST PHASE: Pass
  const handlePass = () => {
    const passBroadcast: BroadcastObject = {
      id: `pass_${Date.now()}_${currentPlayer.id}`,
      playerId: currentPlayer.id,
      conspiracyId: '',
      position: 'REAL',
      evidenceCount: 0,
      timestamp: Date.now(),
      isPassed: true
    };

    setGameState(prev => {
      if (!prev) return prev;
      // Draw 1 card
      const result = drawCards(currentPlayer, prev.evidenceDeck, 1);
      const updatedPlayers = [...prev.players];
      updatedPlayers[prev.currentPlayerIndex] = result.updatedPlayer;

      const updatedQueue = [...prev.broadcastQueue, passBroadcast];
      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      return {
        ...prev,
        players: updatedPlayers,
        evidenceDeck: result.updatedDeck,
        broadcastQueue: updatedQueue,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'RESOLVE' : 'BROADCAST'
      };
    });

    setMessage(`${currentPlayer.name} passed and drew 1 card`);
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

          // Score all broadcasts on this conspiracy
          prev.broadcastQueue
            .filter(b => b.conspiracyId === conspiracy.id && !b.isPassed)
            .forEach(broadcast => {
              const playerIndex = updatedPlayers.findIndex(p => p.id === broadcast.playerId);
              if (playerIndex >= 0) {
                const player = { ...updatedPlayers[playerIndex] };
                const evidenceUsed = player.assignedEvidence[conspiracy.id] || [];

                // Calculate excitement modifier
                let excitementModifier = 0;
                evidenceUsed.forEach(card => {
                  // Check if this evidence was used in previous broadcasts
                  const previousUses = player.broadcastHistory.filter(entry =>
                    entry.evidenceIds.includes(card.id) && entry.wasScored
                  ).length;

                  if (card.excitement === -1 && previousUses > 0) {
                    // BORING card on repeat: -2 penalty
                    excitementModifier -= 2;
                  } else if (card.excitement === 1 && previousUses > 0) {
                    // EXCITING card on repeat: +2 bonus per previous use
                    excitementModifier += 2 * previousUses;
                  }
                  // NEUTRAL (0) never adds modifier
                });

                if (broadcast.position === conspiracy.truthValue) {
                  // Correct - base score + excitement modifier
                  const baseScore = broadcast.evidenceCount * conspiracy.tier;
                  player.audience += baseScore + excitementModifier;
                } else {
                  // Wrong - credibility penalty (double if bluffing)
                  const isBluff = broadcast.evidenceCount === 0;
                  const credibilityLoss = isBluff ? 6 : 3;
                  player.credibility = Math.max(0, player.credibility - credibilityLoss);
                }

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

      // Determine starting player for next round (losing player goes first - comeback mechanic)
      const startingPlayerIndex = updatedPlayers.reduce((lowestIdx, player, idx, arr) =>
        player.audience < arr[lowestIdx].audience ? idx : lowestIdx
      , 0);

      return {
        ...prev,
        conspiracies: updatedConspiracies,
        conspiracyDeck: updatedDeck,
        players: updatedPlayers,
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

      <HelpPanel phase={gameState.phase} />

      {message && <div className="message-banner">{message}</div>}

      <ConspiracyBoard
        conspiracies={gameState.conspiracies}
        onSelect={setSelectedConspiracy}
        selectedConspiracy={selectedConspiracy}
        selectedCardId={selectedCard}
        currentPlayer={currentPlayer}
      />

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
            onBroadcast={handleBroadcast}
            onPass={handlePass}
            onContinue={
              gameState.phase === 'INVESTIGATE'
                ? handleDoneInvestigating
                : handleCleanup
            }
            canAssign={!!selectedCard && !!selectedConspiracy}
            canBroadcast={!!selectedConspiracy}
          />
        </>
      )}
    </div>
  );
}

export default App;
