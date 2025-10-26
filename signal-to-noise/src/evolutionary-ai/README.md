# Evolutionary AI Strategy Discovery System

## Overview

This system uses **genetic algorithms** to evolve optimal game strategies for Signal-to-Noise. The goal is not to create perfect AI opponents, but to **discover exploitable strategies and expose flaws in game design**.

## Purpose

- **Stress-test game balance**: Find dominant strategies that break the game
- **Expose hidden exploits**: Discover unexpected ways to win
- **Identify useless mechanics**: Find rules that evolved strategies ignore
- **Optimize parameters**: Determine ideal ranges for game variables
- **Validate design decisions**: Confirm that multiple strategies remain viable

## Architecture

### Core Components

```
evolutionary-ai/
├── strategyGenome.ts          # Gene representation & genetic operators
├── evolutionaryAgent.ts       # AI agent driven by genome
├── geneticAlgorithm.ts        # Evolution orchestration
├── evolutionarySimulation.test.ts  # Test harness & reporting
└── README.md                  # This file
```

### Strategy Genome

Each AI agent has a **genome** consisting of 28 strategic parameters:

#### Evidence Management (4 genes)
- `minEvidenceToInvestigate`: When to draw evidence
- `minEvidenceForREAL`: Threshold for broadcasting REAL
- `minEvidenceForFAKE`: Threshold for broadcasting FAKE
- `maxEvidenceToHold`: Evidence hand size limit

#### Bluffing Strategy (3 genes)
- `bluffTolerance`: Willingness to play BLUFF cards
- `bluffWithREALEvidence`: Mix bluffs with real evidence
- `bluffThreshold`: Confidence needed before bluffing

#### Betting & Risk (4 genes)
- `baseBetSize`: Default advertise bet amount
- `riskTolerance`: Overall risk appetite
- `credibilityFloor`: Minimum credibility before caution
- `bankruptcyAvoidance`: How much to avoid elimination

#### Position Preference (2 genes)
- `realBias`: Preference for REAL vs FAKE positions
- `inconclusiveTolerance`: Willingness to broadcast INCONCLUSIVE

#### Broadcast Timing (3 genes)
- `earlyBroadcastPref`: Rush early vs wait late
- `passingThreshold`: Likelihood to skip broadcasting
- `minRoundToParticipate`: First round to start playing

#### Coalition & Social (3 genes)
- `coalitionWillingness`: Tendency to align with players
- `followTheCrowdBias`: Match consensus vs think independently
- `counterBroadcastAggression`: Willingness to oppose others

#### Late Game Strategy (3 genes)
- `lateGameAggression`: Increase risk in final rounds
- `comebackDesperation`: Take risks when behind
- `protectLeadConservatism`: Play safe when ahead

#### Advertise Phase (2 genes)
- `advertiseCommitment`: Follow through on signals
- `advertiseFakeouts`: Signal one thing, broadcast another

#### Meta (2 genes)
- `adaptiveness`: Adjust to opponent patterns
- `explorationRate`: Try unusual plays vs stick to plan

### Genetic Algorithm Process

1. **Initialize Population**: Create N agents with random genomes
2. **Evaluate Fitness**: Each agent plays M games across different player counts
3. **Selection**: Tournament selection picks parents from top performers
4. **Crossover**: Blend parent genomes to create children
5. **Mutation**: Randomly tweak genes to explore new strategies
6. **Elitism**: Keep best performers unchanged
7. **Repeat**: Evolve for G generations

### Fitness Function

Multi-objective optimization balancing:
- **Win rate** (100x weight): Most important metric
- **Average audience** (5x weight): Reward point accumulation
- **Average credibility** (2x weight): Reward survival
- **Bankruptcy avoidance** (10x weight): Penalize elimination
- **Average rank** (20x weight): Reward consistent placement

## Usage

### Quick Test (10 generations, ~5 minutes)

```bash
npm test -- --testPathPattern=evolutionarySimulation.test.ts --watchAll=false --testNamePattern="Quick"
```

This runs:
- 20 agents per generation
- 10 generations
- 15 games per agent (5 each at 3p, 4p, 5p)
- Generates `EVOLUTION_QUICK_TEST.md` report

### Full Evolution (20 generations, ~20 minutes)

```bash
npm test -- --testPathPattern=evolutionarySimulation.test.ts --watchAll=false --testNamePattern="Full"
```

This runs:
- 50 agents per generation
- 20 generations
- 30 games per agent
- Generates `EVOLUTION_FULL.md` report

### Extended Evolution (50 generations, ~60 minutes)

```bash
npm test -- --testPathPattern=evolutionarySimulation.test.ts --watchAll=false --testNamePattern="Extended"
```

This runs:
- 50 agents per generation
- 50 generations
- 30 games per agent
- Generates `EVOLUTION_EXTENDED.md` report

## Interpreting Results

### Evolution Report Structure

