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
  CreditCard,
  DollarSign,
  Calculator,
  Percent,
  Receipt,
  BadgePercent
} from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";

export type UserRole = 'admin' | 'guardian' | 'student' | 'parent' | 'teacher';

export function getRoleFromPath(pathname: string): UserRole {
  if (pathname.includes('/admin')) return 'admin';
  if (pathname.includes('/guardian')) return 'guardian';
  if (pathname.includes('/student')) return 'student';
  if (pathname.includes('/parent')) return 'parent';
  if (pathname.includes('/teacher')) return 'teacher';
  return 'admin'; // Default role
}

export function getUserRole(): UserRole | null {
  if (typeof window === 'undefined') return null;
  const role = localStorage.getItem('userRole');
  if (role && ['admin', 'guardian', 'student', 'parent', 'teacher'].includes(role)) {
    return role as UserRole;
  }
  return null;
}

type Submenu = {
  href: string;
  label: string;
  active?: boolean;
};

type Menu = {
  href: string;
  label: string;
  active?: boolean;
  icon: any; // Using any for LucideIcon type
  submenus?: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

export function getMenuList(pathname: string, role: UserRole = 'admin'): Group[] {
  // Common menus for all roles
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
      groupLabel: "Finance",
      menus: [
        {
          href: "/manage/subject-pricing",
          label: "Subject Pricing",
          icon: DollarSign,
          submenus: [],
        },
        {
          href: "/manage/discount-rules",
          label: "Discount Rules",
          icon: BadgePercent,
          submenus: [],
        },
        {
          href: "/manage/tax-configurations",
          label: "Tax Settings",
          icon: Percent,
          submenus: [],
        },
        {
          href: "/manage/pricing-calculator",
          label: "Price Calculator",
          icon: Calculator,
          submenus: [],
        },
        {
          href: "/manage/invoices",
          label: "Invoices",
          icon: Receipt,
          submenus: [],
        },
        // {
        //   href: "/manage/payments",
        //   label: "Payments",
        //   icon: CreditCard,
        //   submenus: [],
        // },
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

  // Return menu based on role
  switch (role) {
    case "admin":
      return [...commonMenus, ...adminMenus];
    case "guardian":
      return [...commonMenus, ...guardianMenus];
    default:
      return commonMenus;
  }
}