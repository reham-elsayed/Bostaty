export type ModuleName = 'CORE' | 'HR' | 'ECOMMERCE' | 'CRM';

export interface NavItem {
  title: string;
  href: string;
  icon: any; // We'll update this to handle Lucide icons soon
  module: ModuleName;
}