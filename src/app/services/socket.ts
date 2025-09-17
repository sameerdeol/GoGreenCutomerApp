import { Injectable } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SocketService {
  private socket: Socket | null = null;
  private readonly serverUrl = 'https://cx.ekarigar.com';
  private readonly socketPath = "/delievery-api/socket.io";
  private connected$ = new BehaviorSubject<boolean>(false);

  constructor() {
    this.initializeSocket();
  }

  private initializeSocket() {
    if (!this.socket) {
      this.socket = io(this.serverUrl, {
        autoConnect: false,
        transports: ['websocket', 'polling'],
        path: this.socketPath,
        secure: true,
        timeout: 5000
      });

      this.socket.on('connect', () => {
        console.log('✅ Socket connected:', this.socket?.id);
        this.connected$.next(true);
      });

      this.socket.on('disconnect', () => {
        console.log('❌ Socket disconnected');
        this.connected$.next(false);
      });

      this.socket.on('connect_error', (error: any) => {
        console.error('⚠️ Socket connection error:', error);
      });
    }
  }

  connect(): void {
    if (!this.socket) this.initializeSocket();
    if (this.socket && !this.socket.connected) {
      this.socket.connect();
    }
  }

  disconnect(): void {
    this.socket?.disconnect();
  }

  connectionStatus$() {
    return this.connected$.asObservable();
  }

  /** Generic emit */
  emit(event: string, data?: any) {
    this.socket?.emit(event, data);
  }

  /** ✅ Only ONE on<T>() implementation */
  on<T>(event: string): Observable<T> {
    return new Observable<T>(subscriber => {
      this.socket?.on(event, (data: T) => {
        subscriber.next(data);
      });
      return () => this.socket?.off(event);
    });
  }

  /** Debug: listen to all events */
  onAny(): Observable<{ event: string; data: any }> {
    return new Observable(subscriber => {
      const handler = (event: string, ...args: any[]) => {
        subscriber.next({ event, data: args?.[0] });
      };
      // @ts-ignore socket.io onAny exists at runtime
      this.socket?.onAny(handler);
      return () => {
        // @ts-ignore offAny exists at runtime
        this.socket?.offAny(handler);
      };
    });
  }

  /** Optional helpers if backend requires joining rooms */
  joinOrderRoom(orderId: string | number) {
    this.emit('joinOrderRoom', { order_id: orderId });
  }
  joinRiderRoom(riderId: string | number) {
    this.emit('joinRiderRoom', { rider_id: riderId });
  }

  /** Example wrapper for rider location updates */
  listenRiderLocationUpdates() {
    return this.on<{ rider_id: string; lat: number; lng: number }>('riderLocationUpdate');
  }
}
