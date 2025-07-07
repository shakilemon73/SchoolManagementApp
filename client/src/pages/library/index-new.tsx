import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Plus, BookOpen, Users, AlertTriangle, TrendingUp, Search, Edit, Trash2, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

// Form schemas
const bookSchema = z.object({
  title: z.string().min(1, "Title is required"),
  titleBn: z.string().min(1, "Bengali title is required"),
  author: z.string().min(1, "Author is required"),
  isbn: z.string().optional(),
  category: z.string().min(1, "Category is required"),
  publisher: z.string().optional(),
  publishYear: z.number().optional(),
  totalCopies: z.number().min(1, "At least 1 copy is required"),
  location: z.string().min(1, "Location is required"),
  description: z.string().optional(),
});

const borrowSchema = z.object({
  bookId: z.number(),
  studentId: z.number(),
  dueDate: z.string().min(1, "Due date is required"),
});

type BookFormData = z.infer<typeof bookSchema>;
type BorrowFormData = z.infer<typeof borrowSchema>;

interface LibraryBook {
  id: number;
  title: string;
  titleBn: string;
  author: string;
  isbn?: string;
  category: string;
  publisher?: string;
  publishYear?: number;
  totalCopies: number;
  availableCopies: number;
  location: string;
  description?: string;
}

interface BorrowedBook {
  id: number;
  bookId: number;
  studentId: number;
  borrowDate: string;
  dueDate: string;
  status: string;
  book: {
    title: string;
    titleBn: string;
  };
  student: {
    name: string;
    nameBn?: string;
  };
}

interface LibraryStats {
  totalBooks: number;
  availableBooks: number;
  borrowedBooks: number;
  activeBorrowers: number;
  overdueBooks: number;
  overdueBorrowers: number;
  popularBooks: number;
}

