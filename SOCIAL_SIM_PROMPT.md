# Signal to Noise — Social Simulation Layer Prompt

## Context

The Signal to Noise v2 game engine is complete and working. The repo is at https://github.com/RogersJohn/Signal2Noise. The game has:

- A pure reducer engine at `src/engine/engine.ts` with `applyAction(state, action) → state`
- 5 base AI strategies at `src/ai/strategies.ts` implementing `AIStrategy { decideCommit, decideBroadcast }`
- A simulation runner at `src/ai/simulation.ts` that plays N games and outputs structured stats
- An analysis module at `src/ai/analysis.ts` that validates game balance metrics

The current AI strategies have **fixed behavior** — they don't adapt within a game or learn across games. This task adds two layers:

**Level 1: Within-game social adaptation.** Agents that maintain trust scores, send pre-broadcast signals, adapt their deception rate when caught bluffing, escalate risk when losing, and hold grudges.

**Level 2: Cross-game evolutionary tuning.** A genetic algorithm that evolves social personality parameters across generations of games to find the optimal social strategy.

The engine code must NOT be modified. The social layer wraps the existing strategies and operates entirely within `src/ai/social/`. The simulation runner at `src/ai/simulation.ts` will need to be extended (not replaced) to support social agents.

## Important: Current Engine State

Two recent changes are in the engine but NOT yet committed to the repo. Before starting work, verify these are present:

1. **First-mover bonus = 0** in `src/engine/scoring.ts` line 27: `const firstMoverBonus = 0;`
2. **Pass draws 1 card** in `src/engine/engine.ts` `handlePass` function (lines ~245-256)

If these changes are NOT present, apply them:
- In `src/engine/scoring.ts`: change `const firstMoverBonus = isFirstMover ? 1 : 0;` to `const firstMoverBonus = 0;`
- In `src/engine/engine.ts` `handlePass`: after computing `newBroadcasted`, add logic to draw 1 card from evidence deck (respecting MAX_HAND_SIZE of 7) before returning new state

Commit these changes first with message: "Nerf first-mover bonus to tiebreaker only, pass draws 1 card"

## Phase 1: Directory Structure

```
src/ai/social/
  types.ts              # Signal, TrustProfile, SocialPersonality, SocialState
  signalLayer.ts        # Signal generation and interpretation
  trustTracker.ts       # Per-player trust scores, trust event detection
  adaptiveBehavior.ts   # Within-game adaptation rules (deception decay, desperation, grudges)
  socialAgent.ts        # Wraps base AIStrategy with social layer
  personalities.ts      # 6 social personality definitions
  __tests__/
    signalLayer.test.ts
    trustTracker.test.ts
    adaptiveBehavior.test.ts
    socialAgent.test.ts

src/ai/evolution/
  types.ts              # Genome, EvolutionConfig, GenerationResult
  genome.ts             # Social personality as evolvable genome
  fitness.ts            # Fitness function (win rate + style metrics)
  evolution.ts          # Selection, crossover, mutation, generational loop
  runner.ts             # Orchestrates evolution runs, saves results
  __tests__/
    genome.test.ts
    evolution.test.ts
```

## Phase 2: Social Types

