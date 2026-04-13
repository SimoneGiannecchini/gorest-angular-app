import { Routes } from '@angular/router';

import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  {
    path: 'login',
    loadChildren: () =>
      import('./features/auth/auth.routes').then((m) => m.AUTH_ROUTES)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/users/users.routes').then((m) => m.USERS_ROUTES)
  },
  {
    path: 'posts',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/posts/posts.routes').then((m) => m.POSTS_ROUTES)
  },
  { path: '**', redirectTo: 'login' }
];
