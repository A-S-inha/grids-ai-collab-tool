import { CalendarDays, FolderKanban, Users } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { demoProjects } from "@/lib/demo-data";

function RoleBadge({ role }: { role: "Lead" | "Member" }) {
  return (
    <span
      className={`rounded-lg px-2 py-0.5 text-xs font-semibold ${
        role === "Lead"
          ? "bg-blue-100 text-blue-700"
          : "bg-sky-100 text-sky-700"
      }`}
    >
      {role}
    </span>
  );
}

export default function ProjectsPage() {
  return (
    <div>
      <PageHeader
        title="Projects"
        description="Leads create tasks with skills, hours, and due dates — then run AI assignment."
        action={
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-xl bg-[#3B82F6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
          >
            + New project
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2">
        {demoProjects.map((p) => (
          <Link
            key={p.id}
            href={`/dashboard/projects/${p.id}`}
            className="block rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${p.color} text-white shadow-md`}
              >
                <FolderKanban className="h-6 w-6" strokeWidth={1.75} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-slate-900">{p.name}</h2>
                <RoleBadge role={p.role} />
              </div>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1.5">
                <Users className="h-4 w-4" strokeWidth={1.75} />
                {p.members} members
              </span>
              <span>{p.tasks.length} tasks in board</span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <CalendarDays className="h-4 w-4 text-[#3B82F6]" strokeWidth={1.75} />
                Due {p.due}
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