```typescript
// src/ai/social/types.ts

// Signal sent between COMMIT and BROADCAST (structured cheap talk)
interface Signal {
  senderId: string;
  conspiracyId: string;
  claimedStrength: 'weak' | 'moderate' | 'strong';
  intent: 'lead' | 'join' | 'avoid';
  // HIDDEN from other players — tracked for analysis only:
  truthful: boolean;
}

// Per-player trust score toward another player
interface TrustEntry {
  targetId: string;
  score: number;           // -1.0 (total distrust) to +1.0 (total trust)
  betrayalCount: number;   // times this player betrayed us
  lastBetrayalRound: number | null;
  followThroughCount: number;  // times they did what they signaled
}

// Trust events detected after each round
type TrustEvent =
  | { type: 'followed_through'; delta: 0.15 }
  | { type: 'betrayed_signal'; delta: -0.25 }
  | { type: 'joined_my_consensus'; delta: 0.1 }
  | { type: 'opposed_my_consensus'; delta: -0.15 }
  | { type: 'bandwagoned_my_evidence'; delta: -0.05 }
  ;

// Adaptive state that changes within a game
interface AdaptiveState {
  currentDeceptionRate: number;   // starts at personality default, decays when caught
  currentRiskTolerance: number;   // starts at default, escalates when losing
  grudges: Map<string, number>;   // playerId → grudge intensity (0-1)
  bluffsCaught: number;           // times my signal didn't match my broadcast AND someone noticed
  roundsSinceLastBetrayedBy: Map<string, number>;  // for grudge decay
}

// Full social state for one agent
interface SocialState {
  playerId: string;
  trustScores: Map<string, TrustEntry>;
  signalHistory: Signal[][];      // indexed by round
  adaptiveState: AdaptiveState;
}

// Social personality — the tunable parameters
interface SocialPersonality {
  name: string;

  // Signal behavior
  baseDeceptionRate: number;      // 0-1: starting bluff frequency
  signalInfluence: number;        // 0-1: how much signals affect broadcast decisions

  // Trust behavior
  initialTrust: number;           // -1 to +1: starting trust for all players
  trustRecoveryRate: number;      // per round recovery toward initial trust after betrayal
  betrayalMemory: number;         // rounds before a betrayal stops affecting trust

  // Adaptation
  deceptionDecayPerCatch: number; // how much deceptionRate drops when caught (e.g. 0.1)
  desperationThreshold: number;   // point deficit that triggers risk escalation
  desperationBoost: number;       // how much risk tolerance increases when desperate

  // Strategic behavior
  retaliationRate: number;        // 0-1: probability of punishing a betrayer
  loyaltyRate: number;            // 0-1: probability of supporting a trusted player's consensus
  opportunismRate: number;        // 0-1: willingness to betray for points
  betrayalPointThreshold: number; // minimum point advantage needed to justify betrayal
}
```

## Phase 3: Level 1 Implementation

### Signal Layer (`signalLayer.ts`)

**`generateSignal(state, playerId, personality, adaptiveState) → Signal`**

Logic:
1. Find the conspiracy where this player has the most evidence (committed this round)
2. If `Math.random() < adaptiveState.currentDeceptionRate`: generate a BLUFF signal
   - Pick a DIFFERENT conspiracy (preferably one with visible evidence from other players to seem credible)
   - Claim 'strong' strength regardless
   - Set `truthful: false`
3. Otherwise: generate honest signal
   - Conspiracy = where you have most evidence
   - Strength = 'strong' if 2+ cards, 'moderate' if 1, 'weak' if 0
   - Intent = 'lead' if 2+ cards, 'join' if 1, 'avoid' if 0
   - Set `truthful: true`

**`interpretSignals(signals, myId, trustScores, visibleCommitCounts) → BeliefState`**

Logic:
1. For each signal from another player:
   - Get trust score for that player
   - Cross-reference: does `claimedStrength` match visible commit count?
     - 'strong' + 2+ visible commits = credible
     - 'strong' + 0 visible commits = suspicious
   - Compute weight = `((trust + 1) / 2) * (credible ? 1.0 : 0.3)`
   - Add weight to the signaled conspiracy's belief score
2. Return map of conspiracyId → total belief weight (how likely consensus forms there)

### Trust Tracker (`trustTracker.ts`)

**`initializeTrust(players, personality) → Map<string, TrustEntry>`**

All other players start at `personality.initialTrust` with zero betrayal/follow-through counts.

**`detectTrustEvents(signals, broadcasts, state) → TrustEvent[]`**

After each round:
1. For each player who signaled:
   - Did they broadcast on the conspiracy they signaled? → `followed_through` (+0.15)
   - Did they broadcast on a DIFFERENT conspiracy? → `betrayed_signal` (-0.25)
