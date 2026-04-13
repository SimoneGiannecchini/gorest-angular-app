import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';

import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('marks a session as verified on login', () => {
    service.login('token-1');

    expect(service.getToken()).toBe('token-1');
    expect(service.hasVerifiedToken()).toBe(true);
    expect(service.checkSession()).toBe(true);
  });

  it('clears the session on logout', () => {
    service.login('token-1');

    service.logout();

    expect(service.getToken()).toBe('');
    expect(service.hasVerifiedToken()).toBe(false);
  });

  it('returns invalid for an empty token', () => {
    service.verifyToken('   ').subscribe((status) => {
      expect(status).toBe('invalid');
    });
  });

  it('returns valid on 422 verification response', () => {
    service.verifyToken('token-1').subscribe((status) => {
      expect(status).toBe('valid');
    });

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer token-1');
    req.flush(
      [{ field: 'name', message: "can't be blank" }],
      { status: 422, statusText: 'Unprocessable Entity' }
    );
  });

  it('returns invalid on 401 verification response', () => {
    service.verifyToken('token-1').subscribe((status) => {
      expect(status).toBe('invalid');
    });

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    req.flush({}, { status: 401, statusText: 'Unauthorized' });
  });

  it('returns unavailable on unexpected verification response', () => {
    service.verifyToken('token-1').subscribe((status) => {
      expect(status).toBe('unavailable');
    });

    const req = httpMock.expectOne('https://gorest.co.in/public/v2/users');
    req.flush({}, { status: 500, statusText: 'Server Error' });
  });
});
