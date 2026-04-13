import { ChevronRight, FileText, FolderOpen, Lock } from "lucide-react";

const cards = [
  {
    title: "Open Tasks",
    subtitle: "3 Due Soon",
    icon: FileText,
    bg: "bg-sky-100",
    iconColor: "text-sky-600",
  },
  {
    title: "Pending Invites",
    subtitle: "2 Awaiting Response",
    icon: Lock,
    bg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    title: "Your Projects",
    subtitle: "2 Lead (1 Lead, 1 Member)",
    icon: FolderOpen,
    bg: "bg-emerald-100",
    iconColor: "text-emerald-600",
    trailing: true,
  },
] as const;

export function SummaryCards() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((c) => {
        const Icon = c.icon;
        return (
          <div
            key={c.title}
            className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-xl ${c.bg}`}
            >
              <Icon className={`h-6 w-6 ${c.iconColor}`} strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-slate-500">{c.title}</p>
              <p className="mt-0.5 text-sm font-semibold text-slate-900">
                {c.subtitle}
              </p>
            </div>
            {"trailing" in c && c.trailing && (
              <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
            )}
          </div>
        );
      })}
    </div>
  );
}
