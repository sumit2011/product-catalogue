import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface MobileHeaderProps {
  user: {
    name: string;
    initials: string;
  };
  onMenuClick: () => void;
}

export function MobileHeader({ user, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="md:hidden bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="mr-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          aria-label="Toggle menu"
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
        <h1 className="text-xl font-semibold text-primary-700 dark:text-primary-500">CatalogueHub</h1>
      </div>
      <div className="flex items-center space-x-4">
        <ThemeToggle />
        <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300" aria-label="Notifications">
          <i className="ri-notification-3-line text-2xl"></i>
        </button>
        <Avatar className="h-8 w-8 bg-primary-700 dark:bg-primary-600">
          <AvatarFallback className="text-white">{user.initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
