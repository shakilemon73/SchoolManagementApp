import type { Express, Request, Response } from "express";
import { db } from "./db";
import * as schema from "@shared/schema";
import { eq, desc, asc, count, sql, and, or, like, isNull, not } from "drizzle-orm";

// Teacher Management Routes
export function registerTeacherRoutes(app: Express) {
  // Get all teachers
  app.get('/api/teachers', async (req: Request, res: Response) => {
    try {
      const teachers = await db.select().from(schema.teachers).orderBy(desc(schema.teachers.createdAt));
      return res.json(teachers);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      return res.status(500).json({ error: 'Failed to fetch teachers' });
    }
  });

  // Create teacher
  app.post('/api/teachers', async (req: Request, res: Response) => {
    try {
      const teacherData = req.body;
      const [newTeacher] = await db.insert(schema.teachers).values(teacherData).returning();
      return res.json(newTeacher);
    } catch (error) {
      console.error('Error creating teacher:', error);
      return res.status(500).json({ error: 'Failed to create teacher' });
    }
  });

  // Update teacher
  app.patch('/api/teachers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const [updatedTeacher] = await db
        .update(schema.teachers)
        .set(updateData)
        .where(eq(schema.teachers.id, parseInt(id)))
        .returning();
      return res.json(updatedTeacher);
    } catch (error) {
      console.error('Error updating teacher:', error);
      return res.status(500).json({ error: 'Failed to update teacher' });
    }
  });

  // Delete teacher
  app.delete('/api/teachers/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(schema.teachers).where(eq(schema.teachers.id, parseInt(id)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting teacher:', error);
      return res.status(500).json({ error: 'Failed to delete teacher' });
    }
  });

  // Teacher stats
  app.get('/api/teachers/stats', async (req: Request, res: Response) => {
    try {
      const [totalTeachers] = await db.select({ count: count() }).from(schema.teachers);
      const [activeTeachers] = await db
        .select({ count: count() })
        .from(schema.teachers)
        .where(eq(schema.teachers.status, 'active'));
      
      return res.json({
        total: totalTeachers.count,
        active: activeTeachers.count,
        inactive: totalTeachers.count - activeTeachers.count
      });
    } catch (error) {
      console.error('Error fetching teacher stats:', error);
      return res.status(500).json({ error: 'Failed to fetch teacher stats' });
    }
  });
}

// Staff Management Routes
export function registerStaffRoutes(app: Express) {
  // Get all staff
  app.get('/api/staff', async (req: Request, res: Response) => {
    try {
      const staff = await db.select().from(schema.staff).orderBy(desc(schema.staff.createdAt));
      return res.json(staff);
    } catch (error) {
      console.error('Error fetching staff:', error);
      return res.status(500).json({ error: 'Failed to fetch staff' });
    }
  });

  // Create staff
  app.post('/api/staff', async (req: Request, res: Response) => {
    try {
      const staffData = req.body;
      const [newStaff] = await db.insert(schema.staff).values(staffData).returning();
      return res.json(newStaff);
    } catch (error) {
      console.error('Error creating staff:', error);
      return res.status(500).json({ error: 'Failed to create staff' });
    }
  });

  // Update staff
  app.patch('/api/staff/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const [updatedStaff] = await db
        .update(schema.staff)
        .set(updateData)
        .where(eq(schema.staff.id, parseInt(id)))
        .returning();
      return res.json(updatedStaff);
    } catch (error) {
      console.error('Error updating staff:', error);
      return res.status(500).json({ error: 'Failed to update staff' });
    }
  });

  // Delete staff
  app.delete('/api/staff/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(schema.staff).where(eq(schema.staff.id, parseInt(id)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting staff:', error);
      return res.status(500).json({ error: 'Failed to delete staff' });
    }
  });
}

