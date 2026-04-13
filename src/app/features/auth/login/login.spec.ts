import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { AuthService } from '../../../core/services/auth.service';
import { LoginComponent } from './login.component';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authService: {
    clearSession: ReturnType<typeof vi.fn>;
    verifyToken: ReturnType<typeof vi.fn>;
    login: ReturnType<typeof vi.fn>;
    logout: ReturnType<typeof vi.fn>;
  };
  let router: Router;

  beforeEach(async () => {
    authService = {
      clearSession: vi.fn(),
      verifyToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: () => null
              }
            }
          }
        }
      ]
    }).compileComponents();

    router = TestBed.inject(Router);
    vi.spyOn(router, 'navigateByUrl').mockResolvedValue(true);

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
  });

  it('clears the session on init', () => {
    fixture.detectChanges();
    expect(authService.clearSession).toHaveBeenCalled();
  });

  it('shows invalid token error from route params', () => {
    TestBed.resetTestingModule();

    authService = {
      clearSession: vi.fn(),
      verifyToken: vi.fn(),
      login: vi.fn(),
      logout: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              queryParamMap: {
                get: (key: string) => (key === 'error' ? 'invalid-token' : null)
              }
            }
          }
        }
      ]
    });

    const localFixture = TestBed.createComponent(LoginComponent);
    localFixture.detectChanges();

    expect(localFixture.componentInstance.error).toBe('Token errato');
  });

  it('shows an error when token is empty', () => {
    fixture.detectChanges();
    component.token = '   ';

    component.login();

    expect(component.error).toBe('Inserisci il token GoREST.');
    expect(authService.verifyToken).not.toHaveBeenCalled();
  });

  it('logs in and navigates on valid token', () => {
    authService.verifyToken.mockReturnValue(of('valid'));
    fixture.detectChanges();
    component.token = 'good-token';

    component.login();

    expect(authService.login).toHaveBeenCalledWith('good-token');
    expect(router.navigateByUrl).toHaveBeenCalledWith('/users');
  });

  it('shows an error on invalid token', () => {
    authService.verifyToken.mockReturnValue(of('invalid'));
    fixture.detectChanges();
    component.token = 'bad-token';

    component.login();

    expect(authService.logout).toHaveBeenCalled();
    expect(component.error).toBe('Token errato');
  });

  it('shows an error when verification is unavailable', () => {
    authService.verifyToken.mockReturnValue(of('unavailable'));
    fixture.detectChanges();
    component.token = 'token';

    component.login();

    expect(authService.logout).toHaveBeenCalled();
    expect(component.error).toBe('Impossibile verificare il token in questo momento.');
  });

  it('shows invalid token on verification error', () => {
    authService.verifyToken.mockReturnValue(
      throwError(() => new Error('network'))
    );
    fixture.detectChanges();
    component.token = 'token';

    component.login();

    expect(authService.logout).toHaveBeenCalled();
    expect(component.error).toBe('Token errato');
  });
});
