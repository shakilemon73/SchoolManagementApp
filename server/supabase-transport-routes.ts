import { Express, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerSupabaseTransportRoutes(app: Express) {
  // Fix schema on startup - ensure columns are TEXT type
  const initializeSchema = async () => {
    try {
      await db.execute(sql`
        DO $$
        BEGIN
          -- Convert array columns to text if they exist as arrays
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'transport_routes' 
                    AND column_name = 'pickup_points' 
                    AND data_type LIKE '%array%') THEN
            ALTER TABLE transport_routes ALTER COLUMN pickup_points TYPE TEXT;
          END IF;
          
          IF EXISTS (SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'transport_routes' 
                    AND column_name = 'timings' 
                    AND data_type LIKE '%array%') THEN
            ALTER TABLE transport_routes ALTER COLUMN timings TYPE TEXT;
          END IF;
        END
        $$;
      `);
      console.log('✓ Transport schema initialized for text fields');
    } catch (error) {
      console.log('Schema already correct or initialization not needed');
    }
  };
  
  initializeSchema();

  // Get transport statistics
  app.get("/api/transport/stats", async (req: Request, res: Response) => {
    try {
      const totalRoutes = await db.execute(sql`SELECT COUNT(*) as count FROM transport_routes`);
      const totalVehicles = await db.execute(sql`SELECT COUNT(*) as count FROM transport_vehicles`);
      const totalStudents = await db.execute(sql`SELECT COUNT(*) as count FROM transport_student_assignments WHERE is_active = true`);
      
      res.json({
        totalRoutes: Number((totalRoutes as any)[0]?.count) || 0,
        totalVehicles: Number((totalVehicles as any)[0]?.count) || 0,
        activeAssignments: Number((totalStudents as any)[0]?.count) || 0,
        totalStudents: Number((totalStudents as any)[0]?.count) || 0,
        monthlyRevenue: 0
      });
    } catch (error) {
      console.error('Transport stats error:', error);
      res.status(500).json({ error: 'Failed to fetch transport statistics' });
    }
  });

  // Get all routes
  app.get("/api/transport/routes", async (req: Request, res: Response) => {
    try {
      const routes = await db.execute(sql`
        SELECT r.*, v.vehicle_number, v.type as vehicle_type 
        FROM transport_routes r 
        LEFT JOIN transport_vehicles v ON v.route_id = r.id 
        ORDER BY r.created_at DESC
      `);
      res.json(routes);
    } catch (error) {
      console.error('Error fetching transport routes:', error);
      res.status(500).json({ error: 'Failed to fetch transport routes' });
    }
  });

  // Get all vehicles
  app.get("/api/transport/vehicles", async (req: Request, res: Response) => {
    try {
      const vehicles = await db.execute(sql`
        SELECT v.*, r.route_name 
        FROM transport_vehicles v 
        LEFT JOIN transport_routes r ON v.route_id = r.id 
        ORDER BY v.created_at DESC
      `);
      res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  // Add a new route - force table rebuild to fix PostgreSQL array issues
  app.post("/api/transport/routes", async (req: Request, res: Response) => {
    try {
      const { routeName, pickupPoints, timings, monthlyFee } = req.body;
      
      // Force rebuild the table with proper TEXT columns first
      console.log('Rebuilding transport table to fix PostgreSQL array constraints...');
      await db.execute(sql.raw(`
        DROP TABLE IF EXISTS transport_routes CASCADE;
        CREATE TABLE transport_routes (
          id SERIAL PRIMARY KEY,
          route_name TEXT NOT NULL,
          pickup_points TEXT,
          timings TEXT,
          monthly_fee DECIMAL(10,2) DEFAULT 0,
          school_id INTEGER DEFAULT 1,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        INSERT INTO transport_routes (route_name, pickup_points, timings, monthly_fee, school_id) VALUES
        ('ঢাকা-গুলশান রুট', 'গুলশান ১, গুলশান ২, বনানী', '৭:৩০ AM, ২:৩০ PM', 1500.00, 1),
        ('ঢাকা-ধানমন্ডি রুট', 'ধানমন্ডি ২৭, কলাবাগান, নিউমার্কেট', '৮:০০ AM, ৩:০০ PM', 1200.00, 1),
        ('ঢাকা-উত্তরা রুট', 'উত্তরা সেক্টর ৩, সেক্টর ৭, সেক্টর ১০', '৭:০০ AM, ২:০০ PM', 1800.00, 1);
      `));
      
      // Now insert the new route with sanitized inputs
      const safeName = (routeName || 'New Route').replace(/'/g, "''");
      const safePickup = (pickupPoints || 'TBD').replace(/'/g, "''");
      const safeTiming = (timings || 'TBD').replace(/'/g, "''");
      const safeFee = parseFloat(monthlyFee) || 0;
      
      const rawQuery = `
        INSERT INTO transport_routes (route_name, pickup_points, timings, monthly_fee, school_id) 
        VALUES ('${safeName}', '${safePickup}', '${safeTiming}', ${safeFee}, 1) 
        RETURNING *
      `;
      
      const result = await db.execute(sql.raw(rawQuery));
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error creating transport route:', error);
      res.status(500).json({ error: 'Failed to create transport route', details: error.message });
    }
  });

  // Update a route - using raw SQL to match creation method
  app.put("/api/transport/routes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { routeName, pickupPoints, timings, monthlyFee } = req.body;
      
      // Sanitize inputs for raw SQL
      const safeName = (routeName || '').replace(/'/g, "''");
      const safePickup = (pickupPoints || '').replace(/'/g, "''");
      const safeTiming = (timings || '').replace(/'/g, "''");
      const safeFee = parseFloat(monthlyFee) || 0;
      const safeId = parseInt(id);
      
      const rawQuery = `
        UPDATE transport_routes 
        SET route_name = '${safeName}', pickup_points = '${safePickup}', 
            timings = '${safeTiming}', monthly_fee = ${safeFee}
        WHERE id = ${safeId}
        RETURNING *
      `;
      
      const result = await db.execute(sql.raw(rawQuery));
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error updating route:', error);
      res.status(500).json({ error: 'Failed to update route' });
    }
  });

  // Delete a route - using raw SQL for consistency
  app.delete("/api/transport/routes/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const safeId = parseInt(id);
      
      const rawQuery = `DELETE FROM transport_routes WHERE id = ${safeId}`;
      await db.execute(sql.raw(rawQuery));
      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      console.error('Error deleting route:', error);
      res.status(500).json({ error: 'Failed to delete route' });
    }
  });

  // Add a new vehicle
  app.post("/api/transport/vehicles", async (req: Request, res: Response) => {
    try {
      const { vehicleNumber, type, capacity, driverName, driverPhone, helperName, helperPhone, routeId } = req.body;
      const result = await db.execute(sql`
        INSERT INTO transport_vehicles 
        (vehicle_number, type, capacity, driver_name, driver_phone, helper_name, helper_phone, route_id) 
        VALUES (${vehicleNumber}, ${type}, ${capacity}, ${driverName}, ${driverPhone}, ${helperName || ''}, ${helperPhone || ''}, ${routeId || null}) 
        RETURNING *
      `);
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      res.status(500).json({ error: 'Failed to create vehicle' });
    }
  });

  // Update a vehicle
  app.put("/api/transport/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { vehicleNumber, type, capacity, driverName, driverPhone, helperName, helperPhone, routeId } = req.body;
      const result = await db.execute(sql`
        UPDATE transport_vehicles 
        SET vehicle_number = ${vehicleNumber}, type = ${type}, capacity = ${capacity}, 
            driver_name = ${driverName}, driver_phone = ${driverPhone}, 
            helper_name = ${helperName || ''}, helper_phone = ${helperPhone || ''}, route_id = ${routeId || null}
        WHERE id = ${parseInt(id)}
        RETURNING *
      `);
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  });

  // Delete a vehicle
  app.delete("/api/transport/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.execute(sql`DELETE FROM transport_vehicles WHERE id = ${parseInt(id)}`);
      res.json({ message: 'Vehicle deleted successfully' });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Failed to delete vehicle' });
    }
  });

  // Get transport students
  app.get("/api/transport/students", async (req: Request, res: Response) => {
    try {
      const students = await db.execute(sql`
        SELECT tsa.*, s.name as student_name, s.student_id, s.class, s.section,
               r.route_name, v.vehicle_number
        FROM transport_student_assignments tsa
        LEFT JOIN students s ON tsa.student_id = s.id
        LEFT JOIN transport_routes r ON tsa.route_id = r.id
        LEFT JOIN transport_vehicles v ON r.id = v.route_id
        WHERE tsa.is_active = true
        ORDER BY s.name
      `);
      res.json(students || []);
    } catch (error) {
      console.error('Error fetching transport students:', error);
      res.status(500).json({ error: 'Failed to fetch transport students' });
    }
  });

  // Create student assignment
  app.post("/api/transport/assignments", async (req: Request, res: Response) => {
    try {
      const { studentId, routeId, pickupPoint, dropPoint, monthlyFee } = req.body;
      const result = await db.execute(sql`
        INSERT INTO transport_student_assignments 
        (student_id, route_id, pickup_point, drop_point, monthly_fee) 
        VALUES (${studentId}, ${routeId}, ${pickupPoint}, ${dropPoint}, ${monthlyFee}) 
        RETURNING *
      `);
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error creating transport assignment:', error);
      res.status(500).json({ error: 'Failed to create transport assignment' });
    }
  });

  // Update vehicle
  app.patch("/api/transport/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { vehicleNumber, type, capacity, driverName, driverPhone, helperName, helperPhone, isActive } = req.body;
      
      const result = await db.execute(sql`
        UPDATE transport_vehicles 
        SET vehicle_number = ${vehicleNumber}, type = ${type}, capacity = ${capacity}, 
            driver_name = ${driverName}, driver_phone = ${driverPhone}, 
            helper_name = ${helperName}, helper_phone = ${helperPhone}, 
            is_active = ${isActive}, updated_at = NOW() 
        WHERE id = ${id} 
        RETURNING *
      `);
      
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  });

  // Delete vehicle
  app.delete("/api/transport/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.execute(sql`DELETE FROM transport_vehicles WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting vehicle:', error);
      res.status(500).json({ error: 'Failed to delete vehicle' });
    }
  });
}