import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { EMPTY, Observable, catchError, expand, map, of, reduce, tap } from 'rxjs';

import { GOREST_POSTS_API_BASE_URL } from '../constants/gorest-api';
import { Post } from '../models/post.model';

@Injectable({
  providedIn: 'root'
})
export class PostsService {
  private readonly http = inject(HttpClient);
  private readonly api = GOREST_POSTS_API_BASE_URL;
  private readonly localPostsKey = 'gorest_local_posts';

  getPosts(page = 1, perPage = 10, search = ''): Observable<HttpResponse<Post[]>> {
    let params = new HttpParams()
      .set('page', page)
      .set('per_page', perPage);

    const term = search.trim();
    if (term) {
      params = params.set('title', term);
    }

    return this.http.get<Post[]>(`${this.api}/posts`, {
      params,
      observe: 'response'
    }).pipe(
      map((response) => {
        const remotePosts = response.body ?? [];
        const mergedPosts = this.mergePosts(remotePosts, this.getLocalPosts(), term);

        return response.clone({
          body: mergedPosts.slice(0, perPage)
        });
      }),
      catchError(() => {
        const localPosts = this.mergePosts([], this.getLocalPosts(), term).slice(0, perPage);
        return of(new HttpResponse<Post[]>({
          body: localPosts,
          status: 200
        }));
      })
    );
  }

  getPostsByUser(userId: number): Observable<Post[]> {
    const perPage = 100;

    return this.http.get<Post[]>(`${this.api}/posts`, {
      params: new HttpParams()
        .set('page', '1')
        .set('per_page', perPage.toString()),
      observe: 'response'
    }).pipe(
      expand((response, index) => {
        const totalPages = Number(response.headers.get('x-pagination-pages') ?? index + 1);
        const nextPage = index + 2;

        if (nextPage > totalPages) {
          return EMPTY;
        }

        return this.http.get<Post[]>(`${this.api}/posts`, {
          params: new HttpParams()
            .set('page', nextPage.toString())
            .set('per_page', perPage.toString()),
          observe: 'response'
        });
      }),
      map((response) => response.body ?? []),
      reduce((allPosts, pagePosts) => [...allPosts, ...pagePosts], [] as Post[]),
      map((remotePosts) => {
        const localPosts = this.getLocalPosts().filter((post) => post.user_id === userId);
        return this.mergePosts(
          remotePosts.filter((post) => post.user_id === userId),
          localPosts
        );
      }),
      catchError(() => {
        const localPosts = this.getLocalPosts().filter((post) => post.user_id === userId);
        return of(localPosts);
      })
    );
  }

  createPost(payload: { user_id: number; title: string; body: string }): Observable<Post> {
    return this.http.post<Post>(`${this.api}/users/${payload.user_id}/posts`, {
      title: payload.title,
      body: payload.body
    }).pipe(
      tap((post) => {
        this.saveLocalPost(post);
      })
    );
  }

  createLocalPost(payload: { user_id: number; user_name?: string; title: string; body: string }): Post {
    const localPost: Post = {
      id: this.getNextLocalId(),
      user_id: payload.user_id,
      user_name: payload.user_name,
      title: payload.title,
      body: payload.body
    };

    this.saveLocalPost(localPost);
    return localPost;
  }

  private getLocalPosts(): Post[] {
    try {
      const raw = localStorage.getItem(this.localPostsKey);
      return raw ? JSON.parse(raw) as Post[] : [];
    } catch {
      return [];
    }
  }

  private saveLocalPost(post: Post): void {
    const currentPosts = this.getLocalPosts();
    const merged = this.mergePosts(currentPosts, [post]);
    localStorage.setItem(this.localPostsKey, JSON.stringify(merged));
  }

  private getNextLocalId(): number {
    const allPosts = this.getLocalPosts();
    const maxId = allPosts.reduce((currentMax, post) => Math.max(currentMax, post.id), 9000000);
    return maxId + 1;
  }

  private mergePosts(primary: Post[], secondary: Post[], search = ''): Post[] {
    const term = search.trim().toLowerCase();
    const merged = [...secondary, ...primary].filter((post, index, posts) =>
      posts.findIndex((candidate) => candidate.id === post.id) === index
    );

    if (!term) {
      return merged;
    }

    return merged.filter((post) => post.title.toLowerCase().includes(term));
  }
}
