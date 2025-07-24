// DO NOT import * as signalR from '@microsoft/signalr' in this file! All signalR usage is mocked below.
import { TestBed } from '@angular/core/testing';
import { NotificationSocketService } from './notification-socket.service';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { JwtService } from '../../../../core/auth/services/jwt.service';
import { NotificationService } from './notification.service';

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseHubUrl: 'ws://localhost/hub',
  },
}));

// Mock JwtService
const mockGetAccessToken = vi.fn(() => 'test-token');
const jwtServiceMock = {
  getAccessToken: mockGetAccessToken,
};

// Mock NotificationService
const mockAddNotification = vi.fn();
const notificationServiceMock = {
  addNotification: mockAddNotification,
};

// Mock signalR
const startMock = vi.fn();
const stopMock = vi.fn();
const onMock = vi.fn();
const withUrlMock = vi.fn(function (this: any) {
  return this;
});
const configureLoggingMock = vi.fn(function (this: any) {
  return this;
});
const withAutomaticReconnectMock = vi.fn(function (this: any) {
  return this;
});
const buildMock = vi.fn(() => HubConnectionMock());

const HubConnectionMock = vi.fn(() => ({
  start: startMock,
  stop: stopMock,
  on: onMock,
}));

function HubConnectionBuilderMock(this: any) {
  return {
    withUrl: withUrlMock,
    configureLogging: configureLoggingMock,
    withAutomaticReconnect: withAutomaticReconnectMock,
    build: buildMock,
  };
}

const LogLevelMock = { Information: 1 };

vi.mock('@microsoft/signalr', () => ({
  HubConnectionBuilder: HubConnectionBuilderMock,
  LogLevel: { Information: 1 },
}));

const mockRandomUUID = vi.fn();

describe('NotificationSocketService (Vitest)', () => {
  let service: NotificationSocketService;

  beforeEach(() => {
    vi.clearAllMocks();
    if (!globalThis.crypto) globalThis.crypto = {} as any;
    if (!window.crypto) window.crypto = {} as any;
    globalThis.crypto.randomUUID = vi.fn(() => 'uuid-123' as any);
    window.crypto.randomUUID = globalThis.crypto.randomUUID;
    TestBed.configureTestingModule({
      providers: [
        NotificationSocketService,
        { provide: JwtService, useValue: jwtServiceMock },
        { provide: NotificationService, useValue: notificationServiceMock },
      ],
    });
    service = TestBed.inject(NotificationSocketService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('connect', () => {
    it('should create a new connection and register handlers', async () => {
      startMock.mockResolvedValueOnce(undefined);
      service.connect();
      await Promise.resolve();
      expect(withUrlMock).toHaveBeenCalledWith(
        'ws://localhost/hub/notification',
        expect.objectContaining({
          accessTokenFactory: expect.any(Function),
        })
      );
      expect(configureLoggingMock).toHaveBeenCalledWith(
        LogLevelMock.Information
      );
      expect(withAutomaticReconnectMock).toHaveBeenCalled();
      expect(buildMock).toHaveBeenCalled();
      expect(startMock).toHaveBeenCalled();
      expect(onMock).toHaveBeenCalledWith(
        'QuestionCreated',
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith(
        'QuestionUpdated',
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith(
        'QuestionDeleted',
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith(
        'QuestionCommented',
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith(
        'QuestionCommentUpdated',
        expect.any(Function)
      );
      expect(onMock).toHaveBeenCalledWith(
        'QuestionCommentDeleted',
        expect.any(Function)
      );
    });

    it('should disconnect previous connection before creating new one', async () => {
      startMock.mockResolvedValueOnce(undefined);
      startMock.mockResolvedValueOnce(undefined);
      service.connect();
      await Promise.resolve();
      (service as any).connection = HubConnectionMock();
      service.connect();
      expect(stopMock).toHaveBeenCalled();
      expect((service as any).connection).not.toBeNull();
    });

    it('should handle start() rejected promise (edge case)', async () => {
      startMock.mockRejectedValueOnce(new Error('fail'));
      service.connect();
      await Promise.resolve();
      expect(startMock).toHaveBeenCalled();
    });
  });

  describe('disconnect', () => {
    it('should stop and nullify connection', () => {
      (service as any).connection = HubConnectionMock();
      service.disconnect();
      expect(stopMock).toHaveBeenCalled();
      expect((service as any).connection).toBeNull();
    });
    it('should do nothing if connection is null (edge case)', () => {
      (service as any).connection = null;
      expect(() => service.disconnect()).not.toThrow();
    });
  });

  describe('registerConnectionHandler', () => {
    it('should call addNotification when event is triggered', () => {
      (service as any).connection = {
        on: (event: string, cb: (payload: any) => void) => {
          if (event === 'TestEvent') {
            cb({ foo: 'bar' });
          }
        },
      };
      const spy = vi
        .spyOn(service as any, 'createNotification')
        .mockReturnValue({
          id: 'id',
          type: 'TestEvent',
          payload: { foo: 'bar' },
          createdAt: 'now',
          isRead: false,
        });
      // @ts-ignore: access private
      (service as any).registerConnectionHandler('TestEvent');
      expect(spy).toHaveBeenCalledWith('TestEvent', { foo: 'bar' });
      expect(mockAddNotification).toHaveBeenCalledWith({
        id: 'id',
        type: 'TestEvent',
        payload: { foo: 'bar' },
        createdAt: 'now',
        isRead: false,
      });
    });
  });

  describe('createNotification', () => {
    it('should return notification with predictable id', () => {
      globalThis.crypto = { randomUUID: mockRandomUUID } as any;
      mockRandomUUID.mockReturnValue('uuid-123');
      const result = (service as any).createNotification('TypeA', { foo: 1 });
      expect(result).toEqual({
        id: 'uuid-123',
        type: 'TypeA',
        payload: { foo: 1 },
        createdAt: expect.any(String),
        isRead: false,
      });
    });
  });
});
