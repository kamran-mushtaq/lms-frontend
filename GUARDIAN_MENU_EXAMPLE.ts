// Example: Customized Guardian Menu Configuration
function getGuardianMenuList(pathname: string): Group[] {
  return [
    {
      groupLabel: "Overview",
      menus: [
        {
          href: "/guardian/dashboard",
          label: "Dashboard",
          icon: LayoutGrid,
          submenus: []
        },
        {
          href: "/guardian/quick-stats",
          label: "Quick Stats",
          icon: BarChart3,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Children Management",
      menus: [
        {
          href: "/guardian/children",
          label: "My Children",
          icon: GraduationCap,
          submenus: [
            {
              href: "/guardian/children/attendance",
              label: "Attendance",
              active: false
            },
            {
              href: "/guardian/children/grades",
              label: "Grades",
              active: false
            }
          ]
        },
        {
          href: "/guardian/children/progress",
          label: "Progress Overview",
          icon: TrendingUp,
          submenus: []
        },
        {
          href: "/guardian/children/reports",
          label: "Reports",
          icon: FileText,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Learning & Assessment",
      menus: [
        {
          href: "/guardian/subjects",
          label: "Subjects",
          icon: BookOpen,
          submenus: []
        },
        {
          href: "/guardian/assessments",
          label: "Assessments",
          icon: ClipboardList,
          submenus: []
        },
        {
          href: "/guardian/study-plans",
          label: "Study Plans",
          icon: ListTodo,
          submenus: []
        },
        {
          href: "/guardian/homework",
          label: "Homework",
          icon: BookOpenCheck,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Communication",
      menus: [
        {
          href: "/guardian/messages",
          label: "Messages",
          icon: MessageSquare,
          submenus: []
        },
        {
          href: "/guardian/notifications",
          label: "Notifications",
          icon: Bell,
          submenus: []
        },
        {
          href: "/guardian/announcements",
          label: "Announcements",
          icon: Megaphone,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Financial",
      menus: [
        {
          href: "/guardian/payments",
          label: "Payments",
          icon: CreditCard,
          submenus: []
        },
        {
          href: "/guardian/invoices",
          label: "Invoices",
          icon: FileText,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Academic Calendar",
      menus: [
        {
          href: "/guardian/calendar",
          label: "Calendar",
          icon: Calendar,
          submenus: []
        },
        {
          href: "/guardian/events",
          label: "Events",
          icon: Target,
          submenus: []
        },
        {
          href: "/guardian/holidays",
          label: "Holidays",
          icon: CalendarDays,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Support",
      menus: [
        {
          href: "/guardian/help",
          label: "Help Center",
          icon: HelpCircle,
          submenus: []
        },
        {
          href: "/guardian/contact",
          label: "Contact Support",
          icon: Phone,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/guardian/settings",
          label: "Account Settings",
          icon: Settings,
          submenus: []
        },
        {
          href: "/guardian/preferences",
          label: "Preferences",
          icon: Sliders,
          submenus: []
        }
      ]
    }
  ];
}
