import {
  LayoutGrid,
  Users,
  BookOpen,
  ClipboardList,
  FileText,
  Bell,
  Calendar,
  MessageSquare,
  TrendingUp,
  Target,
  Settings,
  User,
  BarChart3,
  UserCheck,
  Clock,
  Star,
} from "lucide-react";
import { LucideIcon } from "lucide-react";

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

export function getGuardianMenuList(pathname: string): Group[] {
  // Determine active menu based on current pathname
  const isActive = (href: string) => pathname.startsWith(href);

  return [
    {
      groupLabel: "Overview",
      menus: [
        {
          href: "/guardian/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          active: isActive("/guardian/dashboard"),
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Children Management",
      menus: [
        {
          href: "/guardian/children",
          label: "My Children",
          icon: Users,
          active: isActive("/guardian/children"),
          submenus: [],
        },
        {
          href: "/guardian/children/progress",
          label: "Progress Overview",
          icon: TrendingUp,
          active: isActive("/guardian/children/progress"),
          submenus: [],
        },
        {
          href: "/guardian/children/attendance",
          label: "Attendance",
          icon: UserCheck,
          active: isActive("/guardian/children/attendance"),
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Academic Progress",
      menus: [
        {
          href: "/guardian/subjects",
          label: "Subjects",
          icon: BookOpen,
          active: isActive("/guardian/subjects"),
          submenus: [],
        },
        {
          href: "/guardian/assessments",
          label: "Assessments",
          icon: ClipboardList,
          active: isActive("/guardian/assessments"),
          submenus: [],
        },
        {
          href: "/guardian/grades",
          label: "Grades & Reports",
          icon: BarChart3,
          active: isActive("/guardian/grades"),
          submenus: [],
        },
        {
          href: "/guardian/homework",
          label: "Homework",
          icon: FileText,
          active: isActive("/guardian/homework"),
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "School Activities",
      menus: [
        {
          href: "/guardian/schedule",
          label: "Class Schedule",
          icon: Clock,
          active: isActive("/guardian/schedule"),
          submenus: [],
        },
        {
          href: "/guardian/events",
          label: "School Events",
          icon: Calendar,
          active: isActive("/guardian/events"),
          submenus: [],
        },
        {
          href: "/guardian/extracurricular",
          label: "Extracurricular",
          icon: Star,
          active: isActive("/guardian/extracurricular"),
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Communication",
      menus: [
        {
          href: "/guardian/messages",
          label: "Messages",
          icon: MessageSquare,
          active: isActive("/guardian/messages"),
          submenus: [],
        },
        {
          href: "/guardian/notifications",
          label: "Notifications",
          icon: Bell,
          active: isActive("/guardian/notifications"),
          submenus: [],
        },
        {
          href: "/guardian/parent-teacher",
          label: "Parent-Teacher Meetings",
          icon: Target,
          active: isActive("/guardian/parent-teacher"),
          submenus: [],
        },
      ],
    },
    {
      groupLabel: "Account",
      menus: [
        {
          href: "/guardian/profile",
          label: "My Profile",
          icon: User,
          active: isActive("/guardian/profile"),
          submenus: [],
        },
        {
          href: "/guardian/settings",
          label: "Settings",
          icon: Settings,
          active: isActive("/guardian/settings"),
          submenus: [],
        },
      ],
    },
  ];
}
