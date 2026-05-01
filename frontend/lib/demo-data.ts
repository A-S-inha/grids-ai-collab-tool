export type ProjectTaskStatus =
  | "pending"
  | "assigned"
  | "awaiting_accept"
  | "accepted"
  | "declined"
  | "reassigned"
  | "synced_github";

export type TaskPriority = "low" | "medium" | "high" | "critical";

export type DemoProjectTask = {
  id: string;
  title: string;
  description: string;
  skills: string[];
  estHours: number;
  priority: TaskPriority;
  due: string;
  status: ProjectTaskStatus;
  assignee: string | null;
};

export type DemoProject = {
  id: string;
  name: string;
  role: "Lead" | "Member";
  members: number;
  due: string;
  color: string;
  tasks: DemoProjectTask[];
};

export const demoProjects: DemoProject[] = [
  {
    id: "ai-colab-tool",
    name: "AI Colab Tool",
    role: "Lead",
    members: 8,
    due: "May 15",
    color: "from-[#FFC72C] to-[#990000]",
    tasks: [
      {
        id: "t1",
        title: "OAuth Google Calendar flow",
        description: "Read-only scopes, token storage, reconnect UX.",
        skills: ["Backend", "Security"],
        estHours: 8,
        priority: "high",
        due: "Apr 28, 2026",
        status: "awaiting_accept",
        assignee: "Ahmed K.",
      },
      {
        id: "t2",
        title: "Assignment review UI",
        description: "Lead can override AI suggestions before broadcast.",
        skills: ["Frontend", "UX"],
        estHours: 5,
        priority: "medium",
        due: "May 2, 2026",
        status: "assigned",
        assignee: "Sarah M.",
      },
      {
        id: "t3",
        title: "GitHub issue sync",
        description: "On accept, create issue with task body.",
        skills: ["Backend", "APIs"],
        estHours: 6,
        priority: "critical",
        due: "Apr 22, 2026",
        status: "synced_github",
        assignee: "John L.",
      },
    ],
  },
  {
    id: "website-redesign",
    name: "Website Redesign",
    role: "Member",
    members: 4,
    due: "Jun 2",
    color: "from-[#b91c1c] to-[#7f1d1d]",
    tasks: [
      {
        id: "t4",
        title: "Hero illustrations",
        description: "Marketing hero assets for launch.",
        skills: ["Design", "Figma"],
        estHours: 4,
        priority: "medium",
        due: "May 10, 2026",
        status: "pending",
        assignee: null,
      },
    ],
  },
  {
    id: "mobile-app-sprint",
    name: "Mobile App Sprint",
    role: "Lead",
    members: 6,
    due: "Apr 30",
    color: "from-[#ea580c] to-[#991b1b]",
    tasks: [
      {
        id: "t5",
        title: "Fix authentication bug",
        description: "Session refresh loop on iOS.",
        skills: ["Mobile", "Auth"],
        estHours: 3,
        priority: "critical",
        due: "Apr 20, 2026",
        status: "declined",
        assignee: null,
      },
    ],
  },
  {
    id: "project-x",
    name: "Project X",
    role: "Member",
    members: 11,
    due: "Jul 1",
    color: "from-[#fbbf24] to-[#7f1d1d]",
    tasks: [
      {
        id: "t6",
        title: "API documentation",
        description: "OpenAPI spec + examples.",
        skills: ["Documentation", "APIs"],
        estHours: 10,
        priority: "low",
        due: "Jun 15, 2026",
        status: "accepted",
        assignee: "You",
      },
    ],
  },
];

export function getDemoProject(projectId: string): DemoProject | undefined {
  return demoProjects.find((p) => p.id === projectId);
}
