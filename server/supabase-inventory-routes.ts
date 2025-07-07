import { Express, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

const requireAuth = (req: Request, res: Response, next: any) => {
  // For now, allow all requests - you can add proper auth later
  next();
};

export function registerSupabaseInventoryRoutes(app: Express) {
  // Inventory stats endpoint
  app.get("/api/inventory/stats", requireAuth, async (req: Request, res: Response) => {
    try {
      const totalItems = await db.execute(sql`SELECT COUNT(*) as count FROM inventory_items`);
      const lowStockItems = await db.execute(sql`SELECT COUNT(*) as count FROM inventory_items WHERE current_quantity <= minimum_threshold AND current_quantity > 0`);
      const outOfStockItems = await db.execute(sql`SELECT COUNT(*) as count FROM inventory_items WHERE current_quantity = 0`);
      const totalValue = await db.execute(sql`SELECT COALESCE(SUM(CAST(unit_price AS DECIMAL) * current_quantity), 0) as value FROM inventory_items`);
      
      res.json({
        totalItems: Number((totalItems as any)[0]?.count) || 0,
        lowStock: Number((lowStockItems as any)[0]?.count) || 0,
        outOfStock: Number((outOfStockItems as any)[0]?.count) || 0,
        totalValue: Number((totalValue as any)[0]?.value) || 0
      });
    } catch (error) {
      console.error('Inventory stats error:', error);
      res.status(500).json({ error: 'Failed to fetch inventory statistics' });
    }
  });

  // Get all inventory items (frontend calls /api/inventory/items)
  app.get("/api/inventory/items", requireAuth, async (req: Request, res: Response) => {
    try {
      const { search, category, status } = req.query;
      
      let query = `SELECT * FROM inventory_items WHERE 1=1`;
      const params: any[] = [];
      
      if (search) {
        query += ` AND (name ILIKE $${params.length + 1} OR name_bn ILIKE $${params.length + 1} OR brand ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      if (category && category !== 'all') {
        query += ` AND category = $${params.length + 1}`;
        params.push(category);
      }
      
      if (status && status !== 'all') {
        if (status === 'low_stock') {
          query += ` AND current_quantity <= minimum_threshold AND current_quantity > 0`;
        } else if (status === 'out_of_stock') {
          query += ` AND current_quantity = 0`;
        } else if (status === 'available') {
          query += ` AND current_quantity > minimum_threshold`;
        }
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const items = await db.execute(sql.raw(query, params));
      
      // Add computed status to each item
      const itemsWithStatus = (items as any[]).map(item => ({
        ...item,
        status: item.current_quantity === 0 ? 'out_of_stock' : 
                item.current_quantity <= item.minimum_threshold ? 'low_stock' : 'available'
      }));
      
      res.json(itemsWithStatus);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  });

  // Get all inventory items (main endpoint used by frontend)
  app.get("/api/inventory", requireAuth, async (req: Request, res: Response) => {
    try {
      const { search, category, status } = req.query;
      
      let query = `SELECT * FROM inventory_items WHERE 1=1`;
      const params: any[] = [];
      
      if (search) {
        query += ` AND (name ILIKE $${params.length + 1} OR name_bn ILIKE $${params.length + 1} OR brand ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      if (category && category !== 'all') {
        query += ` AND category = $${params.length + 1}`;
        params.push(category);
      }
      
      if (status && status !== 'all') {
        if (status === 'low_stock') {
          query += ` AND current_quantity <= minimum_threshold AND current_quantity > 0`;
        } else if (status === 'out_of_stock') {
          query += ` AND current_quantity = 0`;
        } else if (status === 'available') {
          query += ` AND current_quantity > minimum_threshold`;
        }
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const items = await db.execute(sql.raw(query, params));
      
      // Add computed status to each item
      const itemsWithStatus = (items as any[]).map(item => ({
        ...item,
        status: item.current_quantity === 0 ? 'out_of_stock' : 
                item.current_quantity <= item.minimum_threshold ? 'low_stock' : 'available'
      }));
      
      res.json(itemsWithStatus);
    } catch (error) {
      console.error('Error fetching inventory items:', error);
      res.status(500).json({ error: 'Failed to fetch inventory items' });
    }
  });

  // Add new inventory item (frontend uses /api/inventory)
  app.post("/api/inventory", requireAuth, async (req: Request, res: Response) => {
    try {
      const { name, nameInBangla, category, brand, model, unit, unitPrice, quantity, minimumStock, location, description, supplier } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO inventory_items 
        (name, name_bn, category, brand, model, current_quantity, minimum_threshold, unit, unit_price, location, description, condition, supplier, school_id) 
        VALUES (${name}, ${nameInBangla || ''}, ${category || ''}, ${brand || ''}, ${model || ''}, ${parseInt(quantity) || 0}, ${parseInt(minimumStock) || 0}, ${unit || ''}, ${unitPrice || '0'}, ${location || 'Main Store'}, ${description || ''}, ${'good'}, ${supplier || ''}, 1) 
        RETURNING *
      `);
      
      res.status(201).json((result as any)[0]);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      res.status(500).json({ error: 'Failed to create inventory item' });
    }
  });

  // Update inventory item (frontend uses /api/inventory/:id)
  app.patch("/api/inventory/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { name, nameInBangla, category, brand, model, unit, unitPrice, quantity, minimumStock, location, description, supplier } = req.body;
      
      const result = await db.execute(sql`
        UPDATE inventory_items 
        SET name = ${name}, name_bn = ${nameInBangla}, category = ${category}, brand = ${brand}, model = ${model || ''},
            current_quantity = ${parseInt(quantity) || 0}, minimum_threshold = ${parseInt(minimumStock) || 0}, 
            unit = ${unit}, unit_price = ${unitPrice || '0'}, location = ${location || 'Main Store'}, 
            description = ${description || ''}, supplier = ${supplier || ''}, updated_at = NOW()
        WHERE id = ${parseInt(id)}
        RETURNING *
      `);
      
      if ((result as any).length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      res.status(500).json({ error: 'Failed to update inventory item' });
    }
  });

  // Delete inventory item (frontend uses /api/inventory/:id)
  app.delete("/api/inventory/:id", requireAuth, async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // First delete related movements
      await db.execute(sql`DELETE FROM inventory_movements WHERE item_id = ${parseInt(id)}`);
      
      // Then delete the item
      const result = await db.execute(sql`DELETE FROM inventory_items WHERE id = ${parseInt(id)} RETURNING *`);
      
      if ((result as any).length === 0) {
        return res.status(404).json({ error: 'Item not found' });
      }
      
      res.json({ message: 'Item deleted successfully' });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  });

  // Get inventory movements
  app.get("/api/inventory/movements", requireAuth, async (req: Request, res: Response) => {
    try {
      const { search } = req.query;
      
      let query = `
        SELECT im.id, im.type, im.quantity, im.reason, im.reference, im.notes, im.created_at,
               ii.id as item_id, ii.name, ii.name_bn as nameInBangla, ii.unit
        FROM inventory_movements im
        LEFT JOIN inventory_items ii ON im.item_id = ii.id
        WHERE 1=1
      `;
      const params: any[] = [];
      
      if (search) {
        query += ` AND (ii.name ILIKE $${params.length + 1} OR ii.name_bn ILIKE $${params.length + 1} OR im.reason ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      query += ` ORDER BY im.created_at DESC LIMIT 50`;
      
      const movements = await db.execute(sql.raw(query, params));
      
      // Format the response to match frontend expectations
      const formattedMovements = (movements as any[]).map(movement => ({
        id: movement.id,
        type: movement.type,
        quantity: movement.quantity,
        reason: movement.reason,
        reference: movement.reference,
        notes: movement.notes,
        createdAt: movement.created_at,
        item: {
          id: movement.item_id,
          name: movement.name,
          nameInBangla: movement.nameinbangla,
          unit: movement.unit
        }
      }));
      
      res.json(formattedMovements);
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      res.json([]); // Return empty array if movements table doesn't exist yet
    }
  });

  // Record stock movement
  app.post("/api/inventory/movements", requireAuth, async (req: Request, res: Response) => {
    try {
      const { itemId, type, quantity, reason, notes } = req.body;
      
      // Create movement record
      const result = await db.execute(sql`
        INSERT INTO inventory_movements 
        (item_id, type, quantity, reason, notes, school_id) 
        VALUES (${parseInt(itemId)}, ${type}, ${parseInt(quantity)}, ${reason || ''}, ${notes || ''}, 1) 
        RETURNING *
      `);
      
      // Update item quantity based on movement type
      let quantityChange = 0;
      if (type === 'in' || type === 'adjustment') {
        quantityChange = parseInt(quantity);
      } else if (type === 'out') {
        quantityChange = -parseInt(quantity);
      }
      
      if (quantityChange !== 0) {
        await db.execute(sql`
          UPDATE inventory_items 
          SET current_quantity = GREATEST(0, current_quantity + ${quantityChange}), updated_at = NOW()
          WHERE id = ${parseInt(itemId)}
        `);
      }
      
      res.status(201).json((result as any)[0]);
    } catch (error) {
      console.error('Error recording stock movement:', error);
      res.status(500).json({ error: 'Failed to record stock movement' });
    }
  });

  // Export inventory data as CSV
  app.get("/api/inventory/export", requireAuth, async (req: Request, res: Response) => {
    try {
      const { search, category, status } = req.query;
      
      let query = `SELECT * FROM inventory_items WHERE 1=1`;
      const params: any[] = [];
      
      if (search) {
        query += ` AND (name ILIKE $${params.length + 1} OR name_bn ILIKE $${params.length + 1} OR brand ILIKE $${params.length + 1})`;
        params.push(`%${search}%`);
      }
      
      if (category && category !== 'all') {
        query += ` AND category = $${params.length + 1}`;
        params.push(category);
      }
      
      if (status && status !== 'all') {
        if (status === 'low_stock') {
          query += ` AND current_quantity <= minimum_threshold AND current_quantity > 0`;
        } else if (status === 'out_of_stock') {
          query += ` AND current_quantity = 0`;
        } else if (status === 'available') {
          query += ` AND current_quantity > minimum_threshold`;
        }
      }
      
      query += ` ORDER BY created_at DESC`;
      
      const items = await db.execute(sql.raw(query, params));
      
      // Create CSV content
      const csvHeaders = 'নাম,Name,ক্যাটেগরি,ব্র্যান্ড,বর্তমান স্টক,ন্যূনতম স্টক,একক,দাম,অবস্থান,অবস্থা\n';
      const csvRows = (items as any[]).map((item: any) => 
        `"${item.name_bn || item.name}","${item.name}","${item.category}","${item.brand}","${item.current_quantity}","${item.minimum_threshold}","${item.unit}","${item.unit_price}","${item.location}","${item.condition}"`
      ).join('\n');
      
      const csvContent = csvHeaders + csvRows;
      
      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', 'attachment; filename="inventory_export.csv"');
      res.send('\ufeff' + csvContent); // Add BOM for proper UTF-8 encoding
    } catch (error) {
      console.error('Error exporting inventory:', error);
      res.status(500).json({ error: 'Failed to export inventory data' });
    }
  });
}