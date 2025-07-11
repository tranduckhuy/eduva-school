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

  it('should send DELETE request with body', () => {
    const body = { id: '123', force: true };
    const expectedHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const expectedContext = new HttpContext();

    (httpClient.delete as any).mockReturnValue(of(mockResponse));
    vi.spyOn(service as any, 'getJsonHeaders').mockReturnValue(expectedHeaders);
    vi.spyOn(requestUtils, 'buildHttpContext').mockReturnValue(expectedContext);

    service.deleteWithBody<any>('url', body).subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    expect(httpClient.delete).toHaveBeenCalledWith('url', {
      headers: expectedHeaders,
      body: JSON.stringify(body),
      context: expectedContext,
    });
  });

  it('should send DELETE request with empty body if body is undefined', () => {
    const expectedHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
    });
    const expectedContext = new HttpContext();

    (httpClient.delete as any).mockReturnValue(of(mockResponse));
    vi.spyOn(service as any, 'getJsonHeaders').mockReturnValue(expectedHeaders);
    vi.spyOn(requestUtils, 'buildHttpContext').mockReturnValue(expectedContext);

    service.deleteWithBody<any>('url').subscribe(res => {
      expect(res).toEqual(mockResponse);
    });

    expect(httpClient.delete).toHaveBeenCalledWith('url', {
      headers: expectedHeaders,
      body: JSON.stringify({}),
      context: expectedContext,
    });
  });
});
