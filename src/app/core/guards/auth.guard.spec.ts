import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { authGuard } from './auth.guard';
import { AuthService } from '../services/auth.service';

describe('authGuard', () => {
  let authService: { hasVerifiedToken: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(() => {
    authService = {
      hasVerifiedToken: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    });

    router = TestBed.inject(Router);
  });

  it('allows navigation for verified tokens', () => {
    authService.hasVerifiedToken.mockReturnValue(true);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toBe(true);
  });

  it('redirects to login for unverified tokens', () => {
    authService.hasVerifiedToken.mockReturnValue(false);

    const result = TestBed.runInInjectionContext(() => authGuard({} as never, {} as never));

    expect(result).toEqual(router.createUrlTree(['/login']));
  });
});
