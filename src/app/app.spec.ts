import { TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';
import { vi } from 'vitest';

import { AppComponent } from './app.component';
import { AuthService } from './core/services/auth.service';

describe('AppComponent', () => {
  let authService: { hasVerifiedToken: ReturnType<typeof vi.fn> };
  let router: Router;

  beforeEach(async () => {
    authService = {
      hasVerifiedToken: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeTruthy();
  });

  it('shows the navbar only for verified sessions outside login', () => {
    authService.hasVerifiedToken.mockReturnValue(true);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/users');

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect((app as never as { showNavbar(): boolean }).showNavbar()).toBe(true);
  });

  it('hides the navbar on login route', () => {
    authService.hasVerifiedToken.mockReturnValue(true);
    vi.spyOn(router, 'url', 'get').mockReturnValue('/login');

    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;

    expect((app as never as { showNavbar(): boolean }).showNavbar()).toBe(false);
  });
});
