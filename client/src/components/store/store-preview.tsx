import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { CartAndCheckout } from "./cart-and-checkout";
import { StoreSettings } from "@shared/schema";

export function StorePreview() {
  const { data: storeSettings, isLoading } = useQuery<StoreSettings>({
    queryKey: ["/api/store"],
  });

  if (isLoading) {
    return (
      <Card className="shadow-sm border border-gray-100">
        <CardHeader className="border-b border-gray-200 flex-row justify-between items-center py-6">
          <CardTitle className="text-lg">Storefront Preview</CardTitle>
          <Skeleton className="h-10 w-28" />
        </CardHeader>
        <CardContent className="p-0">
          <div className="border-b border-gray-200 p-4 flex items-center">
            <div className="w-full max-w-xl mx-auto flex items-center space-x-2">
              <Skeleton className="h-6 w-16" />
              <Skeleton className="flex-1 h-8" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          <div className="p-4" style={{ maxHeight: '600px', overflowY: 'auto' }}>
            <Skeleton className="h-64 w-full mb-8" />
            <Skeleton className="h-12 w-48 mb-6" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {Array(3).fill(null).map((_, index) => (
                <Skeleton key={index} className="h-64 w-full" />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-sm border border-gray-100 overflow-hidden">
      <CardHeader className="border-b border-gray-200 flex-row justify-between items-center py-6">
        <CardTitle className="text-lg">Storefront Preview</CardTitle>
        <Link href="/store" target="_blank">
          <Button>
            <i className="ri-external-link-line mr-2"></i> Open Store
          </Button>
        </Link>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border-b border-gray-200 p-4 flex items-center">
          <div className="w-full max-w-xl mx-auto flex items-center space-x-2">
            <div className="flex-shrink-0 h-6 bg-gray-200 rounded-full flex items-center px-2 space-x-1">
              <div className="h-2 w-2 bg-red-500 rounded-full"></div>
              <div className="h-2 w-2 bg-yellow-500 rounded-full"></div>
              <div className="h-2 w-2 bg-green-500 rounded-full"></div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-md h-8 flex items-center px-3 text-sm text-gray-500">
              {storeSettings?.storeUrl ? `cataloguehub.com/${storeSettings.storeUrl}` : 'yourstore.cataloguehub.com'}
            </div>
            <button className="text-gray-400 hover:text-gray-600">
              <i className="ri-refresh-line"></i>
            </button>
          </div>
        </div>
        
        <div className="p-4" style={{ maxHeight: '600px', overflowY: 'auto' }}>
          <div className="max-w-6xl mx-auto">
            {/* Store Header */}
            <header className="py-6 border-b border-gray-200 mb-8">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <h1 className="text-2xl font-bold text-primary-700">{storeSettings?.storeName || 'YourStore'}</h1>
                </div>
                <nav className="hidden md:flex space-x-8 items-center">
                  <a href="#" className="text-gray-700 hover:text-primary-700">Home</a>
                  <a href="#" className="text-gray-700 hover:text-primary-700">Products</a>
                  <a href="#" className="text-gray-700 hover:text-primary-700">Catalogues</a>
                  <a href="#" className="text-gray-700 hover:text-primary-700">About</a>
                  <a href="#" className="text-gray-700 hover:text-primary-700">Contact</a>
                </nav>
                <div className="flex items-center space-x-4">
                  <button className="text-gray-700 hover:text-gray-900">
                    <i className="ri-search-line text-lg"></i>
                  </button>
                  <button className="text-gray-700 hover:text-gray-900 relative">
                    <i className="ri-shopping-cart-2-line text-lg"></i>
                    <span className="absolute -top-1 -right-1 bg-primary-700 text-white text-xs w-4 h-4 flex items-center justify-center rounded-full">0</span>
                  </button>
                  <button className="md:hidden text-gray-700 hover:text-gray-900">
                    <i className="ri-menu-line text-lg"></i>
                  </button>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <div className="rounded-lg overflow-hidden bg-gradient-to-r from-primary-700 to-primary-900 mb-12">
              <div className="md:flex items-center">
                <div className="p-8 md:p-12 md:w-1/2">
                  <h2 className="text-3xl font-bold text-white mb-4">New Collection</h2>
                  <p className="text-primary-100 mb-6">{storeSettings?.storeDescription || 'Discover our latest range of products for your everyday needs.'}</p>
                  <button className="px-6 py-3 bg-white text-primary-700 font-medium rounded-md hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-700">
                    Shop Now
                  </button>
                </div>
                <div className="md:w-1/2">
                  <img src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2" alt="Collection" className="h-64 md:h-80 w-full object-cover" />
                </div>
              </div>
            </div>

            {/* Contact & WhatsApp Section */}
            {/* Products and Cart/Checkout Section */}
            <CartAndCheckout />

            {/* Contact & WhatsApp Section */}
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-12">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Have questions about our products?</h2>
                <p className="text-gray-600 dark:text-gray-400">We're here to help! Contact us directly via WhatsApp for quick assistance.</p>
              </div>
              <div className="flex justify-center">
                <a href={`https://wa.me/${storeSettings?.whatsappNumber || '9876543210'}`} className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2">
                  <i className="ri-whatsapp-line mr-2 text-xl"></i>
                  Chat on WhatsApp
                </a>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
