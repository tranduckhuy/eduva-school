import { TestBed } from '@angular/core/testing';
import { RequestService } from './request.service';
import {
  HttpClient,
  HttpContext,
  HttpHeaders,
  HttpResponse,
  HttpParams,
} from '@angular/common/http';
import { of } from 'rxjs';
import { BaseResponse } from '../../../models/api/base-response.model';
import { vi } from 'vitest';
import { StatusCode } from '../../../constants/status-code.constant';

// Create hoisted mock functions
const mockCreateRequestParams = vi.hoisted(() => vi.fn());
const mockBuildHttpContext = vi.hoisted(() => vi.fn());
const mockBuildFormDataFromObject = vi.hoisted(() => vi.fn());

// Mock the module
vi.mock('../../../utils/request-utils', () => ({
  createRequestParams: mockCreateRequestParams,
  buildHttpContext: mockBuildHttpContext,
  buildFormDataFromObject: mockBuildFormDataFromObject,
}));

describe('RequestService', () => {
  let service: RequestService;
  let httpClient: HttpClient;

  const mockResponse: BaseResponse<any> = {
    statusCode: StatusCode.SUCCESS,
    message: 'OK',
    data: { test: 'value' },
  };

  const mockBlobResponse = new HttpResponse<Blob>({
    body: new Blob(['test'], { type: 'application/pdf' }),
    status: 200,
  });

  beforeEach(() => {
    const httpClientMock = {
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn(),
    };

    TestBed.configureTestingModule({
      providers: [
        RequestService,
        { provide: HttpClient, useValue: httpClientMock },
      ],
    });

    service = TestBed.inject(RequestService);
    httpClient = TestBed.inject(HttpClient);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('get', () => {
    it('should send GET request with params', () => {
      const params = { page: 1, size: 10 };
      const options = { showLoading: false };
      const mockParams = new HttpParams();
      const mockContext = new HttpContext();

      (httpClient.get as any).mockReturnValue(of(mockResponse));
      mockCreateRequestParams.mockReturnValue(mockParams);
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.get<any>('test-url', params, options).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.get).toHaveBeenCalledWith('test-url', {
        params: mockParams,
        context: mockContext,
      });
      expect(mockCreateRequestParams).toHaveBeenCalledWith(params);
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });

    it('should send GET request without params', () => {
      const mockParams = new HttpParams();
      const mockContext = new HttpContext();

      (httpClient.get as any).mockReturnValue(of(mockResponse));
      mockCreateRequestParams.mockReturnValue(mockParams);
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.get<any>('test-url').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.get).toHaveBeenCalledWith('test-url', {
        params: mockParams,
        context: mockContext,
      });
      expect(mockCreateRequestParams).toHaveBeenCalledWith(undefined);
      expect(mockBuildHttpContext).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getFile', () => {
    it('should send GET request for file download', () => {
      const params = { fileId: '123' };
      const options = { showLoading: true };
      const mockParams = new HttpParams();
      const mockContext = new HttpContext();

      (httpClient.get as any).mockReturnValue(of(mockBlobResponse));
      mockCreateRequestParams.mockReturnValue(mockParams);
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.getFile('test-url', params, options).subscribe(res => {
        expect(res).toEqual(mockBlobResponse);
      });

      expect(httpClient.get).toHaveBeenCalledWith('test-url', {
        params: mockParams,
        context: mockContext,
        responseType: 'blob',
        observe: 'response',
      });
      expect(mockCreateRequestParams).toHaveBeenCalledWith(params);
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });
  });

  describe('post', () => {
    it('should send POST request with body', () => {
      const body = { name: 'test', email: 'test@example.com' };
      const options = { bypassAuth: true };
      const mockContext = new HttpContext();

      (httpClient.post as any).mockReturnValue(of(mockResponse));
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.post<any>('test-url', body, options).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        'test-url',
        JSON.stringify(body),
        expect.objectContaining({
          headers: expect.any(HttpHeaders),
          context: mockContext,
        })
      );
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });

    it('should send POST request with empty body when body is undefined', () => {
      const mockContext = new HttpContext();

      (httpClient.post as any).mockReturnValue(of(mockResponse));
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.post<any>('test-url').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith(
        'test-url',
        JSON.stringify({}),
        expect.objectContaining({
          headers: expect.any(HttpHeaders),
          context: mockContext,
        })
      );
    });
  });

  describe('postWithFormData', () => {
    it('should send POST request with FormData', () => {
      const data = { name: 'test', file: new File([''], 'test.txt') };
      const options = { showLoading: false };
      const mockFormData = new FormData();
      const mockContext = new HttpContext();

      (httpClient.post as any).mockReturnValue(of(mockResponse));
      mockBuildFormDataFromObject.mockReturnValue(mockFormData);
      mockBuildHttpContext.mockReturnValue(mockContext);

      service
        .postWithFormData<any>('test-url', data, options)
        .subscribe(res => {
          expect(res).toEqual(mockResponse);
        });

      expect(httpClient.post).toHaveBeenCalledWith('test-url', mockFormData, {
        context: mockContext,
      });
      expect(mockBuildFormDataFromObject).toHaveBeenCalledWith(data);
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });
  });

  describe('postFile', () => {
    it('should send POST request for file upload expecting blob response', () => {
      const formData = new FormData();
      formData.append('file', new File([''], 'test.txt'));
      const options = { loadingKey: 'upload' };
      const mockContext = new HttpContext();

      (httpClient.post as any).mockReturnValue(of(mockBlobResponse));
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.postFile('test-url', formData, options).subscribe(res => {
        expect(res).toEqual(mockBlobResponse);
      });

      expect(httpClient.post).toHaveBeenCalledWith('test-url', formData, {
        context: mockContext,
        responseType: 'blob',
        observe: 'response',
      });
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });
  });

  describe('put', () => {
    it('should send PUT request with body', () => {
      const body = { id: '123', name: 'updated' };
      const options = { bypassAuthError: true };
      const mockContext = new HttpContext();

      (httpClient.put as any).mockReturnValue(of(mockResponse));
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.put<any>('test-url', body, options).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.put).toHaveBeenCalledWith(
        'test-url',
        JSON.stringify(body),
        expect.objectContaining({
          headers: expect.any(HttpHeaders),
          context: mockContext,
        })
      );
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });

    it('should send PUT request with empty body when body is undefined', () => {
      const mockContext = new HttpContext();

      (httpClient.put as any).mockReturnValue(of(mockResponse));
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.put<any>('test-url').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.put).toHaveBeenCalledWith(
        'test-url',
        JSON.stringify({}),
        expect.objectContaining({
          headers: expect.any(HttpHeaders),
          context: mockContext,
        })
      );
    });
  });

  describe('delete', () => {
    it('should send DELETE request with params', () => {
      const params = { id: '123' };
      const options = { bypassPaymentError: true };
      const mockParams = new HttpParams();
      const mockContext = new HttpContext();

      (httpClient.delete as any).mockReturnValue(of(mockResponse));
      mockCreateRequestParams.mockReturnValue(mockParams);
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.delete<any>('test-url', params, options).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.delete).toHaveBeenCalledWith('test-url', {
        params: mockParams,
        context: mockContext,
      });
      expect(mockCreateRequestParams).toHaveBeenCalledWith(params);
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });

    it('should send DELETE request without params', () => {
      const mockParams = new HttpParams();
      const mockContext = new HttpContext();

      (httpClient.delete as any).mockReturnValue(of(mockResponse));
      mockCreateRequestParams.mockReturnValue(mockParams);
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.delete<any>('test-url').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.delete).toHaveBeenCalledWith('test-url', {
        params: mockParams,
        context: mockContext,
      });
      expect(mockCreateRequestParams).toHaveBeenCalledWith(undefined);
      expect(mockBuildHttpContext).toHaveBeenCalledWith(undefined);
    });
  });

  describe('deleteWithBody', () => {
    it('should send DELETE request with body', () => {
      const body = { id: '123', force: true };
      const options = { showLoading: false };
      const mockContext = new HttpContext();

      (httpClient.delete as any).mockReturnValue(of(mockResponse));
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.deleteWithBody<any>('test-url', body, options).subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.delete).toHaveBeenCalledWith(
        'test-url',
        expect.objectContaining({
          headers: expect.any(HttpHeaders),
          body: JSON.stringify(body),
          context: mockContext,
        })
      );
      expect(mockBuildHttpContext).toHaveBeenCalledWith(options);
    });

    it('should send DELETE request with empty body when body is undefined', () => {
      const mockContext = new HttpContext();

      (httpClient.delete as any).mockReturnValue(of(mockResponse));
      mockBuildHttpContext.mockReturnValue(mockContext);

      service.deleteWithBody<any>('test-url').subscribe(res => {
        expect(res).toEqual(mockResponse);
      });

      expect(httpClient.delete).toHaveBeenCalledWith(
        'test-url',
        expect.objectContaining({
          headers: expect.any(HttpHeaders),
          body: JSON.stringify({}),
          context: mockContext,
        })
      );
      expect(mockBuildHttpContext).toHaveBeenCalledWith(undefined);
    });
  });

  describe('getJsonHeaders', () => {
    it('should return headers with Content-Type application/json', () => {
      const headers = (service as any).getJsonHeaders();
      expect(headers.get('Content-Type')).toBe('application/json');
    });
  });
});
