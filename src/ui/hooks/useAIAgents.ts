import { useRef } from 'react';
import { GameState } from '../../engine/types';
import { createAdvancedAI, AdvancedAI } from '../../ai/social/advancedAgent';
import { STRATEGY_NAMES } from '../../ai/strategies';
import { SOCIAL_PERSONALITY_NAMES } from '../../ai/social/personalities';
import { Signal } from '../../ai/social/types';
import { formatSignalDisplay } from '../../ai/social/signalFlavor';

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export interface AIAgentInfo {
  playerId: string;
  strategyName: string;
  personalityName: string;
  displayName: string;
}

export interface UseAIAgentsReturn {
  agents: AdvancedAI[];
  agentInfos: AIAgentInfo[];
  generateSignals: (state: GameState) => { signals: Signal[]; displays: string[] };
}

export function useAIAgents(aiCount: number): UseAIAgentsReturn {
  const initRef = useRef<{
    agents: AdvancedAI[];
    infos: AIAgentInfo[];
  } | null>(null);

  if (!initRef.current) {
    const agents: AdvancedAI[] = [];
    const infos: AIAgentInfo[] = [];
    for (let i = 0; i < aiCount; i++) {
      const strategyName = pickRandom(STRATEGY_NAMES);
      const personalityName = pickRandom(SOCIAL_PERSONALITY_NAMES);
      const playerId = `player_${i + 1}`;
      agents.push(createAdvancedAI(playerId, strategyName, personalityName));
      infos.push({
        playerId,
        strategyName,
        personalityName,
        displayName: `The ${personalityName}`,
      });
    }
    initRef.current = { agents, infos };
  }

  const { agents, infos } = initRef.current;

  const generateSignals = (state: GameState): { signals: Signal[]; displays: string[] } => {
    const signals: Signal[] = [];
    const displays: string[] = [];
    for (const agent of agents) {
      const signal = agent.generateSignal(state);
      signals.push(signal);
      const conspiracy = state.activeConspiracies.find(c => c.card.id === signal.conspiracyId);
      const name = conspiracy?.card.name ?? signal.conspiracyId;
      displays.push(formatSignalDisplay(signal, agent.personalityName, name));
    }
    return { signals, displays };
  };

  return { agents, agentInfos: infos, generateSignals };
}
