import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';

import { PostComment } from '../../../core/models/comment.model';
import { Post } from '../../../core/models/post.model';
import { User } from '../../../core/models/user.model';
import { CommentsService } from '../../../core/services/comments.service';
import { PostsService } from '../../../core/services/posts.service';
import { UsersService } from '../../../core/services/users.service';

@Component({
  selector: 'app-user-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './user-detail.component.html',
  styleUrl: './user-detail.component.scss'
})
export class UserDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly usersService = inject(UsersService);
  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);

  user: User | null = null;
  posts: Post[] = [];
  commentsByPost: Record<number, PostComment[]> = {};
  openComments: Record<number, boolean> = {};
  commentForms: Record<number, { name: string; email: string; body: string }> = {};
  commentLoading: Record<number, boolean> = {};
  postForm = {
    title: '',
    body: ''
  };
  loadingUser = false;
  loadingPosts = false;
  error = '';
  success = '';

  ngOnInit(): void {
    const userId = Number(this.route.snapshot.paramMap.get('id'));

    if (!userId) {
      this.error = 'Utente non valido.';
      return;
    }

    this.loadUserDetail(userId);
  }

  loadUserDetail(userId: number): void {
    this.loadingUser = true;
    this.error = '';
    this.success = '';

    this.usersService.getUser(userId).subscribe({
      next: (user) => {
        this.user = user;
        this.loadUserPosts(user.id);
      },
      error: (err: HttpErrorResponse) => {
        this.error = `Errore nel caricamento utente. HTTP ${err.status}.`;
        this.loadingUser = false;
      }
    });
  }

  loadUserPosts(userId: number): void {
    this.loadingPosts = true;

    this.postsService.getPostsByUser(userId).subscribe({
      next: (posts) => {
        this.posts = posts;
        this.commentForms = posts.reduce<Record<number, { name: string; email: string; body: string }>>(
          (acc, post) => {
            acc[post.id] = { name: '', email: '', body: '' };
            return acc;
          },
          {},
        );
        this.loadingUser = false;
        this.loadingPosts = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status === 404) {
          this.posts = [];
          this.commentForms = {};
          this.error = '';
          this.loadingUser = false;
          this.loadingPosts = false;
          return;
        }

        if (err.status >= 500 || err.status === 0) {
          this.error = 'I post GoREST non sono disponibili in questo momento.';
          this.loadingUser = false;
          this.loadingPosts = false;
          return;
        }

        this.error = `Errore nel caricamento post utente. HTTP ${err.status}.`;
        this.loadingUser = false;
        this.loadingPosts = false;
      }
    });
  }

  toggleComments(postId: number): void {
    this.openComments[postId] = !this.openComments[postId];

    if (!this.openComments[postId] || this.commentsByPost[postId]) {
      return;
    }

    this.commentsService.getComments(postId).subscribe({
      next: (comments) => {
        this.commentsByPost[postId] = comments;
      },
      error: () => {
        this.commentsByPost[postId] = [];
      }
    });
  }

  createComment(postId: number): void {
    const form = this.commentForms[postId];
    if (!form) {
      return;
    }

    this.commentLoading[postId] = true;
    this.commentsService.createComment(postId, form).subscribe({
      next: (comment) => {
        const currentComments = this.commentsByPost[postId] ?? [];
        this.commentsByPost[postId] = [comment, ...currentComments];
        this.commentForms[postId] = { name: '', email: '', body: '' };
        this.commentLoading[postId] = false;
        this.success = 'Commento aggiunto correttamente.';
      },
      error: () => {
        this.error = 'Errore nella creazione del commento.';
        this.commentLoading[postId] = false;
      }
    });
  }

  createPost(): void {
    const currentUser = this.user;

    if (!currentUser) {
      return;
    }

    this.error = '';
    this.success = '';

    this.postsService.createPost({
      user_id: currentUser.id,
      title: this.postForm.title,
      body: this.postForm.body
    }).subscribe({
      next: (post) => {
        this.posts = [post, ...this.posts];
        this.commentForms[post.id] = { name: '', email: '', body: '' };
        this.postForm = { title: '', body: '' };
        this.loadingPosts = false;
        this.success = `Post #${post.id} creato correttamente.`;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status >= 500 || err.status === 0) {
          this.error = 'GoREST non consente di creare post in questo momento. Il servizio sta restituendo HTTP 500.';
          return;
        }

        if ((err.error?.[0]?.message as string) === 'must exist') {
          const localPost = this.postsService.createLocalPost({
            user_id: currentUser.id,
            user_name: currentUser.name,
            title: this.postForm.title,
            body: this.postForm.body
          });
          this.posts = [localPost, ...this.posts];
          this.commentForms[localPost.id] = { name: '', email: '', body: '' };
          this.postForm = { title: '', body: '' };
          this.success = `Post locale #${localPost.id} creato correttamente. Non sincronizzato con GoREST.`;
          return;
        }

        this.error = (err.error?.[0]?.message as string) ?? 'Errore nella creazione del post.';
      }
    });
  }

  trackByPostId(_index: number, post: Post): number {
    return post.id;
  }
}