// API helper function
async function apiRequest(url: string, method: string = 'GET', data?: any) {
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
  };

  if (data) {
    options.body = JSON.stringify(data);
  }

  const response = await fetch(url, options);
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.statusText}`);
  }

  return response.json();
}

export default function LibraryPageComplete() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isBorrowDialogOpen, setIsBorrowDialogOpen] = useState(false);
  const [selectedBook, setSelectedBook] = useState<LibraryBook | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: libraryStats, isLoading: statsLoading } = useQuery<LibraryStats>({
    queryKey: ['/api/library/stats'],
  });

  const { data: books, isLoading: booksLoading } = useQuery<LibraryBook[]>({
    queryKey: ['/api/library/books'],
  });

  const { data: borrowedBooks, isLoading: borrowedLoading } = useQuery<BorrowedBook[]>({
    queryKey: ['/api/library/borrowed'],
  });

  // Mutations
  const addBookMutation = useMutation({
    mutationFn: (data: BookFormData) => apiRequest('/api/library/books', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/library/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/stats'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Success",
        description: "Book added successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add book",
        variant: "destructive",
      });
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: BookFormData }) => 
      apiRequest(`/api/library/books/${id}`, 'PATCH', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/library/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/stats'] });
      setIsEditDialogOpen(false);
      setSelectedBook(null);
      toast({
        title: "Success",
        description: "Book updated successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update book",
        variant: "destructive",
      });
    },
  });

  const deleteBookMutation = useMutation({
    mutationFn: (id: number) => apiRequest(`/api/library/books/${id}`, 'DELETE'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/library/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/stats'] });
      toast({
        title: "Success",
        description: "Book deleted successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete book",
        variant: "destructive",
      });
    },
  });

  const borrowBookMutation = useMutation({
    mutationFn: (data: BorrowFormData) => apiRequest('/api/library/borrow', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/library/borrowed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/stats'] });
      setIsBorrowDialogOpen(false);
      toast({
        title: "Success",
        description: "Book borrowed successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to borrow book",
        variant: "destructive",
      });
    },
  });

  const returnBookMutation = useMutation({
    mutationFn: (borrowId: number) => apiRequest('/api/library/return', 'POST', { borrowId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/library/borrowed'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/books'] });
      queryClient.invalidateQueries({ queryKey: ['/api/library/stats'] });
      toast({
        title: "Success",
        description: "Book returned successfully",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to return book",
        variant: "destructive",
      });
    },
  });

  // Forms
  const bookForm = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
    defaultValues: {
      title: "",
      titleBn: "",
      author: "",
      isbn: "",
      category: "",
      publisher: "",
      publishYear: new Date().getFullYear(),
      totalCopies: 1,
      location: "",
      description: "",
    },
  });

  const editForm = useForm<BookFormData>({
    resolver: zodResolver(bookSchema),
  });

  const borrowForm = useForm<BorrowFormData>({
    resolver: zodResolver(borrowSchema),
    defaultValues: {
      bookId: 0,
      studentId: 0,
      dueDate: "",
    },
  });

  // Filter books based on search and category
  const filteredBooks = books?.filter((book) => {
    const matchesSearch = 
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.titleBn.includes(searchTerm) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || book.category === selectedCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  // Get unique categories
  const categories = Array.from(new Set(books?.map(book => book.category) || []));

  const handleEditBook = (book: LibraryBook) => {
    setSelectedBook(book);
    editForm.reset({
      title: book.title,
      titleBn: book.titleBn,
      author: book.author,
      isbn: book.isbn || "",
      category: book.category,
      publisher: book.publisher || "",
      publishYear: book.publishYear,
      totalCopies: book.totalCopies,
      location: book.location,
      description: book.description || "",
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteBook = (id: number) => {
    if (confirm("Are you sure you want to delete this book?")) {
      deleteBookMutation.mutate(id);
    }
  };

  const onAddBook = (data: BookFormData) => {
    addBookMutation.mutate(data);
  };

  const onEditBook = (data: BookFormData) => {
    if (selectedBook) {
      updateBookMutation.mutate({ id: selectedBook.id, data });
    }
  };

  const onBorrowBook = (data: BorrowFormData) => {
    borrowBookMutation.mutate(data);
  };

  if (statsLoading || booksLoading || borrowedLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading library data...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Library Management</h1>
          <p className="text-muted-foreground">
            Manage books, track borrowing, and monitor library statistics
          </p>
        </div>
        <div className="flex gap-3">
          <Dialog open={isBorrowDialogOpen} onOpenChange={setIsBorrowDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Users className="mr-2 h-4 w-4" />
                Borrow Book
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Borrow Book</DialogTitle>
                <DialogDescription>
                  Select a book and student to create a borrowing record.
                </DialogDescription>
              </DialogHeader>
              <Form {...borrowForm}>
                <form onSubmit={borrowForm.handleSubmit(onBorrowBook)} className="space-y-4">
                  <FormField
                    control={borrowForm.control}
                    name="bookId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Book</FormLabel>
                        <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select a book" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {books?.filter(book => book.availableCopies > 0).map((book) => (
                              <SelectItem key={book.id} value={book.id.toString()}>
                                {book.title} (Available: {book.availableCopies})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={borrowForm.control}
                    name="studentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Student ID</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            placeholder="Enter student ID" 
                            {...field}
                            onChange={(e) => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={borrowForm.control}
                    name="dueDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Due Date</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={borrowBookMutation.isPending}>
                    {borrowBookMutation.isPending ? "Borrowing..." : "Borrow Book"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Book
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add New Book</DialogTitle>
                <DialogDescription>
                  Add a new book to the library catalog.
                </DialogDescription>
              </DialogHeader>
              <Form {...bookForm}>
                <form onSubmit={bookForm.handleSubmit(onAddBook)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bookForm.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (English)</FormLabel>
                          <FormControl>
                            <Input placeholder="Book title" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookForm.control}
                      name="titleBn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Title (Bengali)</FormLabel>
                          <FormControl>
                            <Input placeholder="বইয়ের নাম" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bookForm.control}
                      name="author"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Author</FormLabel>
                          <FormControl>
                            <Input placeholder="Author name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookForm.control}
                      name="isbn"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>ISBN</FormLabel>
                          <FormControl>
                            <Input placeholder="ISBN number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={bookForm.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <FormControl>
                            <Input placeholder="Book category" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookForm.control}
                      name="publisher"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publisher</FormLabel>
                          <FormControl>
                            <Input placeholder="Publisher name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <FormField
                      control={bookForm.control}
                      name="publishYear"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Publish Year</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Year" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookForm.control}
                      name="totalCopies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Copies</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Number of copies" 
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={bookForm.control}
                      name="location"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Location</FormLabel>
                          <FormControl>
                            <Input placeholder="Shelf location" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  <FormField
                    control={bookForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description</FormLabel>
                        <FormControl>
                          <Input placeholder="Book description" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full" disabled={addBookMutation.isPending}>
                    {addBookMutation.isPending ? "Adding..." : "Add Book"}
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Books</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats?.totalBooks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Books in catalog
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Available Books</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats?.availableBooks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Ready for borrowing
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Borrowed Books</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats?.borrowedBooks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Currently out
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Books</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{libraryStats?.overdueBooks || 0}</div>
            <p className="text-xs text-muted-foreground">
              Need attention
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search books by title, author, or Bengali title..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={selectedCategory} onValueChange={setSelectedCategory}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="Filter by category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>
                {category}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Books Table */}
      <Card>
        <CardHeader>
          <CardTitle>Book Catalog</CardTitle>
          <CardDescription>
            Manage your library's book collection
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Author</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Copies</TableHead>
                <TableHead>Available</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBooks.map((book) => (
                <TableRow key={book.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{book.title}</div>
                      <div className="text-sm text-muted-foreground">{book.titleBn}</div>
                    </div>
                  </TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{book.category}</Badge>
                  </TableCell>
                  <TableCell>{book.totalCopies}</TableCell>
                  <TableCell>
                    <Badge variant={book.availableCopies > 0 ? "default" : "destructive"}>
                      {book.availableCopies}
                    </Badge>
                  </TableCell>
                  <TableCell>{book.location}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEditBook(book)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteBook(book.id)}
                        disabled={deleteBookMutation.isPending}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Borrowed Books */}
      <Card>
        <CardHeader>
          <CardTitle>Currently Borrowed Books</CardTitle>
          <CardDescription>
            Track books that are currently borrowed by students
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Book</TableHead>
                <TableHead>Student</TableHead>
                <TableHead>Borrow Date</TableHead>
                <TableHead>Due Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {borrowedBooks?.map((borrow) => (
                <TableRow key={borrow.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{borrow.book.title}</div>
                      <div className="text-sm text-muted-foreground">{borrow.book.titleBn}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{borrow.student.name}</div>
                      <div className="text-sm text-muted-foreground">{borrow.student.nameBn}</div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(borrow.borrowDate).toLocaleDateString()}</TableCell>
                  <TableCell>{new Date(borrow.dueDate).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Badge variant={
                      new Date(borrow.dueDate) < new Date() ? "destructive" : "default"
                    }>
                      {new Date(borrow.dueDate) < new Date() ? "Overdue" : "Active"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => returnBookMutation.mutate(borrow.id)}
                      disabled={returnBookMutation.isPending}
                    >
                      Return Book
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Book</DialogTitle>
            <DialogDescription>
              Update book information in the library catalog.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditBook)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (English)</FormLabel>
                      <FormControl>
                        <Input placeholder="Book title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="titleBn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title (Bengali)</FormLabel>
                      <FormControl>
                        <Input placeholder="বইয়ের নাম" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="author"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Author</FormLabel>
                      <FormControl>
                        <Input placeholder="Author name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="isbn"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>ISBN</FormLabel>
                      <FormControl>
                        <Input placeholder="ISBN number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category</FormLabel>
                      <FormControl>
                        <Input placeholder="Book category" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="publisher"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publisher</FormLabel>
                      <FormControl>
                        <Input placeholder="Publisher name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={editForm.control}
                  name="publishYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Publish Year</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Year" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="totalCopies"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Total Copies</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Number of copies" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={editForm.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Shelf location" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input placeholder="Book description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={updateBookMutation.isPending}>
                {updateBookMutation.isPending ? "Updating..." : "Update Book"}
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}