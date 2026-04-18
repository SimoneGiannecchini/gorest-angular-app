import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';

import { GOREST_POSTS_API_BASE_URL } from '../constants/gorest-api';
import { PostComment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly api = GOREST_POSTS_API_BASE_URL;
  private readonly localCommentsKey = 'gorest_local_comments';

  getComments(postId: number): Observable<PostComment[]> {
    const localComments = this.getLocalCommentsByPost(postId);

    if (this.isLocalPost(postId)) {
      return of(localComments);
    }

    return this.http.get<PostComment[]>(`${this.api}/posts/${postId}/comments`).pipe(
      catchError(() => of(localComments))
    );
  }

  createComment(
    postId: number,
    payload: { name: string; email: string; body: string }
  ): Observable<PostComment> {
    if (this.isLocalPost(postId)) {
      return of(this.createLocalComment(postId, payload));
    }

    return this.http.post<PostComment>(`${this.api}/posts/${postId}/comments`, payload);
  }

  private isLocalPost(postId: number): boolean {
    return postId >= 9000000;
  }

  private createLocalComment(
    postId: number,
    payload: { name: string; email: string; body: string }
  ): PostComment {
    const comment: PostComment = {
      id: this.getNextLocalCommentId(),
      post_id: postId,
      name: payload.name,
      email: payload.email,
      body: payload.body
    };

    const comments = this.getLocalComments();
    localStorage.setItem(this.localCommentsKey, JSON.stringify([comment, ...comments]));
    return comment;
  }

  private getLocalCommentsByPost(postId: number): PostComment[] {
    return this.getLocalComments().filter((comment) => comment.post_id === postId);
  }

  private getLocalComments(): PostComment[] {
    try {
      const raw = localStorage.getItem(this.localCommentsKey);
      return raw ? JSON.parse(raw) as PostComment[] : [];
    } catch {
      return [];
    }
  }

  private getNextLocalCommentId(): number {
    return this.getLocalComments().reduce((maxId, comment) => Math.max(maxId, comment.id), 9500000) + 1;
  }
}
