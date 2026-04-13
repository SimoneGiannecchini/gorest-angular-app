# GorestAngularApp

Angular application based on the GoREST REST API.

## Authentication

The application is client-side only, in line with the course requirements.

- The login page accepts a personal access token generated on GoREST
- The token is stored in the browser and used as Bearer Token for protected requests
- Angular route guards protect the application pages from unauthenticated access
- If a protected API call returns `401` or `403`, the app logs out and sends the user back to login

## Resources used

Official GoREST documentation indicates these resources:

- `https://gorest.co.in/public/v2/users`
- `https://gorest.co.in/public/v2/posts`
- `https://gorest.co.in/public/v2/comments`
- `https://gorest.co.in/public/v2/todos`

In the current application:

- users are loaded from `https://gorest.in/public/v2`
- posts and comments use `https://gorest.co.in/public/v2`

This split was introduced because, during verification on March 14, 2026, the GoREST service returned inconsistent results across the two domains.

## Implemented features

- Login with personal GoREST token
- Protected Angular routes
- Users list with search, record count selection, pagination, add user and remove user
- User detail page with all available user fields
- User detail page with related posts and comments for each post
- New post creation from user detail
- Posts list with search, pagination and new post creation
- Comment viewing for each post
- Comment creation for each post

## Run locally

```bash
npm start
```

Open:

```text
http://localhost:4200
```

## Available scripts

```bash
npm start
npm run build
npm test
```

## Technical note about GoREST instability

On March 14, 2026, direct tests against GoREST showed the following behavior:

- `GET https://gorest.in/public/v2/users/1001` returned `200`
- `GET https://gorest.in/public/v2/posts` returned `Cannot GET /public/v2/posts`
- `GET https://gorest.co.in/public/v2/users/1001` returned `500`
- `POST https://gorest.co.in/public/v2/users/1001/posts` returned `500`

This means that some failures currently depend on the external GoREST service and not on the Angular frontend itself.

For this reason, the frontend:

- uses the documented endpoints where possible
- shows explicit messages when GoREST returns `500`
- keeps the application flow usable even when part of the external API is temporarily unavailable

## Evaluation note

The application structure, routing, authentication flow, forms, HTTP integration, UI pages and error handling were implemented according to the project requirements.

If post creation or post retrieval temporarily fail, the limitation is caused by the current availability of the GoREST service, as verified through direct external requests during development.
