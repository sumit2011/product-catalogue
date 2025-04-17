import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Catalogue } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { CatalogueForm } from "@/components/catalogue/catalogue-form";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function Catalogues() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("recent");
  const [filterType, setFilterType] = useState("all");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCatalogue, setSelectedCatalogue] = useState<Catalogue | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch catalogues
  const { data: catalogues, isLoading, isError } = useQuery<Catalogue[]>({
    queryKey: ["/api/catalogues"],
  });

  // Delete catalogue mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/catalogues/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Catalogue deleted",
        description: "The catalogue has been successfully deleted.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/catalogues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/catalogues/popular"] });
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete catalogue: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleEditCatalogue = (catalogue: Catalogue) => {
    setSelectedCatalogue(catalogue);
    setIsFormOpen(true);
  };

  const handleDeleteCatalogue = (catalogue: Catalogue) => {
    setSelectedCatalogue(catalogue);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (selectedCatalogue) {
      deleteMutation.mutate(selectedCatalogue.id);
    }
  };

  // Filter and sort catalogues
  const filteredCatalogues = catalogues
    ? catalogues
        .filter((catalogue) => {
          // Filter by search term
          const matchesSearch = catalogue.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (catalogue.description && catalogue.description.toLowerCase().includes(searchTerm.toLowerCase()));
          
          // Filter by type
          const matchesType = filterType === "all" ||
            (filterType === "public" && catalogue.isPublic) ||
            (filterType === "private" && !catalogue.isPublic);
          
          return matchesSearch && matchesType;
        })
        .sort((a, b) => {
          // Sort by selected option
          switch (sortBy) {
            case "name":
              return a.name.localeCompare(b.name);
            case "views":
              return b.viewCount - a.viewCount;
            case "shares":
              return b.shareCount - a.shareCount;
            case "recent":
            default:
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          }
        })
    : [];

  return (
    <div className="p-6">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Catalogues</h1>
          <p className="text-gray-600 mt-1">Create and manage your product catalogues</p>
        </div>
        <Button onClick={() => {
          setSelectedCatalogue(null);
          setIsFormOpen(true);
        }}>
          <i className="ri-add-line mr-2"></i> New Catalogue
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <i className="ri-search-line text-gray-400"></i>
              </div>
              <Input
                type="text"
                placeholder="Search catalogues..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Sort by: Recent</SelectItem>
                <SelectItem value="name">Sort by: Name (A-Z)</SelectItem>
                <SelectItem value="views">Sort by: Most views</SelectItem>
                <SelectItem value="shares">Sort by: Most shares</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="private">Private</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Catalogues Grid */}
      {isError ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load catalogues. Please try again later.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {/* Create New Catalogue Card */}
          <div 
            className="border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center p-6 h-64 bg-gray-50 hover:bg-gray-100 cursor-pointer"
            onClick={() => {
              setSelectedCatalogue(null);
              setIsFormOpen(true);
            }}
          >
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center mb-3">
              <i className="ri-add-line text-xl text-primary-700"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Create Catalogue</h3>
            <p className="text-sm text-gray-500 text-center">Create a new collection of your products</p>
          </div>

          {isLoading ? (
            // Skeleton loaders for catalogues
            Array(7).fill(null).map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-200 overflow-hidden">
                <Skeleton className="w-full h-44" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-1" />
                  <Skeleton className="h-4 w-1/3 mb-3" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4" />
                    <div className="flex space-x-2">
                      <Skeleton className="h-6 w-6 rounded" />
                      <Skeleton className="h-6 w-6 rounded" />
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : filteredCatalogues.length > 0 ? (
            // Actual catalogue cards
            filteredCatalogues.map((catalogue) => (
              <CatalogueCard 
                key={catalogue.id}
                catalogue={catalogue}
                onEdit={handleEditCatalogue}
                onDelete={handleDeleteCatalogue}
              />
            ))
          ) : (
            searchTerm || filterType !== "all" ? (
              <div className="col-span-full py-12 text-center text-gray-500">
                No catalogues match your search criteria.
              </div>
            ) : null
          )}
        </div>
      )}

      {/* Catalogue Form Dialog */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <CatalogueForm 
            catalogue={selectedCatalogue || undefined}
            onSuccess={() => setIsFormOpen(false)}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <div className="grid gap-4">
            <div className="flex flex-col space-y-2 text-center sm:text-left">
              <h2 className="text-lg font-semibold">Delete Catalogue</h2>
              <p className="text-sm text-gray-500">
                Are you sure you want to delete "{selectedCatalogue?.name}"? This action cannot be undone.
              </p>
            </div>
            <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsDeleteDialogOpen(false)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <>
                    <i className="ri-loader-4-line animate-spin mr-2"></i>
                    Deleting...
                  </>
                ) : (
                  "Delete"
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
