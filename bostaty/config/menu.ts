import { NavItem } from "@/types/nav";

export const DASHBOARD_MENU: NavItem[] = [
  { title: 'Overview', href: '/dashboard', icon: 'LayoutDashboard', module: 'CORE' },
  { title: 'Employees', href: '/dashboard/hr', icon: 'Users', module: 'HR' },
  { title: 'Store Front', href: '/dashboard/shop', icon: 'Store', module: 'ECOMMERCE' },
  { title: 'Customers', href: '/dashboard/crm', icon: 'Contact', module: 'CRM' },
];