import {
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  FileText,
} from "lucide-react";

function Avatar({ label }: { label: string }) {
  return (
    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-medium text-slate-600">
      {label}
    </span>
  );
}

export function MyTasksSection() {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">My Tasks</h2>
        <a
          href="#"
          className="text-sm font-medium text-[#990000] hover:underline"
        >
          View All &gt;
        </a>
      </div>
      <ul className="divide-y divide-slate-100">
        <li className="flex flex-wrap items-center gap-3 py-4 first:pt-0">
          <CheckCircle2
            className="h-5 w-5 shrink-0 text-emerald-500"
            strokeWidth={1.75}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">Review API Documentation</p>
            <p className="text-sm text-slate-500">Project X</p>
          </div>
          <span className="text-sm text-slate-500">Apr 24</span>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Due Today
          </span>
          <Avatar label="S" />
          <ChevronRight className="h-5 w-5 text-slate-300" />
        </li>
        <li className="flex flex-wrap items-center gap-3 py-4">
          <FileText
            className="h-5 w-5 shrink-0 text-amber-500"
            strokeWidth={1.75}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">Design Landing Page UI</p>
            <p className="text-sm text-slate-500">AI Collab Tool</p>
          </div>
          <span className="text-sm text-slate-500">Apr 26</span>
          <div className="flex gap-2">
            <button
              type="button"
              className="rounded-xl bg-emerald-500 px-4 py-1.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600"
            >
              Accept
            </button>
            <button
              type="button"
              className="rounded-xl border-2 border-red-500 px-4 py-1.5 text-sm font-semibold text-red-600 hover:bg-red-50"
            >
              Reject
            </button>
          </div>
        </li>
        <li className="flex flex-wrap items-center gap-3 py-4 last:pb-0">
          <AlertCircle
            className="h-5 w-5 shrink-0 text-red-500"
            strokeWidth={1.75}
          />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-slate-900">Fix Authentication Bug</p>
            <p className="text-sm text-slate-500">Mobile App Sprint</p>
          </div>
          <span className="text-sm text-slate-500">Apr 20</span>
          <span className="rounded-full bg-red-500 px-3 py-1 text-xs font-semibold text-white">
            Overdue
          </span>
        </li>
      </ul>
    </section>
  );
}
