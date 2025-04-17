import { 
  users, type User, type InsertUser, 
  products, type Product, type InsertProduct,
  categories, type Category, type InsertCategory,
  catalogues, type Catalogue, type InsertCatalogue,
  catalogueProducts,
  orders, type Order, type InsertOrder,
  orderItems, type OrderItem, type InsertOrderItem,
  storeStats, type StoreStats, type UpdateStoreSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateStoreSettings(userId: number, settings: UpdateStoreSettings): Promise<User>;

  // Product methods
  createProduct(product: InsertProduct): Promise<Product>;
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(userId: number): Promise<Product[]>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;

  // Category methods
  createCategory(category: InsertCategory): Promise<Category>;
  getCategory(id: number): Promise<Category | undefined>;
  getCategories(userId: number): Promise<Category[]>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;

  // Catalogue methods
  createCatalogue(catalogue: InsertCatalogue): Promise<Catalogue>;
  getCatalogue(id: number): Promise<Catalogue | undefined>;
  getCatalogues(userId: number): Promise<Catalogue[]>;
  updateCatalogue(id: number, catalogue: Partial<InsertCatalogue>): Promise<Catalogue | undefined>;
  deleteCatalogue(id: number): Promise<boolean>;
  incrementCatalogueViewCount(id: number): Promise<void>;
  incrementCatalogueShareCount(id: number): Promise<void>;
  getPopularCatalogues(userId: number, limit?: number): Promise<Catalogue[]>;

  // Catalogue Products methods
  addProductToCatalogue(catalogueId: number, productId: number): Promise<void>;
  removeProductFromCatalogue(catalogueId: number, productId: number): Promise<void>;
  getProductsInCatalogue(catalogueId: number): Promise<Product[]>;

  // Order methods
  createOrder(order: InsertOrder, items: InsertOrderItem[]): Promise<Order>;
  getOrder(id: number): Promise<Order | undefined>;
  getOrders(userId: number, limit?: number): Promise<Order[]>;
  updateOrderStatus(id: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order | undefined>;
  getRecentOrders(userId: number, limit?: number): Promise<Order[]>;
  
  // Stats methods
  getStoreStats(userId: number): Promise<StoreStats | undefined>;
  updateStoreStats(userId: number, stats: Partial<StoreStats>): Promise<StoreStats>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private products: Map<number, Product>;
  private categories: Map<number, Category>;
  private catalogues: Map<number, Catalogue>;
  private catalogueProducts: Map<string, { catalogueId: number, productId: number }>;
  private orders: Map<number, Order>;
  private orderItems: Map<number, OrderItem[]>;
  private stats: Map<number, StoreStats>;
  
  private userId: number = 1;
  private productId: number = 1;
  private categoryId: number = 1;
  private catalogueId: number = 1;
  private catalogueProductId: number = 1;
  private orderId: number = 1;
  private orderItemId: number = 1;
  private statsId: number = 1;

  constructor() {
    this.users = new Map();
    this.products = new Map();
    this.categories = new Map();
    this.catalogues = new Map();
    this.catalogueProducts = new Map();
    this.orders = new Map();
    this.orderItems = new Map();
    this.stats = new Map();
    
    // Add default user
    this.createUser({
      username: 'demo',
      password: 'password'
    }).then(user => {
      // Add default store stats
      this.updateStoreStats(user.id, {
        totalRevenue: 28450,
        totalOrders: 146,
        cataloguesShared: 52,
        totalProducts: 38,
        revenueChange: 12,
        ordersChange: 8,
        sharesChange: 24,
        productsChange: 5,
        pendingOrders: 12,
        processingOrders: 8,
        completedOrders: 126,
        cancelledOrders: 5
      });

      // Add default categories
      this.createCategory({
        name: 'Electronics',
        description: 'Electronic gadgets and devices',
        userId: user.id
      });
      this.createCategory({
        name: 'Accessories',
        description: 'Fashion accessories',
        userId: user.id
      });
      this.createCategory({
        name: 'Footwear',
        description: 'Shoes and footwear',
        userId: user.id
      });
      this.createCategory({
        name: 'Sports',
        description: 'Sports equipment',
        userId: user.id
      });
      
      // Update user with store info
      this.updateStoreSettings(user.id, {
        storeName: 'YourStore',
        storeDescription: 'Your one-stop shop for quality electronics, accessories, footwear and more. We provide the best products at competitive prices.',
        storeUrl: 'yourstore',
        whatsappNumber: '9876543210',
        primaryColor: '#0f766e'
      });
    });
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async updateStoreSettings(userId: number, settings: UpdateStoreSettings): Promise<User> {
    const user = await this.getUser(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    const updatedUser = {
      ...user,
      ...settings
    };
    
    this.users.set(userId, updatedUser);
    return updatedUser;
  }

  // Product methods
  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.productId++;
    const createdAt = new Date();
    const product: Product = { ...insertProduct, id, createdAt };
    this.products.set(id, product);
    
    // Update stats
    const stats = await this.getStoreStats(insertProduct.userId);
    if (stats) {
      await this.updateStoreStats(insertProduct.userId, {
        totalProducts: stats.totalProducts + 1,
        productsChange: stats.productsChange + 1
      });
    }
    
    return product;
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProducts(userId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.userId === userId
    );
  }

  async updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined> {
    const existingProduct = await this.getProduct(id);
    if (!existingProduct) {
      return undefined;
    }
    
    const updatedProduct = { ...existingProduct, ...product };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  async deleteProduct(id: number): Promise<boolean> {
    return this.products.delete(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(
      (product) => product.categoryId === categoryId
    );
  }

  // Category methods
  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.categoryId++;
    const category: Category = { ...insertCategory, id };
    this.categories.set(id, category);
    return category;
  }

  async getCategory(id: number): Promise<Category | undefined> {
    return this.categories.get(id);
  }

  async getCategories(userId: number): Promise<Category[]> {
    return Array.from(this.categories.values()).filter(
      (category) => category.userId === userId
    );
  }

  async updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined> {
    const existingCategory = await this.getCategory(id);
    if (!existingCategory) {
      return undefined;
    }
    
    const updatedCategory = { ...existingCategory, ...category };
    this.categories.set(id, updatedCategory);
    return updatedCategory;
  }

  async deleteCategory(id: number): Promise<boolean> {
    return this.categories.delete(id);
  }

  // Catalogue methods
  async createCatalogue(insertCatalogue: InsertCatalogue): Promise<Catalogue> {
    const id = this.catalogueId++;
    const createdAt = new Date();
    const catalogue: Catalogue = { 
      ...insertCatalogue, 
      id, 
      createdAt,
      viewCount: 0,
      shareCount: 0
    };
    this.catalogues.set(id, catalogue);
    return catalogue;
  }

  async getCatalogue(id: number): Promise<Catalogue | undefined> {
    return this.catalogues.get(id);
  }

  async getCatalogues(userId: number): Promise<Catalogue[]> {
    return Array.from(this.catalogues.values()).filter(
      (catalogue) => catalogue.userId === userId
    );
  }

  async updateCatalogue(id: number, catalogue: Partial<InsertCatalogue>): Promise<Catalogue | undefined> {
    const existingCatalogue = await this.getCatalogue(id);
    if (!existingCatalogue) {
      return undefined;
    }
    
    const updatedCatalogue = { ...existingCatalogue, ...catalogue };
    this.catalogues.set(id, updatedCatalogue);
    return updatedCatalogue;
  }

  async deleteCatalogue(id: number): Promise<boolean> {
    // Delete associated catalogue products
    Array.from(this.catalogueProducts.keys()).forEach(key => {
      const entry = this.catalogueProducts.get(key);
      if (entry && entry.catalogueId === id) {
        this.catalogueProducts.delete(key);
      }
    });
    
    return this.catalogues.delete(id);
  }

  async incrementCatalogueViewCount(id: number): Promise<void> {
    const catalogue = await this.getCatalogue(id);
    if (catalogue) {
      catalogue.viewCount += 1;
      this.catalogues.set(id, catalogue);
    }
  }

  async incrementCatalogueShareCount(id: number): Promise<void> {
    const catalogue = await this.getCatalogue(id);
    if (catalogue) {
      catalogue.shareCount += 1;
      this.catalogues.set(id, catalogue);
      
      // Update stats
      const stats = await this.getStoreStats(catalogue.userId);
      if (stats) {
        await this.updateStoreStats(catalogue.userId, {
          cataloguesShared: stats.cataloguesShared + 1,
          sharesChange: stats.sharesChange + 1
        });
      }
    }
  }

  async getPopularCatalogues(userId: number, limit: number = 3): Promise<Catalogue[]> {
    const userCatalogues = await this.getCatalogues(userId);
    return userCatalogues
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, limit);
  }

  // Catalogue Products methods
  async addProductToCatalogue(catalogueId: number, productId: number): Promise<void> {
    const key = `${catalogueId}:${productId}`;
    if (!this.catalogueProducts.has(key)) {
      const id = this.catalogueProductId++;
      this.catalogueProducts.set(key, { catalogueId, productId });
    }
  }

  async removeProductFromCatalogue(catalogueId: number, productId: number): Promise<void> {
    const key = `${catalogueId}:${productId}`;
    this.catalogueProducts.delete(key);
  }

  async getProductsInCatalogue(catalogueId: number): Promise<Product[]> {
    const productIds = Array.from(this.catalogueProducts.values())
      .filter(cp => cp.catalogueId === catalogueId)
      .map(cp => cp.productId);
    
    return Array.from(this.products.values()).filter(
      product => productIds.includes(product.id)
    );
  }

  // Order methods
  async createOrder(insertOrder: InsertOrder, items: InsertOrderItem[]): Promise<Order> {
    const id = this.orderId++;
    const createdAt = new Date();
    const updatedAt = createdAt;
    const order: Order = { ...insertOrder, id, createdAt, updatedAt };
    this.orders.set(id, order);
    
    // Save order items
    const orderItemsList: OrderItem[] = [];
    for (const item of items) {
      const itemId = this.orderItemId++;
      const orderItem: OrderItem = { ...item, id, orderId: id };
      orderItemsList.push(orderItem);
    }
    this.orderItems.set(id, orderItemsList);
    
    // Update stats
    const stats = await this.getStoreStats(insertOrder.userId);
    if (stats) {
      await this.updateStoreStats(insertOrder.userId, {
        totalOrders: stats.totalOrders + 1,
        ordersChange: stats.ordersChange + 1,
        totalRevenue: stats.totalRevenue + insertOrder.totalAmount,
        pendingOrders: stats.pendingOrders + 1
      });
    }
    
    return order;
  }

  async getOrder(id: number): Promise<Order | undefined> {
    return this.orders.get(id);
  }

  async getOrders(userId: number, limit?: number): Promise<Order[]> {
    let userOrders = Array.from(this.orders.values())
      .filter(order => order.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    
    if (limit) {
      userOrders = userOrders.slice(0, limit);
    }
    
    return userOrders;
  }

  async updateOrderStatus(id: number, status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'): Promise<Order | undefined> {
    const order = await this.getOrder(id);
    if (!order) {
      return undefined;
    }
    
    const oldStatus = order.status;
    const updatedOrder = { ...order, status, updatedAt: new Date() };
    this.orders.set(id, updatedOrder);
    
    // Update stats
    const stats = await this.getStoreStats(order.userId);
    if (stats) {
      const statsUpdate: Partial<StoreStats> = {};
      
      // Decrement old status count
      if (oldStatus === 'pending') statsUpdate.pendingOrders = stats.pendingOrders - 1;
      else if (oldStatus === 'processing') statsUpdate.processingOrders = stats.processingOrders - 1;
      else if (oldStatus === 'delivered' || oldStatus === 'shipped') statsUpdate.completedOrders = stats.completedOrders - 1;
      else if (oldStatus === 'cancelled') statsUpdate.cancelledOrders = stats.cancelledOrders - 1;
      
      // Increment new status count
      if (status === 'pending') statsUpdate.pendingOrders = (stats.pendingOrders || 0) + 1;
      else if (status === 'processing') statsUpdate.processingOrders = (stats.processingOrders || 0) + 1;
      else if (status === 'delivered' || status === 'shipped') statsUpdate.completedOrders = (stats.completedOrders || 0) + 1;
      else if (status === 'cancelled') statsUpdate.cancelledOrders = (stats.cancelledOrders || 0) + 1;
      
      await this.updateStoreStats(order.userId, statsUpdate);
    }
    
    return updatedOrder;
  }

  async getRecentOrders(userId: number, limit: number = 5): Promise<Order[]> {
    return this.getOrders(userId, limit);
  }

  // Stats methods
  async getStoreStats(userId: number): Promise<StoreStats | undefined> {
    return Array.from(this.stats.values()).find(
      stats => stats.userId === userId
    );
  }

  async updateStoreStats(userId: number, statsUpdate: Partial<StoreStats>): Promise<StoreStats> {
    let stats = await this.getStoreStats(userId);
    
    if (!stats) {
      // Create new stats if not exists
      const id = this.statsId++;
      const now = new Date();
      stats = {
        id,
        userId,
        totalRevenue: 0,
        totalOrders: 0,
        cataloguesShared: 0,
        totalProducts: 0,
        revenueChange: 0,
        ordersChange: 0,
        sharesChange: 0,
        productsChange: 0,
        pendingOrders: 0,
        processingOrders: 0,
        completedOrders: 0,
        cancelledOrders: 0,
        updatedAt: now
      };
    }
    
    const updatedStats = { ...stats, ...statsUpdate, updatedAt: new Date() };
    this.stats.set(updatedStats.id, updatedStats);
    return updatedStats;
  }
}

export const storage = new MemStorage();
