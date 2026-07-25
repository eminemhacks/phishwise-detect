import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { PublicNav, Footer } from "../components/layout";
import { Icon, Button, Card, Chip, ProgressBar } from "../components/ui";
import { TryItWidget } from "./Detector.jsx";
import { CATEGORIES } from "../data/lessons";

const fade = { initial: { opacity: 0, y: 18 }, whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" }, transition: { duration: 0.5 } };

export default function Landing() {
  return (
    <div>
      <PublicNav />
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 [background:radial-gradient(60%_50%_at_70%_20%,rgba(13,159,146,.14),transparent_70%)]" />
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:py-24">
          <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <Chip tone="teal" className="mb-4"><Icon name="GraduationCap" className="w-3.5 h-3.5" /> Final-year cybersecurity project</Chip>
            <h1 className="text-4xl font-bold leading-[1.1] sm:text-5xl">
              Check if it's phishing —<br /><span className="text-signal-600 dark:text-signal-400">before you click.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-500 dark:text-ink-300">
              Paste a suspicious link or message and PhishWise analyzes it with a transparent, rule-based engine — a risk score, every red flag explained, and the lessons that teach each trick.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button as={Link} to="/register" size="lg">Create free account <Icon name="ArrowRight" className="w-4 h-4" /></Button>
              <Button as={Link} to="/login" variant="secondary" size="lg"><Icon name="MonitorPlay" className="w-4 h-4" /> Explore the demo</Button>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-ink-500 dark:text-ink-400">
              {["Detects URL & message scams", "Explains every signal", "Save your scan history"].map((s) => (
                <span key={s} className="flex items-center gap-1.5"><Icon name="CheckCircle2" className="w-4 h-4 text-signal-500" />{s}</span>
              ))}
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6, delay: 0.15 }} className="flex justify-center lg:justify-end">
            <TryItWidget />
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-ink-100 bg-white dark:border-ink-800 dark:bg-ink-900/50">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 sm:px-6 md:grid-cols-4">
          {[["0\u2013100", "explainable risk score"], ["23 rules", "in the detection engine"], ["URL + text", "both analyzed"], ["17 lessons", "surfaced in context"]].map(([v, l]) => (
            <motion.div key={l} {...fade} className="text-center">
              <p className="font-display text-3xl font-bold text-signal-600 dark:text-signal-400">{v}</p>
              <p className="mt-1 text-sm text-ink-500 dark:text-ink-400">{l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fade} className="mb-12 max-w-2xl">
          <h2 className="text-3xl font-bold">Detection first, learning right beside it</h2>
          <p className="mt-3 text-ink-500 dark:text-ink-300">Catch the threat in front of you now, then learn the trick behind it so you catch the next one yourself.</p>
        </motion.div>
        <div className="grid gap-5 md:grid-cols-3">
          {[
            { icon: "ScanSearch", title: "Rule-based detector", body: "Paste a URL or a message and get a 0\u2013100 risk score from a transparent heuristic engine \u2014 every point traces back to a named signal you can defend." },
            { icon: "ListChecks", title: "Every red flag explained", body: "Look-alike domains, urgency, OTP/BVN requests, prize bait, vishing scripts \u2014 each triggered rule comes with a plain-language reason." },
            { icon: "GraduationCap", title: "Learn at the teachable moment", body: "Results link straight to the micro-lessons that teach whatever trick was detected, turning a close call into a lesson." },
            { icon: "Swords", title: "Scenario-based quizzes", body: "Real attack scenarios: fake bank calls, look-alike URLs, CEO fraud emails. Immediate feedback explains every answer." },
            { icon: "Trophy", title: "XP, streaks & badges", body: "Earn XP for scanning and learning, keep daily streaks, and unlock detection badges like First Catch and Threat Hunter." },
            { icon: "ShieldCheck", title: "Nigeria-aware", body: "Tuned for local scams \u2014 fake bank/telco callers, BVN/NIN harvesting, SIM-block threats and \u201cyou\u2019ve won\u201d promo bait." },
          ].map((f) => (
            <motion.div key={f.title} {...fade}>
              <Card className="h-full p-6 transition hover:shadow-lift">
                <div className="mb-4 inline-flex rounded-xl bg-signal-500/10 p-3 text-signal-600 dark:text-signal-300"><Icon name={f.icon} className="w-6 h-6" /></div>
                <h3 className="font-bold">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-500 dark:text-ink-400">{f.body}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="bg-ink-950 py-20 text-white">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <motion.h2 {...fade} className="text-3xl font-bold">How PhishWise works</motion.h2>
          <div className="mt-12 grid gap-10 md:grid-cols-4">
            {[
              { n: "01", icon: "BookOpen", t: "Learn", b: "Pick a 5-minute lesson from 8 security categories." },
              { n: "02", icon: "ClipboardCheck", t: "Test", b: "Take scenario quizzes with instant, explained feedback." },
              { n: "03", icon: "Sparkles", t: "Earn", b: "Collect XP, keep your streak, and unlock badges." },
              { n: "04", icon: "TrendingUp", t: "Grow", b: "Watch your level — and your instincts — sharpen over time." },
            ].map((s) => (
              <motion.div key={s.n} {...fade}>
                <p className="font-display text-sm font-bold text-signal-400">{s.n}</p>
                <div className="mt-3 inline-flex rounded-xl bg-white/5 p-3"><Icon name={s.icon} className="w-6 h-6 text-signal-300" /></div>
                <h3 className="mt-3 font-bold">{s.t}</h3>
                <p className="mt-1.5 text-sm text-ink-300">{s.b}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Modules */}
      <section id="modules" className="mx-auto max-w-6xl px-4 py-20 sm:px-6">
        <motion.div {...fade} className="mb-10 max-w-2xl">
          <h2 className="text-3xl font-bold">Eight categories. One sharper you.</h2>
          <p className="mt-3 text-ink-500 dark:text-ink-300">From inbox to browser to phone — the full surface area of everyday digital life.</p>
        </motion.div>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          {CATEGORIES.map((c) => (
            <motion.div key={c.id} {...fade}>
              <Link to="/lessons" className="card block h-full p-5 transition hover:-translate-y-0.5 hover:shadow-lift">
                <div className={`mb-3 inline-flex rounded-xl p-2.5 ${c.bg} ${c.color}`}><Icon name={c.icon} className="w-5 h-5" /></div>
                <p className="text-sm font-bold leading-snug">{c.name}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-6xl px-4 pb-20 sm:px-6">
        <motion.div {...fade} className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-signal-700 via-signal-600 to-ink-800 p-10 text-white sm:p-14">
          <Icon name="ShieldCheck" className="pointer-events-none absolute -right-8 -top-8 h-48 w-48 opacity-10" />
          <h2 className="max-w-xl text-3xl font-bold">Your next phishing email is already being written. Be ready for it.</h2>
          <p className="mt-3 max-w-lg text-signal-100">Create a free demo account — or log in as an admin to explore the management console.</p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Button as={Link} to="/register" variant="amber" size="lg">Create free account</Button>
            <Button as={Link} to="/login" size="lg" className="bg-white/15 hover:bg-white/25">Explore admin demo</Button>
          </div>
        </motion.div>
      </section>
      <Footer />
    </div>
  );
}
