import { Express, Request, Response } from "express";

export function registerFixedTransportRoutes(app: Express) {
  // Initialize transport table with proper TEXT columns (public route)
  app.get("/api/public/transport/init", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      // Initialize with sample data using direct inserts
      const sampleRoutes = [
        {
          route_name: 'ঢাকা-গুলশান রুট',
          pickup_points: 'গুলশান ১, গুলশান ২, বনানী',
          timings: '৭:৩০ AM, ২:৩০ PM',
          monthly_fee: 1500.00,
          school_id: 1
        },
        {
          route_name: 'ঢাকা-ধানমন্ডি রুট',
          pickup_points: 'ধানমন্ডি ২৭, কলাবাগান, নিউমার্কেট',
          timings: '৮:০০ AM, ৩:০০ PM',
          monthly_fee: 1200.00,
          school_id: 1
        },
        {
          route_name: 'ঢাকা-উত্তরা রুট',
          pickup_points: 'উত্তরা সেক্টর ৩, সেক্টর ৭, সেক্টর ১০',
          timings: '৭:০০ AM, ২:০০ PM',
          monthly_fee: 1800.00,
          school_id: 1
        }
      ];

      // First clear existing data
      await supabase.from('transport_routes').delete().neq('id', 0);
      
      // Insert sample data
      const { error } = await supabase
        .from('transport_routes')
        .insert(sampleRoutes);
      
      if (error) {
        console.log('Error inserting sample data:', error);
      }
      
      res.json({ message: 'Transport table initialized successfully' });
    } catch (error) {
      console.error('Error initializing transport table:', error);
      res.status(500).json({ error: 'Failed to initialize transport table' });
    }
  });

  // Get all routes
  app.get("/api/public/transport/routes-fixed", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabase
        .from('transport_routes')
        .select('*')
        .order('id');
      
      if (error) {
        throw error;
      }
      
      res.json(data);
    } catch (error) {
      console.error('Error fetching routes:', error);
      res.status(500).json({ error: 'Failed to fetch routes' });
    }
  });

  // Create new route
  app.post("/api/public/transport/routes-fixed", async (req: Request, res: Response) => {
    try {
      const { routeName, pickupPoints, timings, monthlyFee } = req.body;
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabase
        .from('transport_routes')
        .insert([{
          route_name: routeName || 'New Route',
          pickup_points: pickupPoints || 'TBD',
          timings: timings || 'TBD',
          monthly_fee: parseFloat(monthlyFee) || 0,
          school_id: 1
        }])
        .select();
      
      if (error) {
        throw error;
      }
      
      res.json(data[0]);
    } catch (error) {
      console.error('Error creating route:', error);
      res.status(500).json({ error: 'Failed to create route', details: error.message });
    }
  });

  // Update route
  app.put("/api/public/transport/routes-fixed/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { routeName, pickupPoints, timings, monthlyFee } = req.body;
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { data, error } = await supabase
        .from('transport_routes')
        .update({
          route_name: routeName,
          pickup_points: pickupPoints,
          timings: timings,
          monthly_fee: parseFloat(monthlyFee) || 0
        })
        .eq('id', parseInt(id))
        .select();
      
      if (error) {
        throw error;
      }
      
      res.json(data[0]);
    } catch (error) {
      console.error('Error updating route:', error);
      res.status(500).json({ error: 'Failed to update route' });
    }
  });

  // Delete route
  app.delete("/api/public/transport/routes-fixed/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Supabase configuration missing' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      
      const { error } = await supabase
        .from('transport_routes')
        .delete()
        .eq('id', parseInt(id));
      
      if (error) {
        throw error;
      }
      
      res.json({ message: 'Route deleted successfully' });
    } catch (error) {
      console.error('Error deleting route:', error);
      res.status(500).json({ error: 'Failed to delete route' });
    }
  });
}