import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, sql, count, and, desc } from "drizzle-orm";
import { transportRoutes, transportVehicles, transportStudentAssignments } from "../shared/schema";

export function registerTransportRoutes(app: Express) {
  // Get transport statistics
  app.get("/api/transport/stats", async (req: Request, res: Response) => {
    try {
      const totalRoutes = await db.select({ count: count() }).from(transportRoutes);
      const totalVehicles = await db.select({ count: count() }).from(transportVehicles);
      const activeAssignments = await db.select({ count: count() })
        .from(transportStudentAssignments)
        .where(eq(transportStudentAssignments.isActive, true));

      res.json({
        totalRoutes: totalRoutes[0]?.count || 0,
        totalVehicles: totalVehicles[0]?.count || 0,
        activeAssignments: activeAssignments[0]?.count || 0,
        totalStudents: activeAssignments[0]?.count || 0
      });
    } catch (error) {
      console.error('Transport stats error:', error);
      res.status(500).json({ error: 'Failed to fetch transport statistics' });
    }
  });

  // Get all routes
  app.get("/api/transport/routes", async (req: Request, res: Response) => {
    try {
      const routes = await db.select().from(transportRoutes).orderBy(desc(transportRoutes.createdAt));
      res.json(routes);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  // Add a new route
  app.post("/api/transport/routes", async (req: Request, res: Response) => {
    try {
      const { routeName, routeNameBn, startPoint, endPoint, stops, distance, estimatedTime } = req.body;

      const newRoute = await db.insert(transportRoutes).values({
        routeName,
        routeNameBn,
        startPoint,
        endPoint,
        stops: stops || [],
        distance,
        estimatedTime,
        vehicleNumber: "TBD",
        departureTime: "08:00:00",
        estimatedArrival: "09:00:00"
      }).returning();

      res.json(newRoute[0]);
    } catch (error) {
      console.error('Error adding route:', error);
      res.status(500).json({ error: 'Failed to add route' });
    }
  });

  // Get all vehicles
  app.get("/api/transport/vehicles", async (req: Request, res: Response) => {
    try {
      const vehicles = await db.select().from(transportVehicles).orderBy(desc(transportVehicles.createdAt));
      res.json(vehicles);
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
        vehicleType,
        capacity,
        driverName,
        driverPhone,
        status
      } = req.body;

      const newVehicle = await db.insert(transportVehicles).values({
        vehicleNumber,
        vehicleType,
        capacity,
        driverName,
        driverPhone
      }).returning();

      res.json(newVehicle[0]);
    } catch (error) {
      console.error('Error adding vehicle:', error);
      res.status(500).json({ error: 'Failed to add vehicle' });
    }
  });

  // Get all assignments
  app.get("/api/transport/assignments", async (req: Request, res: Response) => {
    try {
      const assignments = await db.select({
        id: transportAssignments.id,
        studentName: transportAssignments.studentName,
        studentId: transportAssignments.studentId,
        routeName: transportRoutes.routeName,
        vehicleNumber: transportVehicles.vehicleNumber,
        pickupPoint: transportAssignments.pickupPoint,
        status: transportAssignments.status
      })
      .from(transportAssignments)
      .leftJoin(transportRoutes, eq(transportAssignments.routeId, transportRoutes.id))
      .leftJoin(transportVehicles, eq(transportAssignments.vehicleId, transportVehicles.id))
      .orderBy(desc(transportAssignments.createdAt));

      res.json(assignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      res.status(500).json({ error: 'Failed to fetch assignments' });
    }
  });

  // Create transport assignment
  app.post("/api/transport/assignments", async (req: Request, res: Response) => {
    try {
      const {
        studentName,
        studentId,
        routeId,
        vehicleId,
        pickupPoint,
        dropoffPoint
      } = req.body;

      const newAssignment = await db.insert(transportAssignments).values({
        schoolId: 1,
        studentName,
        studentId,
        routeId,
        vehicleId,
        pickupPoint,
        dropoffPoint,
        status: 'active'
      }).returning();

      res.json(newAssignment[0]);
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

      const updatedVehicle = await db.update(transportVehicles)
        .set(updates)
        .where(eq(transportVehicles.id, vehicleId))
        .returning();

      if (!updatedVehicle[0]) {
        return res.status(404).json({ error: 'Vehicle not found' });
      }

      res.json(updatedVehicle[0]);
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
      const activeAssignments = await db.select({ count: count() })
        .from(transportAssignments)
        .where(and(
          eq(transportAssignments.routeId, routeId),
          eq(transportAssignments.status, 'active')
        ));

      if (activeAssignments[0]?.count > 0) {
        return res.status(400).json({ error: 'Cannot delete route with active assignments' });
      }

      await db.delete(transportRoutes).where(eq(transportRoutes.id, routeId));
      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      console.error('Error deleting route:', error);
      res.status(500).json({ error: 'Failed to delete route' });
    }
  });
}