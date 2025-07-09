import { TestBed } from '@angular/core/testing';
import { RequestService } from './request.service';
import { HttpClient, HttpContext, HttpHeaders } from '@angular/common/http';
import { of } from 'rxjs';
import { BaseResponse } from '../../../models/api/base-response.model';
import { HttpResponse } from '@angular/common/http';
import { vi } from 'vitest';
import * as requestUtils from '../../../utils/request-utils';

vi.mock('../../../utils/request-utils', async () => {
  const actual = await vi.importActual<any>('../../../utils/request-utils');
  return {
    ...actual,
    createRequestParams: vi.fn().mockReturnValue({ mocked: 'params' }),
    buildHttpContext: vi.fn().mockReturnValue('mockedContext'),
  };
});

describe('RequestService', () => {
  let service: RequestService;
  let httpClient: HttpClient;

  const mockResponse: BaseResponse<any> = {
    statusCode: 200,
    message: 'OK',
    data: { test: 'value' },
  };

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

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should send GET request with default options', () => {
    (httpClient.get as any).mockReturnValue(of(mockResponse));
    service.get<any>('url').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
    expect(httpClient.get).toHaveBeenCalledWith('url', {
      params: { mocked: 'params' },
      context: 'mockedContext',
    });
  });

  it('should send GET request with params', () => {
    (httpClient.get as any).mockReturnValue(of(mockResponse));
    service.get<any>('url', { foo: 'bar' }).subscribe();
    expect(httpClient.get).toHaveBeenCalled();
  });

  it('should send GET file request', () => {
    const blobRes = new HttpResponse({ body: new Blob(), status: 200 });
    (httpClient.get as any).mockReturnValue(of(blobRes));
    service.getFile('url', { id: 1 }).subscribe(res => {
      expect(res).toEqual(blobRes);
    });
  });

  it('should send POST request with body', () => {
    (httpClient.post as any).mockReturnValue(of(mockResponse));
    service.post<any>('url', { a: 1 }).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
  });

  it('should send POST request with empty body', () => {
    const expectedHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const expectedContext = new HttpContext();

    // Mock dependencies
    (httpClient.post as any).mockReturnValue(of(mockResponse));
    vi.spyOn(service as any, 'getJsonHeaders').mockReturnValue(expectedHeaders);
    vi.spyOn(requestUtils, 'buildHttpContext').mockReturnValue(
      new HttpContext()
    );

    service.post<any>('url').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    expect(httpClient.post).toHaveBeenCalledWith('url', JSON.stringify({}), {
      headers: expectedHeaders,
      context: expectedContext,
    });
  });

  it('should send POST FormData request', () => {
    const formData = new FormData();
    formData.append('file', new Blob());
    (httpClient.post as any).mockReturnValue(of(mockResponse));
    service.postFormData<any>('url', formData).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
  });

  it('should send POST File request', () => {
    const formData = new FormData();
    const blobRes = new HttpResponse({ body: new Blob(), status: 200 });
    (httpClient.post as any).mockReturnValue(of(blobRes));
    service.postFile('url', formData).subscribe(res => {
      expect(res).toEqual(blobRes);
    });
  });

  it('should send PUT request with body', () => {
    (httpClient.put as any).mockReturnValue(of(mockResponse));
    service.put<any>('url', { b: 2 }).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
  });

  it('should send PUT request with empty body', () => {
    const expectedHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const expectedContext = new HttpContext();

    // Mock dependencies
    (httpClient.put as any).mockReturnValue(of(mockResponse));
    vi.spyOn(service as any, 'getJsonHeaders').mockReturnValue(expectedHeaders);
    vi.spyOn(requestUtils, 'buildHttpContext').mockReturnValue(
      new HttpContext()
    );

    service.put<any>('url').subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    expect(httpClient.put).toHaveBeenCalledWith('url', JSON.stringify({}), {
      headers: expectedHeaders,
      context: expectedContext,
    });
  });

  it('should send DELETE request', () => {
    (httpClient.delete as any).mockReturnValue(of(mockResponse));
    service.delete<any>('url').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });
  });

  it('should build JSON headers correctly', () => {
    const headers = (service as any).getJsonHeaders();
    expect(headers.get('Content-Type')).toBe('application/json');
  });

  it('should send GET with custom options', () => {
    (httpClient.get as any).mockReturnValue(of(mockResponse));
    const options = { bypassAuth: true };
    service.get('url', {}, options).subscribe();
    expect(httpClient.get).toHaveBeenCalled();
  });

  it('should send POST with custom options', () => {
    (httpClient.post as any).mockReturnValue(of(mockResponse));
    const options = { bypassAuth: true };
    service.post('url', {}, options).subscribe();
    expect(httpClient.post).toHaveBeenCalled();
  });

  it('should send PUT with custom options', () => {
    (httpClient.put as any).mockReturnValue(of(mockResponse));
    const options = { bypassAuth: true };
    service.put('url', {}, options).subscribe();
    expect(httpClient.put).toHaveBeenCalled();
  });

  it('should send DELETE with custom options', () => {
    (httpClient.delete as any).mockReturnValue(of(mockResponse));
    const options = { bypassAuth: true };
    service.delete('url', options).subscribe();
    expect(httpClient.delete).toHaveBeenCalled();
  });
});
