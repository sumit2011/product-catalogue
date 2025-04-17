import { useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

interface CatalogueViewProps {
  id: number;
}

export default function CatalogueView({ id }: CatalogueViewProps) {
  const { toast } = useToast();
  
  // Fetch catalogue details (this automatically increments view count on backend)
  const { data: catalogue, isLoading: isLoadingCatalogue, isError: isCatalogueError } = useQuery({
    queryKey: [`/api/catalogues/${id}`],
  });

  // Fetch store information for header
  const { data: storeInfo } = useQuery({
    queryKey: ["/api/store"],
  });

  // Share mutation
  const shareMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/catalogues/${id}/share`, {
        message: `Check out this ${catalogue?.name} catalogue! Browse their latest products.`
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.whatsappUrl) {
        window.open(data.whatsappUrl, "_blank");
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to share catalogue: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Handle share button click
  const handleShare = () => {
    shareMutation.mutate();
  };

  if (isLoadingCatalogue) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Skeleton className="h-12 w-1/2 mb-4" />
          <Skeleton className="h-6 w-full mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array(8).fill(null).map((_, index) => (
              <Skeleton key={index} className="h-64 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (isCatalogueError || !catalogue) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8 max-w-md">
          <div className="text-5xl text-primary-700 mb-4">
            <i className="ri-error-warning-line"></i>
          </div>
          <h1 className="text-2xl font-bold mb-2">Catalogue Not Found</h1>
          <p className="text-gray-600 mb-6">The catalogue you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => window.history.back()}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Store Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700">
                {storeInfo?.storeName || 'Store'}
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button 
                variant="outline" 
                onClick={() => window.location.href = "/store"}
              >
                <i className="ri-store-2-line mr-2"></i> Back to Store
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="py-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Catalogue Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{catalogue.name}</h1>
                <p className="mt-2 text-gray-600">{catalogue.description}</p>
              </div>
              <div className="mt-4 md:mt-0">
                <Button 
                  onClick={handleShare}
                  disabled={shareMutation.isPending}
                  className="bg-green-600 hover:bg-green-700"
                >
                  {shareMutation.isPending ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Sharing...
                    </>
                  ) : (
                    <>
                      <i className="ri-whatsapp-line mr-2"></i>
                      Share on WhatsApp
                    </>
                  )}
                </Button>
              </div>
            </div>
            <div className="mt-2 text-sm text-gray-500 flex items-center">
              <span className="flex items-center mr-4">
                <i className="ri-eye-line mr-1"></i> 
                {catalogue.viewCount} views
              </span>
              <span className="flex items-center">
                <i className="ri-share-forward-line mr-1"></i>
                {catalogue.shareCount} shares
              </span>
            </div>
          </div>

          {/* Products Grid */}
          {catalogue.products && catalogue.products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {catalogue.products.map((product: Product) => (
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
                    <p className="mt-1 text-sm text-gray-500 line-clamp-2">{product.description || 'Product description'}</p>
                    <div className="mt-2 flex items-center justify-between">
                      <p className="text-lg font-medium text-gray-900">₹{product.price.toLocaleString()}</p>
                      <div className="flex items-center space-x-2">
                        <Button size="sm" variant="outline" className="text-primary-700 border-primary-700">
                          <i className="ri-shopping-cart-2-line mr-1"></i> Add
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
              <div className="text-4xl text-gray-400 mb-4">
                <i className="ri-shopping-basket-line"></i>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No Products</h3>
              <p className="text-gray-500">This catalogue doesn't have any products yet.</p>
            </div>
          )}

          {/* Contact Section */}
          <div className="mt-12 bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-2">Interested in these products?</h2>
              <p className="text-gray-600">Contact us directly via WhatsApp for more information, pricing, or to place an order.</p>
            </div>
            <div className="flex justify-center">
              <a 
                href={`https://wa.me/${storeInfo?.whatsappNumber || '9876543210'}?text=Hi! I'm interested in your ${catalogue.name} catalogue.`} 
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                target="_blank"
                rel="noopener noreferrer"
              >
                <i className="ri-whatsapp-line mr-2 text-xl"></i>
                Contact on WhatsApp
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-8 mt-12">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} {storeInfo?.storeName || 'Store'}. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
