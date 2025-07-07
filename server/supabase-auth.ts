import type { Express, Request, Response } from "express";
import { supabase } from "@shared/supabase";
import { supabaseDb as db } from "./supabase-db";
import * as schema from "@shared/schema";
import { eq } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Middleware to verify Supabase JWT tokens
export async function verifySupabaseAuth(req: AuthenticatedRequest, res: Response, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Get user details from our database
    const dbUser = await db.query.users.findFirst({
      where: eq(schema.users.email, user.email!)
    });

    req.user = dbUser || user;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Authentication failed' });
  }
}

// Setup Supabase authentication routes
export function setupSupabaseAuth(app: Express) {
  // Sign up with Supabase Auth
  app.post("/api/auth/signup", async (req: Request, res: Response) => {
    try {
      const { email, password, full_name, role = 'user', phone } = req.body;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name,
            role,
            phone
          }
        }
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      // Also create user in our database
      if (data.user) {
        await db.insert(schema.users).values({
          username: email.split('@')[0],
          password: 'supabase-managed', // Placeholder since Supabase manages auth
          full_name,
          role,
          email,
          phone,
          language: 'en'
        }).onConflictDoNothing();
      }

      res.json({ user: data.user, session: data.session });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sign in with Supabase Auth
  app.post("/api/auth/signin", async (req: Request, res: Response) => {
    try {
      const { email, password } = req.body;

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      res.json({ user: data.user, session: data.session });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Sign out
  app.post("/api/auth/signout", async (req: Request, res: Response) => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        return res.status(400).json({ error: error.message });
      }
      res.json({ message: 'Signed out successfully' });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get current user
  app.get("/api/auth/user", verifySupabaseAuth, async (req: AuthenticatedRequest, res: Response) => {
    res.json({ user: req.user });
  });
}