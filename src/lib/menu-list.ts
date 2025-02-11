import { CrmRolesEnum } from "@/models";
import {
  Tag,
  Users,
  Settings,
  Bookmark,
  SquarePen,
  LayoutGrid,
  LucideIcon,
  Contact,
  Group as GroupIcon,
  ImportIcon,
  FilterIcon,
  TablePropertiesIcon,
  ListFilterIcon,
  Receipt,
  PhoneOffIcon,
  Archive,
  Trash
} from "lucide-react";

type Submenu = {
  href: string;
  label: string;
  active: boolean;
};

type Menu = {
  href: string;
  label: string;
  active: boolean;
  icon: LucideIcon;
  submenus: Submenu[];
};

type Group = {
  groupLabel: string;
  menus: Menu[];
};

type UserRole =
  | "admin"
  | "manager"
  | "sales_representative"
  | "marketing_specialist"
  | "support_agent"
  | "viewer";

export function getMenuList(
  pathname: string,
  role: CrmRolesEnum = "viewer"
): Group[] {
  if (role === "admin") {
    return [
      {
        groupLabel: "",
        menus: [
          {
            href: "/dashboard",
            label: "Dashboard",
            active: pathname.includes("/dashboard"),
            icon: LayoutGrid,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Contents",
        menus: [
          // {
          //   href: "",
          //   label: "CRM",
          //   active: pathname.includes("/contacts"),
          //   icon: Contact,
          //   submenus: [
          //     {
          //       href: "/contacts/master-list",
          //       label: "Master List",
          //       active: pathname === "/contacts/master-list"
          //     },
          //     {
          //       href: "/contacts",
          //       label: "Leads",
          //       active: pathname === "/contacts"
          //     },
          //     {
          //       href: "/contacts/sold",
          //       label: "Sold",
          //       active: pathname === "/contacts/sold"
          //     },
          //     {
          //       href: "/contacts/pipe",
          //       label: "Pipe",
          //       active: pathname === "/contacts/pipe"
          //     },
          //     {
          //       href: "/contacts/do-not-call",
          //       label: "Do Not Call",
          //       active: pathname === "/contacts/do-not-call"
          //     }
          //     // {
          //     //   href: "/contacts/payment",
          //     //   label: "Payment",
          //     //   active: pathname === "/contacts/payment"
          //     // }
          //   ]
          // },
          {
            href: "/contacts/master-list",
            label: "Master List",
            active: pathname === "/contacts/master-list",
            icon: TablePropertiesIcon,
            submenus: []
          },
          {
            href: "/contacts",
            label: "Leads",
            active: pathname === "/contacts",
            icon: FilterIcon,
            submenus: []
          },
          {
            href: "/contacts/sold",
            label: "Sold",
            active: pathname === "/contacts/sold",
            icon: Receipt,
            submenus: []
          },
          {
            href: "/contacts/pipe",
            label: "Pipe",
            active: pathname === "/contacts/pipe",
            icon: ListFilterIcon,
            submenus: []
          },
          {
            href: "/contacts/do-not-call",
            label: "Do Not Call",
            active: pathname === "/contacts/do-not-call",
            icon: PhoneOffIcon,
            submenus: []
          },
          {
            href: "",
            label: "Archive",
            active: pathname.includes("/archive"),
            icon: Archive,
            submenus: [
              {
                href: "/archive/dnc",
                label: "DNC",
                active: pathname === "/archive/dnc"
              },
              {
                href: "/archive/chargeback",
                label: "Chargeback",
                active: pathname === "/archive/chargeback"
              },
              {
                href: "/archive/refund",
                label: "Refund",
                active: pathname === "/archive/refund"
              }
            ]
          },
          {
            href: "/for-recycle",
            label: "For Recycle",
            active: pathname === "/for-recycle",
            icon: Trash,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Imprints",
        menus: [
          {
            href: "/imprints",
            label: "Imprints",
            active: pathname.includes("/imprints"),
            icon: GroupIcon,
            submenus: []
          },
          {
            href: "/import",
            label: "Import",
            active: pathname.includes("/import"),
            icon: ImportIcon,
            submenus: []
          }
        ]
      },
      {
        groupLabel: "Settings",
        menus: [
          {
            href: "/users",
            label: "Users",
            active: pathname.includes("/users"),
            icon: Users,
            submenus: []
          },
          {
            href: "/account",
            label: "Account",
            active: pathname.includes("/account"),
            icon: Settings,
            submenus: []
          }
        ]
      }
    ];
  }
  return [
    {
      groupLabel: "",
      menus: [
        {
          href: "/dashboard",
          label: "Dashboard",
          active: pathname.includes("/dashboard"),
          icon: LayoutGrid,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Contents",
      menus: [
        // {
        //   href: "",
        //   label: "CRM",
        //   active: pathname.includes("/contacts"),
        //   icon: Contact,
        //   submenus: [
        //     {
        //       href: "/contacts",
        //       label: "Contacts",
        //       active: pathname === "/contacts"
        //     },
        //     {
        //       href: "/contacts/sold",
        //       label: "Sold",
        //       active: pathname === "/contacts/sold"
        //     },
        //     {
        //       href: "/contacts/pipe",
        //       label: "Pipe",
        //       active: pathname === "/contacts/pipe"
        //     },
        //     {
        //       href: "/contacts/do-not-call",
        //       label: "Do Not Call",
        //       active: pathname === "/contacts/do-not-call"
        //     }
        //   ]
        // },
        {
          href: "/contacts",
          label: "Leads",
          active: pathname === "/contacts",
          icon: FilterIcon,
          submenus: []
        },
        {
          href: "/contacts/sold",
          label: "Sold",
          active: pathname === "/contacts/sold",
          icon: Receipt,
          submenus: []
        },
        {
          href: "/contacts/pipe",
          label: "Pipe",
          active: pathname === "/contacts/pipe",
          icon: ListFilterIcon,
          submenus: []
        },
        {
          href: "/contacts/do-not-call",
          label: "Do Not Call",
          active: pathname === "/contacts/do-not-call",
          icon: PhoneOffIcon,
          submenus: []
        }
      ]
    },
    {
      groupLabel: "Settings",
      menus: [
        {
          href: "/account",
          label: "Account",
          active: pathname.includes("/account"),
          icon: Settings,
          submenus: []
        }
      ]
    }
  ];
}
