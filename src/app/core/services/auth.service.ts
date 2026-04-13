import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { catchError, map, Observable, of } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'gorest_token';
  private readonly verifiedKey = 'gorest_token_verified';
  private readonly verifyApi = 'https://gorest.co.in/public/v2';

  hasVerifiedToken(): boolean {
    return this.getToken().trim().length > 0 && localStorage.getItem(this.verifiedKey) === 'true';
  }

  verifyToken(token: string): Observable<'valid' | 'invalid' | 'unavailable'> {
    const cleanToken = token.trim();

    if (!cleanToken) {
      return of('invalid');
    }

    return this.http.post(`${this.verifyApi}/users`, {}, {
      headers: new HttpHeaders({
        Authorization: `Bearer ${cleanToken}`
      }),
      observe: 'response'
    }).pipe(
      map(() => 'valid' as const),
      catchError((error) => {
        if (error.status === 401 || error.status === 403) {
          return of('invalid' as const);
        }

        if (error.status === 422) {
          return of('valid' as const);
        }

        return of('unavailable' as const);
      })
    );
  }

  login(token: string): void {
    localStorage.setItem(this.tokenKey, token.trim());
    localStorage.setItem(this.verifiedKey, 'true');
  }

  checkSession(): boolean {
    return this.hasVerifiedToken();
  }

  getToken(): string {
    return localStorage.getItem(this.tokenKey) ?? '';
  }

  clearSession(): void {
    localStorage.removeItem(this.tokenKey);
    localStorage.removeItem(this.verifiedKey);
  }

  logout(): void {
    this.clearSession();
  }
}
