# GoREST Angular App

Applicazione Angular per la gestione di utenti, post e commenti tramite le REST API di [GoREST](https://gorest.co.in/).

---

## 📖 Descrizione

Il progetto permette di autenticarsi con un token personale GoREST e di lavorare sulle principali risorse della piattaforma attraverso un'interfaccia moderna e responsive.

### Funzionalità principali

- Login con token GoREST
- Visualizzazione e ricerca utenti
- Creazione ed eliminazione utenti
- Dettaglio utente con post e commenti
- Creazione post e commenti
- Visualizzazione e ricerca post globali
- Logout con gestione sessione

---

## 🔐 Login

Per accedere è necessario un token personale GoREST:

👉 https://gorest.co.in/consumer/login

Il token viene utilizzato per:
- autenticazione
- chiamate API tramite Bearer Token

---

## 🛠️ Tecnologie utilizzate

- Angular
- TypeScript
- SCSS
- Bootstrap
- RxJS
- GoREST REST API

---

## 🧱 Architettura

- Lazy modules:
  - `auth`
  - `users`
  - `posts`
- Guard per protezione route
- HTTP Interceptor per token
- Servizi separati (users, posts, comments)
- Componenti condivisi

---

# 🚀 Setup del Progetto

## 📥 Clonare il progetto

```bash
git clone https://github.com/simonegiannecchini/gorest-angular-app.git
cd gorest-angular-app


---

# 📦 Installazione dipendenze
```bash
npm install
---
