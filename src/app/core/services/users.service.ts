import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { GOREST_USERS_API_BASE_URL } from '../constants/gorest-api';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersService {
  private readonly http = inject(HttpClient);
  private readonly api = GOREST_USERS_API_BASE_URL;

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
    });
  }

  getUser(id: number): Observable<User> {
    return this.http.get<User>(`${this.api}/users/${id}`);
  }

  createUser(payload: Omit<User, 'id'>): Observable<User> {
    return this.http.post<User>(`${this.api}/users`, payload);
  }

  deleteUser(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/users/${id}`);
  }
}
