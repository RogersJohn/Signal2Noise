# Signal to Noise: Game Designer Questions

**Version:** 2.1.0
**Date:** October 24, 2025
**Purpose:** Comprehensive list of design questions for future development and balancing

---

## Table of Contents

1. [Core Mechanics Questions](#core-mechanics-questions)
2. [Balance and Gameplay Questions](#balance-and-gameplay-questions)
3. [ADVERTISE Phase Questions](#advertise-phase-questions)
4. [Credibility System Questions](#credibility-system-questions)
5. [Scoring System Questions](#scoring-system-questions)
6. [Evidence and Conspiracy Questions](#evidence-and-conspiracy-questions)
7. [Player Count and Scaling Questions](#player-count-and-scaling-questions)
8. [Physical Implementation Questions](#physical-implementation-questions)
9. [User Experience Questions](#user-experience-questions)
10. [Strategic Depth Questions](#strategic-depth-questions)
11. [Variant Mode Questions](#variant-mode-questions)
12. [Component Design Questions](#component-design-questions)

---

## Core Mechanics Questions

### Consensus Mechanism

**Q1**: Should the consensus threshold scale differently with player count?
- Current: 2 votes (3-4p), 3 votes (5p)
- Alternative: Always majority (2/3, 3/4, 3/5)?
- Alternative: Always 50% + 1?
- **Impact**: Affects how easy it is to form consensus and score points

**Q2**: Should INCONCLUSIVE broadcasts count toward consensus?
- Current: They don't count
- Alternative: They count as "neutral" votes that don't block consensus?
- Alternative: They count as blocking votes (making consensus harder)?
- **Impact**: Changes the strategic value of INCONCLUSIVE plays

**Q3**: What happens if everyone broadcasts INCONCLUSIVE?
- Current: Everyone gets 2 points, no consensus
- Alternative: Force a winner based on some other criteria?
- **Impact**: Prevents "everyone plays it safe" stalemates

### Evidence Persistence

**Q4**: Should evidence persist indefinitely or have a decay mechanism?
- Current: Persists until conspiracy revealed
- Alternative: Evidence expires after X rounds?
- Alternative: Maximum evidence per conspiracy?
- **Impact**: Affects long-term vs short-term strategy balance

**Q5**: Should there be a limit to how many evidence cards can be assigned to one conspiracy?
- Current: No limit
- Alternative: Max 5 cards per conspiracy per player?
- Alternative: Max total cards per conspiracy?
- **Impact**: Prevents evidence stacking, encourages distribution

**Q6**: Should assigned evidence be visible to all players or remain hidden?
- Current: COUNT visible, CONTENT hidden
- Alternative: Completely hidden?
- Alternative: Completely visible?
- **Impact**: Changes information availability and bluffing dynamics

---

## Balance and Gameplay Questions

### Game Length

**Q7**: Is 6 rounds the optimal game length?
- Current: 100% of games end at round 6
- Alternative: Reduce to 5 rounds?
- Alternative: Variable length (first to X audience)?
- **Impact**: Based on testing, 0% reach 60 audience or 12 conspiracies - are these conditions needed?

**Q8**: Should the 60 audience threshold be adjusted?
- Current: 60 points (never reached in testing)
- Alternative: Lower to 40 or 45?
- Alternative: Scale with player count?
- **Impact**: Makes early victory possible, adds tension

**Q9**: Should the 12 conspiracies revealed condition be adjusted?
- Current: 12 conspiracies (never reached in testing)
- Alternative: Lower to 8-10?
- Alternative: Remove entirely?
- **Impact**: Creates alternative win path

### Win Rate Balance

**Q10**: How should we address the 44% win rate spread between best and worst AI personalities?
- Current spread: 53% (Conspiracy Theorist) down to 9% (Steady Builder)
- Acceptable spread?
- Which personalities need buffs/nerfs?
- **Impact**: Affects whether aggressive or passive strategies dominate

**Q11**: Should passive strategies (Paranoid Skeptic, Truth Seeker) be viable?
- Current: These personalities never broadcast and have ~9-11% win rates
- Alternative: Buff PASS action (small audience gain for avoiding consensus?)?
- Alternative: Accept that passing is a losing strategy?
- **Impact**: Determines if non-participation is strategically viable

**Q12**: Is the Reckless Gambler personality too strong?
- Current: 51% win rate, broadcasts every round aggressively
- Alternative: Increase penalties for failed broadcasts?
- Alternative: Reduce bluffing viability?
- **Impact**: Balances risk vs reward for aggressive play

---

## ADVERTISE Phase Questions

### Advertisement Mechanics

**Q13**: Is the -1 audience penalty for advertise deception the right cost?
- Current: -1 audience for advertising A, broadcasting B
- Alternative: No penalty (pure information)?
- Alternative: Higher penalty (-2 or -3)?
- Alternative: Credibility penalty instead?
- **Impact**: Affects how often players mislead with advertisements

**Q14**: Should there be a reward for honest advertising?
- Current: No reward, just avoiding penalty
- Alternative: +1 audience bonus for advertising correctly?
- Alternative: Reduced penalty for first deception?
- **Impact**: Incentivizes honest signaling vs deception

**Q15**: Should the bonus evidence card placement timing change?
- Current: AFTER all advertisements visible
- Alternative: BEFORE seeing others' advertisements?
- Alternative: During INVESTIGATE phase instead?
- **Impact**: Changes strategic information flow

**Q16**: Should players be able to advertise multiple conspiracies?
- Current: One advertisement per player (or pass)
- Alternative: Advertise up to 2 conspiracies?
- Alternative: Pay cost to advertise additional conspiracies?
- **Impact**: Increases strategic flexibility but may cause confusion

**Q17**: Does the ADVERTISE phase add enough strategic depth to justify the complexity?
- Testing shows it creates coordination opportunities
- Does it slow the game down too much?
- Is the psychological warfare aspect fun in physical play?
- **Impact**: Core design question about phase necessity

---

## Credibility System Questions

### Credibility Scaling

**Q18**: Are the credibility multipliers balanced?
- Current: ×1.5 (high 7+), ×1.0 (medium 4-6), ×0.75 (low 0-3)
- Alternative: Stronger multipliers (×2.0/×1.0/×0.5)?
- Alternative: More granular tiers?
- **Impact**: Affects importance of credibility management

**Q19**: Is the escalating bluff penalty the right approach?
- Current: -2, -3, -4, -5 for successive bluffs
- Alternative: Flat -3 per bluff?
- Alternative: Reset after successful evidence broadcast?
- **Impact**: Determines viability of serial bluffing strategies

**Q20**: Should bluffs be counted per round or lifetime?
- Current: Lifetime cumulative
- Alternative: Reset each round?
- Alternative: Decay over time?
- **Impact**: Affects whether players can bluff multiple times

**Q21**: Should credibility changes be more dramatic?
- Current: ±1 for majority/minority, -3 for no consensus
- Alternative: Larger swings (±2/±3)?
- Alternative: Bonus for consistent accuracy?
- **Impact**: Creates more volatility in credibility scores

**Q22**: Should there be a way to regain credibility faster?
- Current: Only +1 per majority broadcast
- Alternative: Special "credibility recovery" action?
- Alternative: Bonus for correctly calling difficult conspiracies?
- **Impact**: Allows recovery from bluffing mistakes

---

## Scoring System Questions

### Evidence Bonuses

**Q23**: Is the specificity bonus gap appropriate?
- Current: +3 for specific, +1 for ALL
- Alternative: Narrow gap (+2 vs +1)?
- Alternative: Wider gap (+4 vs +1)?
- **Impact**: Affects value of specific evidence collection

**Q24**: Is the excitement multiplier balanced?
- Current: ×2.0 (EXCITING), ×1.0 (NEUTRAL), ×0.5 (BORING, rounds up)
- Alternative: ×3.0/×1.0/×0.5?
- Alternative: Remove entirely?
- **Impact**: Determines importance of excitement level in card selection

**Q25**: Should the rounding rule for BORING cards change?
- Current: Rounds up (3→2, 1→1)
- Alternative: Rounds down (3→1, 1→0)?
- Alternative: No rounding (fractional points)?
- **Impact**: Affects value of boring evidence

**Q26**: Is the novelty bonus (+2) appropriate?
- Current: +2 for first use of evidence on any conspiracy
- Alternative: Higher bonus (+3 or +4)?
- Alternative: Remove novelty bonus?
- Alternative: Bonus only for first use per conspiracy (not globally)?
- **Impact**: Incentivizes diverse evidence usage vs reuse

**Q27**: Should there be diminishing returns for evidence stacking?
- Current: Each card adds full bonus
- Alternative: First card full bonus, subsequent cards reduced?
- Alternative: Bonus caps after X cards?
- **Impact**: Prevents optimal strategy of "stack everything on one conspiracy"

### Base Points

**Q28**: Is the base point spread optimal?
- Current: 3 (evidence), 1 (bandwagon), 2 (INCONCLUSIVE)
- Alternative: 4/2/2 or 3/2/2?
- Alternative: Variable based on conspiracy tier?
- **Impact**: Affects relative value of evidence vs bluffing

**Q29**: Should INCONCLUSIVE always score 2 points?
- Current: Always 2, immune to consensus
- Alternative: Scale with credibility?
- Alternative: Reduce to 1 if no consensus on that conspiracy?
- **Impact**: Changes safety value of INCONCLUSIVE

---

## Evidence and Conspiracy Questions

### Card Distribution

**Q30**: Is the current evidence distribution appropriate?
- Current: 156 cards (78 pairs with opposite proof values)
- Distribution: 34 generic (ALL), 114 specific, 8 bluff
- Is this ratio optimal?
- **Impact**: Affects card draw variance

**Q31**: Should more conspiracies have dedicated specific evidence?
- Current: Some conspiracies have 5-7 specific cards, others have 2-3
- Should all conspiracies have equal support?
- Or is asymmetry intentional?
- **Impact**: Affects which conspiracies are easier to build evidence for

**Q32**: Are bluff cards necessary in the base game?
- Current: 8 bluff cards exist but only matter in "Truth Matters" mode
- Alternative: Remove from base game?
- Alternative: Give them a special effect in base game?
- **Impact**: Simplifies deck or adds variant depth

**Q33**: Should conspiracy tiers have mechanical effects in base game?
- Current: Tiers are cosmetic only (1, 2, 3)
- Alternative: Higher tiers worth more points?
- Alternative: Higher tiers harder to form consensus on?
- **Impact**: Adds strategic target selection

**Q34**: How many copies of each evidence type should exist?
- Current: Most cards have 2 copies (original + opposite proof value)
- Alternative: 3 copies of each?
- Alternative: Vary by card quality?
- **Impact**: Affects card availability and draw luck

---

## Player Count and Scaling Questions

### 3-Player Games

**Q35**: Is the game balanced for 3 players?
- Testing shows it works, but is it as fun as 4-5 players?
- Should 3p have different rules?
- **Impact**: Determines minimum player count

**Q36**: Should 3-player games use fewer conspiracies on the board?
- Current: Always 6 conspiracies
- Alternative: 5 conspiracies for 3p?
- **Impact**: Focuses decision space for smaller groups

### 5-Player Games

**Q37**: Does the higher consensus threshold (3 votes) work for 5 players?
- Current: Need 3 votes for consensus in 5p
- This is 60% vs 50% for 3-4p
- Should it be 3 votes (60%) or change to 50%+1?
- **Impact**: Affects difficulty of forming consensus

**Q38**: Should 5-player games have more active conspiracies?
- Current: Always 6 conspiracies
- Alternative: 7-8 conspiracies for 5p?
- **Impact**: Increases decision space and reduces consensus likelihood

### 2-Player and 6+ Player Variants

**Q39**: Should a 2-player variant exist?
- Potential rules: AI third player? Different consensus rules?
- Or is the game fundamentally multiplayer?
- **Impact**: Expands player count range

**Q40**: Should a 6+ player variant exist?
- Potential rules: Teams? Multiple boards?
- Or is 5 players the maximum?
- **Impact**: Scales game for larger groups

---

## Physical Implementation Questions

### Component Design

**Q41**: How should physical evidence assignment work?
- Current digital: Face-down cards with color tokens
- Physical options:
  - Evidence ownership tokens on cards?
  - Hidden evidence trays?
  - Face-down card stacks with markers?
- **Impact**: Affects physical playability

**Q42**: What components are needed for physical play?
- Identified in README:
  - Evidence ownership tokens (color-coded)
  - Advertisement markers
  - Audience/credibility trackers (dials? sliders? tokens?)
  - Conspiracy reveal markers
  - Turn order marker
- Are these sufficient?
- **Impact**: Determines production requirements

**Q43**: How should the ADVERTISE phase work physically?
- Current: Sequential turn order announcements
- Alternative: Simultaneous secret selection revealed together?
- Alternative: Public token placement?
- **Impact**: Affects physical flow and timing

**Q44**: How should scoring be tracked physically?
- Options: Paper score sheets? Dial trackers? Token pools?
- Should credibility and audience be on same tracker or separate?
- **Impact**: Affects component count and usability

**Q45**: Should evidence cards be double-sided or single-sided?
- Single-sided: Standard cards, need tokens to mark ownership
- Double-sided: Could show ownership color on back?
- **Impact**: Affects printing and component design

### Physical Usability

**Q46**: How large should the conspiracy board be?
- Need space for 6 conspiracies + evidence cards
- Recommended table size?
- **Impact**: Affects physical footprint and playability

**Q47**: How should the game handle evidence deck depletion?
- Current: Can run out in long games
- Physical solution: Reshuffle discard pile?
- Alternative: Larger deck?
- **Impact**: Prevents game stalling

**Q48**: Should there be a player aid/reference card?
- Current: QUICK_REFERENCE.md exists for digital
- Physical: Need player aids per player?
- Content: Scoring formula? Phase sequence? Penalties?
- **Impact**: Reduces rules lookups during play

---

## User Experience Questions

### Complexity and Onboarding

**Q49**: Is the game too complex for new players?
- Current: 5 phases, scoring formula, credibility system
- Should there be a "simplified" mode for first game?
- What can be simplified without losing core gameplay?
- **Impact**: Affects accessibility and teaching time

**Q50**: What is the optimal teaching method?
- Current: Tutorial mode in digital version
- Physical: Play example round? Quick start guide?
- **Impact**: Affects adoption rate

**Q51**: Are the phase names intuitive?
- Current: INVESTIGATE, ADVERTISE, BROADCAST, RESOLVE, CLEANUP
- Alternatives: Different names? Icons instead?
- **Impact**: Affects memorability

**Q52**: Is the iconography clear?
- Current: Color-coded phases (blue, purple, orange, green, gray)
- Emojis for conspiracies
- Should icons be more prominent than names?
- **Impact**: Affects visual clarity

### Scoring Transparency

**Q53**: Is the scoring formula too opaque?
- Current: Multiple bonuses × multipliers
- Should it be simplified?
- Should there be a scoring calculator/reference?
- **Impact**: Affects player ability to predict scores

**Q54**: Should players see detailed score breakdowns?
- Current digital: Full breakdown shown
- Physical: How to show this?
- Alternative: Just show final score?
- **Impact**: Affects learning and strategic planning

**Q55**: How much information should be public during the game?
- Current: Evidence count visible, content hidden
- Should more be visible?
- Should credibility be hidden or public?
- **Impact**: Affects information asymmetry

---

## Strategic Depth Questions

### Dominant Strategies

**Q56**: Is there a single dominant strategy?
- Testing shows aggressive broadcast strategies (Reckless Gambler, Conspiracy Theorist) win most
- Is this intentional?
- Should passive strategies be buffed?
- **Impact**: Affects strategy diversity

**Q57**: Is bandwagoning too strong or too weak?
- Current: 1 base point + chance of consensus
- Win rate shows it's viable but not dominant
- Should it be adjusted?
- **Impact**: Affects risk/reward balance

**Q58**: Are there any unintended exploits?
- Testing found "passive play" exploit (EVOLUTIONARY_REPORT)
- Are there others?
- How to prevent without restricting creativity?
- **Impact**: Affects competitive balance

### Strategic Decision Points

**Q59**: Are there enough meaningful decisions per round?
- Current: Evidence assignment, advertise, broadcast position, conspiracy choice
- Too many? Too few?
- **Impact**: Affects engagement and depth

**Q60**: Is the risk/reward balance appropriate?
- Current: Higher risk plays (bluffing, lone broadcasts) can pay off but have penalties
- Should penalties be harsher or more forgiving?
- **Impact**: Affects strategic risk tolerance

**Q61**: How much should reading other players matter?
- Current: High importance (ADVERTISE phase, evidence count watching)
- Should mechanical strategy be stronger than social reads?
- **Impact**: Affects game genre (social deduction vs strategy)

### Long-term Strategy

**Q62**: Is multi-round planning viable?
- Current: Evidence persists, allowing long-term buildup
- Testing shows most players focus on current round
- Should long-term planning be incentivized more?
- **Impact**: Affects strategic depth and game arc

**Q63**: Should there be catch-up mechanics?
- Current: No explicit catch-up (players behind can bluff more)
- Alternative: Trailing player bonuses?
- Alternative: Leader penalties?
- **Impact**: Affects comeback potential

---

## Variant Mode Questions

### "Truth Matters" Mode

**Q64**: Should "Truth Matters" mode be the default or a variant?
- Current: Consensus mode is default
- Alternative: Offer both as equal options?
- **Impact**: Affects core game identity

**Q65**: In "Truth Matters" mode, how should truth be revealed?
- Current design: Truth value hidden on conspiracy cards
- When is it revealed? End of round? End of game?
- **Impact**: Affects information flow

**Q66**: Should proof values on evidence cards matter more?
- Current: Only matter in "Truth Matters" mode
- Alternative: Subtle effects in base game?
- **Impact**: Affects card differentiation

### Team Mode

**Q67**: Should there be an official team variant?
- Testing includes 2v2 format (TEAM_2V2_REPORT)
- Should this be an official variant?
- Rules: Shared audience? Separate credibility?
- **Impact**: Adds cooperative element

**Q68**: How should teams be formed?
- Random? Player choice? Draft?
- Should team composition be secret or public?
- **Impact**: Affects team dynamics

### Coalition Mode

**Q69**: Should coalitions be formalized or emergent?
- Testing includes coalition formats (COALITION_2_1_1_REPORT, MAJORITY_MINORITY_REPORT)
- Current: Emergent through ADVERTISE phase
- Alternative: Pre-game coalition formation?
- **Impact**: Affects social dynamics

---

## Component Design Questions

### Card Design

**Q70**: What information density is optimal for cards?
- Current: Name, supported conspiracies, flavor text, excitement, proof value
- Too much text? Too little?
- **Impact**: Affects readability

**Q71**: Should flavor text be shorter or longer?
- Current: 1-2 sentences of humorous text
- Does it add to experience or slow down play?
- **Impact**: Affects game tone and reading time

**Q72**: Should card backs be uniform or differentiated?
- All evidence same back? Conspiracies same back?
- Or distinguish by type/tier?
- **Impact**: Affects card recognition

**Q73**: What card size is optimal?
- Standard poker size?
- Larger for readability?
- Smaller to reduce table space?
- **Impact**: Affects component design and table footprint

### Visual Design

**Q74**: Should the game use realistic or humorous art style?
- Current: Humorous flavor text and emojis
- Should physical cards have illustrated art?
- Tone: Satirical? Serious? Absurd?
- **Impact**: Affects game theme and appeal

**Q75**: What color palette should the physical game use?
- Current digital: Phase-specific colors (blue, purple, orange, green, gray)
- Should cards/boards use these colors?
- **Impact**: Affects visual cohesion

**Q76**: How prominent should conspiracy icons be?
- Current: Emoji icons (✈️☁️, 🌙🎬, etc.)
- Should these be enlarged, illustrated, or replaced?
- **Impact**: Affects visual recognition

---

## Additional Development Questions

### Accessibility

**Q77**: How can the game be made more accessible?
- Color-blind friendly design?
- Large print option?
- Symbol-based instead of text-based?
- **Impact**: Broadens player base

**Q78**: What age rating should the game target?
- Content: Conspiracy theories, satirical humor
- Complexity: Moderate to high
- Recommended age: 12+? 14+? 16+?
- **Impact**: Affects marketing and content decisions

### Replayability

**Q79**: How many plays before players see repeated content?
- 12 conspiracies (6 active per game)
- 156 evidence cards (players see ~5-8 per round)
- Is this enough variety?
- **Impact**: Determines if expansions are needed

**Q80**: Should there be campaign or legacy elements?
- Could credibility persist between games?
- Could players unlock new cards/conspiracies?
- **Impact**: Adds long-term engagement

### Digital vs Physical

**Q81**: Should the digital and physical versions have identical rules?
- Or should each be optimized for its medium?
- Digital advantages: Automatic scoring, hidden information
- Physical advantages: Social interaction, table presence
- **Impact**: Affects development approach

**Q82**: Should there be solo or AI modes?
- Current: AI testing exists but not as player-facing feature
- Should solo play be official mode?
- **Impact**: Affects player count range

### Publishing and Production

**Q83**: What production quality tier should be targeted?
- Budget: Simple cards and tokens
- Standard: Good quality cards, custom trackers
- Premium: Deluxe components, custom dice/tokens
- **Impact**: Affects price point and audience

**Q84**: What is the optimal box size and component organization?
- Need to fit: 12 conspiracies, 156 evidence, trackers, tokens, rules
- Compact box or larger with insert?
- **Impact**: Affects retail presentation and storage

**Q85**: Should expansions be planned from the start?
- New conspiracy decks?
- New evidence types?
- New game modes?
- **Impact**: Affects base game design (leave room for growth vs complete package)

### Playtesting Priorities

**Q86**: What should be the focus of human playtesting?
- Current: 28,550+ AI games completed
- Human testing needed for:
  - Social dynamics?
  - Physical component usability?
  - Rule clarity?
  - Fun factor?
- **Impact**: Guides playtesting priorities

**Q87**: What metrics should be tracked during human playtesting?
- Win rates by strategy?
- Game length?
- Player engagement scores?
- Rules questions asked?
- **Impact**: Determines what data to collect

**Q88**: How many playtests are needed before launch?
- Current status: AI tested, ready for human testing
- Target: 10? 50? 100 playtests?
- **Impact**: Affects development timeline

---

## Meta Questions

**Q89**: What is the core experience the game should deliver?
- Social deduction? Strategic depth? Humor? Psychological warfare?
- All of the above?
- **Impact**: Guides all other design decisions

**Q90**: Who is the target audience?
- Casual gamers? Strategy gamers? Social deduction fans?
- Age range? Gaming experience level?
- **Impact**: Affects complexity, theme, and marketing

**Q91**: What is the elevator pitch?
- "A social deduction game where truth is determined by consensus"
- "Conspiracy theory bluffing game"
- "Strategic deception with escalating consequences"
- **Impact**: Affects positioning and messaging

**Q92**: What makes this game unique in the market?
- ADVERTISE phase? Escalating bluff penalties? Consensus mechanism?
- What's the hook that differentiates it?
- **Impact**: Affects competitive positioning

**Q93**: Should the game embrace or distance itself from real conspiracy theories?
- Current: Satirical take on conspiracy culture
- Could be seen as making light of serious misinformation?
- Should disclaimer be added?
- **Impact**: Affects theme and potential controversy

**Q94**: What is the desired play time?
- Current: 15-20 minutes for 6 rounds
- Is this ideal? Should it be longer/shorter?
- **Impact**: Affects round count and pacing

**Q95**: Should the game have expansions or stand-alone sequels?
- Expansions: Add to base game
- Sequels: Different themes (political scandals? paranormal? corporate?)
- **Impact**: Affects long-term product strategy

**Q96**: How important is narrative/theme vs mechanics?
- Current: Light theme (conspiracy theories) with medium-heavy mechanics
- Should theme be stronger?
- **Impact**: Affects development focus

**Q97**: What should the learning curve be?
- Easy to learn, hard to master?
- Complex but rewarding?
- Accessible to all?
- **Impact**: Affects rule complexity and depth

**Q98**: How should the game handle controversial conspiracy theories?
- Current: Mix of silly (Elvis lives) and serious (election rigging)
- Should serious topics be avoided?
- Should everything be absurdist?
- **Impact**: Affects content and tone

**Q99**: What is the ideal price point?
- Budget ($15-20)? Standard ($25-35)? Premium ($40-50)?
- Based on component quality and target audience
- **Impact**: Affects production decisions

**Q100**: When is the game "done"?
- Current: v2.1.0, balance tested with AI, ready for human playtesting
- What criteria determine readiness for release?
- **Impact**: Affects launch timeline and quality standards

---

## Priority Questions for Immediate Feedback

Based on current testing data and design status, these questions should be answered first:

### High Priority (Answer First)

1. **Q7**: Is 6 rounds optimal? (Since 100% of games reach round 6)
2. **Q10**: How to address 44% win rate spread?
3. **Q17**: Does ADVERTISE phase add enough value for its complexity?
4. **Q19**: Is escalating bluff penalty the right design?
5. **Q89**: What is the core experience?

### Medium Priority (Answer Soon)

6. **Q41-Q48**: All physical implementation questions (needed for prototype)
7. **Q53**: Is scoring formula too complex?
8. **Q56**: Is there a dominant strategy problem?
9. **Q86-Q88**: Playtesting priorities

### Low Priority (Can Wait)

10. **Q64-Q69**: Variant mode questions (after base game solidified)
11. **Q79-Q85**: Publishing questions (after gameplay finalized)
12. **Q93-Q99**: Meta/strategic questions (after playtesting)

---

## How to Use This Document

**For Designers:**
- Use these questions to guide playtesting sessions
- Track answers and decisions in a separate design log
- Prioritize questions based on current development phase
- Reference when making balance changes

**For Playtesters:**
- Questions provide framework for feedback
- Note which mechanics feel good/bad during play
- Provide specific feedback on numbered questions
- Suggest new questions not covered here

**For Developers:**
- Questions inform feature development priorities
- Technical implementations may affect answer feasibility
- UI/UX questions guide interface design

---

**Last Updated:** October 24, 2025
**Next Review:** After first round of human playtesting
**Questions Added:** 100
**Questions Answered:** 0 (awaiting playtesting feedback)

