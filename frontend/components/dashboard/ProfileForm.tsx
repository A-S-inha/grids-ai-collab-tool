"use client";

import { Plus, X } from "lucide-react";
import Link from "next/link";
import { type FormEvent, useState } from "react";

const initialSkills = [
  "Project management",
  "Agile",
  "Documentation",
  "Stakeholder communication",
];

const PRESET_SKILLS = [
  "Frontend",
  "Backend",
  "Design / Figma",
  "APIs",
  "Mobile",
  "Data / ML",
  "Technical writing",
  "Security",
] as const;

const WEEKDAYS = [
  { id: "mon", label: "Mon" },
  { id: "tue", label: "Tue" },
  { id: "wed", label: "Wed" },
  { id: "thu", label: "Thu" },
  { id: "fri", label: "Fri" },
  { id: "sat", label: "Sat" },
  { id: "sun", label: "Sun" },
] as const;

export function ProfileForm() {
  const [name, setName] = useState("Ayesha");
  const [jobRole, setJobRole] = useState("Project Lead");
  const [skills, setSkills] = useState<string[]>(initialSkills);
  const [skillDraft, setSkillDraft] = useState("");
  const [savedFlash, setSavedFlash] = useState(false);
  const [maxTasks, setMaxTasks] = useState(3);
  const [timezone, setTimezone] = useState("America/New_York");
  const [workStart, setWorkStart] = useState("09:00");
  const [workEnd, setWorkEnd] = useState("17:00");
  const [workDays, setWorkDays] = useState<string[]>([
    "mon",
    "tue",
    "wed",
    "thu",
    "fri",
  ]);

  function toggleWorkDay(id: string) {
    setWorkDays((d) =>
      d.includes(id) ? d.filter((x) => x !== id) : [...d, id].sort(byWeekOrder),
    );
  }

  function byWeekOrder(a: string, b: string) {
    return (
      WEEKDAYS.findIndex((x) => x.id === a) -
      WEEKDAYS.findIndex((x) => x.id === b)
    );
  }

  function addSkill() {
    const next = skillDraft.trim();
    if (!next || skills.some((s) => s.toLowerCase() === next.toLowerCase())) {
      setSkillDraft("");
      return;
    }
    setSkills((s) => [...s, next]);
    setSkillDraft("");
  }

  function addPresetSkill(s: string) {
    if (skills.some((x) => x.toLowerCase() === s.toLowerCase())) return;
    setSkills((prev) => [...prev, s]);
  }

  function removeSkill(index: number) {
    setSkills((s) => s.filter((_, i) => i !== index));
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    setSavedFlash(true);
    window.setTimeout(() => setSavedFlash(false), 2000);
  }

  return (
    <form onSubmit={handleSave} className="space-y-8">
      <section className="rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm sm:p-6">
        <h2 className="text-sm font-semibold text-slate-900">
          Calendar & blocked time
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Connect Google Calendar and add manual blocked dates so assignment
          skips busy periods.
        </p>
        <Link
          href="/dashboard/calendar"
          className="mt-3 inline-flex text-sm font-semibold text-[#990000] hover:underline"
        >
          Manage calendar & availability →
        </Link>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Name & role
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          How you appear to teammates and in AI assignment inputs.
        </p>
        <div className="mt-4 grid gap-4 sm:max-w-2xl sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Full name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
              autoComplete="name"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-slate-500">Role</span>
            <input
              type="text"
              value={jobRole}
              onChange={(e) => setJobRole(e.target.value)}
              placeholder="e.g. Engineer, PM"
              className="mt-1 w-full rounded-xl border border-slate-200 px-4 py-3 text-base text-slate-900 shadow-sm outline-none transition focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
            />
          </label>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Skills
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Preset tags plus free text — used for hard filters before AI
          assignment.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {PRESET_SKILLS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => addPresetSkill(s)}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700 transition hover:border-[#990000]/40 hover:bg-amber-50/80"
            >
              + {s}
            </button>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {skills.map((skill, i) => (
            <span
              key={`${skill}-${i}`}
              className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-3 py-1 text-sm font-medium text-amber-950 ring-1 ring-amber-100"
            >
              {skill}
              <button
                type="button"
                onClick={() => removeSkill(i)}
                className="ml-0.5 rounded-full p-0.5 text-amber-800 transition hover:bg-amber-200/60 hover:text-amber-950"
                aria-label={`Remove ${skill}`}
              >
                <X className="h-3.5 w-3.5" strokeWidth={2.5} />
              </button>
            </span>
          ))}
        </div>
        <div className="mt-4 flex max-w-md flex-col gap-2 sm:flex-row sm:items-center">
          <input
            type="text"
            value={skillDraft}
            onChange={(e) => setSkillDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSkill();
              }
            }}
            placeholder="Add custom skill"
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-900 shadow-sm outline-none focus:border-[#990000] focus:ring-2 focus:ring-[#990000]/20"
          />
          <button
            type="button"
            onClick={addSkill}
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" strokeWidth={2} />
            Add
          </button>
        </div>
      </section>

      <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Availability
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          Working hours and concurrent task cap (PRD §3.2). Uses your timezone
          for interpreting calendar blocks.
        </p>
        <label className="mt-4 block max-w-md">
          <span className="text-xs font-medium text-slate-500">Timezone</span>
          <select
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm"
          >
            <option value="America/New_York">Eastern (US)</option>
            <option value="America/Chicago">Central (US)</option>
            <option value="America/Denver">Mountain (US)</option>
            <option value="America/Los_Angeles">Pacific (US)</option>
            <option value="Europe/London">London</option>
            <option value="Asia/Dubai">Dubai</option>
          </select>
        </label>
        <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-slate-500">
          Working days
        </p>
        <div className="mt-2 flex flex-wrap gap-2">
          {WEEKDAYS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => toggleWorkDay(d.id)}
              className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${
                workDays.includes(d.id)
                  ? "bg-[#990000] text-white shadow-sm"
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200"
              }`}
            >
              {d.label}
            </button>
          ))}
        </div>
        <div className="mt-4 flex max-w-md flex-wrap gap-4">
          <label className="flex flex-col text-xs font-medium text-slate-500">
            Start
            <input
              type="time"
              value={workStart}
              onChange={(e) => setWorkStart(e.target.value)}
              className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
          <label className="flex flex-col text-xs font-medium text-slate-500">
            End
            <input
              type="time"
              value={workEnd}
              onChange={(e) => setWorkEnd(e.target.value)}
              className="mt-1 rounded-xl border border-slate-200 px-3 py-2 text-sm"
            />
          </label>
        </div>
        <label className="mt-6 block max-w-xs">
          <span className="text-xs font-medium text-slate-500">
            Max concurrent tasks you&apos;ll take
          </span>
          <input
            type="number"
            min={1}
            max={20}
            value={maxTasks}
            onChange={(e) => setMaxTasks(Number(e.target.value) || 1)}
            className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm text-slate-900 shadow-sm"
          />
        </label>
      </section>

      <div className="flex flex-wrap items-center gap-3">
        <button
          type="submit"
          className="rounded-xl bg-[#990000] px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7a0000]"
        >
          Save changes
        </button>
        {savedFlash ? (
          <span className="text-sm font-medium text-emerald-600">
            Profile updated (demo — not persisted)
          </span>
        ) : null}
      </div>
    </form>
  );
}
