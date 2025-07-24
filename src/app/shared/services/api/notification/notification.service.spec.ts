import { TestBed } from '@angular/core/testing';
import { NotificationService } from './notification.service';
import { RequestService } from '../../core/request/request.service';
import { StatusCode } from '../../../constants/status-code.constant';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { of, throwError, firstValueFrom } from 'rxjs';
import * as utilFunctions from '../../../utils/util-functions';

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

describe('NotificationService (Vitest)', () => {
  let service: NotificationService;
  let requestService: any;

  const mockNotification = {
    id: '1',
    type: 'QuestionCreated',
    payload: { questionId: 'q1' },
    createdAt: new Date().toISOString(),
    isRead: false,
  };

  const mockResponse = {
    statusCode: StatusCode.SUCCESS,
    data: {
      data: [mockNotification],
      count: 1,
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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('getNotifications', () => {
    it('should fetch notifications and update signals', async () => {
      requestService.get.mockReturnValue(of(mockResponse));
      const req = { pageIndex: 0, pageSize: 10 };
      const result = await service.getNotifications(req).toPromise();
      expect(result).toEqual([expect.objectContaining({ id: '1' })]);
      expect(service.notifications().length).toBeGreaterThan(0);
      expect(service.totalNotification()).toBe(1);
    });

    it('should handle error from API', async () => {
      requestService.get.mockReturnValue(throwError(() => new Error('fail')));
      const req = { pageIndex: 0, pageSize: 10 };
      await expect(service.getNotifications(req).toPromise()).rejects.toThrow(
        'fail'
      );
    });

    it('should handle response with wrong statusCode', async () => {
      requestService.get.mockReturnValue(of({ statusCode: 9999, data: null }));
      const req = { pageIndex: 0, pageSize: 10 };
      const result = await service.getNotifications(req).toPromise();
      expect(result).toBeNull();
      expect(service.notifications().length).toBe(0);
      expect(service.totalNotification()).toBe(0);
    });

    it('should handle response with missing data', async () => {
      requestService.get.mockReturnValue(
        of({ statusCode: StatusCode.SUCCESS })
      );
      const req = { pageIndex: 0, pageSize: 10 };
      const result = await service.getNotifications(req).toPromise();
      expect(result).toBeNull();
      expect(service.notifications().length).toBe(0);
      expect(service.totalNotification()).toBe(0);
    });
  });

  describe('markNotificationAsRead', () => {
    it('should call put and complete', async () => {
      requestService.put.mockReturnValue(of({}));
      await expect(
        firstValueFrom(service.markNotificationAsRead('1'))
      ).resolves.toBeUndefined();
      expect(requestService.put).toHaveBeenCalledWith(`/notifications/1/read`);
    });
    it('should handle error', async () => {
      requestService.put.mockReturnValue(throwError(() => new Error('fail')));
      await expect(
        firstValueFrom(service.markNotificationAsRead('1'))
      ).rejects.toThrow('fail');
    });
  });

  describe('markAllNotificationAsRead', () => {
    it('should call put and complete', async () => {
      requestService.put.mockReturnValue(of({}));
      await expect(
        firstValueFrom(service.markAllNotificationAsRead())
      ).resolves.toBeUndefined();
      expect(requestService.put).toHaveBeenCalledWith(
        `/notifications/read-all`
      );
    });
    it('should handle error', async () => {
      requestService.put.mockReturnValue(throwError(() => new Error('fail')));
      await expect(
        service.markAllNotificationAsRead().toPromise()
      ).rejects.toThrow('fail');
    });
  });

  describe('addNotification', () => {
    it('should add notification to the top of the list', () => {
      service.addNotification(mockNotification);
      expect(service.notifications()[0]).toEqual(mockNotification);
    });
  });

  describe('optimisticMarkAsRead', () => {
    it('should mark the notification as read', () => {
      service.addNotification(mockNotification);
      service.optimisticMarkAsRead('1');
      expect(service.notifications()[0].isRead).toBe(true);
    });
    it('should do nothing if id not found', () => {
      service.addNotification(mockNotification);
      service.optimisticMarkAsRead('not-exist');
      expect(service.notifications()[0].isRead).toBe(false);
    });
  });

  describe('optimisticMarkAllAsRead', () => {
    it('should mark all notifications as read', () => {
      service.addNotification(mockNotification);
      service.addNotification({ ...mockNotification, id: '2' });
      service.optimisticMarkAllAsRead();
      expect(service.notifications().every(n => n.isRead)).toBe(true);
    });
    it('should handle empty notification list', () => {
      service.optimisticMarkAllAsRead();
      expect(service.notifications().length).toBe(0);
    });
  });

  describe('private helpers (indirectly)', () => {
    it('should map payloads for known types', () => {
      const res = {
        statusCode: StatusCode.SUCCESS,
        data: {
          data: [
            { ...mockNotification, type: 'QuestionCreated' },
            { ...mockNotification, type: 'QuestionDeleted' },
            { ...mockNotification, type: 'QuestionCommented' },
            { ...mockNotification, type: 'QuestionCommentDeleted' },
            { ...mockNotification, type: 'UnknownType' },
          ],
          count: 5,
        },
      };
      // @ts-ignore: access private
      service['handleNotificationsResponse'](res);
      expect(service.notifications().length).toBe(5);
      expect((service.notifications()[0].payload as any).mapped).toBe(true);
      expect(service.notifications()[4].type).toBe('UnknownType');
    });
    it('should clear notifications if response is not success', () => {
      // @ts-ignore: access private
      service['handleNotificationsResponse']({ statusCode: 9999 });
      expect(service.notifications().length).toBe(0);
      expect(service.totalNotification()).toBe(0);
    });
    it('should extract notifications from valid response', () => {
      const res = {
        statusCode: StatusCode.SUCCESS,
        data: { data: [mockNotification] },
      };
      // @ts-ignore: access private
      const result = service['extractNotificationsResponse'](res);
      expect(result).toEqual([mockNotification]);
    });
    it('should return null if extractNotificationsResponse gets invalid response', () => {
      // @ts-ignore: access private
      const result = service['extractNotificationsResponse']({
        statusCode: 9999,
      });
      expect(result).toBeNull();
    });
  });
});
