import React, { useState, useEffect, useRef } from 'react';
import { GameState, PlayerState, Position } from '../types';
import { initializeGame, canSupportConspiracy, detectConsensus, checkWinCondition, drawCards, determineEvidenceTruth } from '../gameLogic';
import { getRandomPersonality, makeAIDecision, makeAdvertiseDecision, AIPersonality } from '../aiPersonalities';
import { ConspiracyBoard } from './ConspiracyBoard';
import { AdvertiseQueue } from './AdvertiseQueue';
import { BroadcastQueue } from './BroadcastQueue';
import { PhaseIndicator } from './PhaseIndicator';
import './DemoMode.css';

interface LogEntry {
  round: number;
  phase: string;
  player: string;
  message: string;
  timestamp: number;
  type: 'action' | 'commentary' | 'phase' | 'score';
}

export function DemoMode() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [personalities, setPersonalities] = useState<Map<string, AIPersonality>>(new Map());
  const [log, setLog] = useState<LogEntry[]>([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [stepMode, setStepMode] = useState(true);
  const [speed, setSpeed] = useState(1000); // ms between actions
  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll log to bottom
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  const addLog = (entry: Omit<LogEntry, 'timestamp'>) => {
    setLog(prev => [...prev, { ...entry, timestamp: Date.now() }]);
  };

  const getCommentary = (personality: AIPersonality, action: string, context: any): string => {
    const comments = {
      'The Paranoid Skeptic': [
        "I don't trust any of this...",
        "Everyone's hiding something.",
        "This smells like a setup.",
        "Better safe than sorry."
      ],
      'The Reckless Gambler': [
        "All in!",
        "Fortune favors the bold!",
        "Let's see what happens!",
        "High risk, high reward!"
      ],
      'The Calculated Strategist': [
        "According to my calculations...",
        "This is the optimal play.",
        "Analyzing the probabilities...",
        "Strategy over emotion."
      ],
      'The Truth Seeker': [
        "The evidence speaks for itself.",
        "Let's stick to the facts.",
        "Truth will prevail.",
        "I need more data."
      ],
      'The Conspiracy Theorist': [
        "It's all connected!",
        "They don't want you to know!",
        "Wake up, sheeple!",
        "The truth is out there!"
      ],
      'The Professional Analyst': [
        "Based on market analysis...",
        "The data suggests...",
        "Professional assessment indicates...",
        "Maintaining portfolio balance."
      ],
      'The Opportunist': [
        "Time to strike!",
        "I see an opening...",
        "Exploiting the weakness.",
        "Opportunity knocks!"
      ],
      'The Cautious Scholar': [
        "Let me review the literature...",
        "Academic rigor demands...",
        "Upon careful consideration...",
        "The research indicates..."
      ],
      'The Chaos Agent': [
        "Chaos reigns!",
        "Let's shake things up!",
        "Unpredictability is key.",
        "No one expects this!"
      ],
      'The Steady Builder': [
        "Slow and steady...",
        "Building momentum.",
        "Consistent progress.",
        "Trust the process."
      ],
      'The Saboteur': [
        "Setting the trap...",
        "Let them fall into it.",
        "Misdirection is an art.",
        "They'll regret this."
      ],
      'The Meta-Reader': [
        "I see what you're doing...",
        "Reading between the lines.",
        "That's a trap.",
        "Patterns emerging..."
      ]
    };

    const personalityComments = comments[personality.name as keyof typeof comments] || ["Interesting move."];
    return personalityComments[Math.floor(Math.random() * personalityComments.length)];
  };

  const initializeDemo = () => {
    const playerCount = 4;
    const newGame = initializeGame(playerCount);

    // Assign random personalities to each player
    const personalityMap = new Map<string, AIPersonality>();
    newGame.players.forEach(player => {
      const personality = getRandomPersonality();
      personalityMap.set(player.id, personality);
      player.name = personality.name;
    });

    setPersonalities(personalityMap);
    setGameState(newGame);
    setLog([]);

    addLog({
      round: 1,
      phase: 'SETUP',
      player: 'System',
      message: `Demo starting with ${playerCount} AI players!`,
      type: 'phase'
    });

    newGame.players.forEach(player => {
      const personality = personalityMap.get(player.id)!;
      addLog({
        round: 1,
        phase: 'SETUP',
        player: player.name,
        message: `${personality.description}`,
        type: 'commentary'
      });
    });
  };

  const executeNextAction = () => {
    if (!gameState) return;

    const currentPlayer = gameState.players[gameState.currentPlayerIndex];
    const personality = personalities.get(currentPlayer.id);

    if (!personality) return;

    switch (gameState.phase) {
      case 'INVESTIGATE':
        handleInvestigatePhase(currentPlayer, personality);
        break;
      case 'ADVERTISE':
        handleAdvertisePhase(currentPlayer, personality);
        break;
      case 'BROADCAST':
        handleBroadcastPhase(currentPlayer, personality);
        break;
      case 'RESOLVE':
        handleResolvePhase();
        break;
      case 'CLEANUP':
        handleCleanupPhase();
        break;
    }
  };

  const handleInvestigatePhase = (player: PlayerState, personality: AIPersonality) => {
    if (!gameState) return;

    const availableCards = player.evidenceHand.filter(card =>
      gameState.conspiracies.some(c => canSupportConspiracy(card, c.id))
    );

    if (availableCards.length > 0 && Math.random() < 0.7) {
      // Assign a card
      const card = availableCards[Math.floor(Math.random() * availableCards.length)];
      const eligibleConspiracies = gameState.conspiracies.filter(c => canSupportConspiracy(card, c.id));
      const conspiracy = eligibleConspiracies[Math.floor(Math.random() * eligibleConspiracies.length)];

      setGameState(prev => {
        if (!prev) return prev;
        const updatedPlayers = [...prev.players];
        const playerIndex = prev.currentPlayerIndex;
        const updatedPlayer = { ...updatedPlayers[playerIndex] };

        updatedPlayer.evidenceHand = updatedPlayer.evidenceHand.filter(c => c.id !== card.id);
        if (!updatedPlayer.assignedEvidence[conspiracy.id]) {
          updatedPlayer.assignedEvidence[conspiracy.id] = [];
        }
        updatedPlayer.assignedEvidence[conspiracy.id] = [
          ...updatedPlayer.assignedEvidence[conspiracy.id],
          card
        ];

        updatedPlayers[playerIndex] = updatedPlayer;
        return { ...prev, players: updatedPlayers };
      });

      addLog({
        round: gameState.round,
        phase: 'INVESTIGATE',
        player: player.name,
        message: `Assigned "${card.name}" to ${conspiracy.name}`,
        type: 'action'
      });

      addLog({
        round: gameState.round,
        phase: 'INVESTIGATE',
        player: player.name,
        message: getCommentary(personality, 'investigate', { card, conspiracy }),
        type: 'commentary'
      });
    } else {
      // Done investigating
      setGameState(prev => {
        if (!prev) return prev;
        const nextPlayerIndex = prev.currentPlayerIndex + 1;
        const isLastPlayer = nextPlayerIndex >= prev.players.length;

        if (!isLastPlayer) {
          return { ...prev, currentPlayerIndex: nextPlayerIndex };
        }

        // All players finished - draw cards
        let updatedDeck = [...prev.evidenceDeck];
        const updatedPlayers = prev.players.map(p => {
          const result = drawCards(p, updatedDeck, 3);
          updatedDeck = result.updatedDeck;
          return result.updatedPlayer;
        });

        const startingPlayerIndex = updatedPlayers.reduce((lowestIdx, p, idx, arr) =>
          p.audience < arr[lowestIdx].audience ? idx : lowestIdx
        , 0);

        return {
          ...prev,
          players: updatedPlayers,
          evidenceDeck: updatedDeck,
          phase: 'ADVERTISE',
          currentPlayerIndex: startingPlayerIndex
        };
      });

      if (gameState.currentPlayerIndex === gameState.players.length - 1) {
        addLog({
          round: gameState.round,
          phase: 'INVESTIGATE',
          player: 'System',
          message: 'All players drew 3 cards. Advertise phase begins!',
          type: 'phase'
        });
      }
    }
  };

  const handleAdvertisePhase = (player: PlayerState, personality: AIPersonality) => {
    if (!gameState) return;

    const currentRound = gameState.round;
    const currentAdvertiseQueueLength = gameState.advertiseQueue.length;
    const playerCount = gameState.players.length;

    const decision = makeAdvertiseDecision(gameState, gameState.currentPlayerIndex, personality);

    if (decision.action === 'advertise' && decision.conspiracyId) {
      const conspiracy = gameState.conspiracies.find(c => c.id === decision.conspiracyId);

      setGameState(prev => {
        if (!prev) return prev;
        const advertise = {
          id: `advertise_${Date.now()}_${player.id}`,
          playerId: player.id,
          conspiracyId: decision.conspiracyId!,
          timestamp: Date.now()
        };

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

      addLog({
        round: currentRound,
        phase: 'ADVERTISE',
        player: player.name,
        message: `Advertised interest in: ${conspiracy?.name}${decision.isTrap ? ' (TRAP!)' : ''}`,
        type: 'action'
      });

      addLog({
        round: currentRound,
        phase: 'ADVERTISE',
        player: player.name,
        message: getCommentary(personality, 'advertise', { conspiracy }),
        type: 'commentary'
      });
    } else {
      // Pass
      setGameState(prev => {
        if (!prev) return prev;
        const passAdvertise = {
          id: `advertise_pass_${Date.now()}_${player.id}`,
          playerId: player.id,
          conspiracyId: '',
          timestamp: Date.now(),
          isPassed: true
        };

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

      addLog({
        round: currentRound,
        phase: 'ADVERTISE',
        player: player.name,
        message: 'Passed on advertising',
        type: 'action'
      });
    }

    if (currentAdvertiseQueueLength === playerCount - 1) {
      addLog({
        round: currentRound,
        phase: 'ADVERTISE',
        player: 'System',
        message: 'Advertise phase complete. Broadcast phase begins!',
        type: 'phase'
      });
    }
  };

  const handleBroadcastPhase = (player: PlayerState, personality: AIPersonality) => {
    if (!gameState) return;

    const currentRound = gameState.round;

    // Simple version: make 1-2 broadcasts then pass
    const broadcastsMade = gameState.broadcastQueue.filter(b => b.playerId === player.id && !b.isPassed).length;

    if (broadcastsMade < 2) {
      const decision = makeAIDecision(gameState, gameState.currentPlayerIndex, personality);

      if (decision.action === 'broadcast' && decision.conspiracyId && decision.position) {
        const conspiracy = gameState.conspiracies.find(c => c.id === decision.conspiracyId);
        const assignedCards = player.assignedEvidence[decision.conspiracyId] || [];

        setGameState(prev => {
          if (!prev) return prev;
          const broadcast = {
            id: `broadcast_${Date.now()}_${player.id}`,
            playerId: player.id,
            conspiracyId: decision.conspiracyId!,
            position: decision.position!,
            evidenceCount: assignedCards.length,
            timestamp: Date.now()
          };

          const updatedQueue = [...prev.broadcastQueue, broadcast];

          return { ...prev, broadcastQueue: updatedQueue };
        });

        addLog({
          round: currentRound,
          phase: 'BROADCAST',
          player: player.name,
          message: `Broadcasts: ${conspiracy?.name} is ${decision.position} (${assignedCards.length} evidence${decision.isBluff ? ', BLUFFING!' : ''})`,
          type: 'action'
        });

        addLog({
          round: currentRound,
          phase: 'BROADCAST',
          player: player.name,
          message: getCommentary(personality, 'broadcast', { conspiracy, position: decision.position }),
          type: 'commentary'
        });
      } else {
        // Pass/Done
        moveToNextBroadcaster();
      }
    } else {
      moveToNextBroadcaster();
    }
  };

  const moveToNextBroadcaster = () => {
    setGameState(prev => {
      if (!prev) return prev;

      const nextPlayerIndex = (prev.currentPlayerIndex + 1) % prev.players.length;
      const allPlayersWent = nextPlayerIndex === 0;

      if (allPlayersWent) {
        addLog({
          round: prev.round,
          phase: 'BROADCAST',
          player: 'System',
          message: 'All broadcasts complete. Resolving...',
          type: 'phase'
        });
      }

      return {
        ...prev,
        currentPlayerIndex: nextPlayerIndex,
        phase: allPlayersWent ? 'RESOLVE' : 'BROADCAST'
      };
    });
  };

  const handleResolvePhase = () => {
    if (!gameState) return;

    const currentRound = gameState.round;
    const currentPlayers = gameState.players;

    setGameState(prev => {
      if (!prev) return prev;
      const updatedPlayers = [...prev.players];
      const revealedConspiracies: string[] = [];
      let totalRevealed = prev.totalRevealed;

      prev.conspiracies.forEach(conspiracy => {
        const { consensus, position } = detectConsensus(prev.broadcastQueue, conspiracy.id, prev.players.length);

        if (consensus && position) {
          if (!conspiracy.isRevealed) {
            revealedConspiracies.push(conspiracy.id);
            totalRevealed++;
          }

          const broadcasts = prev.broadcastQueue.filter(
            b => b.conspiracyId === conspiracy.id && !b.isPassed
          );

          // Award points and adjust credibility
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

              audiencePoints += conspiracy.tier;

              let evidenceBonus = 0;
              evidenceUsed.forEach((card, index) => {
                let specificityBonus = index === 0 ? (card.supportedConspiracies.includes('ALL') ? 1 : 3) : 1;
                let excitementMult = card.excitement === 1 ? 2.0 : card.excitement === -1 ? 0.5 : 1.0;
                evidenceBonus += Math.round(specificityBonus * excitementMult);
              });

              const subtotal = audiencePoints + evidenceBonus;
              let finalScore = subtotal;

              if (player.credibility >= 7) {
                finalScore = Math.round(subtotal * 1.5);
              } else if (player.credibility <= 3) {
                finalScore = Math.round(subtotal * 0.75);
              }

              player.audience += finalScore;

              // Credibility adjustment
              if (broadcast.position !== 'INCONCLUSIVE') {
                if (broadcast.position === position) {
                  player.credibility = Math.min(10, player.credibility + 1);
                } else {
                  player.credibility = Math.max(0, player.credibility - 1);
                }
              }

              // Truth bonus
              const allEvidence: any[] = [];
              prev.players.forEach(p => {
                const ev = p.assignedEvidence[conspiracy.id] || [];
                allEvidence.push(...ev);
              });

              const { truth } = determineEvidenceTruth(allEvidence);
              if (truth !== 'TIE' && broadcast.position === truth) {
                player.audience += 3;
              }

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

          addLog({
            round: prev.round,
            phase: 'RESOLVE',
            player: 'System',
            message: `CONSENSUS: ${conspiracy.name} is ${position}!`,
            type: 'score'
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

    // Log scores
    gameState!.players.forEach(player => {
      addLog({
        round: gameState.round,
        phase: 'RESOLVE',
        player: player.name,
        message: `Score: ${player.audience} audience, ${player.credibility} credibility`,
        type: 'score'
      });
    });
  };

  const handleCleanupPhase = () => {
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

      const startingPlayerIndex = updatedPlayers.reduce((lowestIdx, p, idx, arr) =>
        p.audience < arr[lowestIdx].audience ? idx : lowestIdx
      , 0);

      if (winCheck.gameOver) {
        const winner = prev.players.find(p => p.id === winCheck.winner);
        addLog({
          round: prev.round,
          phase: 'CLEANUP',
          player: 'System',
          message: `GAME OVER! ${winner?.name} wins with ${winner?.audience} audience!`,
          type: 'phase'
        });
        setIsPlaying(false);
      } else {
        addLog({
          round: prev.round + 1,
          phase: 'CLEANUP',
          player: 'System',
          message: `Round ${prev.round + 1} begins!`,
          type: 'phase'
        });
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
  };

  // Auto-play loop
  useEffect(() => {
    if (isPlaying && !stepMode && gameState && !gameState.gameOver) {
      const timer = setTimeout(() => {
        executeNextAction();
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [isPlaying, stepMode, gameState, speed]);

  if (!gameState) {
    return (
      <div className="demo-mode">
        <div className="demo-header">
          <h1>Signal to Noise - AI Demo Mode</h1>
          <p>Watch AI personalities battle it out!</p>
          <button className="btn btn-primary" onClick={initializeDemo}>
            Start Demo
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="demo-mode">
      <div className="demo-header">
        <h1>Signal to Noise - AI Demo</h1>
        <div className="demo-controls">
          {!gameState.gameOver && (
            <>
              <button
                className="btn btn-primary"
                onClick={() => setIsPlaying(!isPlaying)}
              >
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={executeNextAction}
                disabled={isPlaying && !stepMode}
              >
                Step
              </button>
              <label>
                <input
                  type="checkbox"
                  checked={stepMode}
                  onChange={(e) => setStepMode(e.target.checked)}
                />
                Step Mode
              </label>
              <label>
                Speed:
                <select value={speed} onChange={(e) => setSpeed(Number(e.target.value))}>
                  <option value={2000}>Slow</option>
                  <option value={1000}>Normal</option>
                  <option value={500}>Fast</option>
                  <option value={200}>Very Fast</option>
                </select>
              </label>
            </>
          )}
          <button className="btn btn-secondary" onClick={initializeDemo}>
            Restart
          </button>
        </div>
      </div>

      <div className="demo-content">
        <div className="demo-game-view">
          <PhaseIndicator phase={gameState.phase} round={gameState.round} />

          <ConspiracyBoard
            conspiracies={gameState.conspiracies}
            onSelect={() => {}}
            selectedConspiracy={null}
            selectedCardId={null}
            currentPlayer={gameState.players[gameState.currentPlayerIndex]}
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

          <div className="player-scores">
            <h3>Scores</h3>
            {gameState.players.map(p => (
              <div key={p.id} className="score-item" style={{ borderLeft: `4px solid ${p.color}` }}>
                <span className="player-name">{p.name}</span>
                <span className="score">{p.audience} pts</span>
                <span className="credibility">{p.credibility} cred</span>
              </div>
            ))}
          </div>
        </div>

        <div className="demo-log">
          <h3>Game Log</h3>
          <div className="log-entries">
            {log.map((entry, idx) => (
              <div key={idx} className={`log-entry log-${entry.type}`}>
                <span className="log-round">R{entry.round}</span>
                <span className="log-phase">{entry.phase}</span>
                <span className="log-player">{entry.player}:</span>
                <span className="log-message">{entry.message}</span>
              </div>
            ))}
            <div ref={logEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
