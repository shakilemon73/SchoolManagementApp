import type { Express, Request, Response } from "express";
import { createClient } from '@supabase/supabase-js';
import { db } from "../db/index";
import * as schema from "@shared/schema";
import { count } from "drizzle-orm";

interface AuthenticatedRequest extends Request {
  user?: any;
}

// Enhanced session middleware that works with Supabase tokens
async function supabaseAuthMiddleware(
  req: AuthenticatedRequest, 
  res: Response, 
  next: any
) {
  try {
    const supabaseUrl = process.env.SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    let accessToken: string | null = null;
    
    // Check Authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      accessToken = authHeader.substring(7);
    }
    
    // Check cookies
    if (!accessToken && req.cookies) {
      accessToken = req.cookies['sb-access-token'];
    }

    if (!accessToken) {
      return res.status(401).json({ message: 'Not authenticated' });
    }

    // Verify token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(accessToken);
    
    if (error || !user) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    
    req.user = user;
    req.session = { user, accessToken };
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(401).json({ message: 'Authentication failed' });
  }
}

export function registerSupabaseDashboardFix(app: Express) {
  
  // Fixed Dashboard Stats
  app.get('/api/supabase/dashboard/stats', supabaseAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get stats directly from Supabase
      const [studentsResult, teachersResult, classesResult] = await Promise.all([
        supabase.from('students').select('id', { count: 'exact', head: true }),
        supabase.from('teachers').select('id', { count: 'exact', head: true }),
        supabase.from('classes').select('id', { count: 'exact', head: true })
      ]);

      // Calculate monthly income
      const currentMonth = new Date().getMonth() + 1;
      const currentYear = new Date().getFullYear();
      
      const { data: feeData } = await supabase
        .from('fee_receipts')
        .select('total_amount')
        .gte('created_at', `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`)
        .lt('created_at', `${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-01`);

      const monthlyIncome = feeData?.reduce((sum, receipt) => sum + (receipt.total_amount || 0), 0) || 0;

      const stats = {
        students: studentsResult.count || 0,
        teachers: teachersResult.count || 0,
        classes: classesResult.count || 0,
        monthlyIncome
      };

      res.json(stats);
    } catch (error) {
      console.error('Dashboard stats error:', error);
      res.status(500).json({ error: 'Failed to fetch dashboard statistics' });
    }
  });

  // Fixed Dashboard Activities
  app.get('/api/supabase/dashboard/activities', supabaseAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get recent activities from Supabase
      const { data: recentStudents } = await supabase
        .from('students')
        .select('id, name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentFeeReceipts } = await supabase
        .from('fee_receipts')
        .select('id, total_amount, created_at, student:students(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      const activities = [
        ...(recentStudents || []).map(student => ({
          type: 'student_registration',
          title: 'নতুন শিক্ষার্থী নিবন্ধন',
          subtitle: student.name,
          time: new Date(student.created_at).toLocaleString('bn-BD'),
          id: student.id
        })),
        ...(recentFeeReceipts || []).map(receipt => ({
          type: 'fee_payment',
          title: 'ফি পেমেন্ট',
          subtitle: (receipt.student as any)?.name || 'Unknown Student',
          time: new Date(receipt.created_at).toLocaleString('bn-BD'),
          amount: receipt.total_amount,
          id: receipt.id
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 10);

      res.json(activities);
    } catch (error) {
      console.error('Dashboard activities error:', error);
      res.status(500).json({ error: 'Failed to fetch activities' });
    }
  });

  // Fixed Dashboard Documents
  app.get('/api/supabase/dashboard/documents', supabaseAuthMiddleware, async (req: AuthenticatedRequest, res: Response) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get recent documents from Supabase
      const { data: recentAdmitCards } = await supabase
        .from('admit_cards')
        .select('id, status, created_at, student:students(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      const { data: recentIdCards } = await supabase
        .from('id_cards')
        .select('id, status, created_at, student:students(name)')
        .order('created_at', { ascending: false })
        .limit(3);

      const documents = [
        ...(recentAdmitCards || []).map(card => ({
          type: 'admit_card',
          title: 'প্রবেশপত্র',
          subtitle: card.student?.name || 'Unknown Student',
          status: card.status,
          time: new Date(card.created_at).toLocaleString('bn-BD'),
          id: card.id
        })),
        ...(recentIdCards || []).map(card => ({
          type: 'id_card',
          title: 'পরিচয়পত্র',
          subtitle: card.student?.name || 'Unknown Student',
          status: card.status,
          time: new Date(card.created_at).toLocaleString('bn-BD'),
          id: card.id
        }))
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 8);

      res.json(documents);
    } catch (error) {
      console.error('Dashboard documents error:', error);
      res.status(500).json({ error: 'Failed to fetch documents' });
    }
  });

  // Create test user for dashboard access
  app.post('/api/supabase/create-test-user', async (req: Request, res: Response) => {
    try {
      const supabaseUrl = process.env.SUPABASE_URL!;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const testEmail = 'dashboard@school.com';
      const testPassword = 'dashboard123';

      // Create test user
      const { data: userData, error: userError } = await supabase.auth.admin.createUser({
        email: testEmail,
        password: testPassword,
        email_confirm: true,
        user_metadata: {
          full_name: 'Dashboard Test User',
          role: 'admin'
        }
      });

      if (userError && !userError.message.includes('already registered')) {
        return res.status(400).json({ error: userError.message });
      }

      // Get session for this user
      const { data: sessionData, error: sessionError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword
      });

      if (sessionError) {
        return res.status(400).json({ error: sessionError.message });
      }

      res.json({
        message: 'Test user created successfully',
        credentials: {
          email: testEmail,
          password: testPassword,
          accessToken: sessionData.session?.access_token
        },
        instructions: 'Use these credentials to login and test the dashboard'
      });
    } catch (error: any) {
      console.error('Test user creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });
}