2. For each consensus that formed:
   - Players who joined my side → `joined_my_consensus` (+0.1)
   - Players who opposed my side → `opposed_my_consensus` (-0.15)

**`updateTrust(current, events, personality) → Map<string, TrustEntry>`**

Apply deltas, clamp to [-1, +1]. Also apply natural trust recovery:
- Each round, trust drifts toward `personality.initialTrust` by `personality.trustRecoveryRate`
- But only if no new betrayal this round
- Betrayals within `personality.betrayalMemory` rounds suppress recovery

### Adaptive Behavior (`adaptiveBehavior.ts`)

Four adaptation rules, each a pure function:

**`applyDeceptionDecay(adaptiveState, wasCaught) → AdaptiveState`**

If the player's signal didn't match their broadcast AND at least one other player had low trust for them (trust < 0, indicating they were "watching"):
- Reduce `currentDeceptionRate` by `personality.deceptionDecayPerCatch`
- Minimum: 0.02 (never fully stops bluffing — humans always have a baseline)

**`applyDesperationEscalation(adaptiveState, myScore, leaderScore, round, personality) → AdaptiveState`**

If `leaderScore - myScore >= personality.desperationThreshold` AND `round >= 4`:
- Increase `currentRiskTolerance` by `personality.desperationBoost`
- Cap at 0.95

**`applyGrudgeUpdate(adaptiveState, trustEvents, round, personality) → AdaptiveState`**

For each `betrayed_signal` or `opposed_my_consensus` event:
- Set/increase grudge for that player: `grudge = min(1.0, current + 0.3)`
- Record `lastBetrayalRound`

Grudges decay each round by 0.1 (forgetting), but only after `betrayalMemory` rounds have passed.

**`applyLateGameCalculation(adaptiveState, myScore, allScores, round) → AdaptiveState`**

In rounds 5-6, if the point difference between broadcasting and not broadcasting would change who wins:
- Override `opportunismRate` to 0.8+ regardless of personality
- This models the universal human behavior: "the game is almost over, I need to make a move"

### Social Agent (`socialAgent.ts`)

**`createSocialAgent(baseStrategy, personality) → SocialAIStrategy`**

The social agent wraps a base `AIStrategy` and augments it:

```typescript
interface SocialAIStrategy {
  name: string;
  personality: SocialPersonality;
  socialState: SocialState;

  // Same interface as AIStrategy but with social awareness
  decideCommit(state: GameState, playerId: string): GameAction[];
  generateSignal(state: GameState, playerId: string): Signal;
  decideBroadcast(state: GameState, playerId: string, allSignals: Signal[]): GameAction;
  onRoundEnd(state: GameState, playerId: string, allSignals: Signal[]): void;
}
```

**`decideBroadcast` logic:**

1. Get base strategy recommendation
2. Interpret all signals → build belief state
3. Find the conspiracy with highest belief weight (most likely to reach consensus)
4. Decision tree:
   - If highest-belief conspiracy matches base strategy recommendation → follow base strategy
   - If highest-belief conspiracy is different AND I have evidence there → switch to it (following the crowd WITH evidence is optimal)
   - If highest-belief conspiracy is different AND I have NO evidence:
     - If `Math.random() < personality.loyaltyRate` AND the signal came from a trusted player → bandwagon (loyalty)
     - If `Math.random() < personality.opportunismRate` AND estimated points > `betrayalPointThreshold` → bandwagon (opportunism)
     - Otherwise → follow base strategy
   - If I signaled conspiracy X but want to broadcast on conspiracy Y:
     - This is a betrayal. Check: `estimatedPointGain >= personality.betrayalPointThreshold`?
     - If yes AND not retaliating against a grudge target → betray
     - If grudge target signaled conspiracy X → retaliate (oppose them) with probability `personality.retaliationRate`
5. After decision, update adaptive state

**`onRoundEnd` logic:**