// Parent Management Routes
export function registerParentManagementRoutes(app: Express) {
  // Get all parents
  app.get('/api/parents', async (req: Request, res: Response) => {
    try {
      const parents = await db.select().from(schema.parents).orderBy(desc(schema.parents.createdAt));
      return res.json(parents);
    } catch (error) {
      console.error('Error fetching parents:', error);
      return res.status(500).json({ error: 'Failed to fetch parents' });
    }
  });

  // Create parent
  app.post('/api/parents', async (req: Request, res: Response) => {
    try {
      const parentData = req.body;
      const [newParent] = await db.insert(schema.parents).values(parentData).returning();
      return res.json(newParent);
    } catch (error) {
      console.error('Error creating parent:', error);
      return res.status(500).json({ error: 'Failed to create parent' });
    }
  });

  // Update parent
  app.patch('/api/parents/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const [updatedParent] = await db
        .update(schema.parents)
        .set(updateData)
        .where(eq(schema.parents.id, parseInt(id)))
        .returning();
      return res.json(updatedParent);
    } catch (error) {
      console.error('Error updating parent:', error);
      return res.status(500).json({ error: 'Failed to update parent' });
    }
  });

  // Delete parent
  app.delete('/api/parents/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(schema.parents).where(eq(schema.parents.id, parseInt(id)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting parent:', error);
      return res.status(500).json({ error: 'Failed to delete parent' });
    }
  });
}

// Inventory Routes
export function registerInventoryRoutes(app: Express) {
  // Get all inventory items
  app.get('/api/inventory', async (req: Request, res: Response) => {
    try {
      const items = await db.select().from(schema.inventoryItems).orderBy(desc(schema.inventoryItems.createdAt));
      return res.json(items);
    } catch (error) {
      console.error('Error fetching inventory:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory' });
    }
  });

  // Create inventory item
  app.post('/api/inventory', async (req: Request, res: Response) => {
    try {
      const itemData = req.body;
      const [newItem] = await db.insert(schema.inventoryItems).values(itemData).returning();
      return res.json(newItem);
    } catch (error) {
      console.error('Error creating inventory item:', error);
      return res.status(500).json({ error: 'Failed to create inventory item' });
    }
  });

  // Update inventory item
  app.patch('/api/inventory/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const [updatedItem] = await db
        .update(schema.inventoryItems)
        .set(updateData)
        .where(eq(schema.inventoryItems.id, parseInt(id)))
        .returning();
      return res.json(updatedItem);
    } catch (error) {
      console.error('Error updating inventory item:', error);
      return res.status(500).json({ error: 'Failed to update inventory item' });
    }
  });

  // Delete inventory item
  app.delete('/api/inventory/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(schema.inventoryItems).where(eq(schema.inventoryItems.id, parseInt(id)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting inventory item:', error);
      return res.status(500).json({ error: 'Failed to delete inventory item' });
    }
  });

  // Get inventory movements
  app.get('/api/inventory/movements', async (req: Request, res: Response) => {
    try {
      const movements = await db
        .select({
          id: schema.inventoryMovements.id,
          type: schema.inventoryMovements.type,
          quantity: schema.inventoryMovements.quantity,
          reason: schema.inventoryMovements.reason,
          createdAt: schema.inventoryMovements.createdAt,
          itemName: schema.inventoryItems.name,
        })
        .from(schema.inventoryMovements)
        .leftJoin(schema.inventoryItems, eq(schema.inventoryMovements.itemId, schema.inventoryItems.id))
        .orderBy(desc(schema.inventoryMovements.createdAt));
      return res.json(movements);
    } catch (error) {
      console.error('Error fetching inventory movements:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory movements' });
    }
  });

  // Create inventory movement
  app.post('/api/inventory/movements', async (req: Request, res: Response) => {
    try {
      const movementData = req.body;
      const [newMovement] = await db.insert(schema.inventoryMovements).values(movementData).returning();
      
      // Update item quantity
      const item = await db.select().from(schema.inventoryItems).where(eq(schema.inventoryItems.id, movementData.itemId));
      if (item.length > 0) {
        const currentQuantity = item[0].currentQuantity;
        let newQuantity = currentQuantity;
        
        if (movementData.type === 'in') {
          newQuantity = currentQuantity + movementData.quantity;
        } else if (movementData.type === 'out') {
          newQuantity = currentQuantity - movementData.quantity;
        } else if (movementData.type === 'adjustment') {
          newQuantity = movementData.quantity;
        }
        
        await db
          .update(schema.inventoryItems)
          .set({ currentQuantity: newQuantity })
          .where(eq(schema.inventoryItems.id, movementData.itemId));
      }
      
      return res.json(newMovement);
    } catch (error) {
      console.error('Error creating inventory movement:', error);
      return res.status(500).json({ error: 'Failed to create inventory movement' });
    }
  });

  // Get inventory stats
  app.get('/api/inventory/stats', async (req: Request, res: Response) => {
    try {
      const [totalItems] = await db.select({ count: count() }).from(schema.inventoryItems);
      const [lowStockItems] = await db
        .select({ count: count() })
        .from(schema.inventoryItems)
        .where(sql`${schema.inventoryItems.currentQuantity} <= ${schema.inventoryItems.minimumThreshold}`);
      
      const totalValue = await db
        .select({ value: sql`COALESCE(SUM(${schema.inventoryItems.unitPrice} * ${schema.inventoryItems.currentQuantity}), 0)` })
        .from(schema.inventoryItems);
      
      return res.json({
        totalItems: totalItems.count,
        lowStockItems: lowStockItems.count,
        totalValue: totalValue[0].value || 0
      });
    } catch (error) {
      console.error('Error fetching inventory stats:', error);
      return res.status(500).json({ error: 'Failed to fetch inventory stats' });
    }
  });
}

