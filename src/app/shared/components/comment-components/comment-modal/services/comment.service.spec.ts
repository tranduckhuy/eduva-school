import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { CommentService } from './comment.service';
import { RequestService } from '../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../../shared/constants/status-code.constant';
import { of, throwError, firstValueFrom, lastValueFrom } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';

const mockComment = {
  id: 'c1',
  questionId: 'q1',
  content: 'test',
  createdAt: '',
  lastModifiedAt: '',
  createdByUserId: '',
  createdByName: '',
  createdByAvatar: '',
  createdByRole: '',
  canUpdate: true,
  canDelete: true,
  parentCommentId: '',
  replies: [],
  replyCount: 0,
};
const errorResponse = new HttpErrorResponse({
  status: 500,
  statusText: 'Server Error',
});

function setup({
  post = vi.fn(),
  put = vi.fn(),
  del = vi.fn(),
  successGeneral = vi.fn(),
  errorGeneral = vi.fn(),
} = {}) {
  TestBed.configureTestingModule({
    providers: [
      CommentService,
      { provide: RequestService, useValue: { post, put, delete: del } },
      {
        provide: ToastHandlingService,
        useValue: { successGeneral, errorGeneral },
      },
    ],
  });
  const service = TestBed.inject(CommentService);
  return { service, post, put, del, successGeneral, errorGeneral };
}

describe('CommentService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  describe('createComment', () => {
    it('should call successGeneral and return comment on success', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        post: vi
          .fn()
          .mockReturnValue(
            of({ statusCode: StatusCode.CREATED, data: mockComment })
          ),
        successGeneral,
      });
      const result = await firstValueFrom(
        service.createComment({ questionId: 'q1', content: 'test' })
      );
      expect(result).toEqual(mockComment);
      expect(successGeneral).toHaveBeenCalled();
    });
    it('should call errorGeneral and return null if not created', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        post: vi.fn().mockReturnValue(of({ statusCode: 4000, data: null })),
        errorGeneral,
      });
      const result = await firstValueFrom(
        service.createComment({ questionId: 'q1', content: 'test' })
      );
      expect(result).toBeNull();
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle error and call errorGeneral', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        post: vi.fn().mockReturnValue(throwError(() => errorResponse)),
        errorGeneral,
      });
      await expect(
        firstValueFrom(
          service.createComment({ questionId: 'q1', content: 'test' })
        )
      ).rejects.toBe(errorResponse);
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle edge case: missing content', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        post: vi.fn().mockReturnValue(
          of({
            statusCode: StatusCode.CREATED,
            data: { ...mockComment, content: '' },
          })
        ),
        successGeneral,
      });
      const result = await firstValueFrom(
        service.createComment({ questionId: 'q1', content: '' })
      );
      expect(result).toHaveProperty('content', '');
      expect(successGeneral).toHaveBeenCalled();
    });
  });

  describe('updateComment', () => {
    it('should call successGeneral and return comment on success', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        put: vi
          .fn()
          .mockReturnValue(
            of({ statusCode: StatusCode.SUCCESS, data: mockComment })
          ),
        successGeneral,
      });
      const result = await lastValueFrom(
        service.updateComment('c1', { content: 'updated' })
      );
      expect(result).toEqual(mockComment);
      expect(successGeneral).toHaveBeenCalled();
    });
    it('should call errorGeneral and return null if not success', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        put: vi.fn().mockReturnValue(of({ statusCode: 4000, data: null })),
        errorGeneral,
      });
      const result = await lastValueFrom(
        service.updateComment('c1', { content: 'updated' })
      );
      expect(result).toBeNull();
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle error and call errorGeneral', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        put: vi.fn().mockReturnValue(throwError(() => errorResponse)),
        errorGeneral,
      });
      await expect(
        lastValueFrom(service.updateComment('c1', { content: 'updated' }))
      ).rejects.toBe(errorResponse);
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle edge case: empty update', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        put: vi.fn().mockReturnValue(
          of({
            statusCode: StatusCode.SUCCESS,
            data: { ...mockComment, content: '' },
          })
        ),
        successGeneral,
      });
      const result = await lastValueFrom(
        service.updateComment('c1', { content: '' })
      );
      expect(result).toHaveProperty('content', '');
      expect(successGeneral).toHaveBeenCalled();
    });
  });

  describe('deleteComment', () => {
    it('should call successGeneral on success', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        del: vi.fn().mockReturnValue(of({ statusCode: StatusCode.SUCCESS })),
        successGeneral,
      });
      const result = await firstValueFrom(service.deleteComment('c1'));
      expect(result).toBeUndefined();
      expect(successGeneral).toHaveBeenCalled();
    });
    it('should call errorGeneral on fail', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        del: vi.fn().mockReturnValue(of({ statusCode: 4000 })),
        errorGeneral,
      });
      const result = await firstValueFrom(service.deleteComment('c1'));
      expect(result).toBeUndefined();
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle error and call errorGeneral', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        del: vi.fn().mockReturnValue(throwError(() => errorResponse)),
        errorGeneral,
      });
      await expect(firstValueFrom(service.deleteComment('c1'))).rejects.toBe(
        errorResponse
      );
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle edge case: already deleted', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        del: vi.fn().mockReturnValue(of({ statusCode: StatusCode.DELETED })),
        errorGeneral,
      });
      const result = await firstValueFrom(service.deleteComment('c1'));
      expect(result).toBeUndefined();
    });
  });
});
