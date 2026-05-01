"use client";

import Link from "next/link";
import {
  useParams,
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { Suspense, useState } from "react";
import { ArrowLeft, X } from "lucide-react";
import { ProjectDetailView } from "@/components/dashboard/ProjectDetailView";
import { getDemoProject } from "@/lib/demo-data";
import {
  getUserProject,
  saveUserProject,
  type UserProject,
} from "@/lib/user-projects";

function normalizeProjectId(
  raw: string | string[] | undefined,
): string {
  if (typeof raw === "string") return raw;
  if (Array.isArray(raw)) return raw[0] ?? "";
  return "";
}

function InviteOutcomeBanner() {
  const search = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const invited = search.get("invited");
  const inviteFail = search.get("inviteFail");
  const inviteError = search.get("inviteError");

  if (inviteError === "1") {
    return (
      <div className="mb-4 flex items-start justify-between gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <p>
          <span className="font-semibold">Invites not sent.</span> Configure{" "}
          <code className="rounded bg-amber-100/80 px-1">NEXT_PUBLIC_SUPABASE_URL</code>{" "}
          and{" "}
          <code className="rounded bg-amber-100/80 px-1">
            SUPABASE_SERVICE_ROLE_KEY
          </code>{" "}
          (see <code className="rounded bg-amber-100/80 px-1">.env.example</code>
          ), then enable email under Supabase Authentication → Emails.
        </p>
        <button
          type="button"
          onClick={() => router.replace(pathname)}
          className="shrink-0 rounded-lg p-1 text-amber-800 hover:bg-amber-100"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" strokeWidth={1.75} />
        </button>
      </div>
    );
  }

  if (invited === null) return null;

  const sent = parseInt(invited, 10);
  const failed = parseInt(inviteFail ?? "0", 10);
  if (Number.isNaN(sent) && Number.isNaN(failed)) return null;

  return (
    <div
      className={`mb-4 flex items-start justify-between gap-3 rounded-xl border px-4 py-3 text-sm ${
        failed > 0
          ? "border-amber-200 bg-amber-50 text-amber-950"
          : "border-emerald-200 bg-emerald-50 text-emerald-950"
      }`}
    >
      <p>
        <span className="font-semibold">Supabase invites:</span>{" "}
        {Number.isFinite(sent) ? sent : 0} email
        {(Number.isFinite(sent) ? sent : 0) === 1 ? "" : "s"} sent
        {Number.isFinite(failed) && failed > 0
          ? `, ${failed} could not be sent (check Supabase logs or whether those users already exist).`
          : "."}
      </p>
      <button
        type="button"
        onClick={() => router.replace(pathname)}
        className={`shrink-0 rounded-lg p-1 hover:bg-black/5 ${
          failed > 0 ? "text-amber-900" : "text-emerald-900"
        }`}
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" strokeWidth={1.75} />
      </button>
    </div>
  );
}

/** Remount when the URL changes so local state matches the new project id. */
export function ProjectDetailPageClient() {
  const pathname = usePathname();
  return (
    <>
      <Suspense fallback={null}>
        <InviteOutcomeBanner />
      </Suspense>
      <ProjectDetailPageInner key={pathname} />
    </>
  );
}

function ProjectDetailPageInner() {
  const params = useParams();
  const projectId = normalizeProjectId(
    params?.projectId as string | string[] | undefined,
  );

  const [userProj, setUserProj] = useState<UserProject | null>(() => {
    if (typeof window === "undefined" || !projectId) return null;
    if (getDemoProject(projectId)) return null;
    return getUserProject(projectId) ?? null;
  });

  if (!projectId) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-lg font-semibold text-slate-900">Invalid project</p>
        <Link
          href="/dashboard/projects"
          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#990000] hover:underline"
        >
          <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
          Back to projects
        </Link>
      </div>
    );
  }

  const demo = getDemoProject(projectId);

  if (demo) {
    return (
      <ProjectDetailView
        key={demo.id}
        mode="demo"
        projectId={demo.id}
        name={demo.name}
        isLead={demo.role === "Lead"}
        members={demo.members}
        milestoneDue={demo.due}
        initialTasks={demo.tasks}
      />
    );
  }

  if (userProj) {
    return (
      <ProjectDetailView
        key={userProj.id}
        mode="user"
        userProject={userProj}
        onUserProjectChange={(next) => {
          saveUserProject(next);
          setUserProj(next);
        }}
      />
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
      <p className="text-lg font-semibold text-slate-900">Project not found</p>
      <p className="mt-2 text-sm text-slate-600">
        It may have been removed from this browser&apos;s storage.
      </p>
      <Link
        href="/dashboard/projects"
        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#990000] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" strokeWidth={1.75} />
        Back to projects
      </Link>
    </div>
  );
}
