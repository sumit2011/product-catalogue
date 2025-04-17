import { useState } from "react";
import { Link } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { ShareCatalogueDialog } from "./share-catalogue-dialog";
import { Catalogue } from "@shared/schema";

interface CatalogueCardProps {
  catalogue: Catalogue;
  onEdit?: (catalogue: Catalogue) => void;
  onDelete?: (catalogue: Catalogue) => void;
}

export function CatalogueCard({ catalogue, onEdit, onDelete }: CatalogueCardProps) {
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const defaultImage = "https://images.unsplash.com/photo-1523275335684-37898b6baf30";

  const incrementViewMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("GET", `/api/catalogues/${catalogue.id}`);
      return response.json();
    },
  });

  const handleViewClick = () => {
    incrementViewMutation.mutate();
  };

  return (
    <>
      <div className="rounded-lg border border-gray-200 overflow-hidden bg-white shadow-sm hover:shadow transition-shadow">
        <div className="aspect-w-16 aspect-h-9 bg-gray-100 relative">
          <img 
            src={catalogue.imageUrl || defaultImage} 
            alt={`${catalogue.name} Catalogue`} 
            className="w-full h-44 object-cover" 
          />
          {(onEdit || onDelete) && (
            <div className="absolute top-2 right-2">
              <button className="bg-white p-2 rounded-full shadow-sm text-gray-700 hover:text-gray-900">
                <i className="ri-more-2-fill"></i>
              </button>
            </div>
          )}
        </div>
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-1">{catalogue.name}</h3>
          <p className="text-sm text-gray-500 mb-3">
            {/* This would be populated from actual product count from API */}
            {catalogue.description || 'No description'}
          </p>
          <div className="flex justify-between items-center">
            <div className="flex items-center text-sm text-gray-500">
              <i className="ri-eye-line mr-1"></i> {catalogue.viewCount} views
            </div>
            <div className="flex space-x-2">
              {onEdit && (
                <button 
                  className="text-primary-700 p-1 rounded hover:bg-primary-50"
                  onClick={() => onEdit(catalogue)}
                  aria-label="Edit catalogue"
                >
                  <i className="ri-edit-line"></i>
                </button>
              )}
              
              <button 
                className="text-primary-700 p-1 rounded hover:bg-primary-50"
                onClick={() => setIsShareDialogOpen(true)}
                aria-label="Share catalogue"
              >
                <i className="ri-share-forward-line"></i>
              </button>
              
              {onDelete && (
                <button 
                  className="text-red-600 p-1 rounded hover:bg-red-50"
                  onClick={() => onDelete(catalogue)}
                  aria-label="Delete catalogue"
                >
                  <i className="ri-delete-bin-line"></i>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <ShareCatalogueDialog 
        open={isShareDialogOpen} 
        onOpenChange={setIsShareDialogOpen} 
        catalogue={catalogue} 
      />
    </>
  );
}
