import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface MobileHeaderProps {
  user: {
    name: string;
    initials: string;
  };
  onMenuClick: () => void;
}

export function MobileHeader({ user, onMenuClick }: MobileHeaderProps) {
  return (
    <header className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-10">
      <div className="flex items-center">
        <button 
          onClick={onMenuClick}
          className="mr-2 text-gray-500"
          aria-label="Toggle menu"
        >
          <i className="ri-menu-line text-2xl"></i>
        </button>
        <h1 className="text-xl font-semibold text-primary-700">CatalogueHub</h1>
      </div>
      <div className="flex items-center space-x-4">
        <button className="text-gray-500" aria-label="Notifications">
          <i className="ri-notification-3-line text-2xl"></i>
        </button>
        <Avatar className="h-8 w-8">
          <AvatarFallback>{user.initials}</AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
