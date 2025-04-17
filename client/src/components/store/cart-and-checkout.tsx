import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Product } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";

// Define the cart item interface
interface CartItem {
  product: Product;
  quantity: number;
}

// Define the form schema for checkout
const checkoutFormSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Invalid email address").optional().or(z.literal("")),
  customerPhone: z.string().min(10, "Phone number must be at least 10 digits"),
  address: z.string().min(1, "Address is required"),
  paymentMode: z.enum(["cod", "online", "bank_transfer"]),
  notes: z.string().optional(),
});

type CheckoutFormValues = z.infer<typeof checkoutFormSchema>;

export function CartAndCheckout() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const { toast } = useToast();

  // Fetch products for the demo
  const { data: products, isLoading } = useQuery<Product[]>({
    queryKey: ["/api/products"],
  });

  // Setup form
  const form = useForm<CheckoutFormValues>({
    resolver: zodResolver(checkoutFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      address: "",
      paymentMode: "cod",
      notes: "",
    },
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (values: CheckoutFormValues) => {
      // Calculate total amount
      const totalAmount = cart.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );

      // Prepare order items
      const items = cart.map((item) => ({
        productId: item.product.id,
        quantity: item.quantity,
        price: item.product.price,
      }));

      // Create order payload
      const orderData = {
        ...values,
        totalAmount,
        items,
      };

      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      setOrderSuccess(true);
      setCart([]);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to place order: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Add product to cart
  const addToCart = (product: Product) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find(
        (item) => item.product.id === product.id
      );

      if (existingItem) {
        // Increase quantity if product already in cart
        return prevCart.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        // Add new product to cart
        return [...prevCart, { product, quantity: 1 }];
      }
    });

    toast({
      title: "Added to cart",
      description: `${product.name} has been added to your cart.`,
    });
  };

  // Remove item from cart
  const removeFromCart = (productId: number) => {
    setCart((prevCart) =>
      prevCart.filter((item) => item.product.id !== productId)
    );
  };

  // Update item quantity
  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity < 1) return;
    
    setCart((prevCart) =>
      prevCart.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  // Calculate total price
  const totalPrice = cart.reduce(
    (total, item) => total + item.product.price * item.quantity,
    0
  );

  // Handle checkout submission
  const onCheckoutSubmit = (values: CheckoutFormValues) => {
    createOrderMutation.mutate(values);
  };

  // Product cards for demo
  const renderProducts = () => {
    if (isLoading) {
      return <p>Loading products...</p>;
    }

    if (!products || products.length === 0) {
      return <p>No products available.</p>;
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {products.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-sm border border-gray-200 dark:border-gray-700"
          >
            <div className="h-48 overflow-hidden bg-gray-100 dark:bg-gray-900">
              {product.imageUrl ? (
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400 dark:text-gray-600">
                  <i className="ri-image-line text-4xl"></i>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                {product.name}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                {product.description || "No description available"}
              </p>
              <div className="flex justify-between items-center mt-4">
                <span className="font-medium text-primary-700 dark:text-primary-400">
                  ₹{product.price.toFixed(2)}
                </span>
                <Button
                  size="sm"
                  onClick={() => addToCart(product)}
                >
                  Add to Cart
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Cart dialog
  const renderCartDialog = () => (
    <Dialog open={isCartOpen} onOpenChange={setIsCartOpen}>
      <DialogContent className="sm:max-w-md dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">Your Cart</DialogTitle>
        </DialogHeader>
        {cart.length === 0 ? (
          <div className="py-6 text-center text-gray-500 dark:text-gray-400">
            Your cart is empty
          </div>
        ) : (
          <>
            <div className="space-y-4 max-h-96 overflow-auto">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex-1">
                    <h4 className="font-medium dark:text-white">{item.product.name}</h4>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      ₹{item.product.price.toFixed(2)} × {item.quantity}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                    >
                      <i className="ri-subtract-line"></i>
                    </Button>
                    <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    >
                      <i className="ri-add-line"></i>
                    </Button>
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => removeFromCart(item.product.id)}
                    >
                      <i className="ri-delete-bin-line text-red-500"></i>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Separator className="my-4 dark:bg-gray-700" />
            <div className="flex justify-between py-2 font-medium dark:text-white">
              <span>Total</span>
              <span>₹{totalPrice.toFixed(2)}</span>
            </div>
            <DialogFooter className="sm:justify-between">
              <Button
                variant="outline"
                onClick={() => setIsCartOpen(false)}
                className="dark:border-gray-700 dark:text-gray-300"
              >
                Continue Shopping
              </Button>
              <Button 
                onClick={() => {
                  setIsCartOpen(false);
                  setIsCheckoutOpen(true);
                }}
                disabled={cart.length === 0}
              >
                Checkout
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );

  // Checkout dialog
  const renderCheckoutDialog = () => (
    <Dialog open={isCheckoutOpen} onOpenChange={setIsCheckoutOpen}>
      <DialogContent className="sm:max-w-lg dark:bg-gray-800">
        <DialogHeader>
          <DialogTitle className="dark:text-white">
            {orderSuccess ? "Order Placed Successfully!" : "Checkout"}
          </DialogTitle>
        </DialogHeader>
        
        {orderSuccess ? (
          <div className="py-6 text-center">
            <div className="mb-4 flex justify-center">
              <div className="rounded-full bg-green-100 p-3 dark:bg-green-900">
                <i className="ri-check-line text-2xl text-green-600 dark:text-green-400"></i>
              </div>
            </div>
            <h3 className="text-xl font-medium mb-2 dark:text-white">Thank you for your order!</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Your order has been placed successfully. We'll process it soon.
            </p>
            <Button
              onClick={() => {
                setOrderSuccess(false);
                setIsCheckoutOpen(false);
              }}
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onCheckoutSubmit)} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="customerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Your full name" {...field} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customerPhone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="dark:text-gray-300">Phone Number</FormLabel>
                      <FormControl>
                        <Input placeholder="Your phone number" {...field} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="customerEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-300">Email (Optional)</FormLabel>
                    <FormControl>
                      <Input placeholder="Your email address" {...field} className="dark:bg-gray-700 dark:border-gray-600 dark:text-white" />
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
                    <FormLabel className="dark:text-gray-300">Delivery Address</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Your full address with pin code" 
                        {...field} 
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={3} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="paymentMode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-300">Payment Method</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                          <SelectValue placeholder="Select a payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="dark:bg-gray-800 dark:border-gray-700">
                        <SelectItem value="cod">Cash on Delivery</SelectItem>
                        <SelectItem value="online">Online Payment</SelectItem>
                        <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
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
                    <FormLabel className="dark:text-gray-300">Order Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Any special instructions for your order" 
                        {...field} 
                        className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                        rows={2} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <Separator className="my-4 dark:bg-gray-700" />
              
              <div className="space-y-2">
                <h4 className="font-medium dark:text-white">Order Summary</h4>
                <div className="text-sm space-y-1">
                  {cart.map((item) => (
                    <div key={item.product.id} className="flex justify-between dark:text-gray-300">
                      <span>{item.product.name} × {item.quantity}</span>
                      <span>₹{(item.product.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between font-medium pt-2 dark:text-white">
                  <span>Total</span>
                  <span>₹{totalPrice.toFixed(2)}</span>
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
                  className="dark:border-gray-700 dark:text-gray-300"
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
        )}
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="my-12">
      {/* Product Section */}
      <div className="mb-12">
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-6">
          Our Products
        </h2>
        {renderProducts()}
      </div>

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