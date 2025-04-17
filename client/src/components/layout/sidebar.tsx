import { useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface NavItem {
  href: string;
  label: string;
  icon: string;
}

interface NavGroupProps {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  user: {
    name: string;
    email: string;
    initials: string;
  };
}

export function Sidebar({ isOpen, onClose, user }: SidebarProps) {
  const [location] = useLocation();
  
  const mainNavItems: NavItem[] = [
    { href: "/dashboard", label: "Dashboard", icon: "ri-dashboard-line" },
    { href: "/catalogues", label: "Catalogues", icon: "ri-book-2-line" },
    { href: "/products", label: "Products", icon: "ri-shopping-bag-line" },
    { href: "/orders", label: "Orders", icon: "ri-shopping-cart-2-line" },
  ];
  
  const storeNavItems: NavItem[] = [
    { href: "/storefront", label: "Storefront", icon: "ri-store-2-line" },
    { href: "/customers", label: "Customers", icon: "ri-user-line" },
  ];
  
  const accountNavItems: NavItem[] = [
    { href: "/settings", label: "Settings", icon: "ri-settings-5-line" },
    { href: "/help", label: "Help & Support", icon: "ri-question-line" },
  ];
  
  const navGroups: NavGroupProps[] = [
    { title: "Main", items: mainNavItems },
    { title: "Store", items: storeNavItems },
    { title: "Account", items: accountNavItems },
  ];

  return (
    <aside
      className={cn(
        "w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 fixed inset-y-0 left-0 transform transition duration-200 ease-in-out z-20 md:z-0",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}
    >
      <div className="h-full flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
          <span className="text-xl font-semibold text-primary-700 dark:text-primary-500">CatalogueHub</span>
          <div className="hidden md:block">
            <ThemeToggle />
          </div>
        </div>
        
        <nav className="flex-1 pt-4 pb-4 overflow-y-auto scrollbar-hide">
          {navGroups.map((group) => (
            <div key={group.title} className="mb-6">
              <div className="px-4 mb-2 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                {group.title}
              </div>
              {group.items.map((item) => {
                const isActive = location === item.href || 
                  (item.href === "/dashboard" && location === "/");
                
                return (
                  <div
                    key={item.href}
                    className={cn(
                      "flex items-center px-4 py-3 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md mb-1 group cursor-pointer",
                      isActive && "bg-gray-100 dark:bg-gray-800"
                    )}
                    onClick={() => {
                      window.location.href = item.href;
                      if (window.innerWidth < 768) {
                        onClose();
                      }
                    }}
                  >
                    <i className={cn(
                      item.icon,
                      "mr-3 text-lg",
                      isActive 
                        ? "text-primary-700 dark:text-primary-500" 
                        : "text-gray-500 dark:text-gray-400 group-hover:text-primary-700 group-hover:dark:text-primary-500"
                    )}></i>
                    <span>{item.label}</span>
                  </div>
                );
              })}
            </div>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="flex items-center">
            <div className="h-8 w-8 rounded-full bg-primary-700 dark:bg-primary-600 text-white flex items-center justify-center">
              <span className="text-sm font-medium">{user.initials}</span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{user.name}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
