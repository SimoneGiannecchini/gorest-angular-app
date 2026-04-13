import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  token = '';
  error = '';
  loading = false;

  ngOnInit(): void {
    this.authService.clearSession();

    const error = this.route.snapshot.queryParamMap.get('error');

    if (error === 'invalid-token') {
      this.error = 'Token errato';
    }
  }

  login(): void {
    this.error = '';

    const cleanToken = this.token.trim();

    if (!cleanToken) {
      this.error = 'Inserisci il token GoREST.';
      return;
    }

    this.loading = true;
    this.authService.verifyToken(cleanToken).subscribe({
      next: (status) => {
        this.loading = false;

        if (status === 'invalid') {
          this.authService.logout();
          this.error = 'Token errato';
          return;
        }

        if (status === 'unavailable') {
          this.authService.logout();
          this.error = 'Impossibile verificare il token in questo momento.';
          return;
        }

        this.authService.login(cleanToken);
        this.router.navigateByUrl('/users');
      },
      error: () => {
        this.loading = false;
        this.authService.logout();
        this.error = 'Token errato';
      }
    });
  }
}
