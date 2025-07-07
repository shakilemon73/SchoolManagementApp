import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { SchoolInstance } from "../shared/developer-portal-schema";
import { nanoid } from "nanoid";

interface SchoolSupabaseConfig {
  url: string;
  anonKey: string;
  serviceKey: string;
  databaseUrl: string;
  projectId: string;
}

class MultiSupabaseManager {
  private schoolClients = new Map<string, SupabaseClient>();
  private schoolConfigs = new Map<string, SchoolSupabaseConfig>();

  /**
   * Initialize or get a Supabase client for a specific school
   */
  async getSchoolClient(schoolId: string, config?: SchoolSupabaseConfig): Promise<SupabaseClient | null> {
    // Return existing client if available
    if (this.schoolClients.has(schoolId)) {
      return this.schoolClients.get(schoolId)!;
    }

    // If no config provided, try to get from stored configs
    if (!config && this.schoolConfigs.has(schoolId)) {
      config = this.schoolConfigs.get(schoolId)!;
    }

    if (!config) {
      console.error(`No Supabase config found for school: ${schoolId}`);
      return null;
    }

    try {
      const client = createClient(config.url, config.anonKey);
      this.schoolClients.set(schoolId, client);
      this.schoolConfigs.set(schoolId, config);
      
      console.log(`✓ Supabase client initialized for school: ${schoolId}`);
      return client;
    } catch (error) {
      console.error(`Failed to initialize Supabase client for school ${schoolId}:`, error);
      return null;
    }
  }

  /**
   * Get admin client for a school (using service key)
   */
  async getSchoolAdminClient(schoolId: string, config?: SchoolSupabaseConfig): Promise<SupabaseClient | null> {
    if (!config && this.schoolConfigs.has(schoolId)) {
      config = this.schoolConfigs.get(schoolId)!;
    }

    if (!config) {
      console.error(`No Supabase config found for school: ${schoolId}`);
      return null;
    }

    try {
      const adminClient = createClient(config.url, config.serviceKey);
      console.log(`✓ Supabase admin client initialized for school: ${schoolId}`);
      return adminClient;
    } catch (error) {
      console.error(`Failed to initialize Supabase admin client for school ${schoolId}:`, error);
      return null;
    }
  }

  /**
   * Register a new school with its own Supabase instance
   */
  async registerSchoolSupabase(schoolInstance: SchoolInstance): Promise<SchoolSupabaseConfig | null> {
    try {
      // In a real implementation, you would:
      // 1. Create a new Supabase project via API
      // 2. Set up the database schema
      // 3. Configure authentication
      // 4. Set up storage buckets
      
      // For now, we'll assume these values are provided or generated
      const config: SchoolSupabaseConfig = {
        url: schoolInstance.supabaseUrl || `https://${schoolInstance.schoolId}.supabase.co`,
        anonKey: this.generateAnonymousKey(),
        serviceKey: this.generateServiceKey(),
        databaseUrl: schoolInstance.databaseUrl || `postgresql://postgres:[password]@db.${schoolInstance.schoolId}.supabase.co:5432/postgres`,
        projectId: schoolInstance.supabaseProjectId || schoolInstance.schoolId
      };

      // Store the configuration
      this.schoolConfigs.set(schoolInstance.schoolId, config);

      // Initialize the client
      await this.getSchoolClient(schoolInstance.schoolId, config);

      return config;
    } catch (error) {
      console.error(`Failed to register Supabase for school ${schoolInstance.schoolId}:`, error);
      return null;
    }
  }