// Transport Routes
export function registerTransportFullRoutes(app: Express) {
  // Get all transport routes
  app.get('/api/transport/routes', async (req: Request, res: Response) => {
    try {
      const routes = await db.select().from(schema.transportRoutes).orderBy(desc(schema.transportRoutes.createdAt));
      return res.json(routes);
    } catch (error) {
      console.error('Error fetching transport routes:', error);
      return res.status(500).json({ error: 'Failed to fetch transport routes' });
    }
  });

  // Create transport route
  app.post('/api/transport/routes', async (req: Request, res: Response) => {
    try {
      const routeData = req.body;
      const [newRoute] = await db.insert(schema.transportRoutes).values(routeData).returning();
      return res.json(newRoute);
    } catch (error) {
      console.error('Error creating transport route:', error);
      return res.status(500).json({ error: 'Failed to create transport route' });
    }
  });

  // Get all vehicles
  app.get('/api/transport/vehicles', async (req: Request, res: Response) => {
    try {
      const vehicles = await db.select().from(schema.transportVehicles).orderBy(desc(schema.transportVehicles.createdAt));
      return res.json(vehicles);
    } catch (error) {
      console.error('Error fetching vehicles:', error);
      return res.status(500).json({ error: 'Failed to fetch vehicles' });
    }
  });

  // Create vehicle
  app.post('/api/transport/vehicles', async (req: Request, res: Response) => {
    try {
      const vehicleData = req.body;
      const [newVehicle] = await db.insert(schema.transportVehicles).values(vehicleData).returning();
      return res.json(newVehicle);
    } catch (error) {
      console.error('Error creating vehicle:', error);
      return res.status(500).json({ error: 'Failed to create vehicle' });
    }
  });

  // Get student assignments
  app.get('/api/transport/assignments', async (req: Request, res: Response) => {
    try {
      const assignments = await db
        .select({
          id: schema.transportStudentAssignments.id,
          pickupPoint: schema.transportStudentAssignments.pickupPoint,
          dropPoint: schema.transportStudentAssignments.dropPoint,
          monthlyFee: schema.transportStudentAssignments.monthlyFee,
          isActive: schema.transportStudentAssignments.isActive,
          studentName: schema.students.name,
          routeName: schema.transportRoutes.routeName,
          vehicleNumber: schema.transportVehicles.vehicleNumber,
        })
        .from(schema.transportStudentAssignments)
        .leftJoin(schema.students, eq(schema.transportStudentAssignments.studentId, schema.students.id))
        .leftJoin(schema.transportRoutes, eq(schema.transportStudentAssignments.routeId, schema.transportRoutes.id))
        .leftJoin(schema.transportVehicles, eq(schema.transportStudentAssignments.vehicleId, schema.transportVehicles.id))
        .orderBy(desc(schema.transportStudentAssignments.createdAt));
      
      return res.json(assignments);
    } catch (error) {
      console.error('Error fetching transport assignments:', error);
      return res.status(500).json({ error: 'Failed to fetch transport assignments' });
    }
  });

  // Create student assignment
  app.post('/api/transport/assignments', async (req: Request, res: Response) => {
    try {
      const assignmentData = req.body;
      const [newAssignment] = await db.insert(schema.transportStudentAssignments).values(assignmentData).returning();
      return res.json(newAssignment);
    } catch (error) {
      console.error('Error creating transport assignment:', error);
      return res.status(500).json({ error: 'Failed to create transport assignment' });
    }
  });

  // Transport stats
  app.get('/api/transport/stats', async (req: Request, res: Response) => {
    try {
      const [totalRoutes] = await db.select({ count: count() }).from(schema.transportRoutes);
      const [totalVehicles] = await db.select({ count: count() }).from(schema.transportVehicles);
      const [totalStudents] = await db.select({ count: count() }).from(schema.transportStudentAssignments);
      
      return res.json({
        totalRoutes: totalRoutes.count,
        totalVehicles: totalVehicles.count,
        totalStudents: totalStudents.count,
        monthlyRevenue: 0
      });
    } catch (error) {
      console.error('Error fetching transport stats:', error);
      return res.status(500).json({ error: 'Failed to fetch transport stats' });
    }
  });
}

