import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { MobileHeader } from "./mobile-header";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: React.ReactNode;
}

export function AppLayout({ children }: AppLayoutProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [location] = useLocation();
  
  // Close sidebar when route changes on mobile
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location]);

  // Mock user data - in a real app this would come from authentication
  const user = {
    name: "John Doe",
    email: "john@example.com",
    initials: "JD"
  };

  // Check if the current route is a public route (store view or catalogue view)
  const isPublicRoute = 
    location.startsWith("/store") || 
    location.startsWith("/catalogue/");

  if (isPublicRoute) {
    // For public routes, render without admin layout
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Mobile Header */}
      <MobileHeader 
        user={user} 
        onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} 
      />

      {/* Sidebar Navigation */}
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setIsSidebarOpen(false)} 
        user={user} 
      />

      {/* Main Content */}
      <main className="flex-1 md:ml-64 min-h-screen">
        {children}
      </main>
    </div>
  );
}
