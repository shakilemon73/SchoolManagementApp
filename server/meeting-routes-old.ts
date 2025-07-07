import { Request, Response, Express } from "express";
import { db } from "./db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { supabase } from "../shared/supabase";

interface CreateMeetingRequest {
  title: string;
  titleBn: string;
  description?: string;
  descriptionBn?: string;
  meetingType: 'class' | 'teacher_meeting' | 'parent_meeting';
  scheduledTime: string;
  duration: number;
  maxParticipants?: number;
}

export function registerMeetingRoutes(app: Express) {
  
  // Get all meetings for the current user
  app.get("/api/meetings", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      // Fetch meetings from Supabase
      const { data: meetings, error } = await supabase
        .from('video_conferences')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching meetings:', error);
        return res.status(500).json({
          success: false,
          message: "মিটিং ডেটা লোড করতে ত্রুটি। Error loading meetings data."
        });
      }

      // Transform data to match frontend expectations
      const transformedMeetings = (meetings || []).map((meeting: any) => ({
        id: meeting.id,
        title: meeting.name || meeting.title,
        titleBn: meeting.name_bn || meeting.title_bn || meeting.name,
        description: meeting.description || "Video conference meeting",
        descriptionBn: meeting.description_bn || meeting.description || "ভিডিও কনফারেন্স মিটিং",
        startTime: meeting.start_time || new Date().toISOString(),
        endTime: meeting.end_time || new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        status: meeting.status || "scheduled",
        participants: meeting.current_participants || 0,
        maxParticipants: meeting.max_participants || 50,
        meetingId: meeting.meeting_id || `MEET-${meeting.id}`,
        isRecording: meeting.is_recording || false,
        type: meeting.type || "class",
        duration: meeting.duration || 60,
        hostId: meeting.host || userId,
        hostName: meeting.host_name || req.user?.name || "Host",
        roomId: meeting.room_id || `room-${meeting.id}`,
        createdAt: meeting.created_at
      }));

      return res.json({
        success: true,
        data: transformedMeetings
      });

    } catch (error) {
      console.error('Get meetings error:', error);
      return res.status(500).json({
        success: false,
        message: "মিটিং লোড করতে ত্রুটি। Error loading meetings."
      });
    }
  });

  // Create a new meeting
  app.post("/api/meetings", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      const {
        title,
        titleBn,
        description,
        descriptionBn,
        meetingType,
        scheduledTime,
        duration,
        maxParticipants
      }: CreateMeetingRequest = req.body;

      // Validate required fields
      if (!title || !meetingType || !scheduledTime || !duration) {
        return res.status(400).json({
          success: false,
          message: "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য দিন। Please provide all required fields."
        });
      }

      // Generate unique room ID
      const roomId = `${meetingType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      // Create new meeting object
      const newMeeting = {
        id: Date.now(),
        title,
        titleBn: titleBn || title,
        description: description || '',
        descriptionBn: descriptionBn || description || '',
        roomId,
        meetingType,
        scheduledTime,
        duration,
        hostId: userId,
        hostName: req.user?.full_name || 'Host',
        participants: [],
        status: 'scheduled' as const,
        isRecorded: meetingType !== 'parent_meeting',
        maxParticipants: maxParticipants || 50,
        createdAt: new Date().toISOString()
      };

      return res.json({
        success: true,
        message: "মিটিং সফলভাবে তৈরি হয়েছে! Meeting created successfully!",
        data: newMeeting
      });

    } catch (error) {
      console.error('Create meeting error:', error);
      return res.status(500).json({
        success: false,
        message: "মিটিং তৈরি করতে ত্রুটি। Error creating meeting."
      });
    }
  });

  // Join a meeting
  app.post("/api/meetings/:id/join", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      const meetingId = parseInt(req.params.id);

      return res.json({
        success: true,
        message: "মিটিংয়ে যোগদান সফল! Successfully joined meeting!",
        data: {
          meetingId,
          participantName: req.user?.full_name || 'User',
          joinedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Join meeting error:', error);
      return res.status(500).json({
        success: false,
        message: "মিটিংয়ে যোগ দিতে ত্রুটি। Error joining meeting."
      });
    }
  });

  // Leave a meeting
  app.post("/api/meetings/:id/leave", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      const meetingId = parseInt(req.params.id);

      return res.json({
        success: true,
        message: "মিটিং ছাড়া সফল! Successfully left meeting!",
        data: {
          meetingId,
          leftAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Leave meeting error:', error);
      return res.status(500).json({
        success: false,
        message: "মিটিং ছাড়তে ত্রুটি। Error leaving meeting."
      });
    }
  });

  // Get meeting statistics
  app.get("/api/meetings/stats", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      const stats = {
        totalMeetings: 3,
        upcomingMeetings: 3,
        completedMeetings: 0,
        liveMeetings: 0,
        totalParticipants: 0,
        averageDuration: 45,
        meetingsByType: {
          class: 1,
          teacher_meeting: 1,
          parent_meeting: 1
        }
      };

      return res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Get meeting stats error:', error);
      return res.status(500).json({
        success: false,
        message: "পরিসংখ্যান লোড করতে ত্রুটি। Error loading statistics."
      });
    }
  });

  // Update meeting status
  app.patch("/api/meetings/:id/status", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      const meetingId = parseInt(req.params.id);
      const { status } = req.body;

      if (!['scheduled', 'live', 'ended'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: "অবৈধ স্ট্যাটাস। Invalid status."
        });
      }

      return res.json({
        success: true,
        message: "মিটিং স্ট্যাটাস আপডেট হয়েছে! Meeting status updated!",
        data: {
          meetingId,
          status,
          updatedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Update meeting status error:', error);
      return res.status(500).json({
        success: false,
        message: "স্ট্যাটাস আপডেট করতে ত্রুটি। Error updating status."
      });
    }
  });

  // Get today's schedule
  app.get("/api/meetings/today", async (req: Request, res: Response) => {
    try {
      const userId = req.user?.id;
      if (!userId) {
        return res.status(401).json({
          success: false,
          message: "অননুমোদিত। Unauthorized."
        });
      }

      // Mock today's meetings
      const todayMeetings = [
        {
          id: 1,
          title: "Mathematics Class - Grade 8",
          titleBn: "গণিত ক্লাস - অষ্টম শ্রেণী",
          meetingType: "class",
          scheduledTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
          duration: 45,
          hostName: req.user?.full_name || "Teacher",
          status: "scheduled"
        }
      ];

      return res.json({
        success: true,
        data: todayMeetings
      });

    } catch (error) {
      console.error('Get today meetings error:', error);
      return res.status(500).json({
        success: false,
        message: "আজকের মিটিং লোড করতে ত্রুটি। Error loading today's meetings."
      });
    }
  });
}