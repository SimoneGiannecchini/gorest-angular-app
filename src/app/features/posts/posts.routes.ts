import { Routes } from '@angular/router';
import { PostsListComponent } from './posts-list/posts-list.component';

export const POSTS_ROUTES: Routes = [
  {
    path: '',
    component: PostsListComponent
  }
];