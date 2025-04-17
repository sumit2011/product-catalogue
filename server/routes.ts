import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertProductSchema, 
  insertCatalogueSchema,
  insertCategorySchema, 
  insertOrderSchema,
  insertOrderItemSchema,
  updateStoreSettingsSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // API routes
  const apiRouter = express.Router();
  
  // Products API
  apiRouter.get("/products", async (req: Request, res: Response) => {
    // The userId would normally come from authenticated user
    // For development, we'll use a default user ID
    const userId = 1;
    const products = await storage.getProducts(userId);
    res.json(products);
  });
  
  apiRouter.get("/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const product = await storage.getProduct(id);
    
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.json(product);
  });
  
  apiRouter.post("/products", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Default user ID for development
      const productData = insertProductSchema.parse({
        ...req.body,
        userId
      });
      
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create product" });
    }
  });
  
  apiRouter.put("/products/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      
      const updatedProduct = await storage.updateProduct(id, productData);
      if (!updatedProduct) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(updatedProduct);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid product data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update product" });
    }
  });
  
  apiRouter.delete("/products/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteProduct(id);
    
    if (!success) {
      return res.status(404).json({ message: "Product not found" });
    }
    
    res.status(204).end();
  });
  
  // Categories API
  apiRouter.get("/categories", async (req: Request, res: Response) => {
    const userId = 1; // Default user ID for development
    const categories = await storage.getCategories(userId);
    res.json(categories);
  });
  
  apiRouter.post("/categories", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Default user ID for development
      const categoryData = insertCategorySchema.parse({
        ...req.body,
        userId
      });
      
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });
  
  // Catalogues API
  apiRouter.get("/catalogues", async (req: Request, res: Response) => {
    const userId = 1; // Default user ID for development
    const catalogues = await storage.getCatalogues(userId);
    res.json(catalogues);
  });
  
  apiRouter.get("/catalogues/popular", async (req: Request, res: Response) => {
    const userId = 1; // Default user ID for development
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 3;
    const catalogues = await storage.getPopularCatalogues(userId, limit);
    res.json(catalogues);
  });
  
  apiRouter.get("/catalogues/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const catalogue = await storage.getCatalogue(id);
    
    if (!catalogue) {
      return res.status(404).json({ message: "Catalogue not found" });
    }
    
    // Increment view count
    await storage.incrementCatalogueViewCount(id);
    
    // Get products in the catalogue
    const products = await storage.getProductsInCatalogue(id);
    
    res.json({
      ...catalogue,
      products
    });
  });
  
  apiRouter.post("/catalogues", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Default user ID for development
      const catalogueData = insertCatalogueSchema.parse({
        ...req.body,
        userId
      });
      
      const catalogue = await storage.createCatalogue(catalogueData);
      
      // Add products to catalogue if provided
      if (req.body.productIds && Array.isArray(req.body.productIds)) {
        for (const productId of req.body.productIds) {
          await storage.addProductToCatalogue(catalogue.id, productId);
        }
      }
      
      res.status(201).json(catalogue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid catalogue data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create catalogue" });
    }
  });
  
  apiRouter.put("/catalogues/:id", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const catalogueData = insertCatalogueSchema.partial().parse(req.body);
      
      const updatedCatalogue = await storage.updateCatalogue(id, catalogueData);
      if (!updatedCatalogue) {
        return res.status(404).json({ message: "Catalogue not found" });
      }
      
      // Update products in catalogue if provided
      if (req.body.productIds && Array.isArray(req.body.productIds)) {
        // Get current products
        const currentProducts = await storage.getProductsInCatalogue(id);
        const currentProductIds = currentProducts.map(p => p.id);
        
        // Remove products no longer in the list
        for (const productId of currentProductIds) {
          if (!req.body.productIds.includes(productId)) {
            await storage.removeProductFromCatalogue(id, productId);
          }
        }
        
        // Add new products
        for (const productId of req.body.productIds) {
          if (!currentProductIds.includes(productId)) {
            await storage.addProductToCatalogue(id, productId);
          }
        }
      }
      
      res.json(updatedCatalogue);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid catalogue data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update catalogue" });
    }
  });
  
  apiRouter.delete("/catalogues/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const success = await storage.deleteCatalogue(id);
    
    if (!success) {
      return res.status(404).json({ message: "Catalogue not found" });
    }
    
    res.status(204).end();
  });
  
  apiRouter.post("/catalogues/:id/share", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const catalogue = await storage.getCatalogue(id);
    
    if (!catalogue) {
      return res.status(404).json({ message: "Catalogue not found" });
    }
    
    await storage.incrementCatalogueShareCount(id);
    
    // Generate WhatsApp share link
    const user = await storage.getUser(catalogue.userId);
    if (!user || !user.whatsappNumber) {
      return res.status(400).json({ message: "WhatsApp number not configured" });
    }
    
    // Get hostname from request
    const host = req.get('host') || 'localhost:5000';
    const protocol = req.protocol || 'http';
    
    // Build share message
    const message = req.body.message || `Check out my ${catalogue.name} catalogue!`;
    const catalogueUrl = `${protocol}://${host}/catalogue/${id}`;
    const whatsappUrl = `https://wa.me/${user.whatsappNumber}?text=${encodeURIComponent(message + ' ' + catalogueUrl)}`;
    
    res.json({
      whatsappUrl,
      catalogueUrl,
      shareCount: catalogue.shareCount + 1
    });
  });
  
  // Products in Catalogue API
  apiRouter.get("/catalogues/:id/products", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const catalogue = await storage.getCatalogue(id);
    
    if (!catalogue) {
      return res.status(404).json({ message: "Catalogue not found" });
    }
    
    const products = await storage.getProductsInCatalogue(id);
    res.json(products);
  });
  
  apiRouter.post("/catalogues/:id/products", async (req: Request, res: Response) => {
    try {
      const catalogueId = parseInt(req.params.id);
      const productId = parseInt(req.body.productId);
      
      const catalogue = await storage.getCatalogue(catalogueId);
      const product = await storage.getProduct(productId);
      
      if (!catalogue) {
        return res.status(404).json({ message: "Catalogue not found" });
      }
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      await storage.addProductToCatalogue(catalogueId, productId);
      res.status(201).json({ message: "Product added to catalogue" });
    } catch (error) {
      res.status(500).json({ message: "Failed to add product to catalogue" });
    }
  });
  
  apiRouter.delete("/catalogues/:catalogueId/products/:productId", async (req: Request, res: Response) => {
    const catalogueId = parseInt(req.params.catalogueId);
    const productId = parseInt(req.params.productId);
    
    const catalogue = await storage.getCatalogue(catalogueId);
    
    if (!catalogue) {
      return res.status(404).json({ message: "Catalogue not found" });
    }
    
    await storage.removeProductFromCatalogue(catalogueId, productId);
    res.status(204).end();
  });
  
  // Orders API
  apiRouter.get("/orders", async (req: Request, res: Response) => {
    const userId = 1; // Default user ID for development
    const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
    const orders = await storage.getOrders(userId, limit);
    res.json(orders);
  });
  
  apiRouter.get("/orders/recent", async (req: Request, res: Response) => {
    const userId = 1; // Default user ID for development
    const limit = req.query.limit ? parseInt(req.query.limit as string) : 5;
    const orders = await storage.getRecentOrders(userId, limit);
    res.json(orders);
  });
  
  apiRouter.get("/orders/:id", async (req: Request, res: Response) => {
    const id = parseInt(req.params.id);
    const order = await storage.getOrder(id);
    
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }
    
    res.json(order);
  });
  
  apiRouter.post("/orders", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Default user ID for development
      
      // Generate a unique order number
      const orderNumber = `ORD-${Math.floor(1000 + Math.random() * 9000)}`;
      
      const orderData = insertOrderSchema.parse({
        ...req.body,
        userId,
        orderNumber
      });
      
      // Parse and validate order items
      if (!req.body.items || !Array.isArray(req.body.items) || req.body.items.length === 0) {
        return res.status(400).json({ message: "Order must contain at least one item" });
      }
      
      const orderItems = req.body.items.map((item: any) => 
        insertOrderItemSchema.parse({
          ...item,
          orderId: 0 // Will be updated after order creation
        })
      );
      
      const order = await storage.createOrder(orderData, orderItems);
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid order data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create order" });
    }
  });
  
  apiRouter.put("/orders/:id/status", async (req: Request, res: Response) => {
    try {
      const id = parseInt(req.params.id);
      const status = z.enum(['pending', 'processing', 'shipped', 'delivered', 'cancelled']).parse(req.body.status);
      
      const updatedOrder = await storage.updateOrderStatus(id, status);
      if (!updatedOrder) {
        return res.status(404).json({ message: "Order not found" });
      }
      
      res.json(updatedOrder);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid status", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update order status" });
    }
  });
  
  // Store Stats API
  apiRouter.get("/stats", async (req: Request, res: Response) => {
    const userId = 1; // Default user ID for development
    const stats = await storage.getStoreStats(userId);
    
    if (!stats) {
      return res.status(404).json({ message: "Stats not found" });
    }
    
    res.json(stats);
  });
  
  // Store Settings API
  apiRouter.get("/store", async (req: Request, res: Response) => {
    const userId = 1; // Default user ID for development
    const user = await storage.getUser(userId);
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    
    // Remove sensitive info
    const { password, ...storeInfo } = user;
    res.json(storeInfo);
  });
  
  apiRouter.put("/store", async (req: Request, res: Response) => {
    try {
      const userId = 1; // Default user ID for development
      const storeData = updateStoreSettingsSchema.parse(req.body);
      
      const updatedUser = await storage.updateStoreSettings(userId, storeData);
      const { password, ...storeInfo } = updatedUser;
      
      res.json(storeInfo);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid store settings", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update store settings" });
    }
  });
  
  // Mount API routes with prefix
  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
