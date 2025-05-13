import {
  LayoutGrid,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  GraduationCap,
  Bell,
  Flag,
  Layers,
  Tag,
  Settings,
  ListTodo,
  School,
  CreditCard
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";


type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: LucideIcon;
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};
export function getMenuList(pathname: string): Group[] {
  const { user } = useAuth();
  console.log("user", user);

  if (!user) return [];

  const commonMenus: Group[] = [
    {
      groupLabel: "Overview",
      menus: [
        {
          href: "/manage/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: [],
        },
      ],
    },
  ];

  const adminMenus: Group[] = [
    {
      groupLabel: "User Management",
      menus: [
        {
          href: "/manage/users",
          label: "Users",
          icon: Users,
          submenus: [],
        },
        {
          href: "/manage/enrollments",
          label: "Enrollments",
          icon: GraduationCap,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Academic Content",
      menus: [
        {
          href: "/manage/classes",
          label: "Classes",
          icon: ClipboardList,
          submenus: [],
        },
        {
          href: "/manage/subjects",
          label: "Subjects",
          icon: BookOpen,
          submenus: [],
        },
        {
          href: "/manage/chapters",
          label: "Chapters",
          icon: BookOpen,
          submenus: [],
        },
        {
          href: "/manage/lectures",
          label: "Lectures",
          icon: BookOpen,
          submenus: [],
        },
        {
          href: "/manage/study-plans",
          label: "Study Plans",
          icon: ListTodo,
          submenus: [],
        },
        {
          href: "/manage/content-versions",
          label: "Content Versions",
          icon: Layers,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Assessments",
      menus: [
        {
          href: "/manage/assessments-management",
          label: "Assessments",
          icon: ClipboardList,
          submenus: [],
        },
        {
          href: "/manage/questions",
          label: "Questions",
          icon: FileText,
          submenus: [],
        },
        {
          href: "/manage/assessment-templates",
          label: "Assessment Templates",
          icon: FileText,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Attributes & Types",
      menus: [
        {
          href: "/manage/attributes",
          label: "Attributes",
          icon: Tag,
          submenus: [],
        },
        {
          href: "/manage/attribute-types",
          label: "Attribute Types",
          icon: Tag,
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "System Settings",
      menus: [
        {
          href: "/admin/settings",
          label: "System Settings",
          icon: Settings,
          submenus: [],
        },
        {
          href: "#",
          label: "Notifications",
          icon: Bell,
          submenus: [],
        },
        {
          href: "#",
          label: "Payments",
          icon: CreditCard,
          submenus: [],
        },
      ],
    },
  ];

  const guardianMenus: Group[] = [
    {
      groupLabel: "Guardian",
      menus: [
        {
          href: "/child-list",
          label: "My children",
          icon: School,
          submenus: [],
        },
        {
          href: "/guardian/attendance",
          label: "Attendance",
          icon: ClipboardList,
          submenus: [],
        },
      ],
    },
  ];

  // Return menu based on user.type
  switch (user.type) {
    case "admin":
      return [...commonMenus, ...adminMenus];
    case "guardian":
      return [...commonMenus, ...guardianMenus];
    default:
      return commonMenus;
  }
}
