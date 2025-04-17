import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Product, Category, Catalogue } from "@shared/schema";

export default function StoreView() {
  // Fetch store information
  const { data: storeInfo, isLoading: isLoadingStore } = useQuery({
    queryKey: ["/api/store"],
  });

  // Fetch popular catalogues
  const { data: catalogues, isLoading: isLoadingCatalogues } = useQuery<Catalogue[]>({
    queryKey: ["/api/catalogues/popular"],
  });

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
    select: (data) => data.slice(0, 4), // Only show first 4 products
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">
                {isLoadingStore ? <Skeleton className="h-8 w-32" /> : storeInfo?.storeName || 'Store'}
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-gray-700 hover:text-primary-700">Home</a>
              <a href="#products" className="text-gray-700 hover:text-primary-700">Products</a>
              <a href="#catalogues" className="text-gray-700 hover:text-primary-700">Catalogues</a>
              <a href="#contact" className="text-gray-700 hover:text-primary-700">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 hover:text-gray-900">
                <i className="ri-search-line text-lg"></i>
              </button>
              <button className="md:hidden text-gray-700 hover:text-gray-900">
                <i className="ri-menu-line text-lg"></i>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-lg overflow-hidden bg-gradient-to-r from-primary-700 to-primary-900 mb-12">
            <div className="md:flex items-center">
              <div className="p-8 md:p-12 md:w-1/2">
                <h2 className="text-3xl font-bold text-white mb-4">New Collection</h2>
                <p className="text-primary-100 mb-6">
                  {isLoadingStore ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    storeInfo?.storeDescription || 'Discover our latest range of products for your everyday needs.'
                  )}
                </p>
                <Button className="bg-white text-primary-700 hover:bg-gray-100">
                  Shop Now
                </Button>
              </div>
              <div className="md:w-1/2">
                <img 
                  src="https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2" 
                  alt="Collection" 
                  className="h-64 md:h-80 w-full object-cover" 
                />
              </div>
            </div>
          </div>

          {/* Featured Catalogues */}
          <div id="catalogues" className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Featured Catalogues</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingCatalogues ? (
                Array(3).fill(null).map((_, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                    <Skeleton className="w-full h-44" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/3 mb-3" />
                      <Skeleton className="h-8 w-36" />
                    </div>
                  </div>
                ))
              ) : catalogues && catalogues.length > 0 ? (
                catalogues.map((catalogue) => (
                  <div key={catalogue.id} className="rounded-lg border border-gray-200 overflow-hidden group">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
                      <img
                        src={catalogue.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                        alt={`${catalogue.name} Catalogue`}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 mb-1 group-hover:text-primary-700">{catalogue.name}</h3>
                      <p className="text-sm text-gray-500 mb-3">{catalogue.description || 'View our collection'}</p>
                      <Link href={`/catalogue/${catalogue.id}`}>
                        <a className="text-primary-700 text-sm font-medium flex items-center hover:text-primary-800">
                          View Catalogue <i className="ri-arrow-right-line ml-1"></i>
                        </a>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-gray-500">
                  No catalogues available.
                </div>
              )}
            </div>
          </div>

          {/* Popular Products */}
          <div id="products" className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Popular Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoadingProducts ? (
                Array(4).fill(null).map((_, index) => (
                  <div key={index} className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <Skeleton className="w-full h-44" />
                    <div className="p-4 border-t border-gray-100">
                      <Skeleton className="h-5 w-3/4 mb-1" />
                      <Skeleton className="h-4 w-1/2 mb-2" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-9 w-9 rounded-full" />
                      </div>
                    </div>
                  </div>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden group">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"}
                        alt={product.name}
                        className="w-full h-44 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 border-t border-gray-100">
                      <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-700">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500">{product.description || 'Product description'}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-lg font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
                        <button className="p-1 rounded-full bg-primary-100 text-primary-700 hover:bg-primary-200">
                          <i className="ri-shopping-cart-2-line"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-6 text-gray-500">
                  No products available.
                </div>
              )}
            </div>
          </div>

          {/* Contact & WhatsApp Section */}
          <div id="contact" className="bg-gray-50 rounded-lg p-6 mb-12 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Have questions about our products?</h2>
              <p className="text-gray-600">We're here to help! Contact us directly via WhatsApp for quick assistance.</p>
            </div>
            <div className="flex justify-center">
              <a 
                href={isLoadingStore ? '#' : `https://wa.me/${storeInfo?.whatsappNumber || '9876543210'}`} 
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="ri-whatsapp-line mr-2 text-xl"></i>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:order-2 space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Instagram</span>
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Facebook</span>
                <i className="ri-facebook-circle-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500">
                <span className="sr-only">Twitter</span>
                <i className="ri-twitter-line text-xl"></i>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400">
                &copy; {new Date().getFullYear()} {isLoadingStore ? 'Store' : storeInfo?.storeName || 'Store'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
