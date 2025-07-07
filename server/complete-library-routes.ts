import { Express, Request, Response } from "express";
import { db } from "./db";
import { eq, sql, count, sum, lt, and, desc } from "drizzle-orm";
import { libraryBooks, libraryBorrowedBooks, students } from "../shared/schema";

export function registerCompleteLibraryRoutes(app: Express) {
  // Get library statistics
  app.get("/api/library/stats", async (req: Request, res: Response) => {
    try {
      // Get total books
      const totalBooksResult = await db.select({ count: count() }).from(libraryBooks);
      const totalBooks = totalBooksResult[0]?.count || 0;

      // Get borrowed books count
      const borrowedBooksResult = await db.select({ count: count() })
        .from(libraryBorrowedBooks)
        .where(eq(libraryBorrowedBooks.status, 'active'));
      const borrowedBooks = borrowedBooksResult[0]?.count || 0;

      // Get overdue books
      const overdueBooksResult = await db.select({ count: count() })
        .from(libraryBorrowedBooks)
        .where(and(
          eq(libraryBorrowedBooks.status, 'active'),
          lt(libraryBorrowedBooks.dueDate, new Date().toISOString().split('T')[0])
        ));
      const overdueBooks = overdueBooksResult[0]?.count || 0;

      // Calculate available books
      const availableBooksResult = await db.select({ 
        total: sum(libraryBooks.availableCopies) 
      }).from(libraryBooks);
      const availableBooks = Number(availableBooksResult[0]?.total) || 0;

      res.json({
        totalBooks,
        availableBooks,
        borrowedBooks,
        activeBorrowers: borrowedBooks,
        overdueBooks,
        overdueBorrowers: overdueBooks,
        popularBooks: Math.min(totalBooks, 5)
      });
    } catch (error) {
      console.error('Library stats error:', error);
      res.status(500).json({ error: 'Failed to fetch library statistics' });
    }
  });

  // Get all books
  app.get("/api/library/books", async (req: Request, res: Response) => {
    try {
      const books = await db.select().from(libraryBooks).orderBy(desc(libraryBooks.createdAt));

      const formattedBooks = books.map(book => ({
        id: book.id,
        title: book.title,
        titleBn: book.titleBn,
        author: book.author,
        isbn: book.isbn,
        category: book.category,
        publisher: book.publisher,
        publishYear: book.publishYear,
        totalCopies: book.totalCopies,
        availableCopies: book.availableCopies,
        location: book.location,
        description: book.description
      }));

      res.json(formattedBooks);
    } catch (error) {
      console.error('Books fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch books' });
    }
  });

  // Get borrowed books with joins
  app.get("/api/library/borrowed", async (req: Request, res: Response) => {
    try {
      const borrowedBooks = await db
        .select({
          id: libraryBorrowedBooks.id,
          bookId: libraryBorrowedBooks.bookId,
          studentId: libraryBorrowedBooks.studentId,
          borrowDate: libraryBorrowedBooks.borrowDate,
          dueDate: libraryBorrowedBooks.dueDate,
          status: libraryBorrowedBooks.status,
          bookTitle: libraryBooks.title,
          bookTitleBn: libraryBooks.titleBn,
          studentName: students.name,
          studentNameBn: students.nameInBangla
        })
        .from(libraryBorrowedBooks)
        .innerJoin(libraryBooks, eq(libraryBorrowedBooks.bookId, libraryBooks.id))
        .innerJoin(students, eq(libraryBorrowedBooks.studentId, students.id))
        .where(eq(libraryBorrowedBooks.status, 'active'))
        .orderBy(desc(libraryBorrowedBooks.borrowDate));

      const formattedBorrowedBooks = borrowedBooks.map(borrowed => ({
        id: borrowed.id,
        bookId: borrowed.bookId,
        studentId: borrowed.studentId,
        borrowDate: borrowed.borrowDate,
        dueDate: borrowed.dueDate,
        status: borrowed.status,
        book: {
          title: borrowed.bookTitle,
          titleBn: borrowed.bookTitleBn
        },
        student: {
          name: borrowed.studentName,
          nameBn: borrowed.studentNameBn || borrowed.studentName
        }
      }));

      res.json(formattedBorrowedBooks);
    } catch (error) {
      console.error('Borrowed books fetch error:', error);
      res.status(500).json({ error: 'Failed to fetch borrowed books' });
    }
  });

  // Add new book
  app.post("/api/library/books", async (req: Request, res: Response) => {
    try {
      const newBook = await db.insert(libraryBooks).values({
        title: req.body.title,
        titleBn: req.body.titleBn,
        author: req.body.author,
        isbn: req.body.isbn,
        category: req.body.category,
        publisher: req.body.publisher,
        publishYear: req.body.publishYear,
        totalCopies: req.body.totalCopies,
        availableCopies: req.body.totalCopies,
        location: req.body.location,
        description: req.body.description
      }).returning();

      res.json(newBook[0]);
    } catch (error) {
      console.error('Book creation error:', error);
      res.status(500).json({ error: 'Failed to create book' });
    }
  });

  // Borrow book
  app.post("/api/library/borrow", async (req: Request, res: Response) => {
    try {
      const { bookId, studentId, dueDate } = req.body;

      // Check if book is available
      const book = await db.select().from(libraryBooks).where(eq(libraryBooks.id, bookId));
      
      if (!book[0] || book[0].availableCopies <= 0) {
        return res.status(400).json({ error: 'Book not available' });
      }

      // Create borrow record
      const borrowRecord = await db.insert(libraryBorrowedBooks).values({
        bookId: bookId,
        studentId: studentId,
        dueDate: dueDate,
        status: 'active'
      }).returning();

      // Update available copies
      await db.update(libraryBooks)
        .set({ availableCopies: book[0].availableCopies - 1 })
        .where(eq(libraryBooks.id, bookId));

      res.json(borrowRecord[0]);
    } catch (error) {
      console.error('Book borrow error:', error);
      res.status(500).json({ error: 'Failed to borrow book' });
    }
  });

  // Return book
  app.post("/api/library/return", async (req: Request, res: Response) => {
    try {
      const { borrowId } = req.body;

      // Get borrow record
      const borrowRecord = await db.select()
        .from(libraryBorrowedBooks)
        .where(eq(libraryBorrowedBooks.id, borrowId));

      if (!borrowRecord[0]) {
        return res.status(404).json({ error: 'Borrow record not found' });
      }

      // Update borrow record
      await db.update(libraryBorrowedBooks)
        .set({ 
          status: 'returned',
          returnDate: new Date().toISOString().split('T')[0]
        })
        .where(eq(libraryBorrowedBooks.id, borrowId));

      // Update available copies
      const book = await db.select().from(libraryBooks)
        .where(eq(libraryBooks.id, borrowRecord[0].bookId));

      await db.update(libraryBooks)
        .set({ availableCopies: (book[0]?.availableCopies || 0) + 1 })
        .where(eq(libraryBooks.id, borrowRecord[0].bookId));

      res.json({ success: true });
    } catch (error) {
      console.error('Book return error:', error);
      res.status(500).json({ error: 'Failed to return book' });
    }
  });

  // Update book
  app.patch("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      const updatedBook = await db.update(libraryBooks)
        .set({
          title: req.body.title,
          titleBn: req.body.titleBn,
          author: req.body.author,
          isbn: req.body.isbn,
          category: req.body.category,
          publisher: req.body.publisher,
          publishYear: req.body.publishYear,
          totalCopies: req.body.totalCopies,
          location: req.body.location,
          description: req.body.description
        })
        .where(eq(libraryBooks.id, parseInt(req.params.id)))
        .returning();

      res.json(updatedBook[0]);
    } catch (error) {
      console.error('Book update error:', error);
      res.status(500).json({ error: 'Failed to update book' });
    }
  });

  // Delete book
  app.delete("/api/library/books/:id", async (req: Request, res: Response) => {
    try {
      // Check if book is currently borrowed
      const borrowedBooks = await db.select()
        .from(libraryBorrowedBooks)
        .where(and(
          eq(libraryBorrowedBooks.bookId, parseInt(req.params.id)),
          eq(libraryBorrowedBooks.status, 'active')
        ));

      if (borrowedBooks.length > 0) {
        return res.status(400).json({ error: 'Cannot delete book that is currently borrowed' });
      }

      await db.delete(libraryBooks).where(eq(libraryBooks.id, parseInt(req.params.id)));

      res.json({ success: true, message: 'Book deleted successfully' });
    } catch (error) {
      console.error('Book deletion error:', error);
      res.status(500).json({ error: 'Failed to delete book' });
    }
  });
}