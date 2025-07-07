import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, sql, count, sum, lt, and, desc } from "drizzle-orm";
import { inventoryItems } from "../shared/schema";

export function registerWorkingInventoryRoutes(app: Express) {
  // Get inventory statistics
  app.get("/api/inventory/stats", async (req: Request, res: Response) => {
    try {
      // Get total items
      const totalItemsResult = await db.select({ count: count() }).from(inventoryItems);
      const totalItems = totalItemsResult[0]?.count || 0;

      // Get total quantity using actual column names
      const totalQuantityResult = await db.select({ 
        total: sum(sql`current_quantity`) 
      }).from(inventoryItems);
      const totalQuantity = totalQuantityResult[0]?.total || 0;

      // Get low stock items using actual column names
      const lowStockResult = await db.select({ count: count() })
        .from(inventoryItems)
        .where(sql`current_quantity <= minimum_threshold`);
      const lowStockItems = lowStockResult[0]?.count || 0;

      // Get out of stock using actual column names
      const outOfStockResult = await db.select({ count: count() })
        .from(inventoryItems)
        .where(sql`current_quantity = 0`);
      const outOfStockItems = outOfStockResult[0]?.count || 0;

      // Get total value using actual column names
      const totalValueResult = await db.select({ 
        total: sum(sql`current_quantity * unit_price`) 
      }).from(inventoryItems);
      const totalValue = totalValueResult[0]?.total || 0;

      res.json({
        totalItems,
        totalQuantity: Number(totalQuantity),
        lowStockItems,
        outOfStockItems,
        totalValue: Number(totalValue),
        categories: 0
      });
    } catch (error) {
      console.error("Error fetching inventory stats:", error);
      res.status(500).json({ error: "Failed to fetch inventory statistics" });
    }
  });

  // Get all inventory items
  app.get("/api/inventory/items", async (req: Request, res: Response) => {
    try {
      const items = await db.select().from(inventoryItems).orderBy(sql`created_at DESC`);
      res.json(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });

  // Add new inventory item
  app.post("/api/inventory/items", async (req: Request, res: Response) => {
    try {
      const { name, nameBn, category, currentQuantity, minimumThreshold, unit, purchasePrice, supplier, location, description, condition } = req.body;

      const [newItem] = await db.insert(inventoryItems).values({
        name: name || '',
        nameBn: nameBn || '',
        category: category || '',
        currentQuantity: parseInt(currentQuantity) || 0,
        minimumThreshold: parseInt(minimumThreshold) || 10,
        unit: unit || 'pieces',
        purchasePrice: String(parseFloat(purchasePrice) || 0),
        supplier,
        location: location || 'Main Store',
        condition: condition || 'good',
        description
      }).returning();

      res.json(newItem);
    } catch (error) {
      console.error("Error adding inventory item:", error);
      res.status(500).json({ error: "Failed to add inventory item" });
    }
  });

  // Update inventory item
  app.patch("/api/inventory/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const { name, nameBn, category, currentQuantity, minimumThreshold, unit, purchasePrice, supplier, location, description, condition } = req.body;

      const [updatedItem] = await db.update(inventoryItems)
        .set({
          name,
          nameBn,
          category,
          currentQuantity: parseInt(currentQuantity) || 0,
          minimumThreshold: parseInt(minimumThreshold) || 10,
          unit: unit || 'pieces',
          purchasePrice: String(parseFloat(purchasePrice) || 0),
          supplier,
          location,
          condition: condition || 'good',
          description
        })
        .where(eq(inventoryItems.id, itemId))
        .returning();

      if (!updatedItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(updatedItem);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  // Delete inventory item
  app.delete("/api/inventory/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);

      const [deletedItem] = await db.delete(inventoryItems)
        .where(eq(inventoryItems.id, itemId))
        .returning();

      if (!deletedItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json({ message: "Item deleted successfully" });
    } catch (error) {
      console.error("Error deleting inventory item:", error);
      res.status(500).json({ error: "Failed to delete inventory item" });
    }
  });

  // Update item quantity (for stock movements)
  app.post("/api/inventory/items/:id/adjust", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const { adjustment, reason } = req.body;

      // Get current item
      const [currentItem] = await db.select()
        .from(inventoryItems)
        .where(eq(inventoryItems.id, itemId));

      if (!currentItem) {
        return res.status(404).json({ error: "Item not found" });
      }

      const newQuantity = currentItem.currentQuantity + parseInt(adjustment);

      // Update quantity
      const [updatedItem] = await db.update(inventoryItems)
        .set({ currentQuantity: newQuantity })
        .where(eq(inventoryItems.id, itemId))
        .returning();

      res.json(updatedItem);
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      res.status(500).json({ error: "Failed to adjust inventory" });
    }
  });

  // Get low stock items
  app.get("/api/inventory/low-stock", async (req: Request, res: Response) => {
    try {
      const lowStockItems = await db.select()
        .from(inventoryItems)
        .where(sql`${inventoryItems.currentQuantity} <= ${inventoryItems.minimumThreshold}`)
        .orderBy(inventoryItems.currentQuantity);

      res.json(lowStockItems);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  });
}