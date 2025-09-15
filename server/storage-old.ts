import { db } from "../db/index";
import * as schema from "@shared/schema";
import { eq, count } from "drizzle-orm";
import session, { type Store } from "express-session";

export interface IStorage {
  getUser: (id: number) => Promise<schema.User | undefined>;
  getUserByUsername: (username: string) => Promise<schema.User | undefined>;
  getUserByEmail: (email: string) => Promise<schema.User | undefined>;
  createUser: (user: schema.InsertUser) => Promise<schema.User>;
  updateUserLastLogin: (id: number) => Promise<void>;
  sessionStore: Store;
  
  // School management methods
  getUsers: () => Promise<schema.User[]>;
  getStudents: () => Promise<schema.Student[]>;
  getLibraryBooks: () => Promise<schema.LibraryBook[]>;
  createLibraryBook: (book: schema.InsertLibraryBook) => Promise<schema.LibraryBook>;
  getDashboardStats: () => Promise<any>;
}

export class DatabaseStorage implements IStorage {
  sessionStore: Store;

  constructor() {
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

  // School management methods
  async getUsers(): Promise<schema.User[]> {
    return await db.query.users.findMany();
  }

  async getStudents(): Promise<schema.Student[]> {
    return await db.query.students.findMany();
  }

  async getLibraryBooks(): Promise<schema.LibraryBook[]> {
    return await db.query.libraryBooks.findMany();
  }

  async createLibraryBook(book: schema.InsertLibraryBook): Promise<schema.LibraryBook> {
    const [newBook] = await db.insert(schema.libraryBooks)
      .values(book)
      .returning();
    return newBook;
  }

  async getDashboardStats() {
    const [userCount] = await db.select({ count: count() }).from(schema.users);
    const [studentCount] = await db.select({ count: count() }).from(schema.students);
    const [bookCount] = await db.select({ count: count() }).from(schema.libraryBooks);

    return {
      users: userCount.count,
      students: studentCount.count,
      books: bookCount.count,
      timestamp: new Date().toISOString()
    };
  }
}

export const storage = new DatabaseStorage();

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
