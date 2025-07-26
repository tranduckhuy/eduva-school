import { TestBed } from '@angular/core/testing';
import { HttpErrorResponse } from '@angular/common/http';

import { of, throwError, firstValueFrom } from 'rxjs';

import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

import { NotificationService } from './notification.service';
import { RequestService } from '../../core/request/request.service';

import * as utilFunctions from '../../../utils/util-functions';

import { StatusCode } from '../../../constants/status-code.constant';

// Mock environment
vi.mock('../../../../../environments/environment', () => ({
  environment: {
    baseApiUrl: 'http://localhost:3000/api',
  },
}));

// Mock util functions
vi.mock('../../../utils/util-functions', async () => {
  const actual = await vi.importActual<any>('../../../utils/util-functions');
  return {
    ...actual,
    mapNotificationPayload: vi.fn((n: any) => ({
      ...n,
      payload: { ...n.payload, mapped: true },
    })),
  };
});

describe('NotificationService', () => {
  let service: NotificationService;
  let requestService: any;

  const mockNotification = {
    id: '1',
    type: 'QuestionCreated' as const,
    payload: { questionId: 'q1' },
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  const mockNotificationResponse = {
    statusCode: StatusCode.SUCCESS,
    data: {
      data: [mockNotification],
      count: 1,
    },
  };

  const mockSummaryResponse = {
    statusCode: StatusCode.SUCCESS,
    data: {
      unreadCount: 5,
    },
  };

  beforeEach(() => {
    vi.spyOn(utilFunctions, 'mapNotificationPayload').mockImplementation(
      (n: any) => ({ ...n, payload: { ...n.payload, mapped: true } })
    );

    requestService = {
      get: vi.fn(),
      put: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        NotificationService,
        { provide: RequestService, useValue: requestService },
      ],
    });

    service = TestBed.inject(NotificationService);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Service Creation', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have initial signal values', () => {
      expect(service.notifications()).toEqual([]);
      expect(service.totalNotification()).toBe(0);
      expect(service.unreadCount()).toBe(0);
      expect(service.hasLoaded()).toBe(false);
    });
  });

  describe('getNotifications', () => {
    it('should fetch notifications and update signals successfully', async () => {
      requestService.get.mockReturnValue(of(mockNotificationResponse));

      const req = { pageIndex: 0, pageSize: 10 };
      const result = await firstValueFrom(service.getNotifications(req));

      expect(result).toEqual([mockNotification]);
      expect(service.notifications()).toHaveLength(1);
      expect(service.totalNotification()).toBe(1);
      expect(service.hasLoaded()).toBe(true);
      expect(requestService.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/notifications',
        req,
        { loadingKey: 'get-notifications' }
      );
    });

    it('should handle API error', async () => {
      const error = new HttpErrorResponse({ error: 'Network error' });
      requestService.get.mockReturnValue(throwError(() => error));

      const req = { pageIndex: 0, pageSize: 10 };

      await expect(
        firstValueFrom(service.getNotifications(req))
      ).rejects.toThrow();
    });

    it('should handle response with wrong statusCode', async () => {
      requestService.get.mockReturnValue(of({ statusCode: 9999, data: null }));

      const req = { pageIndex: 0, pageSize: 10 };
      const result = await firstValueFrom(service.getNotifications(req));

      expect(result).toBeNull();
      expect(service.notifications()).toHaveLength(0);
      expect(service.totalNotification()).toBe(0);
      expect(service.hasLoaded()).toBe(true);
    });

    it('should handle response with missing data', async () => {
      requestService.get.mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const req = { pageIndex: 0, pageSize: 10 };
      const result = await firstValueFrom(service.getNotifications(req));

      expect(result).toBeNull();
      expect(service.notifications()).toHaveLength(0);
      expect(service.totalNotification()).toBe(0);
      expect(service.hasLoaded()).toBe(true);
    });

    it('should map different notification types correctly', async () => {
      const notificationsWithDifferentTypes = {
        statusCode: StatusCode.SUCCESS,
        data: {
          data: [
            { ...mockNotification, type: 'QuestionCreated' },
            { ...mockNotification, id: '2', type: 'QuestionDeleted' },
            { ...mockNotification, id: '3', type: 'QuestionCommented' },
            { ...mockNotification, id: '4', type: 'QuestionCommentDeleted' },
            { ...mockNotification, id: '5', type: 'UnknownType' },
          ],
          count: 5,
        },
      };

      requestService.get.mockReturnValue(of(notificationsWithDifferentTypes));

      const req = { pageIndex: 0, pageSize: 10 };
      await firstValueFrom(service.getNotifications(req));

      expect(service.notifications()).toHaveLength(5);
      expect(utilFunctions.mapNotificationPayload).toHaveBeenCalledTimes(4);
    });

    it('should append new notifications to existing ones', async () => {
      // First call
      requestService.get.mockReturnValue(of(mockNotificationResponse));
      const req1 = { pageIndex: 0, pageSize: 10 };
      await firstValueFrom(service.getNotifications(req1));

      // Second call with different notification
      const secondResponse = {
        statusCode: StatusCode.SUCCESS,
        data: {
          data: [{ ...mockNotification, id: '2' }],
          count: 2,
        },
      };
      requestService.get.mockReturnValue(of(secondResponse));
      const req2 = { pageIndex: 1, pageSize: 10 };
      await firstValueFrom(service.getNotifications(req2));

      expect(service.notifications()).toHaveLength(2);
      expect(service.totalNotification()).toBe(2);
    });
  });

  describe('getNotificationSummary', () => {
    it('should fetch notification summary successfully', async () => {
      requestService.get.mockReturnValue(of(mockSummaryResponse));

      const result = await firstValueFrom(service.getNotificationSummary());

      expect(result).toBe(5);
      expect(service.unreadCount()).toBe(5);
      expect(requestService.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/notifications/summary'
      );
    });

    it('should handle API error', async () => {
      const error = new HttpErrorResponse({ error: 'Network error' });
      requestService.get.mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.getNotificationSummary())
      ).rejects.toThrow();
    });

    it('should handle response with wrong statusCode', async () => {
      requestService.get.mockReturnValue(of({ statusCode: 9999, data: null }));

      const result = await firstValueFrom(service.getNotificationSummary());

      expect(result).toBe(0);
      expect(service.unreadCount()).toBe(0);
    });

    it('should handle response with missing data', async () => {
      requestService.get.mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );

      const result = await firstValueFrom(service.getNotificationSummary());

      expect(result).toBe(0);
      expect(service.unreadCount()).toBe(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should mark notification as read successfully', async () => {
      requestService.put.mockReturnValue(of({}));
      requestService.get.mockReturnValue(of(mockSummaryResponse));

      await firstValueFrom(service.markNotificationAsRead('1'));

      expect(requestService.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/notifications/1/read'
      );
      expect(requestService.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/notifications/summary'
      );
    });

    it('should handle API error', async () => {
      const error = new HttpErrorResponse({ error: 'Network error' });
      requestService.put.mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.markNotificationAsRead('1'))
      ).rejects.toThrow();
    });
  });

  describe('markAllNotificationAsRead', () => {
    it('should mark all notifications as read successfully', async () => {
      requestService.put.mockReturnValue(of({}));
      requestService.get.mockReturnValue(of(mockSummaryResponse));

      await firstValueFrom(service.markAllNotificationAsRead());

      expect(requestService.put).toHaveBeenCalledWith(
        'http://localhost:3000/api/notifications/read-all'
      );
      expect(requestService.get).toHaveBeenCalledWith(
        'http://localhost:3000/api/notifications/summary'
      );
    });

    it('should handle API error', async () => {
      const error = new HttpErrorResponse({ error: 'Network error' });
      requestService.put.mockReturnValue(throwError(() => error));

      await expect(
        firstValueFrom(service.markAllNotificationAsRead())
      ).rejects.toThrow();
    });
  });

  describe('addNotification', () => {
    it('should add notification to the top of the list', () => {
      const initialCount = service.notifications().length;
      const initialTotal = service.totalNotification();
      const initialUnread = service.unreadCount();

      service.addNotification(mockNotification);

      expect(service.notifications()).toHaveLength(initialCount + 1);
      expect(service.notifications()[0]).toEqual(mockNotification);
      expect(service.totalNotification()).toBe(initialTotal + 1);
      expect(service.unreadCount()).toBe(initialUnread + 1);
    });

    it('should add multiple notifications correctly', () => {
      service.addNotification(mockNotification);
      service.addNotification({ ...mockNotification, id: '2' });

      expect(service.notifications()).toHaveLength(2);
      expect(service.totalNotification()).toBe(2);
      expect(service.unreadCount()).toBe(2);
    });

    it('should handle notification with different payload types', () => {
      const notificationWithDifferentPayload = {
        ...mockNotification,
        payload: { differentKey: 'value' },
      };

      service.addNotification(notificationWithDifferentPayload);

      expect(service.notifications()[0].payload).toEqual({
        differentKey: 'value',
      });
    });
  });

  describe('optimisticMarkAsRead', () => {
    it('should mark the specific notification as read', () => {
      service.addNotification(mockNotification);
      service.addNotification({ ...mockNotification, id: '2' });

      service.optimisticMarkAsRead('1');

      expect(service.notifications()[1].isRead).toBe(true);
      expect(service.notifications()[0].isRead).toBe(false);
    });

    it('should do nothing if notification id not found', () => {
      service.addNotification(mockNotification);

      service.optimisticMarkAsRead('not-exist');

      expect(service.notifications()[0].isRead).toBe(false);
    });

    it('should handle empty notification list', () => {
      expect(() => service.optimisticMarkAsRead('1')).not.toThrow();
    });

    it('should preserve other notification properties when marking as read', () => {
      const notification = { ...mockNotification, someProperty: 'value' };
      service.addNotification(notification);

      service.optimisticMarkAsRead('1');

      const updatedNotification = service.notifications()[0] as any;
      expect(updatedNotification.isRead).toBe(true);
      expect(updatedNotification.someProperty).toBe('value');
      expect(updatedNotification.id).toBe('1');
    });
  });

  describe('optimisticMarkAllAsRead', () => {
    it('should mark all notifications as read', () => {
      service.addNotification(mockNotification);
      service.addNotification({ ...mockNotification, id: '2' });
      service.addNotification({ ...mockNotification, id: '3' });

      service.optimisticMarkAllAsRead();

      expect(service.notifications().every(n => n.isRead)).toBe(true);
    });

    it('should handle empty notification list', () => {
      expect(() => service.optimisticMarkAllAsRead()).not.toThrow();
      expect(service.notifications()).toHaveLength(0);
    });

    it('should preserve notification properties when marking all as read', () => {
      const notification1 = { ...mockNotification, someProperty: 'value1' };
      const notification2 = {
        ...mockNotification,
        id: '2',
        someProperty: 'value2',
      };

      service.addNotification(notification1);
      service.addNotification(notification2);

      service.optimisticMarkAllAsRead();

      const updatedNotifications = service.notifications() as any[];
      expect(updatedNotifications[1].isRead).toBe(true);
      expect(updatedNotifications[1].someProperty).toBe('value1');
      expect(updatedNotifications[0].isRead).toBe(true);
      expect(updatedNotifications[0].someProperty).toBe('value2');
    });
  });

  describe('Private Helper Functions', () => {
    describe('handleNotificationsResponse', () => {
      it('should handle successful response with data', () => {
        const response = {
          statusCode: StatusCode.SUCCESS,
          data: {
            data: [mockNotification],
            count: 1,
          },
        };

        // @ts-ignore: accessing private method for testing
        service['handleNotificationsResponse'](response);

        expect(service.notifications()).toHaveLength(1);
        expect(service.totalNotification()).toBe(1);
        expect(service.hasLoaded()).toBe(true);
      });

      it('should handle unsuccessful response', () => {
        const response = { statusCode: 9999, data: null };

        // @ts-ignore: accessing private method for testing
        service['handleNotificationsResponse'](response);

        expect(service.notifications()).toHaveLength(0);
        expect(service.totalNotification()).toBe(0);
        expect(service.hasLoaded()).toBe(true);
      });

      it('should handle response without data', () => {
        const response = { statusCode: StatusCode.SUCCESS };

        // @ts-ignore: accessing private method for testing
        service['handleNotificationsResponse'](response);

        expect(service.notifications()).toHaveLength(0);
        expect(service.totalNotification()).toBe(0);
        expect(service.hasLoaded()).toBe(true);
      });
    });

    describe('handleNotificationSummaryResponse', () => {
      it('should handle successful summary response', () => {
        const response = {
          statusCode: StatusCode.SUCCESS,
          data: { unreadCount: 10 },
        };

        // @ts-ignore: accessing private method for testing
        service['handleNotificationSummaryResponse'](response);

        expect(service.unreadCount()).toBe(10);
      });

      it('should handle unsuccessful summary response', () => {
        const response = { statusCode: 9999, data: null };

        // @ts-ignore: accessing private method for testing
        service['handleNotificationSummaryResponse'](response);

        expect(service.unreadCount()).toBe(0);
      });
    });

    describe('extractNotificationsResponse', () => {
      it('should extract notifications from valid response', () => {
        const response = {
          statusCode: StatusCode.SUCCESS,
          data: { data: [mockNotification] },
        };

        // @ts-ignore: accessing private method for testing
        const result = service['extractNotificationsResponse'](response);

        expect(result).toEqual([mockNotification]);
      });

      it('should return null for invalid response', () => {
        const response = { statusCode: 9999, data: null };

        // @ts-ignore: accessing private method for testing
        const result = service['extractNotificationsResponse'](response);

        expect(result).toBeNull();
      });

      it('should return null for response without data', () => {
        const response = { statusCode: StatusCode.SUCCESS };

        // @ts-ignore: accessing private method for testing
        const result = service['extractNotificationsResponse'](response);

        expect(result).toBeNull();
      });
    });

    describe('extractNotificationSummaryResponse', () => {
      it('should extract unread count from valid response', () => {
        const response = {
          statusCode: StatusCode.SUCCESS,
          data: { unreadCount: 15 },
        };

        // @ts-ignore: accessing private method for testing
        const result = service['extractNotificationSummaryResponse'](response);

        expect(result).toBe(15);
      });

      it('should return 0 for invalid response', () => {
        const response = { statusCode: 9999, data: null };

        // @ts-ignore: accessing private method for testing
        const result = service['extractNotificationSummaryResponse'](response);

        expect(result).toBe(0);
      });

      it('should return 0 for response without data', () => {
        const response = { statusCode: StatusCode.SUCCESS };

        // @ts-ignore: accessing private method for testing
        const result = service['extractNotificationSummaryResponse'](response);

        expect(result).toBe(0);
      });
    });
  });

  describe('Signal Interactions', () => {
    it('should properly update all signals when adding notifications', () => {
      const initialNotifications = service.notifications();
      const initialTotal = service.totalNotification();
      const initialUnread = service.unreadCount();

      service.addNotification(mockNotification);

      expect(service.notifications()).toHaveLength(
        initialNotifications.length + 1
      );
      expect(service.totalNotification()).toBe(initialTotal + 1);
      expect(service.unreadCount()).toBe(initialUnread + 1);
    });

    it('should maintain signal consistency across operations', () => {
      // Add notifications
      service.addNotification(mockNotification);
      service.addNotification({ ...mockNotification, id: '2' });

      expect(service.notifications()).toHaveLength(2);
      expect(service.totalNotification()).toBe(2);
      expect(service.unreadCount()).toBe(2);

      // Mark one as read
      service.optimisticMarkAsRead('1');

      expect(service.notifications()).toHaveLength(2);
      expect(service.totalNotification()).toBe(2);
      expect(service.unreadCount()).toBe(2); // unreadCount is not updated by optimistic operations

      // Mark all as read
      service.optimisticMarkAllAsRead();

      expect(service.notifications()).toHaveLength(2);
      expect(service.totalNotification()).toBe(2);
      expect(service.unreadCount()).toBe(2); // unreadCount is not updated by optimistic operations
    });
  });
});
