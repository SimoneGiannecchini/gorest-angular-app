import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

import { PostComment } from '../../../core/models/comment.model';
import { Post } from '../../../core/models/post.model';
import { CommentsService } from '../../../core/services/comments.service';
import { PostsService } from '../../../core/services/posts.service';

@Component({
  selector: 'app-posts-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './posts-list.component.html',
  styleUrl: './posts-list.component.scss'
})
export class PostsListComponent implements OnInit {
  private readonly postsService = inject(PostsService);
  private readonly commentsService = inject(CommentsService);

  readonly perPageOptions = [5, 10, 20, 50];
  posts: Post[] = [];
  commentsByPost: Record<number, PostComment[]> = {};
  openComments: Record<number, boolean> = {};
  commentForms: Record<number, { name: string; email: string; body: string }> = {};
  commentLoading: Record<number, boolean> = {};
  loading = false;
  error = '';
  success = '';

  search = '';
  page = 1;
  perPage = 10;
  totalPages = 1;
  hasNextPage = false;
  showCreateForm = false;

  form = {
    user_id: 0,
    title: '',
    body: ''
  };

  ngOnInit(): void {
    this.loadPosts();
  }

  loadPosts(): void {
    this.loading = true;
    this.error = '';

    this.postsService.getPosts(this.page, this.perPage, this.search).subscribe({
      next: (response: HttpResponse<Post[]>) => {
        this.posts = response.body ?? [];
        this.commentForms = this.posts.reduce<Record<number, { name: string; email: string; body: string }>>(
          (acc, post) => {
            acc[post.id] = acc[post.id] ?? { name: '', email: '', body: '' };
            return acc;
          },
          {},
        );
        const headerPages = Number(response.headers.get('x-pagination-pages') ?? 0);
        this.totalPages = headerPages > 0 ? headerPages : Math.max(this.page, 1);
        this.hasNextPage = headerPages > 0 ? this.page < headerPages : this.posts.length === this.perPage;
        this.loading = false;
      },
      error: (err: HttpErrorResponse) => {
        if (err.status >= 500 || err.status === 0) {
          this.error = 'I post GoREST non sono disponibili in questo momento.';
          this.loading = false;
          return;
        }

        this.error = `Errore nel caricamento dei post. HTTP ${err.status}.`;
        this.loading = false;
      }
    });
  }

  searchPosts(): void {
    this.page = 1;
    this.loadPosts();
  }

  resetSearch(): void {
    this.search = '';
    this.page = 1;
    this.hasNextPage = false;
    this.loadPosts();
  }

  onPerPageChange(): void {
    this.page = 1;
    this.loadPosts();
  }

  previousPage(): void {
    if (this.page > 1) {
      this.page--;
      this.loadPosts();
    }
  }

  nextPage(): void {
    if (this.hasNextPage) {
      this.page++;
      this.loadPosts();
    }
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

  createPost(): void {
    this.error = '';
    this.success = '';

    this.postsService.createPost(this.form).subscribe({
      next: (post) => {
        this.form = {
          user_id: 0,
          title: '',
          body: ''
        };
        this.showCreateForm = false;
        this.page = 1;
        this.success = `Post #${post.id} creato correttamente.`;
        this.loadPosts();
      },
      error: (err: HttpErrorResponse) => {
        if (err.status >= 500 || err.status === 0) {
          this.error = 'GoREST non consente di creare post in questo momento. Il servizio sta restituendo HTTP 500.';
          return;
        }

        if ((err.error?.[0]?.message as string) === 'must exist') {
          const localPost = this.postsService.createLocalPost(this.form);
          this.form = {
            user_id: 0,
            title: '',
            body: ''
          };
          this.showCreateForm = false;
          this.page = 1;
          this.success = `Post locale #${localPost.id} creato correttamente.`;
          this.loadPosts();
          return;
        }

        this.error = (err.error?.[0]?.message as string) ?? 'Errore nella creazione del post.';
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

  getPostAuthorLabel(post: Post): string {
    if (post.user_name?.trim()) {
      return `Post di ${post.user_name}`;
    }

    return `Utente #${post.user_id}`;
  }

  trackByPostId(_index: number, post: Post): number {
    return post.id;
  }
}