// Financial Management Routes
export function registerFinancialManagementRoutes(app: Express) {
  // Get all transactions
  app.get('/api/finance/transactions', async (req: Request, res: Response) => {
    try {
      const transactions = await db.select().from(schema.financialTransactions).orderBy(desc(schema.financialTransactions.createdAt));
      return res.json(transactions);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      return res.status(500).json({ error: 'Failed to fetch transactions' });
    }
  });

  // Create transaction
  app.post('/api/finance/transactions', async (req: Request, res: Response) => {
    try {
      const transactionData = req.body;
      const [newTransaction] = await db.insert(schema.financialTransactions).values(transactionData).returning();
      return res.json(newTransaction);
    } catch (error) {
      console.error('Error creating transaction:', error);
      return res.status(500).json({ error: 'Failed to create transaction' });
    }
  });

  // Financial stats
  app.get('/api/finance/stats', async (req: Request, res: Response) => {
    try {
      const [totalIncome] = await db
        .select({ amount: sql`COALESCE(SUM(${schema.financialTransactions.amount}), 0)` })
        .from(schema.financialTransactions)
        .where(eq(schema.financialTransactions.transactionType, 'income'));
      
      const [totalExpense] = await db
        .select({ amount: sql`COALESCE(SUM(${schema.financialTransactions.amount}), 0)` })
        .from(schema.financialTransactions)
        .where(eq(schema.financialTransactions.transactionType, 'expense'));
      
      const [monthlyIncome] = await db
        .select({ amount: sql`COALESCE(SUM(${schema.financialTransactions.amount}), 0)` })
        .from(schema.financialTransactions)
        .where(and(
          eq(schema.financialTransactions.transactionType, 'income'),
          sql`EXTRACT(MONTH FROM ${schema.financialTransactions.date}) = EXTRACT(MONTH FROM CURRENT_DATE)`
        ));
      
      const [monthlyExpense] = await db
        .select({ amount: sql`COALESCE(SUM(${schema.financialTransactions.amount}), 0)` })
        .from(schema.financialTransactions)
        .where(and(
          eq(schema.financialTransactions.transactionType, 'expense'),
          sql`EXTRACT(MONTH FROM ${schema.financialTransactions.date}) = EXTRACT(MONTH FROM CURRENT_DATE)`
        ));
      
      return res.json({
        totalIncome: totalIncome.amount || 0,
        totalExpense: totalExpense.amount || 0,
        monthlyIncome: monthlyIncome.amount || 0,
        monthlyExpense: monthlyExpense.amount || 0,
        netIncome: (totalIncome.amount || 0) - (totalExpense.amount || 0)
      });
    } catch (error) {
      console.error('Error fetching financial stats:', error);
      return res.status(500).json({ error: 'Failed to fetch financial stats' });
    }
  });
}

// Document Templates Routes
export function registerDocumentTemplateRoutes(app: Express) {
  // Get all templates
  app.get('/api/document-templates', async (req: Request, res: Response) => {
    try {
      const templates = await db.select().from(schema.documentTemplates).orderBy(desc(schema.documentTemplates.createdAt));
      return res.json(templates);
    } catch (error) {
      console.error('Error fetching templates:', error);
      return res.status(500).json({ error: 'Failed to fetch templates' });
    }
  });

  // Create template
  app.post('/api/document-templates', async (req: Request, res: Response) => {
    try {
      const templateData = req.body;
      const [newTemplate] = await db.insert(schema.documentTemplates).values(templateData).returning();
      return res.json(newTemplate);
    } catch (error) {
      console.error('Error creating template:', error);
      return res.status(500).json({ error: 'Failed to create template' });
    }
  });

  // Update template
  app.patch('/api/document-templates/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const [updatedTemplate] = await db
        .update(schema.documentTemplates)
        .set(updateData)
        .where(eq(schema.documentTemplates.id, parseInt(id)))
        .returning();
      return res.json(updatedTemplate);
    } catch (error) {
      console.error('Error updating template:', error);
      return res.status(500).json({ error: 'Failed to update template' });
    }
  });

  // Delete template
  app.delete('/api/document-templates/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(schema.documentTemplates).where(eq(schema.documentTemplates.id, parseInt(id)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting template:', error);
      return res.status(500).json({ error: 'Failed to delete template' });
    }
  });
}

