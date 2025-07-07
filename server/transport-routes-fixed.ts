import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, sql, count, and, desc } from "drizzle-orm";

export function registerTransportRoutes(app: Express) {
  // Get transport statistics
  app.get("/api/transport/stats", async (req: Request, res: Response) => {
    try {
      const totalRoutes = await db.execute(sql`SELECT COUNT(*) as count FROM transport_routes`);
      const totalVehicles = await db.execute(sql`SELECT COUNT(*) as count FROM transport_vehicles`);
      const activeAssignments = await db.execute(sql`SELECT COUNT(*) as count FROM transport_student_assignments WHERE is_active = true`);

      res.json({
        totalRoutes: totalRoutes.rows[0]?.count || 0,
        totalVehicles: totalVehicles.rows[0]?.count || 0,
        activeAssignments: activeAssignments.rows[0]?.count || 0,
        totalStudents: activeAssignments.rows[0]?.count || 0
      });
    } catch (error) {
      console.error('Transport stats error:', error);
      res.status(500).json({ error: 'Failed to fetch transport statistics' });
    }
  });

  // Get all routes
  app.get("/api/transport/routes", async (req: Request, res: Response) => {
    try {
      const routes = await db.execute(sql`SELECT * FROM transport_routes ORDER BY created_at DESC`);
      res.json(routes.rows);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  // Add a new route
  app.post("/api/transport/routes", async (req: Request, res: Response) => {
    try {
      const { name, description, fare, vehicleId } = req.body;

      const newRoute = await db.execute(
        sql`INSERT INTO transport_routes (name, description, fare, vehicle_id, school_id) 
            VALUES (${name}, ${description}, ${fare}, ${vehicleId}, 1) 
            RETURNING *`
      );

      res.json(newRoute.rows[0]);
    } catch (error) {
      console.error('Error adding route:', error);
      res.status(500).json({ error: 'Failed to add route' });
    }
  });

  // Get all vehicles
  app.get("/api/transport/vehicles", async (req: Request, res: Response) => {
    try {
      const vehicles = await db.execute(sql`SELECT * FROM transport_vehicles ORDER BY created_at DESC`);
      res.json(vehicles.rows);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  // Add a new vehicle
  app.post("/api/transport/vehicles", async (req: Request, res: Response) => {
    try {
      const {
        vehicleNumber,
        type,
        capacity,
        driverName,
        driverPhone,
        helperName,
        helperPhone,
        routeId
      } = req.body;

      const newVehicle = await db.execute(
        sql`INSERT INTO transport_vehicles 
            (vehicle_number, type, capacity, driver_name, driver_phone, helper_name, helper_phone, route_id, school_id) 
            VALUES (${vehicleNumber}, ${type}, ${capacity}, ${driverName}, ${driverPhone}, ${helperName}, ${helperPhone}, ${routeId}, 1) 
            RETURNING *`
      );

      res.json(newVehicle.rows[0]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      res.status(500).json({ error: 'Failed to add vehicle' });
    }
  });

  // Get all assignments
  app.get("/api/transport/assignments", async (req: Request, res: Response) => {
    try {
      const assignments = await db.execute(
        sql`SELECT tsa.*, s.name as student_name, tr.name as route_name, tv.vehicle_number
            FROM transport_student_assignments tsa
            LEFT JOIN students s ON tsa.student_id = s.id
            LEFT JOIN transport_routes tr ON tsa.route_id = tr.id
            LEFT JOIN transport_vehicles tv ON tsa.vehicle_id = tv.id
            ORDER BY tsa.created_at DESC`
      );

      res.json(assignments.rows);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Create transport assignment
  app.post("/api/transport/assignments", async (req: Request, res: Response) => {
    try {
      const {
        studentId,
        routeId,
        vehicleId,
        pickupPoint,
        dropPoint,
        monthlyFee
      } = req.body;

      const newAssignment = await db.execute(
        sql`INSERT INTO transport_student_assignments 
            (student_id, route_id, vehicle_id, pickup_point, drop_point, monthly_fee, school_id) 
            VALUES (${studentId}, ${routeId}, ${vehicleId}, ${pickupPoint}, ${dropPoint}, ${monthlyFee}, 1) 
            RETURNING *`
      );

      res.json(newAssignment.rows[0]);
    } catch (error) {
      console.error('Error creating assignment:', error);
      res.status(500).json({ error: 'Failed to create assignment' });
    }
  });

  // Update vehicle
  app.patch("/api/transport/vehicles/:id", async (req: Request, res: Response) => {
    try {
      const vehicleId = parseInt(req.params.id);
      const updates = req.body;

      const setClause = Object.keys(updates)
        .map(key => `${key} = $${Object.keys(updates).indexOf(key) + 2}`)
        .join(', ');

      const values = [vehicleId, ...Object.values(updates)];

      const updatedVehicle = await db.execute(
        sql`UPDATE transport_vehicles SET is_active = ${updates.is_active} WHERE id = ${vehicleId} RETURNING *`
      );

      if (!updatedVehicle.rows[0]) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(updatedVehicle.rows[0]);
    } catch (error) {
      console.error('Error updating vehicle:', error);
      res.status(500).json({ error: 'Failed to update vehicle' });
    }
  });

  // Delete route
  app.delete("/api/transport/routes/:id", async (req: Request, res: Response) => {
    try {
      const routeId = parseInt(req.params.id);

      // Check if route has active assignments
      const activeAssignments = await db.execute(
        sql`SELECT COUNT(*) as count FROM transport_student_assignments 
            WHERE route_id = ${routeId} AND is_active = true`
      );

      if (activeAssignments.rows[0]?.count > 0) {
        return res.status(400).json({ error: 'Cannot delete route with active assignments' });
      }

      await db.execute(sql`DELETE FROM transport_routes WHERE id = ${routeId}`);
      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      console.error('Error deleting route:', error);
      res.status(500).json({ error: 'Failed to delete route' });
    }
  });

  // Get transport students (for assignment dropdown)
  app.get("/api/transport/students", async (req: Request, res: Response) => {
    try {
      const students = await db.execute(
        sql`SELECT tsa.*, s.name as student_name, s.student_id, s.class, s.section,
                   tr.name as route_name, tv.vehicle_number
            FROM transport_student_assignments tsa
            LEFT JOIN students s ON tsa.student_id = s.id
            LEFT JOIN transport_routes tr ON tsa.route_id = tr.id
            LEFT JOIN transport_vehicles tv ON tr.vehicle_id = tv.id
            WHERE tsa.is_active = true
            ORDER BY s.name`
      );

      res.json(students.rows);
    } catch (error) {
      console.error('Error fetching transport students:', error);
      res.status(500).json({ error: 'Failed to fetch transport students' });
    }
  });
}