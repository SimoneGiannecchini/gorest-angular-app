import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { UsersService } from '../../../core/services/users.service';
import { UsersListComponent } from './users-list.component';

describe('UsersListComponent', () => {
  let component: UsersListComponent;
  let fixture: ComponentFixture<UsersListComponent>;
  let usersService: {
    getUsers: ReturnType<typeof vi.fn>;
    createUser: ReturnType<typeof vi.fn>;
    deleteUser: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = {
      getUsers: vi.fn(),
      createUser: vi.fn(),
      deleteUser: vi.fn()
    };

    usersService.getUsers.mockReturnValue(
      of(new HttpResponse({
        body: [{ id: 1, name: 'Mario', email: 'mario@test.it', gender: 'male', status: 'active' }],
        headers: new HttpHeaders({ 'x-pagination-pages': '2' })
      }))
    );

    await TestBed.configureTestingModule({
      imports: [UsersListComponent],
      providers: [
        provideRouter([]),
        { provide: UsersService, useValue: usersService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UsersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads users on init', () => {
    expect(component.users.length).toBe(1);
    expect(component.totalPages).toBe(2);
    expect(component.hasNextPage).toBe(true);
  });

  it('resets search state', () => {
    component.search = 'mario';
    component.page = 3;

    component.resetSearch();

    expect(component.search).toBe('');
    expect(component.page).toBe(1);
  });

  it('creates a user and closes the form', () => {
    usersService.createUser.mockReturnValue(
      of({ id: 2, name: 'Luigi', email: 'luigi@test.it', gender: 'male', status: 'active' })
    );
    const loadSpy = vi.spyOn(component, 'loadUsers');
    component.showCreateForm = true;
    component.form = {
      name: 'Luigi',
      email: 'luigi@test.it',
      gender: 'male',
      status: 'active'
    };

    component.createUser();

    expect(component.showCreateForm).toBe(false);
    expect(loadSpy).toHaveBeenCalled();
  });

  it('stores a readable load error when request fails', () => {
    usersService.getUsers.mockReturnValue(
      throwError(() => ({ status: 500 }))
    );

    component.loadUsers();

    expect(component.error).toBe('Errore nel caricamento degli utenti. HTTP 500.');
  });
});
