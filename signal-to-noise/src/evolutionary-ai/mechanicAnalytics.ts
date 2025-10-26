/**
 * Mechanic Analytics: Track which game mechanics are being used/exploited/ignored
 *
 * This helps identify:
 * - Unused mechanics (candidates for removal)
 * - Overused mechanics (may be too strong)
 * - Optimal usage patterns
 */

export interface MechanicUsageStats {
  // Advertise Phase
  advertiseUsageRate: number;        // % of times player advertises vs passes
  advertiseFollowThroughRate: number; // % of times player broadcasts what they advertised
  advertiseFakeoutRate: number;      // % of times player broadcasts opposite of advertise

  // Broadcast Phase
  broadcastRate: number;             // % of rounds player broadcasts (vs passing)
  averageBroadcastRound: number;     // Average round # when broadcasting
  realPositionRate: number;          // % broadcasts that are REAL
  fakePositionRate: number;          // % broadcasts that are FAKE
  inconclusiveRate: number;          // % broadcasts that are INCONCLUSIVE

  // Evidence Usage
  averageEvidencePerBroadcast: number; // Avg # evidence cards played
  bluffCardUsageRate: number;        // % of played evidence that are BLUFFs
  realEvidenceRate: number;          // % of played evidence that are REAL
  fakeEvidenceRate: number;          // % of played evidence that are FAKE

  // Risk Taking
  highBetRate: number;               // % of advertises with 3-point bet
  lowBetRate: number;                // % of advertises with 1-point bet

  // Late Game Behavior
  roundsParticipated: number[];      // Which rounds did they broadcast? (1-6)
  earlyGameActivity: number;         // Broadcasts in rounds 1-2
  midGameActivity: number;           // Broadcasts in rounds 3-4
  lateGameActivity: number;          // Broadcasts in rounds 5-6
}

export interface GameMechanicAnalytics {
  totalGames: number;
  totalRounds: number;
  totalAdvertises: number;
  totalBroadcasts: number;
  totalPasses: number;
  totalBluffsPlayed: number;
  totalEvidencePlayed: number;

  // Per-personality breakdown
  mechanicsByPersonality: Map<string, MechanicUsageStats>;

  // Overall patterns
  overallAdvertiseRate: number;
  overallBroadcastRate: number;
  overallBluffRate: number;

  // Mechanic effectiveness
  advertiseFollowThroughWinRate: number; // Win rate when following through on advertise
  advertiseFakeoutWinRate: number;       // Win rate when faking out

  // Unused mechanics detection
  mechanicsNeverUsed: string[];
  mechanicsRarelyUsed: string[];  // <10% usage
  mechanicsOverused: string[];    // >80% usage
}

export class MechanicAnalyzer {
  private stats: Map<string, any[]> = new Map();

  /**
   * Track a game event for mechanic analysis
   */
  trackEvent(personalityId: string, event: {
    type: 'advertise' | 'broadcast' | 'pass' | 'evidence';
    round?: number;
    data?: any;
  }) {
    if (!this.stats.has(personalityId)) {
      this.stats.set(personalityId, []);
    }
    this.stats.get(personalityId)!.push(event);
  }

  /**
   * Analyze all tracked events and generate report
   */
  generateReport(): GameMechanicAnalytics {
    const report: GameMechanicAnalytics = {
      totalGames: 0,
      totalRounds: 0,
      totalAdvertises: 0,
      totalBroadcasts: 0,
      totalPasses: 0,
      totalBluffsPlayed: 0,
      totalEvidencePlayed: 0,
      mechanicsByPersonality: new Map(),
      overallAdvertiseRate: 0,
      overallBroadcastRate: 0,
      overallBluffRate: 0,
      advertiseFollowThroughWinRate: 0,
      advertiseFakeoutWinRate: 0,
      mechanicsNeverUsed: [],
      mechanicsRarelyUsed: [],
      mechanicsOverused: [],
    };

    // Calculate overall stats
    this.stats.forEach((events, personalityId) => {
      const advertises = events.filter(e => e.type === 'advertise');
      const broadcasts = events.filter(e => e.type === 'broadcast');
      const passes = events.filter(e => e.type === 'pass');

      report.totalAdvertises += advertises.length;
      report.totalBroadcasts += broadcasts.length;
      report.totalPasses += passes.length;
    });

    const totalActions = report.totalAdvertises + report.totalBroadcasts + report.totalPasses;
    if (totalActions > 0) {
      report.overallAdvertiseRate = report.totalAdvertises / totalActions;
      report.overallBroadcastRate = report.totalBroadcasts / totalActions;
    }

    // Identify unused/overused mechanics
    if (report.overallAdvertiseRate === 0) {
      report.mechanicsNeverUsed.push('Advertise Phase');
    } else if (report.overallAdvertiseRate < 0.1) {
      report.mechanicsRarelyUsed.push('Advertise Phase');
    } else if (report.overallAdvertiseRate > 0.8) {
      report.mechanicsOverused.push('Advertise Phase');
    }

    if (report.overallBroadcastRate === 0) {
      report.mechanicsNeverUsed.push('Broadcasting');
    } else if (report.overallBroadcastRate < 0.1) {
      report.mechanicsRarelyUsed.push('Broadcasting');
    }

    if (report.totalBluffsPlayed === 0) {
      report.mechanicsNeverUsed.push('Bluff Cards');
    } else {
      report.overallBluffRate = report.totalBluffsPlayed / Math.max(1, report.totalEvidencePlayed);
      if (report.overallBluffRate < 0.1) {
        report.mechanicsRarelyUsed.push('Bluff Cards');
      }
    }

    return report;
  }

  /**
   * Reset analyzer for new analysis
   */
  reset() {
    this.stats.clear();
  }
}
