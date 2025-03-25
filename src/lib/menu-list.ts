import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  ClipboardList
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
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/users",
          label: "Users",
          icon: Users,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/classes",
          label: "Classes",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/subjects",
          label: "Subjects",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/chapters",
          label: "chapters",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/lectures",
          label: "Lectures",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/assessments-management",
          label: "Assessments",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/questions",
          label: "Questions",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/enrollments",
          label: "Enrollments",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/study-plans",
          label: "Study Plans",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/guardian-student",
          label: "Guardian Student",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/content-versions",
          label: "Content Versions",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/notifications",
          label: "Notifications",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/feature-flags",
          label: "Feature Flags",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/assessment-templates",
          label: "Assessment Templates",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/attributes",
          label: "Attributes",
          icon: ClipboardList,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "",
      menus: [
        {
          href: "/attribute-types",
          label: "Attribute Types",
          icon: ClipboardList,
          submenus: []
        }
      ]
    }
  ];
}
