import { db } from "../db/index";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import session, { type Store } from "express-session";

const scryptAsync = promisify(scrypt);

export interface IStorage {
  getUser: (id: number) => Promise<schema.User | undefined>;
  getUserByUsername: (username: string) => Promise<schema.User | undefined>;
  getUserByEmail: (email: string) => Promise<schema.User | undefined>;
  createUser: (user: schema.InsertUser) => Promise<schema.User>;
  updateUserLastLogin: (id: number) => Promise<void>;
  sessionStore: Store;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
    // Use memory session store to avoid PostgreSQL connection issues with Supabase
    this.sessionStore = new session.MemoryStore();
  }

  async getUser(id: number): Promise<schema.User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.id, id)
    });
    return user;
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.username, username)
    });
    return user;
  }

  async createUser(user: schema.InsertUser): Promise<schema.User> {
    const [newUser] = await db.insert(schema.users)
      .values(user)
      .returning();
    return newUser;
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    const user = await db.query.users.findFirst({
      where: eq(schema.users.email, email)
    });
    return user;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    await db.update(schema.users)
      .set({ lastLogin: new Date() })
      .where(eq(schema.users.id, id));
  }

  // Additional storage methods for the school management system
  async getStudents() {
    return await db.query.students.findMany();
  }

  async getFeeReceipts() {
    return await db.query.feeReceipts.findMany({
      with: {
        items: true,
        student: true
      }
    });
  }
}

// Temporary memory storage class to bypass database issues
class MemoryStorage implements IStorage {
  private users: Map<number, schema.User> = new Map();
  private userIdCounter = 1;
  sessionStore: Store;

  constructor() {
    this.sessionStore = new session.MemoryStore();
  }

  async getUser(id: number): Promise<schema.User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<schema.User | undefined> {
    for (const user of this.users.values()) {
      if (user.username === username) return user;
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<schema.User | undefined> {
    for (const user of this.users.values()) {
      if (user.email === email) return user;
    }
    return undefined;
  }

  async createUser(userData: schema.InsertUser): Promise<schema.User> {
    const newUser: schema.User = {
      id: this.userIdCounter++,
      username: userData.username,
      name: userData.name,
      email: userData.email,
      passwordHash: userData.passwordHash,
      role: userData.role || 'user',
      schoolId: userData.schoolId || null,
      studentId: userData.studentId || null,
      credits: userData.credits || 0,
      isActive: userData.isActive !== false,
      isAdmin: userData.role === 'admin',
      lastLogin: null,
      profilePicture: userData.profilePicture || null,
      phoneNumber: userData.phoneNumber || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(newUser.id, newUser);
    return newUser;
  }

  async updateUserLastLogin(id: number): Promise<void> {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date();
      user.updatedAt = new Date();
    }
  }

  async getStudents() {
    return [];
  }

  async getFeeReceipts() {
    return [];
  }
}

// Use database storage for production
export const storage = new DatabaseStorage();