The generated markdown reports contain:

1. **Executive Summary**
   - Fitness improvement over generations
   - Best strategy win rate and statistics
   - Strategy profile description

2. **Generation Progress Table**
   - Track fitness, win rate, and diversity over time
   - Identify when convergence occurs

3. **Top 10 Evolved Strategies**
   - See variety of successful approaches
   - Compare different strategy profiles

4. **Detailed Genome Analysis**
   - All 28 parameters of the best strategy
   - Understand what makes it successful

5. **Exploit Detection Analysis**
   - Flags for dominant strategies (>60% win rate)
   - Warnings for low diversity (strategy convergence)
   - Bankruptcy rate analysis

### Warning Signs

🚨 **CRITICAL: Dominant Strategy** (Win rate >60%)
- Game may be "solved"
- One approach is clearly optimal
- Consider rebalancing mechanics

⚠️ **WARNING: Low Diversity** (Diversity <40%)
- Strategies converging to similar approaches
- Limited viable playstyles
- May indicate narrow strategic space

⚠️ **High Bankruptcy Rate** (>20%)
- Credibility penalties too harsh
- Game too punishing for mistakes
- Consider adjusting parameters

## What to Look For

### Good Signs ✅
- Win rates around 30-40% for best strategy
- Diversity remains >40% throughout evolution
- Top 10 strategies show varied approaches
- Gradual fitness improvement over generations

### Bad Signs ❌
- Win rates >60% (one strategy dominates all others)
- Diversity drops below 20% (all strategies become identical)
- No fitness improvement (population stuck in local optimum)
- Extreme parameter values (e.g., always pass, never bluff)

## Expected Discoveries

The evolution might reveal:

1. **Optimal Bluff Ratios**: How often should you bluff?
2. **Evidence Hoarding**: Is it better to save evidence or play early?
3. **Advertise Meta**: Can fakeouts be systematically exploited?
4. **Credibility Tanking**: Is there value in intentional bankruptcy?
5. **Passing Strategy**: Can you win by avoiding early conflicts?
6. **Coalition Dominance**: Can 2 cooperating players always win?
7. **Position Bias**: Is REAL or FAKE inherently stronger?
8. **Late Game Rushes**: Should you conserve resources until final rounds?

## Customizing Evolution

Edit `evolutionarySimulation.test.ts` to adjust:

```typescript
const ga = new GeneticAlgorithm({
  populationSize: 50,        // More agents = better exploration
  generations: 20,           // More gens = better convergence
  gamesPerIndividual: 30,    // More games = better fitness estimate
  playerCountsToTest: [3,4,5], // Which formats to test
  mutationRate: 0.15,        // % genes mutated (0.1-0.3)
  mutationStrength: 0.2,     // How much genes change (0.1-0.5)
  eliteCount: 5,             // Top N preserved unchanged
  tournamentSize: 5,         // Selection pressure (3-10)
});
```

### Parameter Tuning Guidelines

- **High mutation rate (0.3+)**: More exploration, slower convergence
- **Low mutation rate (0.05)**: Faster convergence, risk local optimum
- **Large tournament (10+)**: Strong selection pressure, risk premature convergence
- **Small tournament (3)**: Weak selection, slower evolution
- **More elites (10+)**: Preserve diversity, slower adaptation
- **Fewer elites (2)**: Faster evolution, risk losing good strategies

## Future Enhancements (Phase 2+)

### Phase 2: Advanced Analytics
- **Mechanic usage tracking**: Which rules are exploited vs ignored?
- **Strategy clustering**: Identify distinct strategy archetypes
- **Head-to-head matrix**: Best vs best performance
- **Temporal analysis**: How strategies shift over game rounds

### Phase 3: Reinforcement Learning
- **Neural network agents**: Deep learning for complex patterns
- **PPO/DQN training**: Learn from rewards, not just win/loss
- **Self-play**: Agents train against themselves
- **Transfer learning**: Start with evolved genomes, refine with RL

### Phase 4: Interactive Evolution
- **Human-in-the-loop**: Play against evolved strategies
- **Strategy suggestions**: Recommend counters to dominant approaches
- **Live adaptation**: Agents adapt to human playstyle during game

## Technical Notes

- Compatible with existing `gameSimulation.ts` framework
- Uses same `AIPersonality` interface as rule-based AIs
- No changes to game logic required
- Reports generated in project root directory
- TypeScript with full type safety

## Contributing

To add new genes to the genome:

1. Add parameter to `StrategyGenome` interface in `strategyGenome.ts`
2. Update `createRandomGenome()` with valid range
3. Update `mutate()` to handle new parameter range
4. Implement behavior in `evolutionaryAgent.ts` decision functions
5. Document in this README

---

**Remember**: The goal is to find exploits and weaknesses, not to create perfect AI. If evolution discovers a broken strategy, that's a success - it means you've identified a balance issue to fix!
