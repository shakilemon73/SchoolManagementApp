import { useState, useEffect } from 'react';
import { supabaseFeatures } from '@shared/supabase';
import { Bell, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface Notification {
  id: number;
  title: string;
  message: string;
  type: 'success' | 'warning' | 'error' | 'info' | 'urgent';
  created_at: string;
  read: boolean;
}

interface RealTimeNotificationsProps {
  userId: number;
}

export function RealTimeNotifications({ userId }: RealTimeNotificationsProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Subscribe to real-time notifications
    const subscription = supabaseFeatures.subscribeToNotifications(userId, (payload) => {
      console.log('Real-time notification received:', payload);
      
      if (payload.eventType === 'INSERT') {
        setNotifications(prev => [payload.new, ...prev]);
        setIsVisible(true);
      } else if (payload.eventType === 'UPDATE') {
        setNotifications(prev => 
          prev.map(notif => 
            notif.id === payload.new.id ? payload.new : notif
          )
        );
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [userId]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'success': return 'bg-green-100 text-green-800';
      case 'warning': return 'bg-yellow-100 text-yellow-800';
      case 'error': return 'bg-red-100 text-red-800';
      case 'urgent': return 'bg-red-500 text-white';
      default: return 'bg-blue-100 text-blue-800';
    }
  };

  if (!isVisible || notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Card className="shadow-lg border-l-4 border-l-blue-500">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-sm">
              <Bell className="h-4 w-4" />
              Live Notifications
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-2">
          {notifications.slice(0, 3).map((notification) => (
            <div key={notification.id} className="p-2 rounded border">
              <div className="flex items-center justify-between mb-1">
                <Badge className={getTypeColor(notification.type)}>
                  {notification.type}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(notification.created_at).toLocaleTimeString()}
                </span>
              </div>
              <h4 className="font-medium text-sm">{notification.title}</h4>
              <p className="text-xs text-muted-foreground">{notification.message}</p>
            </div>
          ))}
          {notifications.length > 3 && (
            <p className="text-xs text-center text-muted-foreground">
              +{notifications.length - 3} more notifications
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}