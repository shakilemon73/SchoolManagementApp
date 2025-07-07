import { Express, Request, Response } from "express";
import { db } from "../db";
import { sql } from "drizzle-orm";

export function registerSupabaseLibraryRoutes(app: Express) {
  // Library stats endpoint
  app.get("/api/library/stats", async (req: Request, res: Response) => {
    try {
      const totalBooks = await db.execute(sql`SELECT COUNT(*) as count FROM library_books`);
      const borrowedBooks = await db.execute(sql`SELECT COUNT(*) as count FROM library_borrowed_books WHERE status = 'active'`);
      const overdueBooks = await db.execute(sql`SELECT COUNT(*) as count FROM library_borrowed_books WHERE status = 'overdue'`);
      
      const totalCount = Number((totalBooks as any)[0]?.count) || 0;
      const borrowedCount = Number((borrowedBooks as any)[0]?.count) || 0;
      const overdueCount = Number((overdueBooks as any)[0]?.count) || 0;
      
      res.json({
        totalBooks: totalCount,
        availableBooks: totalCount - borrowedCount,
        borrowedBooks: borrowedCount,
        overdueBooks: overdueCount
      });
    } catch (error) {
      console.error('Library stats error:', error);
      res.status(500).json({ error: 'Failed to fetch library statistics' });
    }
  });

  // Get all books
  app.get("/api/library/books", async (req: Request, res: Response) => {
    try {
      const books = await db.execute(sql`
        SELECT * FROM library_books 
        ORDER BY created_at DESC
      `);
      res.json(books);
    } catch (error) {
      console.error('Error fetching books:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  });

  // Add new book
  app.post("/api/library/books", async (req: Request, res: Response) => {
    try {
      const { title, titleBn, author, isbn, category, publisher, publishYear, totalCopies, location, description } = req.body;
      
      const result = await db.execute(sql`
        INSERT INTO library_books 
        (title, title_bn, author, isbn, category, publisher, publish_year, total_copies, available_copies, location, description) 
        VALUES (${title}, ${titleBn}, ${author}, ${isbn}, ${category}, ${publisher}, ${publishYear}, ${totalCopies}, ${totalCopies}, ${location}, ${description}) 
        RETURNING *
      `);
      
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error creating book:', error);
      res.status(500).json({ error: 'Failed to create book' });
    }
  });

  // Update a book
  app.put("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, titleBn, author, isbn, category, publisher, publishYear, totalCopies, location, description } = req.body;
      
      const result = await db.execute(sql`
        UPDATE library_books 
        SET title = ${title}, title_bn = ${titleBn}, author = ${author}, isbn = ${isbn}, 
            category = ${category}, publisher = ${publisher}, publish_year = ${publishYear}, 
            total_copies = ${totalCopies}, location = ${location}, description = ${description}
        WHERE id = ${parseInt(id)}
        RETURNING *
      `);
      
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Failed to update book' });
    }
  });

  // Delete a book
  app.delete("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      
      // Check if book is currently borrowed
      const borrowedCheck = await db.execute(sql`
        SELECT COUNT(*) as count FROM library_borrowed_books 
        WHERE book_id = ${parseInt(id)} AND status = 'active'
      `);
      
      if (Number((borrowedCheck as any)[0]?.count) > 0) {
        return res.status(400).json({ error: 'Cannot delete book that is currently borrowed' });
      }
      
      await db.execute(sql`DELETE FROM library_books WHERE id = ${parseInt(id)}`);
      res.json({ message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  });

  // Get borrowed books
  app.get("/api/library/borrowed", async (req: Request, res: Response) => {
    try {
      const borrowedBooks = await db.execute(sql`
        SELECT lbb.*, lb.title, lb.author, s.name as student_name, s.student_id
        FROM library_borrowed_books lbb
        LEFT JOIN library_books lb ON lbb.book_id = lb.id
        LEFT JOIN students s ON lbb.student_id = s.id
        WHERE lbb.status = 'active'
        ORDER BY lbb.borrow_date DESC
      `);
      res.json(borrowedBooks);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
  });

  // Borrow a book
  app.post("/api/library/borrow", async (req: Request, res: Response) => {
    try {
      const { bookId, studentId, dueDate } = req.body;
      
      // Check if book is available
      const bookCheck = await db.execute(sql`
        SELECT available_copies FROM library_books WHERE id = ${bookId}
      `);
      
      if (!bookCheck[0] || Number((bookCheck as any)[0].available_copies) <= 0) {
        return res.status(400).json({ error: 'Book not available' });
      }
      
      // Create borrow record
      const borrowDate = new Date().toISOString().split('T')[0];
      const finalDueDate = dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      
      const result = await db.execute(sql`
        INSERT INTO library_borrowed_books 
        (book_id, student_id, borrow_date, due_date, status) 
        VALUES (${bookId}, ${studentId}, ${borrowDate}, ${finalDueDate}, 'active') 
        RETURNING *
      `);
      
      // Update available copies
      await db.execute(sql`
        UPDATE library_books 
        SET available_copies = available_copies - 1 
        WHERE id = ${bookId}
      `);
      
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({ error: 'Failed to borrow book' });
    }
  });

  // Return a book
  app.post("/api/library/return", async (req: Request, res: Response) => {
    try {
      const { borrowId } = req.body;
      
      // Get borrow record
      const borrowRecord = await db.execute(sql`
        SELECT book_id FROM library_borrowed_books 
        WHERE id = ${borrowId} AND status = 'active'
      `);
      
      if (!borrowRecord[0]) {
        return res.status(404).json({ error: 'Active borrow record not found' });
      }
      
      // Update borrow record
      const returnDate = new Date().toISOString().split('T')[0];
      await db.execute(sql`
        UPDATE library_borrowed_books 
        SET status = 'returned', return_date = ${returnDate}
        WHERE id = ${borrowId}
      `);
      
      // Update available copies
      await db.execute(sql`
        UPDATE library_books 
        SET available_copies = available_copies + 1 
        WHERE id = ${(borrowRecord as any)[0].book_id}
      `);
      
      res.json({ message: 'Book returned successfully' });
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(500).json({ error: 'Failed to return book' });
    }
  });

  // Update book
  app.patch("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { title, titleBn, author, isbn, category, publisher, publishYear, totalCopies, location, description } = req.body;
      
      const result = await db.execute(sql`
        UPDATE library_books 
        SET title = ${title}, title_bn = ${titleBn}, author = ${author}, isbn = ${isbn}, 
            category = ${category}, publisher = ${publisher}, publish_year = ${publishYear}, 
            total_copies = ${totalCopies}, location = ${location}, description = ${description}
        WHERE id = ${id} 
        RETURNING *
      `);
      
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error updating book:', error);
      res.status(500).json({ error: 'Failed to update book' });
    }
  });

  // Delete book
  app.delete("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      await db.execute(sql`DELETE FROM library_books WHERE id = ${id}`);
      res.json({ success: true });
    } catch (error) {
      console.error('Error deleting book:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  });

  // Get borrowed books
  app.get("/api/library/borrowed", async (req: Request, res: Response) => {
    try {
      const borrowedBooks = await db.execute(sql`
        SELECT lbb.*, lb.title, lb.author, s.name as student_name, s.student_id
        FROM library_borrowed_books lbb
        LEFT JOIN library_books lb ON lbb.book_id = lb.id
        LEFT JOIN students s ON lbb.student_id = s.id
        ORDER BY lbb.created_at DESC
      `);
      res.json(borrowedBooks);
    } catch (error) {
      console.error('Error fetching borrowed books:', error);
      res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
  });

  // Borrow book
  app.post("/api/library/borrow", async (req: Request, res: Response) => {
    try {
      const { bookId, studentId, dueDate } = req.body;
      
      // Check if book is available
      const book = await db.execute(sql`
        SELECT available_copies FROM library_books WHERE id = ${bookId}
      `);
      
      if (!book || Number((book as any)[0]?.available_copies) <= 0) {
        return res.status(400).json({ error: 'Book not available' });
      }
      
      // Create borrowing record
      const result = await db.execute(sql`
        INSERT INTO library_borrowed_books (book_id, student_id, due_date, status) 
        VALUES (${bookId}, ${studentId}, ${dueDate}, 'active') 
        RETURNING *
      `);
      
      // Update available copies
      await db.execute(sql`
        UPDATE library_books 
        SET available_copies = available_copies - 1 
        WHERE id = ${bookId}
      `);
      
      res.json((result as any)[0]);
    } catch (error) {
      console.error('Error borrowing book:', error);
      res.status(500).json({ error: 'Failed to borrow book' });
    }
  });

  // Return book
  app.post("/api/library/return", async (req: Request, res: Response) => {
    try {
      const { borrowId } = req.body;
      
      // Get borrowing record
      const borrowRecord = await db.execute(sql`
        SELECT book_id FROM library_borrowed_books WHERE id = ${borrowId}
      `);
      
      if (!borrowRecord) {
        return res.status(404).json({ error: 'Borrowing record not found' });
      }
      
      const bookId = (borrowRecord as any)[0]?.book_id;
      
      // Update borrowing record
      await db.execute(sql`
        UPDATE library_borrowed_books 
        SET status = 'returned', return_date = CURRENT_DATE 
        WHERE id = ${borrowId}
      `);
      
      // Update available copies
      await db.execute(sql`
        UPDATE library_books 
        SET available_copies = available_copies + 1 
        WHERE id = ${bookId}
      `);
      
      res.json({ success: true });
    } catch (error) {
      console.error('Error returning book:', error);
      res.status(500).json({ error: 'Failed to return book' });
    }
  });
}