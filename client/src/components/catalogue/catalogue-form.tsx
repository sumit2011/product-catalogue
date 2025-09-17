import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { MultiSelect } from "@/components/ui/multi-select";
import { Catalogue, Product } from "@shared/schema";

// Extending the schema to include validation
const catalogueFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  imageUrl: z.string().optional(),
  isPublic: z.boolean().default(true),
  productIds: z.array(z.number()).optional(),
});

type CatalogueFormValues = z.infer<typeof catalogueFormSchema>;

interface CatalogueFormProps {
  catalogue?: Catalogue;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function CatalogueForm({ catalogue, onSuccess, onCancel }: CatalogueFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch all products for selection
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Create or update mutation
  const mutation = useMutation({
    mutationFn: async (values: CatalogueFormValues) => {
      // Convert productIds to numbers if they are strings
      const productIds = values.productIds?.map(id => typeof id === 'string' ? parseInt(id) : id);
      const data = { ...values, productIds };
      
      if (catalogue) {
        // Update existing catalogue
        return apiRequest("PUT", `/api/catalogues/${catalogue.id}`, data);
      } else {
        // Create new catalogue
        return apiRequest("POST", "/api/catalogues", data);
      }
    },
    onSuccess: async () => {
      toast({
        title: catalogue ? "Catalogue updated" : "Catalogue created",
        description: catalogue ? "Your catalogue has been updated successfully." : "Your catalogue has been created successfully.",
      });
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/catalogues"] });
      await queryClient.invalidateQueries({ queryKey: ["/api/catalogues/popular"] });
      if (onSuccess) onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to ${catalogue ? "update" : "create"} catalogue: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Initialize form with existing catalogue data or defaults
  const form = useForm<CatalogueFormValues>({
    resolver: zodResolver(catalogueFormSchema),
    defaultValues: {
      name: catalogue?.name || "",
      description: catalogue?.description || "",
      imageUrl: catalogue?.imageUrl || "",
      isPublic: catalogue?.isPublic ?? true,
      productIds: [], // This will be populated from API
    },
  });

  // Fetch catalogue products if editing
  const catalogueProductsQuery = useQuery<Product[]>({
    queryKey: ["/api/catalogues", catalogue?.id, "products"],
    enabled: !!catalogue,
    queryFn: async () => {
      const response = await fetch(`/api/catalogues/${catalogue!.id}/products`);
      if (!response.ok) {
        throw new Error("Failed to fetch catalogue products");
      }
      return response.json();
    },
  });

  // Set product IDs when data is available
  useEffect(() => {
    if (catalogueProductsQuery.data) {
      form.setValue("productIds", catalogueProductsQuery.data.map(product => product.id));
    }
  }, [catalogueProductsQuery.data, form]);

  const onSubmit = (values: CatalogueFormValues) => {
    mutation.mutate(values);
  };

  return (
    <div className="h-[100dvh] overflow-y-auto px-4 py-6 sm:px-6">
    <Card className="w-full max-w-xl mx-auto">
  <CardHeader>
    <CardTitle className="text-xl sm:text-2xl text-center">
      {catalogue ? "Edit Catalogue" : "Create New Catalogue"}
    </CardTitle>
  </CardHeader>
  <Form {...form}>
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <CardContent className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="Enter catalogue name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  className="w-full"
                  placeholder="Describe your catalogue (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="imageUrl"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Image URL</FormLabel>
              <FormControl>
                <Input
                  className="w-full"
                  placeholder="Enter image URL (optional)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublic"
          render={({ field }) => (
            <FormItem className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-0.5 mb-2 sm:mb-0">
                <FormLabel>Public Catalogue</FormLabel>
                <div className="text-sm text-muted-foreground">
                  Make this catalogue visible to all customers
                </div>
              </div>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="productIds"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Products</FormLabel>
              <FormControl>
                <MultiSelect
                  className="w-full"
                  disabled={isLoadingProducts || !products}
                  options={
                    products?.map((product) => ({
                      value: product.id,
                      label: product.name,
                    })) || []
                  }
                  selected={field.value || []}
                  onChange={field.onChange}
                  placeholder="Select products to include"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row justify-end sm:space-x-4 space-y-2 sm:space-y-0">
        <Button
          type="button"
          variant="outline"
          className="w-full sm:w-auto"
          onClick={onCancel}
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending}
          className="w-full sm:w-auto"
        >
          {mutation.isPending ? (
            <>
              <i className="ri-loader-4-line animate-spin mr-2"></i>
              {catalogue ? "Updating..." : "Creating..."}
            </>
          ) : (
            catalogue ? "Update Catalogue" : "Create Catalogue"
          )}
        </Button>
      </CardFooter>
    </form>
  </Form>
</Card>
</div>
  );
}
