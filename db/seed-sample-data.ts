import { db } from './index';
import { users, students, calendarEvents } from '../shared/schema';
import { eq } from 'drizzle-orm';

async function seedSampleData() {
  try {
    console.log('🌱 Starting to seed sample data...');

    // Create sample library books in notifications table (as library schema not in main schema yet)
    const sampleNotifications = [
      {
        title: "নতুন বই সংযোজিত হয়েছে",
        message: "গণিত অংক সমাধান বই লাইব্রেরিতে নতুন এসেছে। আগ্রহী শিক্ষার্থীরা ইস্যু করতে পারেন।",
        type: "library",
        isRead: false,
        sender: "গ্রন্থাগারিক",
        schoolId: 1,
        createdBy: 1
      },
      {
        title: "বই ফেরত দেওয়ার অনুরোধ",
        message: "আমিনুল ইসলাম - 'বাংলা ব্যাকরণ' বইটি ১৫ দিন অতিক্রম করেছে। দয়া করে আজই ফেরত দিন।",
        type: "library",
        isRead: false,
        sender: "গ্রন্থাগারিক",
        schoolId: 1,
        createdBy: 1
      },
      {
        title: "নতুন পরিবহন রুট চালু",
        message: "উত্তরা থেকে স্কুল পর্যন্ত নতুন বাস সেবা চালু হয়েছে। মাসিক ভাড়া ১৫০০ টাকা।",
        type: "transport",
        isRead: false,
        sender: "পরিবহন বিভাগ",
        schoolId: 1,
        createdBy: 1
      },
      {
        title: "ইনভেন্টরি আপডেট",
        message: "কম্পিউটার ল্যাবের জন্য ১০টি নতুন কম্পিউটার ক্রয় করা হয়েছে। শীঘ্রই ইনস্টল করা হবে।",
        type: "inventory",
        isRead: false,
        sender: "প্রশাসন",
        schoolId: 1,
        createdBy: 1
      },
      {
        title: "মাসিক ফি পরিশোধের সময়সীমা",
        message: "জুন মাসের ফি ৩০ জুনের মধ্যে পরিশোধ করতে হবে। বিলম্ব হলে ১০% জরিমানা প্রযোজ্য।",
        type: "financial",
        isRead: true,
        sender: "অ্যাকাউন্টস অফিস",
        schoolId: 1,
        createdBy: 1
      },
      {
        title: "নতুন শিক্ষাবর্ষ শুরু",
        message: "২০২৫-২৬ শিক্ষাবর্ষ আগামী ১ জানুয়ারি থেকে শুরু হবে। ভর্তির জন্য আবেদন গ্রহণ শুরু।",
        type: "academic",
        isRead: false,
        sender: "প্রধান শিক্ষক",
        schoolId: 1,
        createdBy: 1
      }
    ];

    // Add more calendar events for variety
    const additionalEvents = [
      {
        title: "বার্ষিক ক্রীড়া প্রতিযোগিতা",
        description: "সকল শ্রেণীর শিক্ষার্থীদের অংশগ্রহণে বার্ষিক ক্রীড়া প্রতিযোগিতা",
        startDate: "2025-06-25",
        startTime: "08:00:00",
        endTime: "17:00:00",
        location: "স্কুল মাঠ",
        eventType: "sports",
        isAllDay: false,
        isRecurring: false,
        notifyParticipants: true,
        createdBy: 1,
        schoolId: 1
      },
      {
        title: "বিজ্ঞান মেলা",
        description: "৮ম ও ৯ম শ্রেণীর শিক্ষার্থীদের বিজ্ঞান প্রজেক্ট প্রদর্শনী",
        startDate: "2025-06-30",
        startTime: "09:00:00",
        endTime: "15:00:00",
        location: "বিজ্ঞান ভবন",
        eventType: "academic",
        isAllDay: false,
        isRecurring: false,
        notifyParticipants: true,
        createdBy: 1,
        schoolId: 1
      },
      {
        title: "অভিভাবক দিবস",
        description: "সকল অভিভাবকদের সাথে শিক্ষার্থীদের অগ্রগতি নিয়ে আলোচনা",
        startDate: "2025-07-05",
        startTime: "10:00:00",
        endTime: "16:00:00",
        location: "সভা কক্ষ",
        eventType: "meeting",
        isAllDay: false,
        isRecurring: false,
        notifyParticipants: true,
        createdBy: 1,
        schoolId: 1
      }
    ];

    // Insert additional calendar events
    for (const event of additionalEvents) {
      try {
        await db.insert(calendarEvents).values(event);
        console.log(`✅ Added calendar event: ${event.title}`);
      } catch (error) {
        console.log(`⚠️ Calendar event ${event.title} might already exist`);
      }
    }

    // Since we don't have notification table in schema, we'll store in a temporary way
    // For now, create a JSON file with sample data that the notification API can serve
    const fs = require('fs');
    const path = require('path');
    
    const sampleDataDir = path.join(process.cwd(), 'sample-data');
    if (!fs.existsSync(sampleDataDir)) {
      fs.mkdirSync(sampleDataDir, { recursive: true });
    }

    // Store sample notifications
    fs.writeFileSync(
      path.join(sampleDataDir, 'notifications.json'),
      JSON.stringify(sampleNotifications, null, 2)
    );

    // Store sample library data
    const sampleLibraryData = {
      books: [
        {
          id: 1,
          title: "Advanced Mathematics",
          titleBn: "উচ্চতর গণিত",
          author: "ড. মোহাম্মদ আলী",
          isbn: "978-984-123-456-7",
          category: "textbook",
          publisher: "বাংলা প্রকাশনী",
          publishYear: 2024,
          totalCopies: 15,
          availableCopies: 12,
          location: "শেলফ A-১",
          description: "দশম শ্রেণীর গণিত বই"
        },
        {
          id: 2,
          title: "Bengali Literature",
          titleBn: "বাংলা সাহিত্য",
          author: "রবীন্দ্রনাথ ঠাকুর",
          isbn: "978-984-234-567-8",
          category: "literature",
          publisher: "সাহিত্য প্রকাশন",
          publishYear: 2023,
          totalCopies: 20,
          availableCopies: 18,
          location: "শেলফ B-২",
          description: "বাংলা সাহিত্যের সংকলন"
        },
        {
          id: 3,
          title: "Physics Fundamentals",
          titleBn: "পদার্থবিজ্ঞানের মূলভিত্তি",
          author: "ড. আব্দুল করিম",
          isbn: "978-984-345-678-9",
          category: "science",
          publisher: "বিজ্ঞান প্রকাশনী",
          publishYear: 2024,
          totalCopies: 12,
          availableCopies: 8,
          location: "শেলফ C-৩",
          description: "নবম ও দশম শ্রেণীর পদার্থবিজ্ঞান"
        }
      ],
      borrowed: [
        {
          id: 1,
          bookId: 1,
          studentId: 1,
          borrowDate: "2025-06-01",
          dueDate: "2025-06-15",
          status: "active",
          book: { title: "Advanced Mathematics", titleBn: "উচ্চতর গণিত" },
          student: { name: "Aminul Islam", nameBn: "আমিনুল ইসলাম" }
        },
        {
          id: 2,
          bookId: 3,
          studentId: 2,
          borrowDate: "2025-06-03",
          dueDate: "2025-06-17",
          status: "active",
          book: { title: "Physics Fundamentals", titleBn: "পদার্থবিজ্ঞানের মূলভিত্তি" },
          student: { name: "Fatema Sultana", nameBn: "ফাতেমা সুলতানা" }
        }
      ],
      stats: {
        totalBooks: 47,
        availableBooks: 38,
        borrowedBooks: 9,
        activeBorrowers: 7,
        overdueBooks: 2,
        overdueBorrowers: 2,
        popularBooks: 5
      }
    };

    fs.writeFileSync(
      path.join(sampleDataDir, 'library.json'),
      JSON.stringify(sampleLibraryData, null, 2)
    );

    // Store sample inventory data
    const sampleInventoryData = {
      items: [
        {
          id: 1,
          name: "Desktop Computer",
          nameBn: "ডেস্কটপ কম্পিউটার",
          category: "electronics",
          brand: "Dell",
          model: "OptiPlex 3090",
          currentQuantity: 25,
          minimumThreshold: 5,
          unit: "piece",
          purchasePrice: 45000,
          location: "কম্পিউটার ল্যাব",
          condition: "good"
        },
        {
          id: 2,
          name: "Whiteboard",
          nameBn: "হোয়াইটবোর্ড",
          category: "furniture",
          brand: "Standard",
          currentQuantity: 30,
          minimumThreshold: 10,
          unit: "piece",
          purchasePrice: 1500,
          location: "স্টোর রুম A",
          condition: "good"
        },
        {
          id: 3,
          name: "Projector",
          nameBn: "প্রজেক্টর",
          category: "electronics",
          brand: "Epson",
          model: "EB-X06",
          currentQuantity: 3,
          minimumThreshold: 2,
          unit: "piece",
          purchasePrice: 35000,
          location: "AV রুম",
          condition: "excellent"
        }
      ],
      movements: [
        {
          id: 1,
          type: "in",
          quantity: 10,
          reason: "নতুন ক্রয়",
          createdAt: "2025-06-01",
          item: { nameBn: "ডেস্কটপ কম্পিউটার", unit: "piece" }
        },
        {
          id: 2,
          type: "out",
          quantity: 2,
          reason: "মেরামতের জন্য",
          createdAt: "2025-06-02",
          item: { nameBn: "প্রজেক্টর", unit: "piece" }
        }
      ],
      stats: {
        totalItems: 58,
        totalCategories: 5,
        totalValue: 1250000,
        lowStockItems: 3,
        outOfStockItems: 1
      },
      lowStock: [
        {
          id: 3,
          nameBn: "প্রজেক্টর",
          currentQuantity: 3,
          minimumThreshold: 2,
          unit: "piece"
        }
      ]
    };

    fs.writeFileSync(
      path.join(sampleDataDir, 'inventory.json'),
      JSON.stringify(sampleInventoryData, null, 2)
    );

    // Store sample transport data
    const sampleTransportData = {
      vehicles: [
        {
          id: 1,
          vehicleNumber: "ঢাকা মেট্রো-গ-১২৩৪",
          type: "bus",
          capacity: 40,
          driverName: "মোহাম্মদ আলী",
          driverPhone: "০১৭১২৩৪৫০০১",
          helperName: "করিম উদ্দিন",
          helperPhone: "০১৮৮৭৬৫৪৩২১",
          isActive: true,
          route: { name: "ধানমন্ডি - স্কুল" }
        },
        {
          id: 2,
          vehicleNumber: "ঢাকা মেট্রো-খ-৫৬৭৮",
          type: "microbus",
          capacity: 20,
          driverName: "আব্দুল রহমান",
          driverPhone: "০১৯৮৭৬৫৪৩২১",
          isActive: true,
          route: { name: "উত্তরা - স্কুল" }
        },
        {
          id: 3,
          vehicleNumber: "ঢাকা মেট্রো-ঘ-৯১০১",
          type: "van",
          capacity: 12,
          driverName: "মো. রফিক",
          driverPhone: "০১৬১২৩৪৫৬৭৮",
          isActive: false,
          route: null
        }
      ],
      routes: [
        {
          id: 1,
          name: "ধানমন্ডি - স্কুল",
          startPoint: "ধানমন্ডি",
          endPoint: "স্কুল",
          distance: 15,
          estimatedTime: 45,
          fare: 1200,
          stops: ["ধানমন্ডি", "কলাবাগান", "রমনা", "স্কুল"]
        },
        {
          id: 2,
          name: "উত্তরা - স্কুল",
          startPoint: "উত্তরা",
          endPoint: "স্কুল",
          distance: 25,
          estimatedTime: 60,
          fare: 1500,
          stops: ["উত্তরা", "শাহবাগ", "পল্টন", "স্কুল"]
        }
      ],
      students: [
        {
          id: 1,
          studentId: 1,
          routeId: 1,
          pickupStop: "ধানমন্ডি",
          dropStop: "স্কুল",
          monthlyFee: 1200,
          isActive: true,
          student: { name: "আমিনুল ইসলাম" },
          route: { name: "ধানমন্ডি - স্কুল" }
        }
      ],
      stats: {
        totalVehicles: 15,
        activeVehicles: 12,
        totalRoutes: 8,
        activeRoutes: 6,
        transportStudents: 320,
        totalCapacity: 500,
        monthlyRevenue: 384000
      }
    };

    fs.writeFileSync(
      path.join(sampleDataDir, 'transport.json'),
      JSON.stringify(sampleTransportData, null, 2)
    );

    console.log('✅ Sample data files created successfully!');
    console.log('📁 Files created:');
    console.log('   - sample-data/notifications.json');
    console.log('   - sample-data/library.json');
    console.log('   - sample-data/inventory.json');
    console.log('   - sample-data/transport.json');

  } catch (error) {
    console.error('❌ Error seeding sample data:', error);
  }
}

seedSampleData().catch(console.error);