import { supabase } from './supabase';
import { RealtimeChannel } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

export type UserRole = 'student' | 'teacher' | 'staff' | 'parent' | 'admin';

export interface RealtimeSubscription {
  channel: RealtimeChannel;
  unsubscribe: () => void;
}

export interface RealtimeConfig {
  table: string;
  event: 'INSERT' | 'UPDATE' | 'DELETE' | '*';
  filter?: string;
  callback: (payload: any) => void;
}

class RealtimeManager {
  private subscriptions: Map<string, RealtimeSubscription> = new Map();
  private isConnected: boolean = false;

  // Initialize real-time connection
  async initialize(): Promise<boolean> {
    try {
      // Test connection by creating a temporary channel
      const testChannel = supabase.channel('connection-test');
      
      const subscription = await new Promise<boolean>((resolve) => {
        testChannel.subscribe((status) => {
          if (status === 'SUBSCRIBED') {
            resolve(true);
          } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
            resolve(false);
          }
        });
      });

      if (subscription) {
        this.isConnected = true;
        console.log('✓ Real-time connection established');
        testChannel.unsubscribe();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Real-time connection failed:', error);
      return false;
    }
  }

  // Subscribe to real-time updates for specific user roles
  subscribeForRole(role: UserRole, schoolId?: number): string[] {
    const subscriptionIds: string[] = [];

    switch (role) {
      case 'student':
        subscriptionIds.push(
          this.subscribe({
            table: 'students',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleStudentUpdate(payload)
          }),
          this.subscribe({
            table: 'attendance',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleAttendanceUpdate(payload)
          }),
          this.subscribe({
            table: 'exam_results',
            event: '*',
            callback: (payload) => this.handleExamResultUpdate(payload)
          }),
          this.subscribe({
            table: 'fee_receipts',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleFeeReceiptUpdate(payload)
          })
        );
        break;

      case 'teacher':
        subscriptionIds.push(
          this.subscribe({
            table: 'teachers',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleTeacherUpdate(payload)
          }),
          this.subscribe({
            table: 'classes',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleClassUpdate(payload)
          }),
          this.subscribe({
            table: 'students',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleStudentUpdate(payload)
          }),
          this.subscribe({
            table: 'attendance',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleAttendanceUpdate(payload)
          })
        );
        break;

      case 'staff':
        subscriptionIds.push(
          this.subscribe({
            table: 'students',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleStudentUpdate(payload)
          }),
          this.subscribe({
            table: 'teachers',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleTeacherUpdate(payload)
          }),
          this.subscribe({
            table: 'fee_receipts',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleFeeReceiptUpdate(payload)
          }),
          this.subscribe({
            table: 'books',
            event: '*',
            filter: schoolId ? `school_id=eq.${schoolId}` : undefined,
            callback: (payload) => this.handleBookUpdate(payload)
          })
        );
        break;

      case 'parent':
        subscriptionIds.push(
          this.subscribe({
            table: 'students',
            event: '*',
            callback: (payload) => this.handleStudentUpdate(payload)
          }),
          this.subscribe({
            table: 'attendance',
            event: '*',
            callback: (payload) => this.handleAttendanceUpdate(payload)
          }),
          this.subscribe({
            table: 'exam_results',
            event: '*',
            callback: (payload) => this.handleExamResultUpdate(payload)
          }),
          this.subscribe({
            table: 'fee_receipts',
            event: '*',
            callback: (payload) => this.handleFeeReceiptUpdate(payload)
          })
        );
        break;

      case 'admin':
        subscriptionIds.push(
          this.subscribe({
            table: 'students',
            event: '*',
            callback: (payload) => this.handleStudentUpdate(payload)
          }),
          this.subscribe({
            table: 'teachers',
            event: '*',
            callback: (payload) => this.handleTeacherUpdate(payload)
          }),
          this.subscribe({
            table: 'schools',
            event: '*',
            callback: (payload) => this.handleSchoolUpdate(payload)
          }),
          this.subscribe({
            table: 'users',
            event: '*',
            callback: (payload) => this.handleUserUpdate(payload)
          })
        );
        break;
    }

    return subscriptionIds;
  }

