import { Express, Request, Response } from "express";

export function registerLibraryRoutes(app: Express) {
  // Get library statistics
  app.get("/api/library/stats", async (req: Request, res: Response) => {
    console.log('[LIBRARY ROUTE] Stats endpoint reached successfully');
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.json({
          totalBooks: 0,
          availableBooks: 0,
          borrowedBooks: 0,
          activeBorrowers: 0,
          overdueBooks: 0,
          overdueBorrowers: 0,
          popularBooks: 0
        });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Get counts using Supabase client
      const [booksResult, borrowedResult] = await Promise.all([
        supabase.from('library_books').select('id', { count: 'exact', head: true }),
        supabase.from('library_borrowed_books').select('id', { count: 'exact', head: true }).eq('status', 'active')
      ]);

      const totalBooks = booksResult.count || 0;
      const borrowedBooks = borrowedResult.count || 0;
      const availableBooks = Math.max(0, totalBooks - borrowedBooks);

      res.json({
        totalBooks,
        availableBooks,
        borrowedBooks,
        activeBorrowers: borrowedBooks, // Simplified - one book per borrower
        overdueBooks: 0, // Would need date comparison
        overdueBorrowers: 0,
        popularBooks: Math.min(5, totalBooks)
      });
    } catch (error) {
      console.error('Library stats error:', error);
      res.status(500).json({ error: 'Failed to fetch library statistics' });
    }
  });

  // Get all books
  app.get("/api/library/books", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.json([]);
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: books, error } = await supabase
        .from('library_books')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching books:', error);
        return res.status(500).json({ error: 'Failed to fetch books' });
      }

      const formattedBooks = (books || []).map(book => ({
        id: book.id,
        title: book.title,
        titleBn: book.title_bn,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publisher: book.publisher,
        publishYear: book.publish_year,
        totalCopies: book.total_copies,
        availableCopies: book.available_copies,
        location: book.location,
        description: book.description
      }));

      res.json(formattedBooks);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  });

  // Get borrowed books  
  app.get("/api/library/borrowed", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.json([]);
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { data: borrowedBooks, error } = await supabase
        .from('library_borrowed_books')
        .select('*')
        .eq('status', 'active')
        .order('borrow_date', { ascending: false });

      if (error) {
        console.error('Error fetching borrowed books:', error);
        return res.status(500).json({ error: 'Failed to fetch borrowed books' });
      }

      const formattedBorrowedBooks = (borrowedBooks || []).map(borrowed => ({
        id: borrowed.id,
        bookId: borrowed.book_id,
        studentId: borrowed.student_id,
        borrowDate: borrowed.borrow_date,
        dueDate: borrowed.due_date,
        status: borrowed.status,
        bookTitle: `Book ${borrowed.book_id}`, // Simplified
        studentName: `Student ${borrowed.student_id}` // Simplified
      }));

      res.json(formattedBorrowedBooks);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
  });

  // Add a new book
  app.post("/api/library/books", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const bookData = {
        title: req.body.title,
        title_bn: req.body.titleBn,
        author: req.body.author,
        isbn: req.body.isbn,
        category: req.body.category,
        publisher: req.body.publisher,
        publish_year: req.body.publishYear,
        total_copies: req.body.totalCopies,
        available_copies: req.body.totalCopies, // Initially all copies are available
        location: req.body.location,
        description: req.body.description
      };

      const { data: newBook, error } = await supabase
        .from('library_books')
        .insert([bookData])
        .select()
        .single();

      if (error) {
        console.error('Error adding book:', error);
        return res.status(500).json({ error: 'Failed to add book' });
      }

      res.status(201).json(newBook);
    } catch (error) {
      console.error('Error adding book:', error);
      res.status(500).json({ error: 'Failed to add book' });
    }
  });

  // Borrow a book
  app.post("/api/library/borrow", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { bookId, studentId } = req.body;

      // Check if book is available
      const { data: book } = await supabase
        .from('library_books')
        .select('available_copies')
        .eq('id', bookId)
        .single();

      if (!book || book.available_copies <= 0) {
        return res.status(400).json({ error: 'Book not available' });
      }

      // Create borrow record
      const borrowDate = new Date().toISOString().split('T')[0];
      const dueDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]; // 14 days from now

      const { data: borrowRecord, error: borrowError } = await supabase
        .from('library_borrowed_books')
        .insert([{
          book_id: bookId,
          student_id: studentId,
          borrow_date: borrowDate,
          due_date: dueDate,
          status: 'active'
        }])
        .select()
        .single();

      if (borrowError) {
        console.error('Error creating borrow record:', borrowError);
        return res.status(500).json({ error: 'Failed to borrow book' });
      }

      // Update available copies
      await supabase
        .from('library_books')
        .update({ available_copies: book.available_copies - 1 })
        .eq('id', bookId);

      res.json({ message: 'Book borrowed successfully', borrowRecord });
    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({ error: 'Failed to borrow book' });
    }
  });

  // Return a book
  app.post("/api/library/return", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const { borrowId } = req.body;

      // Get borrow record
      const { data: borrowRecord } = await supabase
        .from('library_borrowed_books')
        .select('book_id')
        .eq('id', borrowId)
        .eq('status', 'active')
        .single();

      if (!borrowRecord) {
        return res.status(404).json({ error: 'Active borrow record not found' });
      }

      // Update borrow record status
      await supabase
        .from('library_borrowed_books')
        .update({ 
          status: 'returned',
          return_date: new Date().toISOString().split('T')[0]
        })
        .eq('id', borrowId);

      // Update available copies
      const { data: book } = await supabase
        .from('library_books')
        .select('available_copies')
        .eq('id', borrowRecord.book_id)
        .single();

      if (book) {
        await supabase
          .from('library_books')
          .update({ available_copies: book.available_copies + 1 })
          .eq('id', borrowRecord.book_id);
      }

      res.json({ message: 'Book returned successfully' });
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(500).json({ error: 'Failed to return book' });
    }
  });

  // Update a book
  app.patch("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);
      const updates = req.body;

      const { data: updatedBook, error } = await supabase
        .from('library_books')
        .update(updates)
        .eq('id', req.params.id)
        .select()
        .single();

      if (error) {
        console.error('Error updating book:', error);
        return res.status(500).json({ error: 'Failed to update book' });
      }

      if (!updatedBook) {
        return res.status(404).json({ error: 'Book not found' });
      }

      res.json(updatedBook);
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Failed to update book' });
    }
  });

  // Delete a book
  app.delete("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      const supabaseUrl = process.env.SUPABASE_URL;
      const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

      if (!supabaseUrl || !supabaseServiceKey) {
        return res.status(500).json({ error: 'Database not configured' });
      }

      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      // Check if book is currently borrowed
      const { data: borrowedBooks } = await supabase
        .from('library_borrowed_books')
        .select('id')
        .eq('book_id', req.params.id)
        .eq('status', 'active');

      if (borrowedBooks && borrowedBooks.length > 0) {
        return res.status(400).json({ error: 'Cannot delete book that is currently borrowed' });
      }

      const { error } = await supabase
        .from('library_books')
        .delete()
        .eq('id', req.params.id);

      if (error) {
        console.error('Error deleting book:', error);
        return res.status(500).json({ error: 'Failed to delete book' });
      }

      res.json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  });
}