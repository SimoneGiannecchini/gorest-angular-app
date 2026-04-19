import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, of, tap } from 'rxjs';

import { GOREST_USERS_API_BASE_URL } from '../constants/gorest-api';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly api = GOREST_USERS_API_BASE_URL;
  private readonly localUsersKey = 'gorest_local_users';

  getUsers(page = 1, perPage = 10, search = ''): Observable<HttpResponse<User[]>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('per_page', perPage.toString());

    const term = search.trim();

    if (term) {
      if (term.includes('@')) {
        params = params.set('email', term);
      } else {
        params = params.set('name', term);
      }
    }

    return this.http.get<User[]>(`${this.api}/users`, {
      params,
      observe: 'response'
    }).pipe(
      map((response) => {
        const mergedUsers = this.mergeUsers(response.body ?? [], this.getLocalUsers(), term);

        return response.clone({
          body: mergedUsers.slice(0, perPage)
        });
      }),
      catchError(() => {
        const localUsers = this.mergeUsers([], this.getLocalUsers(), term).slice(0, perPage);
        return of(new HttpResponse<User[]>({
          body: localUsers,
          status: 200
        }));
      })
    );
  }

  getUser(id: number): Observable<User> {
    const localUser = this.getLocalUsers().find((user) => user.id === id);

    if (localUser) {
      return of(localUser);
    }

    return this.http.get<User>(`${this.api}/users/${id}`);
  }

  createUser(payload: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.api}/users`, payload).pipe(
      tap((user) => {
        this.saveLocalUser(user);
      }),
      catchError(() => {
        const localUser = this.createLocalUser(payload);
        return of(localUser);
      })
    );
  }

  deleteUser(id: number): Observable<void> {
    if (this.isLocalUser(id)) {
      this.removeLocalUser(id);
      return of(void 0);
    }

    return this.http.delete<void>(`${this.api}/users/${id}`).pipe(
      tap(() => {
        this.removeLocalUser(id);
      })
    );
  }

  private isLocalUser(id: number): boolean {
    return id >= 8000000;
  }

  private createLocalUser(payload: Omit<User, 'id'>): User {
    const user: User = {
      id: this.getNextLocalUserId(),
      ...payload
    };

    this.saveLocalUser(user);
    return user;
  }

  private getLocalUsers(): User[] {
    try {
      const raw = localStorage.getItem(this.localUsersKey);
      return raw ? JSON.parse(raw) as User[] : [];
    } catch {
      return [];
    }
  }

  private saveLocalUser(user: User): void {
    const merged = this.mergeUsers(this.getLocalUsers(), [user]);
    localStorage.setItem(this.localUsersKey, JSON.stringify(merged));
  }

  private removeLocalUser(id: number): void {
    const remainingUsers = this.getLocalUsers().filter((user) => user.id !== id);
    localStorage.setItem(this.localUsersKey, JSON.stringify(remainingUsers));
  }

  private getNextLocalUserId(): number {
    return this.getLocalUsers().reduce((maxId, user) => Math.max(maxId, user.id), 8000000) + 1;
  }

  private mergeUsers(primary: User[], secondary: User[], search = ''): User[] {
    const term = search.trim().toLowerCase();
    const merged = [...secondary, ...primary].filter((user, index, users) =>
      users.findIndex((candidate) => candidate.id === user.id) === index
    );

    if (!term) {
      return merged;
    }

    return merged.filter((user) =>
      user.name.toLowerCase().includes(term) || user.email.toLowerCase().includes(term)
    );
  }
}