  // Generic subscribe method
  subscribe(config: RealtimeConfig): string {
    const subscriptionId = `${config.table}-${config.event}-${Date.now()}`;
    
    const channel = supabase.channel(subscriptionId);
    
    let realtimeConfig: any = {
      event: config.event,
      schema: 'public',
      table: config.table
    };

    if (config.filter) {
      realtimeConfig.filter = config.filter;
    }

    channel.on('postgres_changes', realtimeConfig, config.callback);

    const subscription: RealtimeSubscription = {
      channel,
      unsubscribe: () => {
        channel.unsubscribe();
        this.subscriptions.delete(subscriptionId);
      }
    };

    channel.subscribe();
    this.subscriptions.set(subscriptionId, subscription);

    return subscriptionId;
  }

  // Unsubscribe from specific subscription
  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (subscription) {
      subscription.unsubscribe();
    }
  }

  // Unsubscribe from all subscriptions
  unsubscribeAll(): void {
    this.subscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.subscriptions.clear();
  }

  // Event handlers for different table updates
  private handleStudentUpdate(payload: any): void {
    console.log('Student data updated:', payload);
    window.dispatchEvent(new CustomEvent('student-updated', { detail: payload }));
  }

  private handleTeacherUpdate(payload: any): void {
    console.log('Teacher data updated:', payload);
    window.dispatchEvent(new CustomEvent('teacher-updated', { detail: payload }));
  }

  private handleAttendanceUpdate(payload: any): void {
    console.log('Attendance data updated:', payload);
    window.dispatchEvent(new CustomEvent('attendance-updated', { detail: payload }));
  }

  private handleExamResultUpdate(payload: any): void {
    console.log('Exam result updated:', payload);
    window.dispatchEvent(new CustomEvent('exam-result-updated', { detail: payload }));
  }

  private handleFeeReceiptUpdate(payload: any): void {
    console.log('Fee receipt updated:', payload);
    window.dispatchEvent(new CustomEvent('fee-receipt-updated', { detail: payload }));
  }

  private handleClassUpdate(payload: any): void {
    console.log('Class data updated:', payload);
    window.dispatchEvent(new CustomEvent('class-updated', { detail: payload }));
  }

  private handleBookUpdate(payload: any): void {
    console.log('Book data updated:', payload);
    window.dispatchEvent(new CustomEvent('book-updated', { detail: payload }));
  }

  private handleSchoolUpdate(payload: any): void {
    console.log('School data updated:', payload);
    window.dispatchEvent(new CustomEvent('school-updated', { detail: payload }));
  }

  private handleUserUpdate(payload: any): void {
    console.log('User data updated:', payload);
    window.dispatchEvent(new CustomEvent('user-updated', { detail: payload }));
  }

  // Check connection status
  isRealtimeConnected(): boolean {
    return this.isConnected;
  }

  // Get active subscription count
  getActiveSubscriptionCount(): number {
    return this.subscriptions.size;
  }
}

export const realtimeManager = new RealtimeManager();

// Custom hooks for React components
export function useRealtime(role: UserRole, schoolId?: number) {
  const [isConnected, setIsConnected] = useState(false);
  const [subscriptionIds, setSubscriptionIds] = useState<string[]>([]);

  useEffect(() => {
    let mounted = true;

    const initializeRealtime = async () => {
      const connected = await realtimeManager.initialize();
      if (mounted) {
        setIsConnected(connected);
        
        if (connected) {
          const ids = realtimeManager.subscribeForRole(role, schoolId);
          setSubscriptionIds(ids);
        }
      }
    };

    initializeRealtime();

    return () => {
      mounted = false;
      subscriptionIds.forEach(id => realtimeManager.unsubscribe(id));
    };
  }, [role, schoolId]);

  return {
    isConnected,
    subscriptionCount: subscriptionIds.length
  };
}

// Real-time event listener hook
export function useRealtimeEvent(eventName: string, callback: (detail: any) => void) {
  useEffect(() => {
    const handleEvent = (event: CustomEvent) => {
      callback(event.detail);
    };

    window.addEventListener(eventName as any, handleEvent);
    
    return () => {
      window.removeEventListener(eventName as any, handleEvent);
    };
  }, [eventName, callback]);
}