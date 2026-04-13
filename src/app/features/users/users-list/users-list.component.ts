import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

import { User } from '../../../core/models/user.model';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-users-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss'
})
export class UsersListComponent implements OnInit {
  private readonly usersService = inject(UsersService);

  readonly perPageOptions = [5, 10, 20, 50];
  users: User[] = [];
  loading = false;
  error = '';

  search = '';
  page = 1;
  perPage = 10;
  totalPages = 1;
  hasNextPage = false;

  showCreateForm = false;

  form: Omit<User, 'id'> = {
    name: '',
    email: '',
    gender: 'male',
    status: 'active'
  };

  ngOnInit(): void {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading = true;
    this.error = '';

    this.usersService.getUsers(this.page, this.perPage, this.search).subscribe({
      next: (response: HttpResponse<User[]>) => {
        this.users = response.body ?? [];
        const headerPages = Number(response.headers.get('x-pagination-pages') ?? 0);
        this.totalPages = headerPages > 0 ? headerPages : Math.max(this.page, 1);
        this.hasNextPage = headerPages > 0 ? this.page < headerPages : this.users.length === this.perPage;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 0) {
          this.error =
            'Impossibile raggiungere GoREST dal browser. Riavvia npm start e fai un refresh completo.';
        } else {
          this.error = `Errore nel caricamento degli utenti. HTTP ${err.status}.`;
        }
        this.loading = false;
        console.error(err);
      }
    });
  }

  searchUsers(): void {
    this.page = 1;
    this.loadUsers();
  }

  resetSearch(): void {
    this.search = '';
    this.page = 1;
    this.hasNextPage = false;
    this.loadUsers();
  }

  createUser(): void {
    this.error = '';

    this.usersService.createUser(this.form).subscribe({
      next: () => {
        this.form = {
          name: '',
          email: '',
          gender: 'male',
          status: 'active'
        };
        this.showCreateForm = false;
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.error = (err.error?.[0]?.message as string) ?? 'Errore nella creazione utente.';
      }
    });
  }

  deleteUser(id: number): void {
    const ok = confirm('Vuoi davvero eliminare questo utente?');
    if (!ok) {
      return;
    }

    this.usersService.deleteUser(id).subscribe({
      next: () => this.loadUsers(),
      error: (err: HttpErrorResponse) => {
        this.error = (err.error?.[0]?.message as string) ?? 'Errore nella cancellazione utente.';
      }
    });
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadUsers();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.page++;
      this.loadUsers();
    }
  }

  onPerPageChange(): void {
    this.page = 1;
    this.loadUsers();
  }

  trackByUserId(_index: number, user: User): number {
    return user.id;
  }
}