// Academic Year Routes
export function registerAcademicYearRoutes(app: Express) {
  // Get all academic years
  app.get('/api/academic-years', async (req: Request, res: Response) => {
    try {
      const years = await db.select().from(schema.academicYears).orderBy(desc(schema.academicYears.createdAt));
      return res.json(years);
    } catch (error) {
      console.error('Error fetching academic years:', error);
      return res.status(500).json({ error: 'Failed to fetch academic years' });
    }
  });

  // Create academic year
  app.post('/api/academic-years', async (req: Request, res: Response) => {
    try {
      const yearData = req.body;
      
      // If this year is marked as current, unset other current years
      if (yearData.isCurrent) {
        await db.update(schema.academicYears).set({ isCurrent: false });
      }
      
      const [newYear] = await db.insert(schema.academicYears).values(yearData).returning();
      return res.json(newYear);
    } catch (error) {
      console.error('Error creating academic year:', error);
      return res.status(500).json({ error: 'Failed to create academic year' });
    }
  });

  // Update academic year
  app.patch('/api/academic-years/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const updateData = req.body;
      
      // If this year is marked as current, unset other current years
      if (updateData.isCurrent) {
        await db.update(schema.academicYears).set({ isCurrent: false });
      }
      
      const [updatedYear] = await db
        .update(schema.academicYears)
        .set(updateData)
        .where(eq(schema.academicYears.id, parseInt(id)))
        .returning();
      return res.json(updatedYear);
    } catch (error) {
      console.error('Error updating academic year:', error);
      return res.status(500).json({ error: 'Failed to update academic year' });
    }
  });

  // Delete academic year
  app.delete('/api/academic-years/:id', async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.delete(schema.academicYears).where(eq(schema.academicYears.id, parseInt(id)));
      return res.json({ success: true });
    } catch (error) {
      console.error('Error deleting academic year:', error);
      return res.status(500).json({ error: 'Failed to delete academic year' });
    }
  });

  // Get current academic year
  app.get('/api/academic-years/current', async (req: Request, res: Response) => {
    try {
      const currentYear = await db.select().from(schema.academicYears).where(eq(schema.academicYears.isCurrent, true));
      return res.json(currentYear[0] || null);
    } catch (error) {
      console.error('Error fetching current academic year:', error);
      return res.status(500).json({ error: 'Failed to fetch current academic year' });
    }
  });
}

// School Settings Routes
export function registerSchoolSettingsRoutes(app: Express) {
  // Get school settings
  app.get('/api/school-settings', async (req: Request, res: Response) => {
    try {
      const settings = await db.select().from(schema.schoolSettings).limit(1);
      return res.json(settings[0] || null);
    } catch (error) {
      console.error('Error fetching school settings:', error);
      return res.status(500).json({ error: 'Failed to fetch school settings' });
    }
  });

  // Create or update school settings
  app.post('/api/school-settings', async (req: Request, res: Response) => {
    try {
      const settingsData = req.body;
      
      // Check if settings exist
      const existingSettings = await db.select().from(schema.schoolSettings).limit(1);
      
      if (existingSettings.length > 0) {
        // Update existing settings
        const [updatedSettings] = await db
          .update(schema.schoolSettings)
          .set({ ...settingsData, updatedAt: new Date() })
          .where(eq(schema.schoolSettings.id, existingSettings[0].id))
          .returning();
        return res.json(updatedSettings);
      } else {
        // Create new settings
        const [newSettings] = await db.insert(schema.schoolSettings).values(settingsData).returning();
        return res.json(newSettings);
      }
    } catch (error) {
      console.error('Error saving school settings:', error);
      return res.status(500).json({ error: 'Failed to save school settings' });
    }
  });
}