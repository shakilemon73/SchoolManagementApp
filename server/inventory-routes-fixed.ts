import { Express, Request, Response } from "express";
import { db } from "./db";
import { sql } from "drizzle-orm";

export function registerFixedInventoryRoutes(app: Express) {
  // Get inventory statistics
  app.get("/api/inventory/stats", async (req: Request, res: Response) => {
    try {
      // Get total items
      const totalItemsResult = await db.execute(sql`SELECT COUNT(*) as count FROM inventory_items`);
      const totalItems = totalItemsResult.rows[0]?.count || 0;

      // Get total quantity
      const totalQuantityResult = await db.execute(sql`SELECT SUM(current_quantity) as total FROM inventory_items`);
      const totalQuantity = totalQuantityResult.rows[0]?.total || 0;

      // Get low stock items
      const lowStockResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM inventory_items 
        WHERE current_quantity <= minimum_threshold
      `);
      const lowStockItems = lowStockResult.rows[0]?.count || 0;

      // Get out of stock
      const outOfStockResult = await db.execute(sql`
        SELECT COUNT(*) as count FROM inventory_items 
        WHERE current_quantity = 0
      `);
      const outOfStockItems = outOfStockResult.rows[0]?.count || 0;

      // Get total value
      const totalValueResult = await db.execute(sql`
        SELECT SUM(current_quantity * unit_price) as total FROM inventory_items
      `);
      const totalValue = totalValueResult.rows[0]?.total || 0;

      res.json({
        totalItems: Number(totalItems),
        totalQuantity: Number(totalQuantity),
        lowStockItems: Number(lowStockItems),
        outOfStockItems: Number(outOfStockItems),
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
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        ORDER BY created_at DESC
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
      res.status(500).json({ error: "Failed to fetch inventory items" });
    }
  });

  // Add new inventory item
  app.post("/api/inventory/items", async (req: Request, res: Response) => {
    try {
      const { 
        name, 
        name_bn, 
        description, 
        category_id, 
        current_quantity, 
        minimum_threshold, 
        unit, 
        unit_price, 
        supplier, 
        location, 
        condition,
        subcategory,
        brand,
        model,
        serial_number
      } = req.body;

      const result = await db.execute(sql`
        INSERT INTO inventory_items (
          name, name_bn, description, category_id, current_quantity, 
          minimum_threshold, unit, unit_price, supplier, location, 
          condition, subcategory, brand, model, serial_number, school_id
        ) VALUES (
          ${name || ''}, 
          ${name_bn || ''}, 
          ${description || ''}, 
          ${category_id || 1}, 
          ${parseInt(current_quantity) || 0}, 
          ${parseInt(minimum_threshold) || 10}, 
          ${unit || 'pieces'}, 
          ${parseFloat(unit_price) || 0}, 
          ${supplier || ''}, 
          ${location || 'Main Store'}, 
          ${condition || 'good'}, 
          ${subcategory || ''}, 
          ${brand || ''}, 
          ${model || ''}, 
          ${serial_number || ''}, 
          1
        ) RETURNING *
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error adding inventory item:", error);
      res.status(500).json({ error: "Failed to add inventory item" });
    }
  });

  // Update inventory item
  app.patch("/api/inventory/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);
      const { 
        name, 
        name_bn, 
        description, 
        category_id, 
        current_quantity, 
        minimum_threshold, 
        unit, 
        unit_price, 
        supplier, 
        location, 
        condition,
        subcategory,
        brand,
        model,
        serial_number
      } = req.body;

      const result = await db.execute(sql`
        UPDATE inventory_items SET
          name = ${name},
          name_bn = ${name_bn},
          description = ${description},
          category_id = ${category_id},
          current_quantity = ${parseInt(current_quantity) || 0},
          minimum_threshold = ${parseInt(minimum_threshold) || 10},
          unit = ${unit},
          unit_price = ${parseFloat(unit_price) || 0},
          supplier = ${supplier},
          location = ${location},
          condition = ${condition},
          subcategory = ${subcategory},
          brand = ${brand},
          model = ${model},
          serial_number = ${serial_number},
          updated_at = NOW()
        WHERE id = ${itemId}
        RETURNING *
      `);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error updating inventory item:", error);
      res.status(500).json({ error: "Failed to update inventory item" });
    }
  });

  // Delete inventory item
  app.delete("/api/inventory/items/:id", async (req: Request, res: Response) => {
    try {
      const itemId = parseInt(req.params.id);

      const result = await db.execute(sql`
        DELETE FROM inventory_items 
        WHERE id = ${itemId}
        RETURNING *
      `);

      if (result.rows.length === 0) {
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
      const currentResult = await db.execute(sql`
        SELECT * FROM inventory_items WHERE id = ${itemId}
      `);

      if (currentResult.rows.length === 0) {
        return res.status(404).json({ error: "Item not found" });
      }

      const currentItem = currentResult.rows[0] as any;
      const newQuantity = Number(currentItem.current_quantity) + parseInt(adjustment);

      // Update quantity
      const result = await db.execute(sql`
        UPDATE inventory_items 
        SET current_quantity = ${newQuantity}, updated_at = NOW()
        WHERE id = ${itemId}
        RETURNING *
      `);

      res.json(result.rows[0]);
    } catch (error) {
      console.error("Error adjusting inventory:", error);
      res.status(500).json({ error: "Failed to adjust inventory" });
    }
  });

  // Get low stock items
  app.get("/api/inventory/low-stock", async (req: Request, res: Response) => {
    try {
      const result = await db.execute(sql`
        SELECT * FROM inventory_items 
        WHERE current_quantity <= minimum_threshold
        ORDER BY current_quantity ASC
      `);

      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching low stock items:", error);
      res.status(500).json({ error: "Failed to fetch low stock items" });
    }
  });

  // Get inventory movements (placeholder - needs movements table)
  app.get("/api/inventory/movements", async (req: Request, res: Response) => {
    try {
      // Check if movements table exists
      const result = await db.execute(sql`
        SELECT * FROM inventory_movements 
        ORDER BY created_at DESC
        LIMIT 50
      `);
      res.json(result.rows);
    } catch (error) {
      console.error("Error fetching inventory movements:", error);
      // Return empty array if table doesn't exist yet
      res.json([]);
    }
  });
}