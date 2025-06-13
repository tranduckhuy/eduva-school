import { Injectable } from '@angular/core';

import { Observable, delay, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  refreshToken(_refreshToken: string): Observable<string> {
    const fakeNewToken =
      'fake_access_token_' + Math.random().toString(36).slice(2);
    console.log('🔁 [Fake] Refreshing token...');

    return of(fakeNewToken).pipe(delay(1000));
  }
  // return this.http.post<{ access_token: string }>(
  //   '/api/auth/refresh-token',
  //   { refreshToken }
  // ).pipe(map(res => res.access_token));
}