  /**
   * Set up initial schema for a school's Supabase instance
   */
  async setupSchoolSchema(schoolId: string): Promise<boolean> {
    try {
      const adminClient = await this.getSchoolAdminClient(schoolId);
      if (!adminClient) return false;

      // Create tables using SQL
      const schemaSql = `
        -- Users table
        CREATE TABLE IF NOT EXISTS users (
          id SERIAL PRIMARY KEY,
          username TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          email TEXT,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'user',
          school_id INTEGER,
          student_id INTEGER,
          credits INTEGER DEFAULT 0,
          is_active BOOLEAN DEFAULT true,
          last_login TIMESTAMP,
          profile_picture TEXT,
          phone_number TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Students table
        CREATE TABLE IF NOT EXISTS students (
          id SERIAL PRIMARY KEY,
          student_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          name_bn TEXT,
          father_name TEXT,
          mother_name TEXT,
          date_of_birth DATE,
          blood_group TEXT,
          phone TEXT,
          email TEXT,
          address TEXT,
          class_id INTEGER,
          section TEXT,
          roll_number INTEGER,
          admission_date DATE,
          status TEXT DEFAULT 'active',
          photo_url TEXT,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Classes table
        CREATE TABLE IF NOT EXISTS classes (
          id SERIAL PRIMARY KEY,
          name TEXT NOT NULL,
          name_bn TEXT,
          level INTEGER,
          description TEXT,
          is_active BOOLEAN DEFAULT true,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Teachers table
        CREATE TABLE IF NOT EXISTS teachers (
          id SERIAL PRIMARY KEY,
          teacher_id TEXT UNIQUE NOT NULL,
          name TEXT NOT NULL,
          name_bn TEXT,
          email TEXT,
          phone TEXT,
          subject TEXT,
          qualification TEXT,
          experience INTEGER,
          date_of_joining DATE,
          status TEXT DEFAULT 'active',
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
        );

        -- Enable Row Level Security
        ALTER TABLE users ENABLE ROW LEVEL SECURITY;
        ALTER TABLE students ENABLE ROW LEVEL SECURITY;
        ALTER TABLE classes ENABLE ROW LEVEL SECURITY;
        ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;

        -- Create basic policies (adjust based on your needs)
        CREATE POLICY "Users can view their own data" ON users FOR SELECT USING (auth.uid()::text = id::text);
        CREATE POLICY "Students can be viewed by authenticated users" ON students FOR SELECT TO authenticated;
        CREATE POLICY "Classes can be viewed by authenticated users" ON classes FOR SELECT TO authenticated;
        CREATE POLICY "Teachers can be viewed by authenticated users" ON teachers FOR SELECT TO authenticated;
      `;

      const { error } = await adminClient.rpc('exec_sql', { sql: schemaSql });
      
      if (error) {
        console.error(`Schema setup failed for school ${schoolId}:`, error);
        return false;
      }

      console.log(`✓ Schema set up successfully for school: ${schoolId}`);
      return true;
    } catch (error) {
      console.error(`Failed to setup schema for school ${schoolId}:`, error);
      return false;
    }
  }

  /**
   * Create storage buckets for a school
   */
  async setupSchoolStorage(schoolId: string): Promise<boolean> {
    try {
      const adminClient = await this.getSchoolAdminClient(schoolId);
      if (!adminClient) return false;

      const buckets = [
        { name: 'school-files', config: { public: true, allowedMimeTypes: ['image/*', 'application/pdf'] } },
        { name: 'student-photos', config: { public: true, allowedMimeTypes: ['image/*'] } },
        { name: 'certificates', config: { public: false, allowedMimeTypes: ['application/pdf', 'image/*'] } },
        { name: 'documents', config: { public: false, allowedMimeTypes: ['application/pdf'] } }
      ];

      for (const bucket of buckets) {
        const { error } = await adminClient.storage.createBucket(bucket.name, bucket.config);
        if (error && !error.message.includes('already exists')) {
          console.log(`Could not create bucket ${bucket.name} for school ${schoolId}:`, error.message);
        } else {
          console.log(`✓ Bucket ${bucket.name} ready for school ${schoolId}`);
        }
      }

      return true;
    } catch (error) {
      console.error(`Failed to setup storage for school ${schoolId}:`, error);
      return false;
    }
  }

  /**
   * Remove a school's Supabase client from memory
   */
  removeSchoolClient(schoolId: string): void {
    this.schoolClients.delete(schoolId);
    this.schoolConfigs.delete(schoolId);
    console.log(`✓ Removed Supabase client for school: ${schoolId}`);
  }

  /**
   * Get all registered school clients
   */
  getRegisteredSchools(): string[] {
    return Array.from(this.schoolClients.keys());
  }

  private generateAnonymousKey(): string {
    return `eyJ${nanoid(32)}.eyJ${nanoid(48)}.${nanoid(32)}`;
  }

  private generateServiceKey(): string {
    return `eyJ${nanoid(32)}.eyJ${nanoid(64)}.${nanoid(48)}`;
  }
}

// Export singleton instance
export const multiSupabaseManager = new MultiSupabaseManager();