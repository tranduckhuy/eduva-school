import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, afterEach } from 'vitest';
import { QuestionService } from './question.service';
import { RequestService } from '../../../../../shared/services/core/request/request.service';
import { ToastHandlingService } from '../../../../../shared/services/core/toast/toast-handling.service';
import { StatusCode } from '../../../../../shared/constants/status-code.constant';
import { of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom, lastValueFrom } from 'rxjs';

// Mock data
const mockQuestion = {
  id: 'q1',
  lessonMaterialId: 'l1',
  lessonMaterialTitle: 'title',
  title: 'title',
  content: 'content',
  createdAt: '',
  lastModifiedAt: '',
  createdByUserId: '',
  createdByName: '',
  createdByAvatar: '',
  createdByRole: '',
  commentCount: 0,
  canUpdate: true,
  canDelete: true,
  canComment: true,
  comments: [],
};
const mockQuestionsResponse = {
  pageIndex: 1,
  pageSize: 10,
  count: 1,
  data: [mockQuestion],
};

const errorResponse = new HttpErrorResponse({
  status: 500,
  statusText: 'Server Error',
});

// Helper to create a QuestionService with DI context
function setup({
  get = vi.fn(),
  post = vi.fn(),
  put = vi.fn(),
  del = vi.fn(),
  successGeneral = vi.fn(),
  errorGeneral = vi.fn(),
} = {}) {
  TestBed.configureTestingModule({
    providers: [
      QuestionService,
      { provide: RequestService, useValue: { get, post, put, delete: del } },
      {
        provide: ToastHandlingService,
        useValue: { successGeneral, errorGeneral },
      },
    ],
  });
  const service = TestBed.inject(QuestionService);
  const requestService = TestBed.inject(RequestService);
  const toastService = TestBed.inject(ToastHandlingService);
  return { service, requestService, toastService };
}