1. Detect trust events by comparing signals to broadcasts
2. Update trust scores
3. Apply deception decay if caught
4. Apply desperation escalation
5. Apply grudge updates
6. Apply late-game calculation

### Simulation Integration

Extend `src/ai/simulation.ts` with a new function (do NOT modify `runSingleGame`):

**`runSocialGame(socialMatchup: string[]) → SocialGameResult`**

Same game loop as `runSingleGame` but:
1. Creates `SocialAIStrategy` agents instead of base strategies
2. Between COMMIT and BROADCAST, calls `generateSignal` for each player and distributes signals
3. Calls `decideBroadcast` with `allSignals` instead of base strategy
4. After RESOLVE, calls `onRoundEnd` for each agent

**`SocialGameResult` extends `GameResult` with:**
```typescript
interface SocialGameResult extends GameResult {
  socialMetrics: {
    signalHonestyRate: number;         // % of signals that matched broadcasts
    bluffDetectionRate: number;        // % of dishonest signals correctly distrusted
    betrayalCount: number;             // total signals betrayed across all rounds
    avgTrustAtEnd: number;             // mean trust score at game end
    trustPolarization: number;         // stddev of trust scores at game end
    betrayalsByRound: number[];        // betrayals per round (should increase late)
    grudgesFormed: number;             // total grudge events
    retaliationCount: number;          // times a player punished a betrayer
    desperationActivations: number;    // times desperation escalation triggered
  };
}
```

## Phase 4: Level 2 Implementation

### Genome (`evolution/genome.ts`)

A `SocialPersonality` IS the genome. Each numeric field is a gene.

```typescript
interface Genome {
  id: string;
  genes: SocialPersonality;   // The evolvable parameters
  fitness: number;            // Set after evaluation
  generation: number;
}

function randomGenome(generation: number): Genome
// Random values within valid ranges for each field

function crossover(parent1: Genome, parent2: Genome): Genome
// Uniform crossover: each gene randomly picked from one parent

function mutate(genome: Genome, mutationRate: number, mutationStrength: number): Genome
// Gaussian noise added to each gene with probability mutationRate
// mutationStrength controls stddev of noise
// Clamp all values to valid ranges after mutation
```

### Fitness (`evolution/fitness.ts`)

```typescript
interface FitnessConfig {
  gamesPerEvaluation: number;  // how many games each genome plays (default: 50)
  opponentPool: string[];      // base strategies to play against (default: all 5)
  weights: {
    winRate: number;           // primary: did you win? (default: 1.0)
    avgScore: number;          // secondary: how many points? (default: 0.3)
    signalFidelityPenalty: number;  // penalty for pure lying (default: -0.1)
    trustAtEnd: number;        // bonus for maintaining relationships (default: 0.1)
  };
}

function evaluateGenome(genome: Genome, config: FitnessConfig): number
```

Evaluation:
1. For each game in `gamesPerEvaluation`:
   - Create a 4-player game: the genome agent + 3 random opponents from `opponentPool`
   - The opponents use base strategies (NOT social agents) — we're evolving social play against "normal" play
   - Run the game using `runSocialGame`
   - Record win/loss, final score, social metrics
2. Compute fitness: `winRate * weights.winRate + normalizedScore * weights.avgScore + socialAdjustments`

### Evolution (`evolution/evolution.ts`)

```typescript
interface EvolutionConfig {
  populationSize: number;       // default: 40
  generations: number;          // default: 50
  eliteCount: number;           // top N preserved unchanged (default: 4)
  tournamentSize: number;       // selection tournament size (default: 3)
  mutationRate: number;         // probability per gene (default: 0.15)
  mutationStrength: number;     // stddev of mutation noise (default: 0.1)
  fitnessConfig: FitnessConfig;
}

interface GenerationResult {
  generation: number;
  bestFitness: number;
  avgFitness: number;
  bestGenome: Genome;
  diversityMetric: number;      // stddev of gene values across population
}

function runEvolution(config: EvolutionConfig): EvolutionResult
```

