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
  School
} from "lucide-react";

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
  return [
    {
      groupLabel: "Overview",
      menus: [
        {
          href: "dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "User Management",
      menus: [
        {
          href: "users",
          label: "Users",
          icon: Users,
          submenus: []
        },
        {
          href: "enrollments",
          label: "Enrollments",
          icon: GraduationCap,
          submenus: []
        },
        {
          href: "guardian-student",
          label: "Guardian Student",
          icon: School,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Academic Content",
      menus: [
        {
          href: "classes",
          label: "Classes",
          icon: ClipboardList,
          submenus: []
        },
        {
          href: "subjects",
          label: "Subjects",
          icon: BookOpen,
          submenus: []
        },
        {
          href: "chapters",
          label: "Chapters",
          icon: BookOpen,
          submenus: []
        },
        {
          href: "lectures",
          label: "Lectures",
          icon: BookOpen,
          submenus: []
        },
        {
          href: "study-plans",
          label: "Study Plans",
          icon: ListTodo,
          submenus: []
        },
        {
          href: "content-versions",
          label: "Content Versions",
          icon: Layers,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Assessments",
      menus: [
        {
          href: "assessments-management",
          label: "Assessments",
          icon: ClipboardList,
          submenus: []
        },
        {
          href: "questions",
          label: "Questions",
          icon: FileText,
          submenus: []
        },
        {
          href: "assessment-templates",
          label: "Assessment Templates",
          icon: FileText,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Attributes & Types",
      menus: [
        {
          href: "attributes",
          label: "Attributes",
          icon: Tag,
          submenus: []
        },
        {
          href: "attribute-types",
          label: "Attribute Types",
          icon: Tag,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "System Settings",
      menus: [
        {
          href: "notifications",
          label: "Notifications",
          icon: Bell,
          submenus: []
        },
        {
          href: "feature-flags",
          label: "Feature Flags",
          icon: Flag,
          submenus: []
        },
        {
          href: "settings",
          label: "Settings",
          icon: Settings,
          submenus: []
        }
      ]
    }
  ];
}
