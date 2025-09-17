import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product, Category, Catalogue, StoreSettings } from "@shared/schema";

// Define checkout form schema
const checkoutFormSchema = z.object({
  customerName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  paymentMethod: z.enum(["cod", "online", "bank_transfer"], {
    required_error: "Please select a payment method",
  }),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

// Cart item type
interface CartItem {
  product: Product;
  quantity: number;
}

export default function StoreView() {
  const { toast } = useToast();
  
  // Cart state
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  
  // Calculate cart total price
  const totalPrice = cart.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  
  // Fetch store information
  const { data: storeInfo, isLoading: isLoadingStore } = useQuery<StoreSettings>({
    queryKey: ["/api/store"],
  });

  // Fetch popular catalogues
  const { data: catalogues, isLoading: isLoadingCatalogues } = useQuery<Catalogue[]>({
    queryKey: ["/api/catalogues/popular"],
  });

  // Fetch products
  const { data: products, isLoading: isLoadingProducts } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });
  
  // Form for checkout
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      email: "",
      phone: "",
      address: "",
      notes: "",
    },
  });
  
  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (values: CheckoutFormValues) => {
      const orderData = {
        ...values,
        items: cart.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          price: item.product.price
        })),
        totalAmount: totalPrice
      };
      
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      toast({
        title: "Order placed successfully",
        description: "Thank you for your order. We'll be in touch soon!",
      });
      setCart([]);
      setIsCheckoutOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error placing order",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Add product to cart
  const addToCart = (product: Product) => {
    setCart(prev => {
      const existingItem = prev.find(item => item.product.id === product.id);
      
      if (existingItem) {
        // Increment quantity if already in cart
        return prev.map(item => 
          item.product.id === product.id 
            ? { ...item, quantity: item.quantity + 1 } 
            : item
        );
      } else {
        // Add new item to cart
        return [...prev, { product, quantity: 1 }];
      }
    });
    
    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  // Update cart item quantity
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    setCart(prev => 
      prev.map(item => 
        item.product.id === productId 
          ? { ...item, quantity: newQuantity } 
          : item
      )
    );
  };
  
  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart(prev => prev.filter(item => item.product.id !== productId));
  };
  
  // Handle checkout form submission
  const onCheckoutSubmit = (values: CheckoutFormValues) => {
    createOrderMutation.mutate(values);
  };

  // Render cart dialog
  const renderCartDialog = () => {
    return (
      <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Your Shopping Cart</DialogTitle>
            <DialogDescription>
              Review your items before checkout.
            </DialogDescription>
          </DialogHeader>
          
          {cart.length === 0 ? (
            <div className="py-6 text-center text-gray-500">
              Your cart is empty.
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map((item) => (
                <div key={item.product.id} className="flex justify-between items-center pb-4 border-b">
                  <div className="flex items-center space-x-3">
                    <img
                      src={item.product.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"}
                      alt={item.product.name}
                      className="w-12 h-12 object-cover rounded"
                    />
                    <div>
                      <h4 className="font-medium text-sm">{item.product.name}</h4>
                      <p className="text-sm text-gray-500">₹{item.product.price.toLocaleString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    >
                      <i className="ri-subtract-line"></i>
                    </Button>
                    <span className="w-6 text-center">{item.quantity}</span>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <i className="ri-add-line"></i>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="h-8 w-8 p-0 text-red-500"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <i className="ri-delete-bin-line"></i>
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="pt-4 flex justify-between font-medium">
                <span>Total</span>
                <span>₹{totalPrice.toLocaleString()}</span>
              </div>
            </div>
          )}
          
          <DialogFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsCartOpen(false)}
            >
              Continue Shopping
            </Button>
            <Button 
              type="button" 
              onClick={() => {
                setIsCartOpen(false);
                setIsCheckoutOpen(true);
              }}
              disabled={cart.length === 0}
            >
              Proceed to Checkout
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Render checkout dialog
  const renderCheckoutDialog = () => {
    return (
      <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Checkout</DialogTitle>
            <DialogDescription>
              Complete your order by providing your details.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCheckoutSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter your full name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="you@example.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Your contact number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter your full address" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cod" key="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="online" key="online">Online Payment</SelectItem>
                        <SelectItem value="bank_transfer" key="bank_transfer">Bank Transfer</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Order Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Any special instructions for your order" {...field} rows={2} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="space-y-2 pt-4">
                <h4 className="font-medium">Order Summary</h4>
                <div className="text-sm space-y-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>₹{(item.product.price * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-medium pt-2">
                  <span>Total</span>
                  <span>₹{totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <DialogFooter className="pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setIsCheckoutOpen(false);
                    setIsCartOpen(true);
                  }}
                >
                  Back to Cart
                </Button>
                <Button 
                  type="submit" 
                  disabled={createOrderMutation.isPending}
                >
                  {createOrderMutation.isPending ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Processing...
                    </>
                  ) : (
                    "Place Order"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Store Header */}
      <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-primary-700 dark:text-primary-400">
                {isLoadingStore ? <Skeleton className="h-8 w-32" /> : storeInfo?.storeName || 'Store'}
              </h1>
            </div>
            <nav className="hidden md:flex space-x-8 items-center">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">Home</a>
              <a href="#products" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">Products</a>
              <a href="#catalogues" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">Catalogues</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400">Contact</a>
            </nav>
            <div className="flex items-center space-x-4">
              <button className="text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white">
                <i className="ri-search-line text-lg"></i>
              </button>
              <button 
                className="md:hidden text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                onClick={() => document.getElementById('mobile-menu')?.classList.toggle('hidden')}
              >
                <i className="ri-menu-line text-lg"></i>
              </button>
            </div>
          </div>
          
          {/* Mobile menu */}
          <div id="mobile-menu" className="md:hidden hidden py-4 border-t border-gray-200 dark:border-gray-700">
            <nav className="flex flex-col space-y-4 px-2">
              <a href="#" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 py-2">Home</a>
              <a href="#products" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 py-2">Products</a>
              <a href="#catalogues" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 py-2">Catalogues</a>
              <a href="#contact" className="text-gray-700 dark:text-gray-300 hover:text-primary-700 dark:hover:text-primary-400 py-2">Contact</a>
            </nav>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="rounded-lg overflow-hidden bg-gradient-to-r from-primary-700 to-primary-900 mb-12">
            <div className="md:flex items-center">
              <div className="p-8 md:p-12 md:w-1/2">
                <h2 className="text-3xl font-bold text-black mb-4">New Collection</h2>
                <p className="text-black mb-6">
                  {isLoadingStore ? (
                    <Skeleton className="h-16 w-full" />
                  ) : (
                    storeInfo?.storeDescription || 'Discover our latest range of products for your everyday needs.'
                  )}
                </p>
                <Button className="bg-black text-primary-700 hover:bg-gray-100">
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
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Featured Catalogues</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {isLoadingCatalogues ? (
                Array(3).fill(null).map((_, index) => (
                  <div key={index} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden dark:bg-gray-800">
                    <Skeleton className="w-full h-44 dark:bg-gray-700" />
                    <div className="p-4">
                      <Skeleton className="h-6 w-3/4 mb-1 dark:bg-gray-700" />
                      <Skeleton className="h-4 w-1/3 mb-3 dark:bg-gray-700" />
                      <Skeleton className="h-8 w-36 dark:bg-gray-700" />
                    </div>
                  </div>
                ))
              ) : catalogues && catalogues.length > 0 ? (
                catalogues.map((catalogue) => (
                  <div key={catalogue.id} className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group bg-white dark:bg-gray-800">
                    <div className="aspect-w-16 aspect-h-9 bg-gray-100 dark:bg-gray-700 relative">
                      <img
                        src={catalogue.imageUrl || "https://images.unsplash.com/photo-1523275335684-37898b6baf30"}
                        alt={`${catalogue.name} Catalogue`}
                        className="w-full h-44 object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1 group-hover:text-primary-700 dark:group-hover:text-primary-400">{catalogue.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">{catalogue.description || 'View our collection'}</p>
                      <Link href={`/catalogue/${catalogue.id}`} className="text-primary-700 dark:text-primary-400 text-sm font-medium flex items-center hover:text-primary-800 dark:hover:text-primary-300">
                          View Catalogue <i className="ri-arrow-right-line ml-1"></i>
                      </Link>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-3 text-center py-6 text-gray-500 dark:text-gray-400">
                  No catalogues available.
                </div>
              )}
            </div>
          </div>

          {/* Popular Products */}
          <div id="products" className="mb-12">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Popular Products</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {isLoadingProducts ? (
                Array(4).fill(null).map((_, index) => (
                  <div key={index} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                    <Skeleton className="w-full h-44 dark:bg-gray-700" />
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                      <Skeleton className="h-5 w-3/4 mb-1 dark:bg-gray-700" />
                      <Skeleton className="h-4 w-1/2 mb-2 dark:bg-gray-700" />
                      <div className="flex justify-between items-center">
                        <Skeleton className="h-6 w-16 dark:bg-gray-700" />
                        <Skeleton className="h-9 w-9 rounded-full dark:bg-gray-700" />
                      </div>
                    </div>
                  </div>
                ))
              ) : products && products.length > 0 ? (
                products.map((product) => (
                  <div key={product.id} className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden group">
                    <div className="aspect-w-1 aspect-h-1 bg-gray-100 dark:bg-gray-700">
                      <img
                        src={product.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f"}
                        alt={product.name}
                        className="w-full h-44 object-contain p-4 group-hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                    <div className="p-4 border-t border-gray-100 dark:border-gray-700">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-primary-700 dark:group-hover:text-primary-400">{product.name}</h3>
                      <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{product.description || 'Product description'}</p>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-lg font-medium text-gray-900 dark:text-white">₹{product.price.toLocaleString()}</p>
                        
                <Button
                  size="sm"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-4 text-center py-6 text-gray-500 dark:text-gray-400">
                  No products available.
                </div>
              )}
            </div>
          </div>

          {/* Contact & WhatsApp Section */}
          <div id="contact" className="bg-gray-50 dark:bg-gray-800 rounded-lg p-6 mb-12 border border-gray-200 dark:border-gray-700">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">Have questions about our products?</h2>
              <p className="text-gray-600 dark:text-gray-300">We're here to help! Contact us directly via WhatsApp for quick assistance.</p>
            </div>
            <div className="flex justify-center">
              <a 
                href={isLoadingStore ? '#' : `https://wa.me/${storeInfo?.whatsappNumber || '9876543210'}`} 
                className="inline-flex items-center px-6 py-3 bg-green-500 text-white font-medium rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:focus:ring-offset-gray-900"
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
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="md:flex md:items-center md:justify-between">
            <div className="flex justify-center md:order-2 space-x-6">
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <i className="ri-instagram-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <i className="ri-facebook-circle-line text-xl"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <i className="ri-twitter-line text-xl"></i>
              </a>
            </div>
            <div className="mt-8 md:mt-0 md:order-1">
              <p className="text-center text-base text-gray-400 dark:text-gray-300">
                &copy; {new Date().getFullYear()} {isLoadingStore ? 'Store' : storeInfo?.storeName || 'Store'}. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      </footer>
      
      {/* Floating Cart Button */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          onClick={() => setIsCartOpen(true)}
          className="rounded-full h-16 w-16 shadow-lg"
        >
          <div className="relative">
            <i className="ri-shopping-cart-2-line text-2xl"></i>
            {cart.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {cart.length}
              </span>
            )}
          </div>
        </Button>
      </div>
      
      {/* Cart Dialog */}
      {renderCartDialog()}
      
      {/* Checkout Dialog */}
      {renderCheckoutDialog()}
    </div>
  );
}
