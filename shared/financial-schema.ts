import { pgTable, serial, text, integer, timestamp, boolean, decimal, date, time } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';
import { z } from 'zod';

export const transactions = pgTable('transactions', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').notNull(),
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  type: text('type', { enum: ['income', 'expense'] }).notNull(),
  category: text('category', { enum: ['fee', 'salary', 'utility', 'equipment', 'maintenance', 'other'] }).notNull(),
  description: text('description').notNull(),
  paymentMethod: text('payment_method', { 
    enum: ['cash', 'bank_transfer', 'bkash', 'nagad', 'rocket', 'upay', 'other'] 
  }).notNull(),
  reference: text('reference'),
  transactionDate: date('transaction_date').notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const budgets = pgTable('budgets', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').notNull(),
  name: text('name').notNull(),
  description: text('description'),
  totalAmount: decimal('total_amount', { precision: 12, scale: 2 }).notNull(),
  usedAmount: decimal('used_amount', { precision: 12, scale: 2 }).default('0.00').notNull(),
  category: text('category').notNull(),
  startDate: date('start_date').notNull(),
  endDate: date('end_date').notNull(),
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const feeStructures = pgTable('fee_structures', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').notNull(),
  className: text('class_name').notNull(),
  feeType: text('fee_type').notNull(),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  frequency: text('frequency', { enum: ['monthly', 'quarterly', 'yearly', 'one_time'] }).notNull(),
  dueDate: integer('due_date'), // Day of month for monthly fees
  isActive: boolean('is_active').default(true).notNull(),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const studentFees = pgTable('student_fees', {
  id: serial('id').primaryKey(),
  schoolId: integer('school_id').notNull(),
  studentId: integer('student_id').notNull(),
  feeStructureId: integer('fee_structure_id').notNull(),
  amountDue: decimal('amount_due', { precision: 10, scale: 2 }).notNull(),
  amountPaid: decimal('amount_paid', { precision: 10, scale: 2 }).default('0.00').notNull(),
  dueDate: date('due_date').notNull(),
  paidDate: date('paid_date'),
  status: text('status', { enum: ['pending', 'partial', 'paid', 'overdue'] }).default('pending').notNull(),
  paymentMethod: text('payment_method'),
  transactionReference: text('transaction_reference'),
  createdBy: integer('created_by').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Zod schemas
export const insertTransactionSchema = createInsertSchema(transactions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetSchema = createInsertSchema(budgets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  usedAmount: true,
});

export const insertFeeStructureSchema = createInsertSchema(feeStructures).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertStudentFeeSchema = createInsertSchema(studentFees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

// Types
export type Transaction = typeof transactions.$inferSelect;
export type InsertTransaction = z.infer<typeof insertTransactionSchema>;

export type Budget = typeof budgets.$inferSelect;
export type InsertBudget = z.infer<typeof insertBudgetSchema>;

export type FeeStructure = typeof feeStructures.$inferSelect;
export type InsertFeeStructure = z.infer<typeof insertFeeStructureSchema>;

export type StudentFee = typeof studentFees.$inferSelect;
export type InsertStudentFee = z.infer<typeof insertStudentFeeSchema>;