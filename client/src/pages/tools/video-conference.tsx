import { useState, useEffect, useRef } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { ResponsivePageLayout } from '@/components/layout/responsive-page-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { 
  Video, 
  VideoOff, 
  Mic, 
  MicOff, 
  Phone, 
  PhoneOff,
  Users,
  Settings,
  Share,
  MessageSquare,
  Camera,
  Monitor,
  Calendar,
  Clock,
  Plus,
  Copy,
  Check,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  MoreHorizontal,
  StopCircle
} from 'lucide-react';

interface ConferenceRoom {
  id: string;
  name: string;
  nameBn: string;
  description: string;
  descriptionBn: string;
  participants: number;
  maxParticipants: number;
  isActive: boolean;
  startTime: string;
  duration: number;
  host: string;
  type: 'class' | 'meeting' | 'discussion';
  isRecording: boolean;
}

interface Participant {
  id: string;
  name: string;
  role: 'host' | 'teacher' | 'student' | 'admin';
  isVideoOn: boolean;
  isAudioOn: boolean;
  joinedAt: string;
}

export default function VideoConferencePage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('rooms');
  const [selectedRoom, setSelectedRoom] = useState<ConferenceRoom | null>(null);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isAudioOn, setIsAudioOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showParticipants, setShowParticipants] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [chatMessage, setChatMessage] = useState('');
  const [isInCall, setIsInCall] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Mock conference rooms data
  const conferenceRooms: ConferenceRoom[] = [
    {
      id: 'room-001',
      name: 'Class 10 Mathematics',
      nameBn: 'দশম শ্রেণী গণিত',
      description: 'Advanced algebra and geometry lesson',
      descriptionBn: 'উন্নত বীজগণিত এবং জ্যামিতি পাঠ',
      participants: 25,
      maxParticipants: 50,
      isActive: true,
      startTime: '10:00 AM',
      duration: 60,
      host: 'মোঃ করিম উদ্দিন',
      type: 'class',
      isRecording: false
    },
    {
      id: 'room-002',
      name: 'Teachers Meeting',
      nameBn: 'শিক্ষক সভা',
      description: 'Weekly staff coordination meeting',
      descriptionBn: 'সাপ্তাহিক স্টাফ সমন্বয় সভা',
      participants: 12,
      maxParticipants: 20,
      isActive: true,
      startTime: '2:00 PM',
      duration: 45,
      host: 'ড. ফাতেমা খাতুন',
      type: 'meeting',
      isRecording: true
    },
    {
      id: 'room-003',
      name: 'Parent-Teacher Conference',
      nameBn: 'অভিভাবক-শিক্ষক সম্মেলন',
      description: 'Monthly parent teacher discussion',
      descriptionBn: 'মাসিক অভিভাবক শিক্ষক আলোচনা',
      participants: 8,
      maxParticipants: 15,
      isActive: false,
      startTime: '4:00 PM',
      duration: 90,
      host: 'মিসেস রহিমা বেগম',
      type: 'discussion',
      isRecording: false
    }
  ];

  // Mock participants data
  const participants: Participant[] = [
    {
      id: 'p-001',
      name: 'মোঃ করিম উদ্দিন (হোস্ট)',
      role: 'host',
      isVideoOn: true,
      isAudioOn: true,
      joinedAt: '10:00 AM'
    },
    {
      id: 'p-002',
      name: 'আয়েশা রহমান',
      role: 'student',
      isVideoOn: true,
      isAudioOn: false,
      joinedAt: '10:02 AM'
    },
    {
      id: 'p-003',
      name: 'রফিক উল্লাহ',
      role: 'student',
      isVideoOn: false,
      isAudioOn: true,
      joinedAt: '10:03 AM'
    }
  ];

  // Enhanced room management
  const joinRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      return apiRequest(`/api/video-conference/join/${roomId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      setIsInCall(true);
      toast({
        title: "রুমে যোগদান সফল",
        description: "আপনি সফলভাবে ভিডিও কনফারেন্সে যোগ দিয়েছেন",
      });
    },
    onError: () => {
      toast({
        title: "যোগদানে সমস্যা",
        description: "ভিডিও কনফারেন্সে যোগ দিতে সমস্যা হয়েছে",
        variant: "destructive",
      });
    },
  });

  const leaveRoomMutation = useMutation({
    mutationFn: async (roomId: string) => {
      return apiRequest(`/api/video-conference/leave/${roomId}`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      setIsInCall(false);
      setSelectedRoom(null);
      toast({
        title: "রুম ত্যাগ করেছেন",
        description: "আপনি ভিডিও কনফারেন্স ত্যাগ করেছেন",
      });
    },
  });

  // Video controls
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    toast({
      title: isVideoOn ? "ভিডিও বন্ধ করা হয়েছে" : "ভিডিও চালু করা হয়েছে",
      description: isVideoOn ? "আপনার ভিডিও বন্ধ করা হয়েছে" : "আপনার ভিডিও চালু করা হয়েছে",
    });
  };

  const toggleAudio = () => {
    setIsAudioOn(!isAudioOn);
    toast({
      title: isAudioOn ? "মাইক্রোফোন বন্ধ করা হয়েছে" : "মাইক্রোফোন চালু করা হয়েছে",
      description: isAudioOn ? "আপনার মাইক বন্ধ করা হয়েছে" : "আপনার মাইক চালু করা হয়েছে",
    });
  };

  const toggleScreenShare = () => {
    setIsScreenSharing(!isScreenSharing);
    toast({
      title: isScreenSharing ? "স্ক্রিন শেয়ার বন্ধ" : "স্ক্রিন শেয়ার চালু",
      description: isScreenSharing ? "স্ক্রিন শেয়ারিং বন্ধ করা হয়েছে" : "স্ক্রিন শেয়ারিং শুরু হয়েছে",
    });
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
    toast({
      title: isRecording ? "রেকর্ডিং বন্ধ" : "রেকর্ডিং শুরু",
      description: isRecording ? "ক্লাস রেকর্ডিং বন্ধ করা হয়েছে" : "ক্লাস রেকর্ডিং শুরু হয়েছে",
    });
  };

  // Room type styling
  const getRoomTypeStyle = (type: string) => {
    switch(type) {
      case 'class': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'meeting': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'discussion': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoomTypeLabel = (type: string) => {
    switch(type) {
      case 'class': return 'ক্লাস';
      case 'meeting': return 'সভা';
      case 'discussion': return 'আলোচনা';
      default: return 'অন্যান্য';
    }
  };

  // Room card component
  const RoomCard = ({ room }: { room: ConferenceRoom }) => (
    <Card className="group hover:shadow-lg transition-all duration-300 border-0 bg-gradient-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Video className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-semibold text-gray-900 dark:text-white">
                {room.nameBn}
              </CardTitle>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {room.descriptionBn}
              </p>
            </div>
          </div>
          <Badge className={getRoomTypeStyle(room.type)}>
            {getRoomTypeLabel(room.type)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {room.participants}/{room.maxParticipants} জন
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-gray-500" />
              <span className="text-gray-700 dark:text-gray-300">
                {room.startTime} - {room.duration} মিনিট
              </span>
            </div>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              হোস্ট: {room.host}
            </span>
            {room.isRecording && (
              <div className="flex items-center gap-1 text-red-600">
                <div className="h-3 w-3 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs">রেকর্ডিং</span>
              </div>
            )}
          </div>

          <div className="flex gap-2 pt-2">
            {room.isActive ? (
              <Button 
                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
                onClick={() => {
                  setSelectedRoom(room);
                  joinRoomMutation.mutate(room.id);
                }}
                disabled={joinRoomMutation.isPending}
              >
                <Video className="h-4 w-4 mr-2" />
                যোগ দিন
              </Button>
            ) : (
              <Button 
                variant="outline" 
                className="flex-1"
                disabled
              >
                <Clock className="h-4 w-4 mr-2" />
                শীঘ্রই শুরু
              </Button>
            )}
            <Button size="sm" variant="outline">
              <Share className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  // Video conference interface
  const VideoConferenceInterface = () => (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between p-4 bg-gray-900 text-white">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">{selectedRoom?.nameBn}</h2>
          <Badge className="bg-red-600">
            <div className="h-3 w-3 bg-white rounded-full animate-pulse mr-1" />
            লাইভ
          </Badge>
          {isRecording && (
            <Badge className="bg-red-500">
              <StopCircle className="h-3 w-3 mr-1" />
              রেকর্ডিং
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          <span>{selectedRoom?.participants} জন</span>
          <Clock className="h-4 w-4 ml-2" />
          <span>{selectedRoom?.duration} মিনিট</span>
        </div>
      </div>

      {/* Main video area */}
      <div className="flex-1 flex">
        {/* Video grid */}
        <div className="flex-1 p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-full">
            {/* Main video */}
            <div className="lg:col-span-2 bg-gray-800 rounded-lg overflow-hidden relative">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
              />
              <div className="absolute bottom-4 left-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded">
                মোঃ করিম উদ্দিন (আপনি)
              </div>
              {!isVideoOn && (
                <div className="absolute inset-0 bg-gray-700 flex items-center justify-center">
                  <div className="text-center text-white">
                    <Camera className="h-12 w-12 mx-auto mb-2 opacity-50" />
                    <p>ভিডিও বন্ধ</p>
                  </div>
                </div>
              )}
            </div>

            {/* Participant videos */}
            {participants.slice(1, 4).map((participant) => (
              <div key={participant.id} className="bg-gray-800 rounded-lg overflow-hidden relative aspect-video">
                {participant.isVideoOn ? (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-600"></div>
                ) : (
                  <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                    <Camera className="h-8 w-8 text-gray-400" />
                  </div>
                )}
                <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white px-2 py-1 rounded text-xs">
                  {participant.name}
                </div>
                {!participant.isAudioOn && (
                  <div className="absolute top-2 right-2 bg-red-600 rounded-full p-1">
                    <MicOff className="h-3 w-3 text-white" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        {(showParticipants || showChat) && (
          <div className="w-80 bg-gray-900 border-l border-gray-700">
            <Tabs value={showParticipants ? 'participants' : 'chat'} className="h-full flex flex-col">
              <TabsList className="grid w-full grid-cols-2 bg-gray-800">
                <TabsTrigger 
                  value="participants" 
                  onClick={() => {setShowParticipants(true); setShowChat(false);}}
                  className="data-[state=active]:bg-gray-700"
                >
                  <Users className="h-4 w-4 mr-2" />
                  অংশগ্রহণকারী
                </TabsTrigger>
                <TabsTrigger 
                  value="chat"
                  onClick={() => {setShowChat(true); setShowParticipants(false);}}
                  className="data-[state=active]:bg-gray-700"
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  চ্যাট
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="participants" className="flex-1 p-4 space-y-2 overflow-y-auto">
                {participants.map((participant) => (
                  <div key={participant.id} className="flex items-center justify-between p-2 bg-gray-800 rounded">
                    <div>
                      <p className="text-white text-sm font-medium">{participant.name}</p>
                      <p className="text-gray-400 text-xs">যোগদান: {participant.joinedAt}</p>
                    </div>
                    <div className="flex gap-1">
                      {participant.isVideoOn ? (
                        <Video className="h-4 w-4 text-green-400" />
                      ) : (
                        <VideoOff className="h-4 w-4 text-red-400" />
                      )}
                      {participant.isAudioOn ? (
                        <Mic className="h-4 w-4 text-green-400" />
                      ) : (
                        <MicOff className="h-4 w-4 text-red-400" />
                      )}
                    </div>
                  </div>
                ))}
              </TabsContent>
              
              <TabsContent value="chat" className="flex-1 flex flex-col">
                <div className="flex-1 p-4 overflow-y-auto">
                  <div className="space-y-3">
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">করিম উদ্দিন • 10:05</p>
                      <p className="text-white text-sm">আজকের পাঠ শুরু করি</p>
                    </div>
                    <div className="bg-gray-800 p-3 rounded">
                      <p className="text-xs text-gray-400 mb-1">আয়েশা রহমান • 10:06</p>
                      <p className="text-white text-sm">স্যার, আমি প্রস্তুত</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 border-t border-gray-700">
                  <div className="flex gap-2">
                    <Input
                      value={chatMessage}
                      onChange={(e) => setChatMessage(e.target.value)}
                      placeholder="বার্তা লিখুন..."
                      className="bg-gray-800 border-gray-600 text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          setChatMessage('');
                        }
                      }}
                    />
                    <Button size="sm">পাঠান</Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </div>

      {/* Bottom controls */}
      <div className="bg-gray-900 p-4 flex items-center justify-center gap-4">
        <Button
          size="lg"
          variant={isAudioOn ? "default" : "destructive"}
          onClick={toggleAudio}
          className="rounded-full w-12 h-12"
        >
          {isAudioOn ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
        </Button>

        <Button
          size="lg"
          variant={isVideoOn ? "default" : "destructive"}
          onClick={toggleVideo}
          className="rounded-full w-12 h-12"
        >
          {isVideoOn ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
        </Button>

        <Button
          size="lg"
          variant={isScreenSharing ? "default" : "outline"}
          onClick={toggleScreenShare}
          className="rounded-full w-12 h-12"
        >
          <Monitor className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          variant={isRecording ? "destructive" : "outline"}
          onClick={toggleRecording}
          className="rounded-full w-12 h-12"
        >
          {isRecording ? <StopCircle className="h-5 w-5" /> : <div className="h-5 w-5 bg-current rounded-full" />}
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowParticipants(!showParticipants)}
          className="rounded-full w-12 h-12"
        >
          <Users className="h-5 w-5" />
        </Button>

        <Button
          size="lg"
          variant="outline"
          onClick={() => setShowChat(!showChat)}
          className="rounded-full w-12 h-12"
        >
          <MessageSquare className="h-5 w-5" />
        </Button>

        <div className="flex-1"></div>

        <Button
          size="lg"
          variant="destructive"
          onClick={() => leaveRoomMutation.mutate(selectedRoom?.id || '')}
          className="rounded-full px-6"
        >
          <PhoneOff className="h-5 w-5 mr-2" />
          কল শেষ
        </Button>
      </div>
    </div>
  );

  if (isInCall && selectedRoom) {
    return <VideoConferenceInterface />;
  }

  return (
    <AppShell>
      <ResponsivePageLayout
        title="ভিডিও কনফারেন্স"
        description="অনলাইন ক্লাস এবং মিটিং পরিচালনা করুন"
      >
        <div className="space-y-6">
          {/* Quick stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                    <Video className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-blue-600 dark:text-blue-400">সক্রিয় রুম</p>
                    <p className="text-2xl font-bold text-blue-700 dark:text-blue-300">
                      {conferenceRooms.filter(r => r.isActive).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                    <Users className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-green-600 dark:text-green-400">মোট অংশগ্রহণকারী</p>
                    <p className="text-2xl font-bold text-green-700 dark:text-green-300">
                      {conferenceRooms.reduce((sum, room) => sum + room.participants, 0)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900 border-purple-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500 rounded-lg flex items-center justify-center">
                    <div className="h-5 w-5 bg-white rounded-full" />
                  </div>
                  <div>
                    <p className="text-sm text-purple-600 dark:text-purple-400">রেকর্ডিং</p>
                    <p className="text-2xl font-bold text-purple-700 dark:text-purple-300">
                      {conferenceRooms.filter(r => r.isRecording).length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900 border-orange-200">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-500 rounded-lg flex items-center justify-center">
                    <Clock className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-orange-600 dark:text-orange-400">আজকের মিটিং</p>
                    <p className="text-2xl font-bold text-orange-700 dark:text-orange-300">
                      {conferenceRooms.length}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main content */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="rooms">সক্রিয় রুম</TabsTrigger>
              <TabsTrigger value="schedule">সময়সূচী</TabsTrigger>
              <TabsTrigger value="recordings">রেকর্ডিং</TabsTrigger>
            </TabsList>

            <TabsContent value="rooms" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">বর্তমানে চলমান</h3>
                <Button className="bg-gradient-to-r from-blue-500 to-purple-600">
                  <Plus className="h-4 w-4 mr-2" />
                  নতুন রুম তৈরি করুন
                </Button>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {conferenceRooms.map((room) => (
                  <RoomCard key={room.id} room={room} />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="h-5 w-5" />
                    আজকের সময়সূচী
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conferenceRooms.map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div>
                          <h4 className="font-medium">{room.nameBn}</h4>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{room.descriptionBn}</p>
                          <p className="text-sm text-gray-500 mt-1">হোস্ট: {room.host}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">{room.startTime}</p>
                          <p className="text-sm text-gray-600">{room.duration} মিনিট</p>
                          <Badge className={getRoomTypeStyle(room.type)} variant="secondary">
                            {getRoomTypeLabel(room.type)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="recordings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <div className="h-5 w-5 bg-red-500 rounded-full" />
                    সংরক্ষিত রেকর্ডিং
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {conferenceRooms.filter(r => r.isRecording).map((room) => (
                      <div key={room.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-8 bg-red-100 dark:bg-red-900 rounded flex items-center justify-center">
                            <div className="h-4 w-4 bg-red-600 rounded-full" />
                          </div>
                          <div>
                            <h4 className="font-medium">{room.nameBn}</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {room.startTime} - {room.duration} মিনিট
                            </p>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline">
                            <Video className="h-4 w-4 mr-1" />
                            দেখুন
                          </Button>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-1" />
                            ডাউনলোড
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </ResponsivePageLayout>
    </AppShell>
  );
}