Algorithm:
1. Initialize population of `populationSize` random genomes
2. For each generation:
   a. Evaluate all genomes (this is the expensive step — `populationSize * gamesPerEvaluation` games)
   b. Sort by fitness
   c. Keep top `eliteCount` unchanged
   d. Fill remaining slots via tournament selection + crossover + mutation
   e. Record `GenerationResult`
3. Return final population sorted by fitness

### Runner (`evolution/runner.ts`)

```typescript
function runAndSave(config: EvolutionConfig, outputDir: string): void
```

1. Run evolution
2. Save results to `data/evolution-results/evolution_{timestamp}.json`:
   ```json
   {
     "config": { ... },
     "generations": [ { generation, bestFitness, avgFitness, bestGenome, diversityMetric } ],
     "finalBest": { ... the winning genome ... },
     "convergenceRound": 23,  // generation where improvement < 1% for 5 consecutive generations
     "analysis": {
       "dominantTraits": { ... which gene values the best genomes share ... },
       "optimalDeceptionRate": 0.18,
       "optimalTrustProfile": "moderate initial trust, slow recovery, long memory",
       "interpretation": "The evolved agent is a Diplomat-type: mostly honest, selectively deceptive, holds grudges but eventually forgives"
     }
   }
   ```
3. Also save the top 5 genomes as named social personalities in a separate file `data/evolution-results/evolved_personalities_{timestamp}.json` for use in future simulations

## Phase 5: Tests

### Signal Layer Tests (`social/__tests__/signalLayer.test.ts`)
- Honest signal matches best evidence conspiracy
- Bluff signal picks different conspiracy
- Signal strength correlates with evidence count
- Cross-referencing: visible commit count vs claimed strength affects credibility
- Interpretation produces correct belief weights given trust and credibility

### Trust Tracker Tests (`social/__tests__/trustTracker.test.ts`)
- Follow-through increases trust
- Betrayal decreases trust (asymmetric: betrayal costs more than follow-through gains)
- Trust clamps to [-1, +1]
- Trust recovers toward initial value over time
- Betrayal memory suppresses recovery for N rounds
- Fresh player starts at initialTrust

### Adaptive Behavior Tests (`social/__tests__/adaptiveBehavior.test.ts`)
- Deception decay reduces rate when caught
- Deception rate never drops below 0.02
- Desperation only triggers when behind by threshold AND round >= 4
- Grudge intensity increases on betrayal, decays over rounds
- Late-game calculation overrides personality in rounds 5-6

### Social Agent Tests (`social/__tests__/socialAgent.test.ts`)
- Agent follows base strategy when no signals exist
- Agent switches conspiracy when high-belief target has evidence
- Agent bandwagons onto trusted player's signal
- Agent refuses to bandwagon onto distrusted player
- Agent betrays signal when point gain exceeds threshold
- Agent retaliates against grudge target
- Full round lifecycle: commit → signal → interpret → broadcast → round end → trust update

### Evolution Tests (`evolution/__tests__/genome.test.ts`)
- Random genome has valid parameter ranges
- Crossover produces child with genes from both parents
- Mutation changes genes within valid ranges
- Zero mutation rate produces identical genome
- High mutation rate changes most genes

### Evolution Integration (`evolution/__tests__/evolution.test.ts`)
- Small evolution run (5 generations, 10 population, 10 games each) completes without errors
- Fitness improves over generations (best fitness at gen 5 > gen 1)
- Elite genomes survive unchanged between generations
- Population diversity decreases over generations (convergence)
- Final best genome has valid parameter ranges

## Phase 6: Analysis Integration

Extend `src/ai/analysis.ts` with social analysis:

