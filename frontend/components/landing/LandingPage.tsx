import Link from "next/link";
import {
  BarChart3,
  Bot,
  Brain,
  Briefcase,
  ClipboardList,
  Play,
  Quote,
  Users,
} from "lucide-react";

const headerLinks = [
  { href: "#features", label: "Features" },
  { href: "#pricing", label: "Pricing" },
  { href: "#docs", label: "Docs" },
  { href: "#about", label: "About" },
] as const;

function LandingHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white text-lg font-black leading-none shadow-sm ring-1 ring-slate-200">
            <span className="text-[#4A90E2]">A</span>
            <span className="text-orange-500">I</span>
          </span>
          <span className="text-lg font-bold tracking-tight text-[#1A2B48]">
            AI Colab Tool
          </span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {headerLinks.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="text-sm font-medium text-slate-600 transition hover:text-[#1A2B48]"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Link
            href="/dashboard"
            className="rounded-[10px] border-2 border-[#1A2B48] px-4 py-2 text-sm font-semibold text-[#1A2B48] transition hover:bg-slate-50"
          >
            Log In
          </Link>
          <Link
            href="/dashboard"
            className="rounded-[10px] bg-[#4A90E2] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d7bc9]"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  );
}

function PlayIconBox() {
  return (
    <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg border-2 border-[#1A2B48]/20 bg-white text-[#1A2B48]">
      <Play className="ml-0.5 h-4 w-4 fill-current" />
    </span>
  );
}

function HeroIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="rounded-2xl border border-slate-200/80 bg-white p-4 shadow-lg shadow-slate-200/60 ring-1 ring-slate-100">
        <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-3">
          <span className="text-sm font-bold text-[#1A2B48]">Project Alpha</span>
          <span className="rounded-md bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
            Live
          </span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-xl bg-emerald-50 p-2 ring-1 ring-emerald-100">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-emerald-700">
              To Do
            </p>
            <div className="space-y-1.5">
              <div className="h-8 rounded-lg bg-white shadow-sm ring-1 ring-slate-100" />
              <div className="h-8 rounded-lg bg-white/80 shadow-sm ring-1 ring-slate-100" />
            </div>
          </div>
          <div className="relative rounded-xl bg-amber-50 p-2 ring-1 ring-amber-100">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-amber-800">
              In Progress
            </p>
            <div className="space-y-1.5">
              <div className="h-10 rounded-lg bg-white shadow-sm ring-2 ring-[#4A90E2]/40" />
              <div className="h-7 rounded-lg bg-white/80 shadow-sm ring-1 ring-slate-100" />
            </div>
            <div
              className="pointer-events-none absolute -right-2 top-1/2 h-14 w-10 -translate-y-1/2"
              aria-hidden
            >
              <svg viewBox="0 0 40 56" className="h-full w-full text-slate-700">
                <ellipse cx="20" cy="12" rx="8" ry="9" fill="currentColor" opacity="0.15" />
                <path
                  d="M20 22 L14 38 L26 38 Z"
                  fill="currentColor"
                  opacity="0.2"
                />
                <path
                  d="M12 38 L28 38 L26 48 L14 48 Z"
                  fill="currentColor"
                  opacity="0.25"
                />
              </svg>
            </div>
          </div>
          <div className="rounded-xl bg-sky-50 p-2 ring-1 ring-sky-100">
            <p className="mb-2 text-center text-[10px] font-bold uppercase tracking-wide text-sky-800">
              Done
            </p>
            <div className="space-y-1.5">
              <div className="h-7 rounded-lg bg-white shadow-sm ring-1 ring-slate-100" />
              <div className="h-8 rounded-lg bg-white shadow-sm ring-1 ring-slate-100" />
            </div>
          </div>
        </div>
        <div className="mt-3 flex items-center gap-2 rounded-xl bg-indigo-50 px-3 py-2 ring-1 ring-indigo-100">
          <Bot className="h-5 w-5 shrink-0 text-[#4A90E2]" strokeWidth={1.75} />
          <span className="text-xs font-semibold text-indigo-900">AI Suggestions</span>
          <span className="ml-auto text-[10px] text-indigo-600">3 new</span>
        </div>
      </div>

      <div className="relative mt-6 flex justify-center">
        <svg
          className="absolute left-1/2 top-0 h-8 w-32 -translate-x-1/2 -translate-y-full text-slate-300"
          aria-hidden
        >
          <path
            d="M16 32 Q 64 8, 112 32"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="4 3"
          />
        </svg>
        <div className="flex items-center gap-4">
          {["#6366f1", "#22c55e", "#f59e0b"].map((c, i) => (
            <span
              key={i}
              className="h-11 w-11 rounded-full border-2 border-white shadow-md ring-2 ring-slate-100"
              style={{ background: `linear-gradient(135deg, ${c}, ${c}aa)` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

const features = [
  {
    icon: ClipboardList,
    title: "Create Projects",
    desc: "Easily set up and manage projects.",
    iconBg: "bg-sky-100",
    iconColor: "text-[#4A90E2]",
  },
  {
    icon: Brain,
    title: "Smart Task Assignment",
    desc: "AI-powered task recommendations.",
    iconBg: "bg-violet-100",
    iconColor: "text-violet-600",
  },
  {
    icon: Users,
    title: "Team Collaboration",
    desc: "Seamless communication & workflow.",
    iconBg: "bg-emerald-100",
    iconColor: "text-emerald-600",
  },
] as const;

const steps = [
  {
    icon: Briefcase,
    title: "Create a Project",
    desc: "Set up a new project in minutes.",
  },
  {
    icon: ClipboardList,
    title: "Assign Tasks",
    desc: "Let AI help assign and manage tasks.",
  },
  {
    icon: BarChart3,
    title: "Track Progress",
    desc: "Monitor your team's progress easily.",
  },
] as const;

export function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#F0F4F8] to-white">
      <LandingHeader />

      <main>
        <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-10">
            <div>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-[#1A2B48] sm:text-5xl lg:text-[2.75rem] lg:leading-[1.15]">
                Supercharge Your{" "}
                <span className="text-[#4A90E2]">Team Collaboration</span> with
                AI
              </h1>
              <p className="mt-5 max-w-xl text-lg text-slate-600">
                Manage projects, assign tasks, and boost productivity with
                intelligent AI assistance.
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center rounded-xl bg-[#4A90E2] px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-[#4A90E2]/25 transition hover:bg-[#3d7bc9]"
                >
                  Get Started for Free
                </Link>
                <button
                  type="button"
                  className="inline-flex items-center gap-3 rounded-xl border-2 border-[#1A2B48]/15 bg-white px-5 py-3 text-base font-semibold text-[#1A2B48] shadow-sm transition hover:border-[#1A2B48]/25 hover:bg-slate-50"
                >
                  <PlayIconBox />
                  Watch Demo
                </button>
              </div>
            </div>
            <HeroIllustration />
          </div>
        </section>

        <section
          id="features"
          className="border-t border-slate-200/60 bg-white/60 py-16"
        >
          <div className="mx-auto grid max-w-6xl gap-6 px-4 sm:grid-cols-3 sm:px-6 lg:px-8">
            {features.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.title}
                  className="rounded-2xl border border-slate-100 bg-[#F0F4F8]/80 p-6 shadow-sm"
                >
                  <div
                    className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${f.iconBg}`}
                  >
                    <Icon className={`h-6 w-6 ${f.iconColor}`} strokeWidth={1.75} />
                  </div>
                  <h3 className="text-lg font-bold text-[#1A2B48]">{f.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">
                    {f.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#1A2B48]">How It Works</h2>
            <p className="mx-auto mt-3 max-w-xl text-slate-600">
              Streamline your team&apos;s workflow in a few simple steps.
            </p>
          </div>
          <div className="relative mt-14 grid gap-8 md:grid-cols-3">
            <div
              className="pointer-events-none absolute left-0 right-0 top-12 hidden h-0.5 bg-gradient-to-r from-transparent via-slate-200 to-transparent md:block"
              aria-hidden
            />
            {steps.map((s, i) => {
              const Icon = s.icon;
              return (
                <div
                  key={s.title}
                  className="relative rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-md shadow-slate-200/40"
                >
                  <div className="relative z-10 mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#4A90E2]/10 text-[#4A90E2] ring-4 ring-white">
                    <Icon className="h-7 w-7" strokeWidth={1.75} />
                  </div>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#4A90E2]">
                    Step {i + 1}
                  </span>
                  <h3 className="mt-2 text-lg font-bold text-[#1A2B48]">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-slate-600">{s.desc}</p>
                </div>
              );
            })}
          </div>
        </section>

        <section className="border-t border-slate-200/60 bg-[#F0F4F8]/50 py-20">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <div className="relative rounded-3xl bg-gradient-to-br from-sky-100 to-indigo-100 p-8 shadow-inner ring-1 ring-sky-200/50 sm:p-10">
              <Quote
                className="absolute right-6 top-6 h-10 w-10 text-[#4A90E2]/30"
                strokeWidth={1.25}
              />
              <blockquote className="relative text-lg font-medium leading-relaxed text-[#1A2B48] sm:text-xl">
                &ldquo;This tool has transformed the way our team works.{" "}
                <strong className="font-bold text-[#1A2B48]">
                  The AI suggestions are a game-changer!
                </strong>
                &rdquo;
              </blockquote>
              <div className="mt-8 flex items-center gap-4">
                <span className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-rose-300 to-orange-300 text-lg font-bold text-white shadow-md ring-4 ring-white">
                  SM
                </span>
                <div>
                  <p className="font-bold text-[#1A2B48]">Sarah M.</p>
                  <p className="text-sm text-slate-600">Project Manager</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section
          id="pricing"
          className="mx-auto max-w-6xl px-4 py-16 sm:px-6 lg:px-8"
        >
          <div className="rounded-2xl border border-slate-200 bg-slate-50/80 p-6 sm:p-8">
            <p className="text-center text-sm font-medium text-slate-500">
              Ready to try AI Colab Tool?
            </p>
            <div className="mx-auto mt-4 flex max-w-lg flex-col gap-3 sm:flex-row sm:justify-center">
              <input
                type="email"
                placeholder="Enter your work email"
                className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#1A2B48] shadow-sm outline-none ring-[#4A90E2]/20 placeholder:text-slate-400 focus:border-[#4A90E2] focus:ring-2"
                aria-label="Work email"
              />
              <Link
                href="/dashboard"
                className="inline-flex items-center justify-center rounded-xl bg-[#4A90E2] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#3d7bc9]"
              >
                Get started
              </Link>
            </div>
          </div>
        </section>

        <footer
          id="about"
          className="border-t border-slate-200 bg-white py-10 text-center text-sm text-slate-500"
        >
          <p id="docs" className="text-slate-600">
            Documentation and guides ship with your workspace.
          </p>
          <p className="mt-2">
            © {new Date().getFullYear()} AI Colab Tool
          </p>
        </footer>
      </main>
    </div>
  );
}
