import { 
  pgTable, 
  serial, 
  text, 
  integer, 
  decimal, 
  boolean, 
  timestamp, 
  json 
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Subscription Plans
export const subscriptionPlans = pgTable("subscription_plans", {
  id: serial("id").primaryKey(),
  planId: text("plan_id").notNull().unique(), // basic, premium, enterprise
  name: text("name").notNull(),
  nameBn: text("name_bn").notNull(),
  description: text("description"),
  descriptionBn: text("description_bn"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("BDT").notNull(),
  billingCycle: text("billing_cycle", { enum: ['monthly', 'yearly'] }).default('monthly').notNull(),
  maxStudents: integer("max_students").notNull(),
  maxTeachers: integer("max_teachers").notNull(),
  maxStorage: integer("max_storage").notNull(), // GB
  features: json("features").default({}), // Feature permissions
  supportLevel: text("support_level", { enum: ['basic', 'premium', 'enterprise'] }).default('basic').notNull(),
  isActive: boolean("is_active").default(true),
  trialDays: integer("trial_days").default(7),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// School Subscriptions
export const schoolSubscriptions = pgTable("school_subscriptions", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").notNull(),
  planId: text("plan_id").notNull(),
  status: text("status", { 
    enum: ['trial', 'active', 'past_due', 'canceled', 'suspended'] 
  }).default('trial').notNull(),
  currentPeriodStart: timestamp("current_period_start").notNull(),
  currentPeriodEnd: timestamp("current_period_end").notNull(),
  trialEnd: timestamp("trial_end"),
  cancelAtPeriodEnd: boolean("cancel_at_period_end").default(false),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Billing Invoices
export const billingInvoices = pgTable("billing_invoices", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").notNull(),
  subscriptionId: integer("subscription_id").notNull(),
  invoiceNumber: text("invoice_number").notNull().unique(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").default("BDT").notNull(),
  status: text("status", { 
    enum: ['pending', 'paid', 'failed', 'refunded'] 
  }).default('pending').notNull(),
  dueDate: timestamp("due_date").notNull(),
  paidAt: timestamp("paid_at"),
  paymentMethod: text("payment_method"),
  stripeInvoiceId: text("stripe_invoice_id"),
  metadata: json("metadata").default({}),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Usage Tracking
export const usageTracking = pgTable("usage_tracking", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").notNull(),
  metric: text("metric").notNull(), // students, teachers, documents, storage, api_calls
  value: integer("value").notNull(),
  date: timestamp("date").defaultNow().notNull(),
  metadata: json("metadata").default({}),
});

// Feature Permissions (what each plan can access)
export const featurePermissions = pgTable("feature_permissions", {
  id: serial("id").primaryKey(),
  planId: text("plan_id").notNull(),
  featureKey: text("feature_key").notNull(), // student_management, document_generation, etc.
  isEnabled: boolean("is_enabled").default(true),
  limits: json("limits").default({}), // Specific limits for this feature
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Customer Support Tickets
export const supportTickets = pgTable("support_tickets", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  priority: text("priority", { enum: ['low', 'medium', 'high', 'urgent'] }).default('medium').notNull(),
  status: text("status", { enum: ['open', 'in_progress', 'resolved', 'closed'] }).default('open').notNull(),
  category: text("category").notNull(), // technical, billing, feature_request, bug
  assignedTo: integer("assigned_to"), // Admin user ID
  createdBy: text("created_by").notNull(), // School contact email
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Audit Logs for Business Operations
export const businessAuditLogs = pgTable("business_audit_logs", {
  id: serial("id").primaryKey(),
  schoolInstanceId: integer("school_instance_id"),
  action: text("action").notNull(), // subscription_created, plan_changed, payment_failed, etc.
  resourceType: text("resource_type").notNull(),
  resourceId: text("resource_id"),
  performedBy: text("performed_by").notNull(),
  details: json("details").default({}),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export schemas and types
export const subscriptionPlanInsertSchema = createInsertSchema(subscriptionPlans);
export type InsertSubscriptionPlan = z.infer<typeof subscriptionPlanInsertSchema>;
export type SubscriptionPlan = typeof subscriptionPlans.$inferSelect;

export const schoolSubscriptionInsertSchema = createInsertSchema(schoolSubscriptions);
export type InsertSchoolSubscription = z.infer<typeof schoolSubscriptionInsertSchema>;
export type SchoolSubscription = typeof schoolSubscriptions.$inferSelect;

export const billingInvoiceInsertSchema = createInsertSchema(billingInvoices);
export type InsertBillingInvoice = z.infer<typeof billingInvoiceInsertSchema>;
export type BillingInvoice = typeof billingInvoices.$inferSelect;

export const supportTicketInsertSchema = createInsertSchema(supportTickets);
export type InsertSupportTicket = z.infer<typeof supportTicketInsertSchema>;
export type SupportTicket = typeof supportTickets.$inferSelect;