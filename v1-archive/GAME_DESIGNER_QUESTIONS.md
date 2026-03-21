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


**Q2**: Should INCONCLUSIVE broadcasts count toward consensus?
- Alternative: They count as "neutral" votes that don't block consensus? 


**Q3**: What happens if everyone broadcasts INCONCLUSIVE?

- Alternative: Inconclusive is itself a consensus! 


### Evidence Persistence

**Q4**: Should evidence persist indefinitely or have a decay mechanism?
- Alternative: Evidence point values decay towards zero and are then reshuffled into the deck


**Q5**: Should there be a limit to how many evidence cards can be assigned to one conspiracy?
- Current: No limit


**Q6**: Should assigned evidence be visible to all players or remain hidden?
- Current: COUNT visible, CONTENT hidden


---

## Balance and Gameplay Questions

### Game Length

**Q7**: Is 6 rounds the optimal game length?
- Alternative: Variable length (first to X audience)
- **Impact**: Based on testing, 0% reach 60 audience or 12 conspiracies - are these conditions needed?

**Q8**: Should the 60 audience threshold be adjusted?
- Alternative: Scale with player count
- **Impact**: Makes early victory possible, adds tension

**Q9**: Should the 12 conspiracies revealed condition be adjusted?
- Alternative: Lower to 8-10 depending on player count
- **Impact**: Creates alternative win path

### Win Rate Balance

**Q10**: How should we address the 44% win rate spread between best and worst AI personalities?
- This is only relevant for playtesting

**Q11**: Should passive strategies (Paranoid Skeptic, Truth Seeker) be viable?
- This is only relevant for playtesting

**Q12**: Is the Reckless Gambler personality too strong?
- This is only relevant for playtesting

---

## ADVERTISE Phase Questions

### Advertisement Mechanics

**Q13**: Is the -1 audience penalty for advertise deception the right cost?
- Alternative: Higher penalty (-2 or -3)
- Alternative: And a Credibility penalty as well


**Q14**: Should there be a reward for honest advertising?
- Alternative: +1 audience bonus for advertising correctly


**Q15**: Should the bonus evidence card placement timing change?
- Current: AFTER all advertisements visible


**Q16**: Should players be able to advertise multiple conspiracies?
- Alternative: Advertise up to 2 conspiracies!


**Q17**: Does the ADVERTISE phase add enough strategic depth to justify the complexity?
- This needs more playtesting

---

## Credibility System Questions

### Credibility Scaling

**Q18**: Are the credibility multipliers balanced?
- Build More granular tiers?


**Q19**: Is the escalating bluff penalty the right approach?
- Current: -2, -3, -4, -5 for successive bluffs, we want to playtest this more


**Q20**: Should bluffs be counted per round or lifetime?
- Current: Lifetime cumulative


**Q21**: Should credibility changes be more dramatic?

- playtest Larger swings (±2/±3) please
- 


**Q22**: Should there be a way to regain credibility faster?
- Current: Only +1 per majority broadcast

---

## Scoring System Questions

### Evidence Bonuses

**Q23**: Is the specificity bonus gap appropriate?
- Current: +3 for specific, +1 for ALL, continue to playtest this


**Q24**: Is the excitement multiplier balanced?
- Current: ×2.0 (EXCITING), ×1.0 (NEUTRAL), ×0.5 (BORING, rounds up)


**Q25**: Should the rounding rule for BORING cards change?
- Current: Rounds up (3→2, 1→1)


**Q26**: Is the novelty bonus (+2) appropriate?

- change to Bonus only for first use per conspiracy (not globally)?


**Q27**: Should there be diminishing returns for evidence stacking?

- change this to:  First card full bonus, subsequent cards reduced to 1


### Base Points

**Q28**: Is the base point spread optimal?
- Current: 3 (evidence), 1 (bandwagon), 2 (INCONCLUSIVE) ,lets continue to playtest this


**Q29**: Should INCONCLUSIVE always score 2 points?
- Inconclusive can BE a Consensus, leave this at 2 points

---

## Evidence and Conspiracy Questions

### Card Distribution

**Q30**: Is the current evidence distribution appropriate?
- lets continue to playtest and see if anything is revealed 

**Q31**: Should more conspiracies have dedicated specific evidence?
- Current: Some conspiracies have 5-7 specific cards, others have 2-3


**Q32**: Are bluff cards necessary in the base game?
- yes

**Q33**: Should conspiracy tiers have mechanical effects in base game?
- Alternative: Higher tiers worth more points? Make this the way things work but only if higher tier cards currently have less specific evidence cards


**Q34**: How many copies of each evidence type should exist?
- Current: Most cards have 2 copies (original + opposite proof value)



---



## Variant Mode Questions



### Team Mode

**Q67**: Should there be an official team variant?
- There is no team mode

### Coalition Mode

**Q69**: Should coalitions be formalized or emergent?
- There is no coalition mode, that was a misunderstanding in testing

---

## Component Design Questions

### Card Design

**Q70**: What information density is optimal for cards?
- Current: Name, supported conspiracies, flavor text, excitement, proof value


**Q71**: Should flavor text be shorter or longer?
- Current: 1-2 sentences of humorous text


**Q72**: Should card backs be uniform or differentiated?
- All evidence same back! Conspiracies same back!


**Q73**: What card size is optimal?
- Standard poker size!


### Visual Design

**Q74**: Should the game use realistic or humorous art style?
- Current: Humorous flavor text and emojis!


**Q75**: What color palette should the physical game use?
- Current digital: Phase-specific colors (blue, purple, orange, green, gray)

**Q76**: How prominent should conspiracy icons be?
- Current: Emoji icons (✈️☁️, 🌙🎬, etc.)


---

## Additional Development Questions


---

## Meta Questions

**Q89**: What is the core experience the game should deliver?
- Social deduction? Strategic depth? Humor? Psychological warfare?
- All of the above!


**Q91**: What is the elevator pitch?
- "A social deduction game where truth is determined by consensus"



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