describe('QuestionService', () => {
  afterEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    const { service } = setup();
    expect(service).toBeTruthy();
  });

  describe('getLessonQuestions', () => {
    it('should return questions on success', async () => {
      const { service, requestService } = setup({
        get: vi
          .fn()
          .mockReturnValue(
            of({ statusCode: StatusCode.SUCCESS, data: mockQuestionsResponse })
          ),
      });
      const result = await firstValueFrom(
        service.getLessonQuestions('matId', { pageIndex: 1 })
      );
      expect(result).toEqual(mockQuestionsResponse);
    });
    it('should return null if response is not success', async () => {
      const { service } = setup({
        get: vi.fn().mockReturnValue(of({ statusCode: 4000, data: null })),
      });
      const result = await firstValueFrom(
        service.getLessonQuestions('matId', { pageIndex: 1 })
      );
      expect(result).toBeNull();
    });
    it('should handle error and call errorGeneral', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        get: vi.fn().mockReturnValue(throwError(() => errorResponse)),
        errorGeneral,
      });
      await expect(
        firstValueFrom(service.getLessonQuestions('matId', { pageIndex: 1 }))
      ).rejects.toBe(errorResponse);
      expect(errorGeneral).toHaveBeenCalled();
    });
  });

  describe('getMyQuestions', () => {
    it('should return my questions on success', async () => {
      const { service } = setup({
        get: vi
          .fn()
          .mockReturnValue(
            of({ statusCode: StatusCode.SUCCESS, data: mockQuestionsResponse })
          ),
      });
      const result = await lastValueFrom(
        service.getMyQuestions({ pageIndex: 1 })
      );
      expect(result).toEqual(mockQuestionsResponse);
    });
    it('should return null if response is not success', async () => {
      const { service } = setup({
        get: vi.fn().mockReturnValue(of({ statusCode: 4000, data: null })),
      });
      const result = await lastValueFrom(
        service.getMyQuestions({ pageIndex: 1 })
      );
      expect(result).toBeNull();
    });
    it('should handle error and call errorGeneral', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        get: vi.fn().mockReturnValue(throwError(() => errorResponse)),
        errorGeneral,
      });
      await expect(
        lastValueFrom(service.getMyQuestions({ pageIndex: 1 }))
      ).rejects.toBe(errorResponse);
      expect(errorGeneral).toHaveBeenCalled();
    });
  });

  describe('getQuestionById', () => {
    it('should return question on success', async () => {
      const { service } = setup({
        get: vi
          .fn()
          .mockReturnValue(
            of({ statusCode: StatusCode.SUCCESS, data: mockQuestion })
          ),
      });
      const result = await firstValueFrom(service.getQuestionById('q1'));
      expect(result).toEqual(mockQuestion);
    });
    it('should return null if response is not success', async () => {
      const { service } = setup({
        get: vi.fn().mockReturnValue(of({ statusCode: 4000, data: null })),
      });
      const result = await firstValueFrom(service.getQuestionById('q1'));
      expect(result).toBeNull();
    });
    it('should handle error and call errorGeneral', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        get: vi.fn().mockReturnValue(throwError(() => errorResponse)),
        errorGeneral,
      });
      await expect(firstValueFrom(service.getQuestionById('q1'))).rejects.toBe(
        errorResponse
      );
      expect(errorGeneral).toHaveBeenCalled();
    });
  });

  describe('createQuestion', () => {
    it('should call successGeneral and return question on success', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        post: vi
          .fn()
          .mockReturnValue(
            of({ statusCode: StatusCode.CREATED, data: mockQuestion })
          ),
        successGeneral,
      });
      const result = await firstValueFrom(
        service.createQuestion({
          lessonMaterialId: 'l1',
          title: 't',
          content: 'c',
        })
      );
      expect(result).toEqual(mockQuestion);
      expect(successGeneral).toHaveBeenCalled();
    });
    it('should call errorGeneral and return null if not created', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        post: vi.fn().mockReturnValue(of({ statusCode: 4000, data: null })),
        errorGeneral,
      });
      const result = await firstValueFrom(
        service.createQuestion({
          lessonMaterialId: 'l1',
          title: 't',
          content: 'c',
        })
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
          service.createQuestion({
            lessonMaterialId: 'l1',
            title: 't',
            content: 'c',
          })
        )
      ).rejects.toBe(errorResponse);
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle edge case: missing fields', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        post: vi.fn().mockReturnValue(
          of({
            statusCode: StatusCode.CREATED,
            data: { ...mockQuestion, title: undefined },
          })
        ),
        successGeneral,
      });
      const result = await firstValueFrom(
        service.createQuestion({
          lessonMaterialId: 'l1',
          title: '',
          content: '',
        })
      );
      expect(result).toHaveProperty('title', undefined);
      expect(successGeneral).toHaveBeenCalled();
    });
  });

  describe('updateQuestion', () => {
    it('should call successGeneral and return question on success', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        put: vi
          .fn()
          .mockReturnValue(
            of({ statusCode: StatusCode.SUCCESS, data: mockQuestion })
          ),
        successGeneral,
      });
      const result = await lastValueFrom(
        service.updateQuestion('q1', { title: 't', content: 'c' })
      );
      expect(result).toEqual(mockQuestion);
      expect(successGeneral).toHaveBeenCalled();
    });
    it('should call errorGeneral and return null if not success', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        put: vi.fn().mockReturnValue(of({ statusCode: 4000, data: null })),
        errorGeneral,
      });
      const result = await lastValueFrom(
        service.updateQuestion('q1', { title: 't', content: 'c' })
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
        lastValueFrom(
          service.updateQuestion('q1', { title: 't', content: 'c' })
        )
      ).rejects.toBe(errorResponse);
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle edge case: empty update', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        put: vi.fn().mockReturnValue(
          of({
            statusCode: StatusCode.SUCCESS,
            data: { ...mockQuestion, content: '' },
          })
        ),
        successGeneral,
      });
      const result = await lastValueFrom(
        service.updateQuestion('q1', { title: '', content: '' })
      );
      expect(result).toHaveProperty('content', '');
      expect(successGeneral).toHaveBeenCalled();
    });
  });

  describe('deleteQuestion', () => {
    it('should call successGeneral on success', async () => {
      const successGeneral = vi.fn();
      const { service } = setup({
        del: vi.fn().mockReturnValue(of({ statusCode: StatusCode.SUCCESS })),
        successGeneral,
      });
      const result = await firstValueFrom(service.deleteQuestion('q1'));
      expect(result).toBeUndefined();
      expect(successGeneral).toHaveBeenCalled();
    });
    it('should call errorGeneral on fail', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        del: vi.fn().mockReturnValue(of({ statusCode: 4000 })),
        errorGeneral,
      });
      const result = await firstValueFrom(service.deleteQuestion('q1'));
      expect(result).toBeUndefined();
      expect(errorGeneral).toHaveBeenCalled();
    });
    it('should handle error and call errorGeneral', async () => {
      const errorGeneral = vi.fn();
      const { service } = setup({
        del: vi.fn().mockReturnValue(throwError(() => errorResponse)),
        errorGeneral,
      });
      await expect(firstValueFrom(service.deleteQuestion('q1'))).rejects.toBe(
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
      const result = await firstValueFrom(service.deleteQuestion('q1'));
      expect(result).toBeUndefined();
    });
  });
});
