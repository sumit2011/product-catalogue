import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";

// Extending the schema to include validation
const storeSettingsSchema = z.object({
  storeName: z.string().min(1, "Store name is required"),
  storeDescription: z.string().optional(),
  storeUrl: z.string().min(1, "Store URL is required"),
  whatsappNumber: z.string().min(10, "WhatsApp number must be at least 10 digits"),
  primaryColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Must be a valid hex color code"),
});

type StoreSettingsValues = z.infer<typeof storeSettingsSchema>;

export function StoreSettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch current store settings
  const { data: storeSettings, isLoading } = useQuery({
    queryKey: ["/api/store"],
  });

  // Update store settings mutation
  const mutation = useMutation({
    mutationFn: async (values: StoreSettingsValues) => {
      return apiRequest("PUT", "/api/store", values);
    },
    onSuccess: async () => {
      toast({
        title: "Settings updated",
        description: "Your store settings have been updated successfully.",
      });
      // Invalidate queries to refresh data
      await queryClient.invalidateQueries({ queryKey: ["/api/store"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update store settings: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Initialize form with fetched settings or defaults
  const form = useForm<StoreSettingsValues>({
    resolver: zodResolver(storeSettingsSchema),
    defaultValues: {
      storeName: "",
      storeDescription: "",
      storeUrl: "",
      whatsappNumber: "",
      primaryColor: "#0f766e",
    },
  });

  // Update form values when data is loaded
  useQuery({
    queryKey: ["/api/store"],
    enabled: false, // This is just to use the same key for type inference
    onSuccess: (data) => {
      if (data) {
        form.reset({
          storeName: data.storeName || "",
          storeDescription: data.storeDescription || "",
          storeUrl: data.storeUrl || "",
          whatsappNumber: data.whatsappNumber || "",
          primaryColor: data.primaryColor || "#0f766e",
        });
      }
    },
  });

  const onSubmit = (values: StoreSettingsValues) => {
    mutation.mutate(values);
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Storefront Settings</CardTitle>
          <p className="text-gray-600 mt-1">Customize your online store appearance</p>
        </CardHeader>
        <CardContent className="space-y-6">
          {Array(5).fill(null).map((_, index) => (
            <div key={index} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Storefront Settings</CardTitle>
        <p className="text-gray-600 mt-1">Customize your online store appearance</p>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="storeName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter store name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="storeUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Store URL</FormLabel>
                    <FormControl>
                      <div className="flex">
                        <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                          cataloguehub.com/
                        </span>
                        <Input 
                          placeholder="yourstore" 
                          className="rounded-l-none" 
                          {...field} 
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <FormLabel>Store Logo</FormLabel>
                <div className="mt-1 flex items-center">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="text-xl">
                      {form.watch("storeName")?.charAt(0) || "S"}
                    </AvatarFallback>
                  </Avatar>
                  <Button type="button" variant="outline" className="ml-5">
                    Change
                  </Button>
                </div>
              </div>
              
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Primary Color</FormLabel>
                    <FormControl>
                      <div className="mt-1 flex items-center">
                        <div 
                          className="h-8 w-8 rounded border border-gray-300" 
                          style={{ backgroundColor: field.value }}
                        />
                        <Input 
                          className="ml-3 block w-24" 
                          {...field} 
                        />
                        <Button type="button" variant="outline" className="ml-3">
                          Change
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="storeDescription"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>Store Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your store" 
                      rows={3} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="whatsappNumber"
              render={({ field }) => (
                <FormItem className="col-span-full">
                  <FormLabel>WhatsApp Contact Number</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        +91
                      </span>
                      <Input 
                        placeholder="9876543210" 
                        className="rounded-l-none" 
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <p className="mt-1 text-xs text-gray-500">
                    This number will be used for WhatsApp sharing and customer inquiries.
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          
          <CardFooter className="flex justify-end space-x-2">
            <Button 
              type="button" 
              variant="outline"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={mutation.isPending}
            >
              {mutation.isPending ? (
                <>
                  <i className="ri-loader-4-line animate-spin mr-2"></i>
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
}
