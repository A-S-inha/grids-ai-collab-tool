import {
  Bot,
  ChevronRight,
  Mail,
  RefreshCw,
  Users,
  XCircle,
  ArrowLeftRight,
} from "lucide-react";

function RoleBadge({ role }: { role: "Lead" | "Member" }) {
  const styles =
    role === "Lead"
      ? "bg-red-100 text-red-800"
      : "bg-amber-100 text-amber-800";
  return (
    <span
      className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${styles}`}
    >
      {role}
    </span>
  );
}

export function BottomSection() {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      <div className="space-y-6 lg:col-span-2">
        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-slate-900">
            Project management
          </h2>
          <ul className="divide-y divide-slate-100">
            <li className="flex flex-wrap items-center gap-3 py-3 first:pt-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">AI Collab Tool</p>
              </div>
              <RoleBadge role="Lead" />
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </li>
            <li className="flex flex-wrap items-center gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  Design Landing Page UI
                </p>
              </div>
              <button
                type="button"
                className="rounded-xl bg-emerald-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-600"
              >
                Accept
              </button>
              <button
                type="button"
                className="rounded-xl border-2 border-red-500 px-3 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50"
              >
                Reject
              </button>
            </li>
            <li className="flex flex-wrap items-center gap-3 py-3 last:pb-0">
              <div className="min-w-0 flex-1">
                <p className="font-medium text-slate-900">
                  Fix Authentication Bug
                </p>
              </div>
            </li>
          </ul>
        </section>

        <div className="grid gap-4 sm:grid-cols-2">
          {[
            {
              title: "AI Collab Tool",
              role: "Lead" as const,
              members: 8,
              tasks: 16,
              due: "May 15",
            },
            {
              title: "Website Redesign",
              role: "Member" as const,
              members: 4,
              tasks: 9,
              due: "Jun 2",
            },
          ].map((p) => (
            <div
              key={p.title}
              className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <div className="mb-3 flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
                    <Users className="h-5 w-5" strokeWidth={1.75} />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">{p.title}</p>
                    <RoleBadge role={p.role} />
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500">
                <span className="flex items-center gap-1">
                  <Users className="h-4 w-4" />
                  {p.members}
                </span>
                <span>{p.tasks} Tasks</span>
                <span className="flex items-center gap-1 text-slate-700">
                  <RefreshCw className="h-4 w-4 text-[#990000]" />
                  {p.due}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <aside className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-slate-900">
          Recent Activity
        </h2>
        <ul className="space-y-5">
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-800">
              <Mail className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Sarah invited you to join Project X
              </p>
              <p className="mt-0.5 text-xs text-slate-500">5 minutes ago</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
              <XCircle className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">
                Ahmed rejected UI Design…
              </p>
              <p className="mt-0.5 text-xs text-slate-500">1 hour ago</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
              <ArrowLeftRight className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">
                John suggested swap…
              </p>
              <p className="mt-0.5 text-xs text-slate-500">3 hours ago</p>
            </div>
          </li>
          <li className="flex gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-amber-800">
              <Bot className="h-5 w-5" strokeWidth={1.75} />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-900">
                AI suggested your AI Term…
              </p>
              <p className="mt-0.5 text-xs text-slate-500">1 day ago</p>
            </div>
          </li>
        </ul>
      </aside>
    </div>
  );
}
