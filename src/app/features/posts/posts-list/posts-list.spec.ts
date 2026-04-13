import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpHeaders, HttpResponse } from '@angular/common/http';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CommentsService } from '../../../core/services/comments.service';
import { PostsService } from '../../../core/services/posts.service';
import { PostsListComponent } from './posts-list.component';

describe('PostsListComponent', () => {
  let component: PostsListComponent;
  let fixture: ComponentFixture<PostsListComponent>;
  let postsService: {
    getPosts: ReturnType<typeof vi.fn>;
    createPost: ReturnType<typeof vi.fn>;
    createLocalPost: ReturnType<typeof vi.fn>;
  };
  let commentsService: {
    getComments: ReturnType<typeof vi.fn>;
    createComment: ReturnType<typeof vi.fn>;
  };

  const postsResponse = new HttpResponse({
    body: [{ id: 1, user_id: 10, title: 'Hello', body: 'World' }],
    headers: new HttpHeaders({ 'x-pagination-pages': '3' })
  });

  beforeEach(async () => {
    postsService = {
      getPosts: vi.fn(),
      createPost: vi.fn(),
      createLocalPost: vi.fn()
    };
    commentsService = {
      getComments: vi.fn(),
      createComment: vi.fn()
    };

    postsService.getPosts.mockReturnValue(of(postsResponse));

    await TestBed.configureTestingModule({
      imports: [PostsListComponent],
      providers: [
        { provide: PostsService, useValue: postsService },
        { provide: CommentsService, useValue: commentsService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(PostsListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('loads posts on init', () => {
    expect(component.posts.length).toBe(1);
    expect(component.totalPages).toBe(3);
    expect(component.hasNextPage).toBe(true);
  });

  it('resets search and pagination', () => {
    component.search = 'term';
    component.page = 3;

    component.resetSearch();

    expect(component.search).toBe('');
    expect(component.page).toBe(1);
  });

  it('goes to next page only when available', () => {
    component.page = 1;
    component.hasNextPage = true;

    component.nextPage();

    expect(component.page).toBe(2);
  });

  it('loads comments when toggling a post', () => {
    commentsService.getComments.mockReturnValue(of([{ id: 1, post_id: 1, name: 'A', email: 'a@test.it', body: 'B' }]));

    component.toggleComments(1);

    expect(component.openComments[1]).toBe(true);
    expect(commentsService.getComments).toHaveBeenCalledWith(1);
    expect(component.commentsByPost[1].length).toBe(1);
  });

  it('creates a remote post and reloads the list', () => {
    postsService.createPost.mockReturnValue(of({ id: 2, user_id: 10, title: 'New', body: 'Post' }));
    const loadSpy = vi.spyOn(component, 'loadPosts');
    component.form = { user_id: 10, title: 'New', body: 'Post' };

    component.createPost();

    expect(component.success).toContain('Post #2');
    expect(loadSpy).toHaveBeenCalled();
  });

  it('creates a local post when GoREST returns must exist', () => {
    postsService.createPost.mockReturnValue(
      throwError(() => ({ error: [{ message: 'must exist' }] }))
    );
    postsService.createLocalPost.mockReturnValue({ id: 9000001, user_id: 10, title: 'Local', body: 'Post' });
    const loadSpy = vi.spyOn(component, 'loadPosts');
    const form = { user_id: 10, title: 'Local', body: 'Post' };
    component.form = { ...form };

    component.createPost();

    expect(postsService.createLocalPost).toHaveBeenCalledWith(form);
    expect(component.success).toContain('Post locale #9000001');
    expect(loadSpy).toHaveBeenCalled();
  });

  it('builds a readable label for posts with user name', () => {
    expect(component.getPostAuthorLabel({ id: 1, user_id: 10, user_name: 'Simone', title: 'T', body: 'B' })).toBe(
      'Post di Simone'
    );
    expect(component.getPostAuthorLabel({ id: 1, user_id: 10, title: 'T', body: 'B' })).toBe('Utente #10');
  });
});
