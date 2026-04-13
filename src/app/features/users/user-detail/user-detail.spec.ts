import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi } from 'vitest';

import { CommentsService } from '../../../core/services/comments.service';
import { PostsService } from '../../../core/services/posts.service';
import { UsersService } from '../../../core/services/users.service';
import { UserDetailComponent } from './user-detail.component';

describe('UserDetailComponent', () => {
  let component: UserDetailComponent;
  let fixture: ComponentFixture<UserDetailComponent>;
  let usersService: { getUser: ReturnType<typeof vi.fn> };
  let postsService: {
    getPostsByUser: ReturnType<typeof vi.fn>;
    createPost: ReturnType<typeof vi.fn>;
    createLocalPost: ReturnType<typeof vi.fn>;
  };
  let commentsService: {
    getComments: ReturnType<typeof vi.fn>;
    createComment: ReturnType<typeof vi.fn>;
  };

  beforeEach(async () => {
    usersService = { getUser: vi.fn() };
    postsService = {
      getPostsByUser: vi.fn(),
      createPost: vi.fn(),
      createLocalPost: vi.fn()
    };
    commentsService = {
      getComments: vi.fn(),
      createComment: vi.fn()
    };

    usersService.getUser.mockReturnValue(
      of({ id: 7, name: 'Anna', email: 'anna@test.it', gender: 'female', status: 'active' })
    );
    postsService.getPostsByUser.mockReturnValue(
      of([{ id: 3, user_id: 7, title: 'My post', body: 'Body' }])
    );

    await TestBed.configureTestingModule({
      imports: [UserDetailComponent],
      providers: [
        provideRouter([]),
        { provide: UsersService, useValue: usersService },
        { provide: PostsService, useValue: postsService },
        { provide: CommentsService, useValue: commentsService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: () => '7'
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(UserDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('loads user detail and posts on init', () => {
    expect(component.user?.id).toBe(7);
    expect(component.posts.length).toBe(1);
  });

  it('loads comments when toggling them', () => {
    commentsService.getComments.mockReturnValue(
      of([{ id: 1, post_id: 3, name: 'Anna', email: 'anna@test.it', body: 'Hi' }])
    );

    component.toggleComments(3);

    expect(component.openComments[3]).toBe(true);
    expect(component.commentsByPost[3].length).toBe(1);
  });

  it('creates a comment successfully', () => {
    component.commentForms[3] = { name: 'Anna', email: 'anna@test.it', body: 'Hi' };
    commentsService.createComment.mockReturnValue(
      of({ id: 2, post_id: 3, name: 'Anna', email: 'anna@test.it', body: 'Hi' })
    );

    component.createComment(3);

    expect(component.success).toBe('Commento aggiunto correttamente.');
    expect(component.commentsByPost[3].length).toBe(1);
  });

  it('creates a remote post successfully', () => {
    postsService.createPost.mockReturnValue(
      of({ id: 4, user_id: 7, title: 'Remote', body: 'Post' })
    );
    component.postForm = { title: 'Remote', body: 'Post' };

    component.createPost();

    expect(component.posts[0].id).toBe(4);
    expect(component.success).toContain('Post #4');
  });

  it('creates a local post on must exist fallback', () => {
    postsService.createPost.mockReturnValue(
      throwError(() => ({ error: [{ message: 'must exist' }] }))
    );
    postsService.createLocalPost.mockReturnValue(
      { id: 9000001, user_id: 7, user_name: 'Anna', title: 'Local', body: 'Body' }
    );
    component.postForm = { title: 'Local', body: 'Body' };

    component.createPost();

    expect(postsService.createLocalPost).toHaveBeenCalledWith({
      user_id: 7,
      user_name: 'Anna',
      title: 'Local',
      body: 'Body'
    });
    expect(component.posts[0].id).toBe(9000001);
    expect(component.success).toContain('Post locale #9000001');
  });
});
