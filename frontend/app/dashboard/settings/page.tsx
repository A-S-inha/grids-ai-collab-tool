import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { PageHeader } from "@/components/dashboard/PageHeader";
import { SettingsIntegrations } from "@/components/dashboard/SettingsIntegrations";

function ToggleRow({
  title,
  description,
  defaultOn,
}: {
  title: string;
  description: string;
  defaultOn?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-4">
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={defaultOn ?? false}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${
          defaultOn ? "bg-[#3B82F6]" : "bg-slate-200"
        }`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${
            defaultOn ? "left-5" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

function LinkRow({ title, hint }: { title: string; hint: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-4 py-4 text-left hover:opacity-90"
    >
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="mt-0.5 text-sm text-slate-500">{hint}</p>
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 text-slate-400" />
    </button>
  );
}

export default function SettingsPage() {
  return (
    <div>
      <PageHeader
        title="Settings"
        description="Integrations, notifications, and workspace (wire to API when ready)."
      />

      <div className="space-y-6">
        <SettingsIntegrations />

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Profile & availability
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            Name, skills, working hours, and task cap live on the profile page.
          </p>
          <Link
            href="/dashboard/profile"
            className="mt-4 inline-flex rounded-xl bg-[#3B82F6] px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-600"
          >
            Open profile
          </Link>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-6 shadow-sm">
          <h2 className="border-b border-slate-100 pt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Notifications
          </h2>
          <ToggleRow
            title="Task assignments"
            description="Email when someone assigns you a task."
            defaultOn
          />
          <ToggleRow
            title="Project invites"
            description="Alerts for new workspace invitations."
            defaultOn
          />
          <ToggleRow
            title="AI suggestions"
            description="Digest of AI-recommended next steps."
          />
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white px-6 pb-2 shadow-sm">
          <h2 className="border-b border-slate-100 pt-6 text-sm font-semibold uppercase tracking-wide text-slate-500">
            Workspace
          </h2>
          <LinkRow title="Manage members" hint="Roles, seats, and invites" />
          <LinkRow title="Billing" hint="Plan, invoices, payment method" />
          <LinkRow title="Security" hint="SSO, audit log (coming soon)" />
        </section>
      </div>
    </div>
  );
}
