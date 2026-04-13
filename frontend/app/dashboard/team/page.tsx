"use client";

import { Calendar, Mail, MoreHorizontal, UserPlus, X } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { PageHeader } from "@/components/dashboard/PageHeader";

const LS_GOOGLE = "ai-colab-google-calendar-connected";

const members = [
  {
    name: "Sarah M.",
    role: "Project Manager",
    email: "sarah@example.com",
    initials: "SM",
    gradient: "from-rose-400 to-orange-400",
    status: "online" as const,
    calendar: true,
  },
  {
    name: "Ahmed K.",
    role: "Engineer",
    email: "ahmed@example.com",
    initials: "AK",
    gradient: "from-cyan-400 to-blue-500",
    status: "away" as const,
    calendar: true,
  },
  {
    name: "John L.",
    role: "Designer",
    email: "john@example.com",
    initials: "JL",
    gradient: "from-violet-400 to-purple-500",
    status: "online" as const,
    calendar: false,
  },
  {
    name: "You",
    role: "Lead · AI Colab Tool",
    email: "ayesha@example.com",
    initials: "A",
    gradient: "from-indigo-400 to-fuchsia-500",
    status: "online" as const,
    highlight: true,
    calendar: true,
  },
];

const pendingInvites = [
  {
    email: "jamie@university.edu",
    sent: "2 days ago",
    project: "AI Colab Tool",
  },
  {
    email: "river@example.com",
    sent: "5 hours ago",
    project: "Mobile App Sprint",
  },
];

export default function TeamPage() {
  const [youCalendar, setYouCalendar] = useState(false);

  useEffect(() => {
    const read = () => {
      try {
        setYouCalendar(localStorage.getItem(LS_GOOGLE) === "1");
      } catch {
        /* ignore */
      }
    };
    read();
    const onVis = () => {
      if (document.visibilityState === "visible") read();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, []);

  return (
    <div>
      <PageHeader
        title="Team"
        description="Invites, roster, and calendar connection status."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
          >
            <UserPlus className="h-4 w-4" strokeWidth={1.75} />
            Invite
          </button>
        }
      />

      <section className="mb-6 rounded-2xl border border-amber-100 bg-amber-50/50 p-5 shadow-sm">
        <h2 className="text-sm font-semibold text-amber-950">Pending invites</h2>
        <ul className="mt-4 space-y-2">
          {pendingInvites.map((inv) => (
            <li
              key={inv.email}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100/80 bg-white/90 px-4 py-3"
            >
              <div>
                <p className="font-medium text-slate-900">{inv.email}</p>
                <p className="text-xs text-slate-500">
                  {inv.project} · sent {inv.sent}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Resend
                </button>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600"
                  aria-label="Revoke invite"
                >
                  <X className="h-4 w-4" strokeWidth={1.75} />
                </button>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
        <ul className="divide-y divide-slate-100">
          {members.map((m) => {
            const calOk =
              "highlight" in m && m.highlight ? youCalendar : m.calendar;
            return (
              <li
                key={m.email}
                className={`flex flex-wrap items-center gap-4 px-5 py-4 ${
                  "highlight" in m && m.highlight ? "bg-sky-50/50" : ""
                }`}
              >
                <div className="relative">
                  <span
                    className={`flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br ${m.gradient} text-sm font-bold text-white shadow-md ring-2 ring-white`}
                  >
                    {m.initials}
                  </span>
                  <span
                    className={`absolute bottom-0 right-0 h-3 w-3 rounded-full ring-2 ring-white ${
                      m.status === "online" ? "bg-emerald-500" : "bg-amber-400"
                    }`}
                    title={m.status}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-900">{m.name}</p>
                  <p className="text-sm text-slate-500">{m.role}</p>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                    calOk
                      ? "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-100"
                      : "bg-amber-50 text-amber-900 ring-1 ring-amber-100"
                  }`}
                >
                  <Calendar className="h-3 w-3" strokeWidth={1.75} />
                  {calOk ? "Calendar OK" : "No calendar"}
                </span>
                <a
                  href={`mailto:${m.email}`}
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-[#3B82F6] hover:underline"
                >
                  <Mail className="h-4 w-4" strokeWidth={1.75} />
                  Message
                </a>
                <button
                  type="button"
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                  aria-label="More"
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <p className="mt-4 text-center text-xs text-slate-500">
        Your calendar status refreshes when you return to this tab.{" "}
        <Link href="/dashboard/calendar" className="text-[#3B82F6] hover:underline">
          Calendar settings
        </Link>
      </p>
    </div>
  );
}
