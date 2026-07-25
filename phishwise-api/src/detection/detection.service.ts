import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Scan } from './scan.entity';
import { ProgressService } from '../progress/progress.service';
import { SafeBrowsingService } from './safe-browsing.service';
import { analyze } from './detection.engine';
import {
  InputType,
  ScanResult,
  TriggeredSignal,
  Verdict,
  VERDICT_ORDER,
} from './types';
import { verdictForScore, clampScore } from './scoring';
import { ALL_SIGNALS } from './signals/catalog';
import { URL_SIGNALS } from './signals/url-signals';
import { MESSAGE_SIGNALS } from './signals/message-signals';

const THREAT_VERDICTS: Verdict[] = ['Likely Phishing', 'Dangerous'];
const isThreatVerdict = (v: string) => THREAT_VERDICTS.includes(v as Verdict);

@Injectable()
export class DetectionService {
  constructor(
    @InjectRepository(Scan) private readonly scans: Repository<Scan>,
    private readonly progress: ProgressService,
    private readonly safeBrowsing: SafeBrowsingService,
  ) {}

  /**
   * Run the rule engine, then (only if the optional Safe Browsing enrichment is
   * enabled) fold a positive Safe Browsing match in as an extra signal. The
   * engine result is always valid on its own; enrichment can only add.
   */
  private async runEngine(input: string, inputType: InputType): Promise<ScanResult> {
    const result = analyze(input, inputType);

    if (result.inputType === 'url' && this.safeBrowsing.enabled && result.normalized) {
      const gsb = await this.safeBrowsing.check(result.normalized);
      if (gsb?.listed) {
        const sig: TriggeredSignal = {
          id: 'gsb-match',
          label: 'Flagged by Google Safe Browsing',
          explanation:
            'Google Safe Browsing lists this URL as a known threat. This is an optional online check layered on top of the offline rules.',
          weight: 45,
          category: 'social-engineering',
          detail: gsb.threatTypes.join(', ') || undefined,
        };
        result.signals.push(sig);
        result.score = clampScore(
          result.signals.reduce((s, x) => s + (x.weight || 0), 0),
        );
        result.verdict = verdictForScore(result.score);
      }
    }
    return result;
  }

  /** Public "Try it" scan \u2014 analysed and returned, but NEVER saved. */
  async scanPublic(input: string, inputType: InputType) {
    const result = await this.runEngine(input, inputType);
    return { result, saved: false };
  }

  /** Authenticated scan \u2014 saved, and rewarded via the gamification engine. */
  async scanForUser(userId: string, input: string, inputType: InputType) {
    const result = await this.runEngine(input, inputType);
    const threat = isThreatVerdict(result.verdict);

    const saved = await this.scans.save(
      this.scans.create({
        userId,
        inputType,
        input,
        score: result.score,
        verdict: result.verdict,
        threat,
        result,
      }),
    );

    // Up-to-date totals feed the shared badge engine.
    const [scanCount, threatsCaught] = await Promise.all([
      this.scans.count({ where: { userId } }),
      this.scans.count({ where: { userId, threat: true } }),
    ]);

    const reward = await this.progress.applyScan(userId, {
      isThreat: threat,
      scanCount,
      threatsCaught,
    });

    return {
      scan: this.toDetail(saved),
      saved: true,
      awardedXp: reward.awardedXp,
      newBadges: reward.newBadges,
      progress: reward.progress,
    };
  }

  /** A user's scan history (newest first, list shape). */
  async history(userId: string) {
    const rows = await this.scans.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
    return rows.map((r) => this.toListItem(r));
  }

  async getScan(userId: string, id: string) {
    const row = await this.scans.findOne({ where: { id, userId } });
    if (!row) throw new NotFoundException('Scan not found.');
    return this.toDetail(row);
  }

  async deleteScan(userId: string, id: string) {
    const res = await this.scans.delete({ id, userId });
    if (!res.affected) throw new NotFoundException('Scan not found.');
    return { id, deleted: true };
  }

  /** Per-user detection stats (for the dashboard / achievements widgets). */
  async myStats(userId: string) {
    const rows = await this.scans.find({ where: { userId } });
    return this.aggregate(rows);
  }

  /** Platform-wide detection analytics for the admin console. */
  async adminStats() {
    const rows = await this.scans.find();
    const base = this.aggregate(rows);
    return {
      ...base,
      inputTypes: {
        url: rows.filter((r) => r.inputType === 'url').length,
        message: rows.filter((r) => r.inputType === 'message').length,
      },
    };
  }

  /** Read-only rule catalog (for the admin "how detection works" view). */
  ruleCatalog() {
    const shape = (s: (typeof ALL_SIGNALS)[number]) => ({
      id: s.id,
      label: s.label,
      explanation: s.explanation,
      weight: s.weight,
      category: s.category,
      lessons: s.lessons,
    });
    return {
      bands: [
        { verdict: 'Safe', range: '0\u201324' },
        { verdict: 'Suspicious', range: '25\u201349' },
        { verdict: 'Likely Phishing', range: '50\u201374' },
        { verdict: 'Dangerous', range: '75\u2013100' },
      ],
      url: URL_SIGNALS.map(shape),
      message: MESSAGE_SIGNALS.map(shape),
      total: ALL_SIGNALS.length,
    };
  }

  // ── helpers ────────────────────────────────────────────
  private aggregate(rows: Scan[]) {
    const verdictCounts: Record<Verdict, number> = {
      Safe: 0,
      Suspicious: 0,
      'Likely Phishing': 0,
      Dangerous: 0,
    };
    const signalCounts = new Map<string, { label: string; count: number }>();

    for (const r of rows) {
      if (verdictCounts[r.verdict as Verdict] != null) {
        verdictCounts[r.verdict as Verdict]++;
      }
      const res = r.result as ScanResult;
      const sigs = res?.signals ?? [];
      for (const s of sigs) {
        const entry = signalCounts.get(s.id) ?? { label: s.label, count: 0 };
        entry.count++;
        signalCounts.set(s.id, entry);
      }
    }

    const topSignals = [...signalCounts.entries()]
      .map(([id, v]) => ({ id, label: v.label, count: v.count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    return {
      totalScans: rows.length,
      threatsCaught: rows.filter((r) => r.threat).length,
      verdictCounts,
      verdictDistribution: VERDICT_ORDER.map((v) => ({
        verdict: v,
        count: verdictCounts[v],
      })),
      topSignals,
    };
  }

  private toListItem(r: Scan) {
    return {
      id: r.id,
      inputType: r.inputType,
      preview: r.input.length > 90 ? r.input.slice(0, 90) + '\u2026' : r.input,
      score: r.score,
      verdict: r.verdict,
      threat: r.threat,
      createdAt: r.createdAt.toISOString(),
    };
  }

  private toDetail(r: Scan) {
    return {
      id: r.id,
      inputType: r.inputType,
      input: r.input,
      score: r.score,
      verdict: r.verdict,
      threat: r.threat,
      result: r.result,
      createdAt: r.createdAt.toISOString(),
    };
  }
}
