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
          href: "/manage/dashboard",
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
          href: "/manage/users",
          label: "Users",
          icon: Users,
          submenus: []
        },
        {
          href: "/manage/enrollments",
          label: "Enrollments",
          icon: GraduationCap,
          submenus: []
        },
        // {
        //   href: "/manage/guardian-student",
        //   label: "Guardian Student",
        //   icon: School,
        //   submenus: []
        // }
      ]
    },
    {
      groupLabel: "Academic Content",
      menus: [
        {
          href: "/manage/classes",
          label: "Classes",
          icon: ClipboardList,
          submenus: []
        },
        {
          href: "/manage/subjects",
          label: "Subjects",
          icon: BookOpen,
          submenus: []
        },
        {
          href: "/manage/chapters",
          label: "Chapters",
          icon: BookOpen,
          submenus: []
        },
        {
          href: "/manage/lectures",
          label: "Lectures",
          icon: BookOpen,
          submenus: []
        },
        {
          href: "/manage/study-plans",
          label: "Study Plans",
          icon: ListTodo,
          submenus: []
        },
        {
          href: "/manage/content-versions",
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
          href: "/manage/assessments-management",
          label: "Assessments",
          icon: ClipboardList,
          submenus: []
        },
        {
          href: "/manage/questions",
          label: "Questions",
          icon: FileText,
          submenus: []
        },
        {
          href: "/manage/assessment-templates",
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
          href: "/manage/attributes",
          label: "Attributes",
          icon: Tag,
          submenus: []
        },
        {
          href: "/manage/attribute-types",
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
          href: "#",
          label: "Notifications",
          icon: Bell,
          submenus: []
        },
        // {
        //   href: "/manage/feature-flags",
        //   label: "Feature Flags",
        //   icon: Flag,
        //   submenus: []
        // },
        {
          href: "#",
          label: "Settings",
          icon: Settings,
          submenus: []
        },
        {
          href: "#",
          label: "Payments",
          icon: Settings,
          submenus: []
        }
      ]
    }
  ];
}
