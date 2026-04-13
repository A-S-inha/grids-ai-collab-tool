"use client";

import {
  Calendar as CalIcon,
  ChevronLeft,
  ChevronRight,
  Copy,
  Link2,
  Plus,
  Trash2,
  Video,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { useDashboardRole } from "@/components/dashboard/DashboardRoleContext";

const LS_GOOGLE = "ai-colab-google-calendar-connected";
const LS_CALS = "ai-colab-selected-calendars";

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const dates = [7, 8, 9, 10, 11, 12, 13];

const events = [
  {
    day: "Wed 9",
    title: "Design sync",
    time: "10:00 AM",
    type: "meet" as const,
    project: "AI Colab Tool",
  },
  {
    day: "Thu 10",
    title: "Sprint planning",
    time: "2:00 PM",
    type: "meet" as const,
    project: "Mobile App Sprint",
  },
  {
    day: "Fri 11",
    title: "Stakeholder review",
    time: "11:30 AM",
    type: "meet" as const,
    project: "Website Redesign",
  },
  {
    day: "Mon 7",
    title: "Focus block — docs",
    time: "All day",
    type: "block" as const,
    project: "Project X",
  },
];

type BlockedRange = { id: string; start: string; end: string; label: string };

const defaultBlocked: BlockedRange[] = [
  {
    id: "b1",
    start: "2026-03-17",
    end: "2026-03-21",
    label: "Midterms",
  },
];

const mockCalendars = [
  { id: "primary", name: "Primary (you@domain.com)", primary: true },
  { id: "work", name: "Work", primary: false },
];

export function CalendarPageClient() {
  const { role } = useDashboardRole();
  const [googleConnected, setGoogleConnected] = useState(false);
  const [selectedCals, setSelectedCals] = useState<string[]>(["primary", "work"]);
  const [blocked, setBlocked] = useState<BlockedRange[]>(defaultBlocked);
  const [blockStart, setBlockStart] = useState("");
  const [blockEnd, setBlockEnd] = useState("");
  const [blockLabel, setBlockLabel] = useState("");
  const [meetingDuration, setMeetingDuration] = useState("45");
  const [meetingWindow, setMeetingWindow] = useState("next_week");
  const [suggestions, setSuggestions] = useState<
    { label: string; detail: string }[] | null
  >(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    try {
      setGoogleConnected(localStorage.getItem(LS_GOOGLE) === "1");
      const raw = localStorage.getItem(LS_CALS);
      if (raw) {
        const parsed = JSON.parse(raw) as string[];
        if (Array.isArray(parsed)) setSelectedCals(parsed);
      }
    } catch {
      /* ignore */
    }
  }, []);

  const persistCals = useCallback((ids: string[]) => {
    setSelectedCals(ids);
    try {
      localStorage.setItem(LS_CALS, JSON.stringify(ids));
    } catch {
      /* ignore */
    }
  }, []);

  const connectGoogle = () => {
    setGoogleConnected(true);
    try {
      localStorage.setItem(LS_GOOGLE, "1");
    } catch {
      /* ignore */
    }
  };

  const disconnectGoogle = () => {
    setGoogleConnected(false);
    try {
      localStorage.removeItem(LS_GOOGLE);
    } catch {
      /* ignore */
    }
  };

  const addBlocked = () => {
    if (!blockStart || !blockEnd || !blockLabel.trim()) return;
    setBlocked((b) => [
      ...b,
      {
        id: `b${Date.now()}`,
        start: blockStart,
        end: blockEnd,
        label: blockLabel.trim(),
      },
    ]);
    setBlockStart("");
    setBlockEnd("");
    setBlockLabel("");
  };

  const removeBlocked = (id: string) => {
    setBlocked((b) => b.filter((x) => x.id !== id));
  };

  const runMeetingSuggest = () => {
    setSuggestions([
      {
        label: "Tue Apr 8 · 10:00–10:45",
        detail: "Everyone free except Sarah (tentative)",
      },
      {
        label: "Wed Apr 9 · 14:00–14:45",
        detail: "No conflicts; respects blocked dates",
      },
      {
        label: "Thu Apr 10 · 09:00–09:45",
        detail: "Earliest option before stakeholder review",
      },
    ]);
  };

  const copySuggestion = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div>
      <PageHeader
        title="Calendar & availability"
        description="Connect Google Calendar (read-only for busy times), manual blocked dates, and meeting suggestions."
        action={
          <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-1 shadow-sm">
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Previous week"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <span className="min-w-[10rem] text-center text-sm font-semibold text-slate-800">
              Apr 7 – 13, 2026
            </span>
            <button
              type="button"
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
              aria-label="Next week"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        }
      />

      <div className="mb-6 space-y-4">
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Google Calendar
              </h2>
              <p className="mt-1 max-w-xl text-sm text-slate-600">
                OAuth + read-only access so we can see when you&apos;re busy.
                Event titles stay in Google unless you change policy later.
              </p>
            </div>
            {googleConnected ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-100">
                  Connected (demo)
                </span>
                <button
                  type="button"
                  onClick={disconnectGoogle}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={connectGoogle}
                className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
              >
                <Link2 className="h-4 w-4" strokeWidth={1.75} />
                Connect Google Calendar
              </button>
            )}
          </div>

          {googleConnected ? (
            <div className="mt-5 border-t border-slate-100 pt-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Calendars used for busy time
              </p>
              <ul className="mt-3 space-y-2">
                {mockCalendars.map((c) => (
                  <li key={c.id} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id={`cal-${c.id}`}
                      checked={selectedCals.includes(c.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          persistCals([...selectedCals, c.id]);
                        } else {
                          persistCals(selectedCals.filter((x) => x !== c.id));
                        }
                      }}
                      className="h-4 w-4 rounded border-slate-300 text-[#3B82F6]"
                    />
                    <label
                      htmlFor={`cal-${c.id}`}
                      className="text-sm font-medium text-slate-800"
                    >
                      {c.name}
                      {c.primary ? (
                        <span className="ml-2 text-xs font-normal text-slate-500">
                          primary
                        </span>
                      ) : null}
                    </label>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-slate-500">
                Last synced: demo · replace with real sync timestamp from API.
              </p>
            </div>
          ) : null}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Blocked dates (manual)
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Exams, leave, or anything Google doesn&apos;t know — stored
            separately per PRD.
          </p>
          <ul className="mt-4 space-y-2">
            {blocked.map((b) => (
              <li
                key={b.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/80 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-slate-900">{b.label}</p>
                  <p className="text-xs text-slate-500">
                    {b.start} → {b.end}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => removeBlocked(b.id)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ${b.label}`}
                >
                  <Trash2 className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </li>
            ))}
          </ul>
          <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <input
              type="date"
              value={blockStart}
              onChange={(e) => setBlockStart(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              aria-label="Start date"
            />
            <input
              type="date"
              value={blockEnd}
              onChange={(e) => setBlockEnd(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
              aria-label="End date"
            />
            <input
              type="text"
              value={blockLabel}
              onChange={(e) => setBlockLabel(e.target.value)}
              placeholder="Reason (e.g. PTO)"
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm sm:col-span-2 lg:col-span-1"
            />
            <button
              type="button"
              onClick={addBlocked}
              className="inline-flex items-center justify-center gap-1 rounded-xl bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
            >
              <Plus className="h-4 w-4" strokeWidth={1.75} />
              Add range
            </button>
          </div>
          <p className="mt-3 text-xs text-slate-500">
            Working hours and task cap live on{" "}
            <Link href="/dashboard/profile" className="font-medium text-[#3B82F6] hover:underline">
              Profile
            </Link>
            .
          </p>
        </section>

        {role === "lead" ? (
          <section className="rounded-2xl border border-indigo-100 bg-indigo-50/40 p-5 shadow-sm sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <CalIcon className="h-5 w-5 text-indigo-600" strokeWidth={1.75} />
              <h2 className="text-lg font-semibold text-slate-900">
                Meeting suggestions (MVP)
              </h2>
              <span className="rounded-full bg-white px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-700 ring-1 ring-indigo-100">
                Suggest only
              </span>
            </div>
            <p className="mt-1 text-sm text-slate-600">
              PRD: AI proposes 2–3 slots; no calendar invites sent yet — copy
              and share manually.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <label className="flex flex-col text-xs font-medium text-slate-500">
                Duration (min)
                <select
                  value={meetingDuration}
                  onChange={(e) => setMeetingDuration(e.target.value)}
                  className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="30">30</option>
                  <option value="45">45</option>
                  <option value="60">60</option>
                </select>
              </label>
              <label className="flex flex-col text-xs font-medium text-slate-500">
                Rough window
                <select
                  value={meetingWindow}
                  onChange={(e) => setMeetingWindow(e.target.value)}
                  className="mt-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900"
                >
                  <option value="this_week">This week</option>
                  <option value="next_week">Next week</option>
                  <option value="two_weeks">Next two weeks</option>
                </select>
              </label>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={runMeetingSuggest}
                  className="rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-700"
                >
                  Suggest slots (demo)
                </button>
              </div>
            </div>
            {suggestions ? (
              <ul className="mt-4 space-y-3">
                {suggestions.map((s) => (
                  <li
                    key={s.label}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white bg-white/90 px-4 py-3 shadow-sm"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{s.label}</p>
                      <p className="text-xs text-slate-500">{s.detail}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => copySuggestion(s.label)}
                      className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy
                    </button>
                  </li>
                ))}
              </ul>
            ) : null}
            {copied ? (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                Copied to clipboard
              </p>
            ) : null}
          </section>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:col-span-2">
          <div className="grid grid-cols-7 gap-px rounded-xl bg-slate-200 ring-1 ring-slate-200">
            {weekDays.map((d) => (
              <div
                key={d}
                className="bg-slate-50 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500"
              >
                {d}
              </div>
            ))}
            {dates.map((n, i) => {
              const highlight = n === 9;
              return (
                <div
                  key={n}
                  className={`min-h-[5.5rem] bg-white p-2 text-sm ${
                    i >= 5 ? "bg-slate-50/80" : ""
                  }`}
                >
                  <span
                    className={`inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium ${
                      highlight
                        ? "bg-[#3B82F6] text-white"
                        : "text-slate-700"
                    }`}
                  >
                    {n}
                  </span>
                  {n === 9 ? (
                    <p className="mt-2 truncate rounded-lg bg-sky-50 px-1.5 py-1 text-[10px] font-medium text-sky-900 ring-1 ring-sky-100">
                      10:00 Design sync
                    </p>
                  ) : null}
                  {n === 10 ? (
                    <p className="mt-2 truncate rounded-lg bg-violet-50 px-1.5 py-1 text-[10px] font-medium text-violet-900 ring-1 ring-violet-100">
                      2:00 Sprint planning
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <aside className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Upcoming</h2>
          <ul className="mt-4 space-y-4">
            {events.map((e) => (
              <li key={`${e.title}-${e.time}`} className="flex gap-3">
                <span
                  className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${
                    e.type === "meet"
                      ? "bg-[#3B82F6]/10 text-[#3B82F6]"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {e.type === "meet" ? (
                    <Video className="h-4 w-4" strokeWidth={1.75} />
                  ) : (
                    <span className="text-xs font-bold">FB</span>
                  )}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-slate-900">{e.title}</p>
                  <p className="text-xs text-slate-500">
                    {e.day} · {e.time}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-400">
                    {e.project}
                  </p>
                </div>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  );
}
