import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CatalogueCard } from "@/components/catalogue/catalogue-card";
import { Catalogue } from "@shared/schema";

export function PopularCatalogues() {
  const { data: catalogues, isLoading } = useQuery<Catalogue[]>({
    queryKey: ["/api/catalogues/popular"],
  });

  return (
    <Card className="shadow-sm border border-gray-100 dark:border-gray-800 dark:bg-gray-800">
      <CardHeader className="border-b border-gray-100 dark:border-gray-700 flex-row justify-between items-center py-6">
        <CardTitle className="text-lg dark:text-white">Popular Catalogues</CardTitle>
        <Link href="/catalogues" className="text-sm text-primary-700 dark:text-primary-400 hover:text-primary-800 dark:hover:text-primary-300 flex items-center">
          View all <i className="ri-arrow-right-line ml-1"></i>
        </Link>
      </CardHeader>
      <CardContent className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {isLoading ? (
            Array(3).fill(null).map((_, index) => (
              <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden bg-white dark:bg-gray-700">
                <Skeleton className="w-full h-44 dark:bg-gray-600" />
                <div className="p-4">
                  <Skeleton className="h-6 w-3/4 mb-1 dark:bg-gray-600" />
                  <Skeleton className="h-4 w-1/3 mb-3 dark:bg-gray-600" />
                  <div className="flex justify-between items-center">
                    <Skeleton className="h-4 w-1/4 dark:bg-gray-600" />
                    <Skeleton className="h-4 w-1/4 dark:bg-gray-600" />
                  </div>
                </div>
              </div>
            ))
          ) : catalogues && catalogues.length > 0 ? (
            catalogues.map((catalogue) => (
              <CatalogueCard key={catalogue.id} catalogue={catalogue} />
            ))
          ) : (
            <div className="col-span-3 text-center py-6 text-gray-500 dark:text-gray-400">
              No catalogues found. <Link href="/catalogues" className="text-primary-700 dark:text-primary-400">Create your first catalogue</Link>.
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