```typescript
interface SocialAnalysisReport extends AnalysisReport {
  socialMetrics: {
    avgSignalHonesty: number;
    avgBluffDetection: number;
    avgBetrayalRate: number;
    betrayalsByRound: number[];     // aggregate across games
    avgEndTrust: number;
    trustTrend: 'increasing' | 'stable' | 'decreasing';
    mostSuccessfulPersonality: string;
    deceptionProfitability: number; // avg point diff: bluff rounds vs honest rounds
    trustProfitability: number;     // correlation between end trust and final score
  };
  interpretation: {
    doesTrustMatter: boolean;       // is there positive correlation between trust and score?
    isDeceptionProfitable: boolean; // do bluffs earn more than honest play on average?
    isSelectiveDeceptionOptimal: boolean;  // does moderate bluffing beat both extremes?
    optimalDeceptionRange: [number, number];  // estimated sweet spot
  };
}
```

**The critical output:** The `interpretation` block answers the design question directly. If `isSelectiveDeceptionOptimal` is true and `doesTrustMatter` is true, the game creates the right incentive structure for interesting social play.

## Execution Order

1. Commit the engine changes (first-mover nerf + pass draws card) if not already present
2. Create `src/ai/social/types.ts`
3. Implement `src/ai/social/trustTracker.ts` + tests
4. Implement `src/ai/social/signalLayer.ts` + tests
5. Implement `src/ai/social/adaptiveBehavior.ts` + tests
6. Implement `src/ai/social/personalities.ts` (6 social personalities)
7. Implement `src/ai/social/socialAgent.ts` + tests
8. Extend `src/ai/simulation.ts` with `runSocialGame`
9. Run social simulations across all personality matchups, verify metrics are sensible
10. Create `src/ai/evolution/types.ts`
11. Implement `src/ai/evolution/genome.ts` + tests
12. Implement `src/ai/evolution/fitness.ts`
13. Implement `src/ai/evolution/evolution.ts` + tests
14. Implement `src/ai/evolution/runner.ts`
15. Run a small evolution (20 generations, 20 population, 30 games each) as a smoke test
16. Run a full evolution (50 generations, 40 population, 50 games each)
17. Extend `src/ai/analysis.ts` with social analysis
18. Generate and save the interpretation report
19. Commit everything with message: "Add social simulation layer (Level 1 + Level 2)"

## What NOT to Do

- Do NOT modify `src/engine/engine.ts` or any engine file (the social layer wraps the engine, it doesn't change it)
- Do NOT modify the existing 5 base strategies in `src/ai/strategies.ts` (social agents wrap them)
- Do NOT use any ML libraries — the evolution is simple GA, the adaptation is handwritten rules
- Do NOT try to model natural language — signals are structured data
- Do NOT make the evolution compute-intensive beyond ~10 minutes for a full run (50 gen × 40 pop × 50 games = 100,000 games should complete in minutes since each game is pure in-memory computation)
- Do NOT add social features to the React UI yet — this is analysis infrastructure only

## Quality Standards

- TypeScript strict mode, no `any`
- Every file under 250 lines
- All social layer tests pass independently: `npx react-scripts test --testPathPattern=src/ai/social`
- All evolution tests pass: `npx react-scripts test --testPathPattern=src/ai/evolution`
- Evolution run saves structured JSON to `data/evolution-results/`
- Social simulation metrics are plausible: signal honesty 40-90%, betrayal rate 5-30%, trust trend should vary by personality mix

## Success Criteria

After implementation, run the following and report results:

1. **Social personality tournament:** Run 200 games for each pair of social personalities (6 personalities = 15 pairings). Report win rates. Verify that the Honest Broker beats the Sociopath (trust should matter) and the Hustler beats both (selective deception should be optimal).

2. **Evolution result:** Run full evolution. Report the evolved optimal personality parameters. The evolved agent should have moderate deception (0.10-0.30), moderate trust (0.0-0.3 initial), and high signal influence (>0.5). If it converges on pure honesty or pure deception, the game's incentive structure is broken.

3. **Key question answer:** Based on the evolution results and social tournament, answer: "Does the game's incentive structure reward building trust, and is selective deception the optimal strategy?" This is a yes/no with supporting data.
