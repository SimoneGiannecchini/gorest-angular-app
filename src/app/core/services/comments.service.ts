import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';

import { GOREST_POSTS_API_BASE_URL } from '../constants/gorest-api';
import { PostComment } from '../models/comment.model';

@Injectable({
  providedIn: 'root'
})
export class CommentsService {
  private readonly http = inject(HttpClient);
  private readonly api = GOREST_POSTS_API_BASE_URL;

  getComments(postId: number): Observable<PostComment[]> {
    return this.http.get<PostComment[]>(`${this.api}/posts/${postId}/comments`);
  }

  createComment(
    postId: number,
    payload: { name: string; email: string; body: string }
  ): Observable<PostComment> {
    return this.http.post<PostComment>(`${this.api}/posts/${postId}/comments`, payload);
  }
}
