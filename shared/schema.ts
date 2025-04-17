import { pgTable, text, serial, integer, timestamp, boolean, pgEnum, real, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Enums
export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'processing',
  'shipped',
  'delivered',
  'cancelled'
]);

export const stockStatusEnum = pgEnum('stock_status', [
  'in_stock',
  'low_stock',
  'out_of_stock'
]);

// Users
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  storeName: text("store_name"),
  storeDescription: text("store_description"),
  storeUrl: text("store_url"),
  whatsappNumber: text("whatsapp_number"),
  primaryColor: text("primary_color").default('#0f766e'),
});

// Products
export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  sku: text("sku").notNull(),
  price: real("price").notNull(),
  stock: integer("stock").notNull().default(0),
  stockStatus: stockStatusEnum("stock_status").notNull().default('in_stock'),
  imageUrl: text("image_url"),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Categories
export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  userId: integer("user_id").notNull(),
});

// Catalogues
export const catalogues = pgTable("catalogues", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  imageUrl: text("image_url"),
  userId: integer("user_id").notNull(),
  isPublic: boolean("is_public").default(true),
  viewCount: integer("view_count").default(0),
  shareCount: integer("share_count").default(0),
  createdAt: timestamp("created_at").defaultNow(),
});

// Catalogue-Product Join Table
export const catalogueProducts = pgTable("catalogue_products", {
  id: serial("id").primaryKey(),
  catalogueId: integer("catalogue_id").notNull(),
  productId: integer("product_id").notNull(),
});

// Orders
export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderNumber: text("order_number").notNull(),
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email"),
  customerPhone: text("customer_phone"),
  totalAmount: real("total_amount").notNull(),
  status: orderStatusEnum("status").notNull().default('pending'),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Order Items
export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull(),
  productId: integer("product_id").notNull(),
  quantity: integer("quantity").notNull(),
  price: real("price").notNull(),
});

// Store Stats (for dashboard)
export const storeStats = pgTable("store_stats", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  totalRevenue: real("total_revenue").default(0),
  totalOrders: integer("total_orders").default(0),
  cataloguesShared: integer("catalogues_shared").default(0),
  totalProducts: integer("total_products").default(0),
  revenueChange: real("revenue_change").default(0),
  ordersChange: integer("orders_change").default(0),
  sharesChange: integer("shares_change").default(0),
  productsChange: integer("products_change").default(0),
  pendingOrders: integer("pending_orders").default(0),
  processingOrders: integer("processing_orders").default(0),
  completedOrders: integer("completed_orders").default(0),
  cancelledOrders: integer("cancelled_orders").default(0),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Schema for inserting new products
export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
  createdAt: true,
});

// Schema for inserting new categories
export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

// Schema for inserting new catalogues
export const insertCatalogueSchema = createInsertSchema(catalogues).omit({
  id: true,
  viewCount: true,
  shareCount: true,
  createdAt: true,
});

// Schema for inserting new orders
export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Schema for inserting order items
export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

// Schema for inserting new users
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

// Schema for inserting store settings
export const updateStoreSettingsSchema = createInsertSchema(users).pick({
  storeName: true,
  storeDescription: true,
  storeUrl: true,
  whatsappNumber: true,
  primaryColor: true,
}).partial();

// Shared types
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Catalogue = typeof catalogues.$inferSelect;
export type InsertCatalogue = z.infer<typeof insertCatalogueSchema>;

export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;

export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type StoreSettings = typeof users.$inferSelect;
export type UpdateStoreSettings = z.infer<typeof updateStoreSettingsSchema>;

export type StoreStats = typeof storeStats.$inferSelect;
