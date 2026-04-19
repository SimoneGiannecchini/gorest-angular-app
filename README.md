# GoREST Angular App

Applicazione Angular per la gestione di utenti, post e commenti tramite le REST API di [GoREST](https://gorest.co.in/).

## Descrizione

Il progetto permette di autenticarsi con un token personale GoREST e di lavorare sulle principali risorse della piattaforma attraverso un'interfaccia moderna e responsive.

L'applicazione consente di:

- effettuare il login con token personale GoREST
- visualizzare e cercare utenti
- creare ed eliminare utenti
- aprire il dettaglio di un utente
- visualizzare i post dell'utente selezionato
- visualizzare e inserire commenti
- visualizzare tutti i post presenti a sistema
- cercare i post
- creare nuovi post
- effettuare il logout

## Login

Per il login è necessario utilizzare un token personale generato su GoREST:

[https://gorest.co.in/consumer/login](https://gorest.co.in/consumer/login)

Il token viene utilizzato per:

- la gestione della sessione nell'applicazione Angular
- l'invocazione delle REST API tramite HTTP Bearer Token

## Funzionalità implementate

### Pagina principale - Elenco utenti

- visualizzazione degli utenti con informazioni base
- ricerca per nome o email
- scelta del numero di record visualizzati
- creazione di un nuovo utente
- eliminazione di un utente
- accesso al dettaglio utente

### Pagina dettaglio utente

- visualizzazione di tutte le informazioni disponibili dell'utente
- elenco dei post associati all'utente
- visualizzazione dei commenti relativi a ogni post
- inserimento di nuovi commenti
- creazione di nuovi post associati all'utente

### Elenco post

- visualizzazione di tutti i post presenti a sistema
- ricerca per titolo
- visualizzazione dei commenti di ogni post
- inserimento di nuovi commenti
- creazione di nuovi post

### Logout

- rimozione della sessione
- ritorno alla schermata di login

## Tecnologie utilizzate

- Angular
- TypeScript
- SCSS
- Bootstrap
- RxJS
- GoREST REST API

## Architettura

Il progetto è organizzato in sezioni lazy loaded:

- `auth`
- `users`
- `posts`

Sono inoltre presenti:

- `guard` per protezione delle route
- `interceptor` per Bearer Token
- servizi dedicati per utenti, post e commenti
- componenti condivisi

# 🚀 Setup del Progetto

Segui questi passaggi per scaricare ed eseguire il progetto in locale.

---

## 📥 Scaricare il progetto

### 🔽 Metodo 1 — Download ZIP (rapido)

1. Vai su GitHub nella pagina del repository  
2. Clicca su **"Code"**  
3. Seleziona **"Download ZIP"**  
4. Estrai il file sul tuo computer  

---

### 💻 Metodo 2 — Clonare con Git (consigliato)

```bash
git clone https://github.com/username/nome-repo.git
cd nome-repo

## Test

Esecuzione test unitari: `npm test -- --watch=false`

Esecuzione coverage: `npx ng test --watch=false --coverage`

Coverage attuale superiore al requisito minimo del 60%.

## Deploy su GitHub Pages

Build per GitHub Pages: `npx ng build --configuration production --base-href /gorest-angular-app/`

L'applicazione è configurata con routing hash per evitare errore 404 al refresh delle pagine su GitHub Pages.

URL del progetto pubblicato: [https://simonegiannecchini.github.io/gorest-angular-app/](https://simonegiannecchini.github.io/gorest-angular-app/)

## Note

Le API GoREST possono mostrare comportamenti non sempre stabili su alcuni endpoint. Per questo il progetto gestisce gli errori in modo esplicito e mostra messaggi chiari all'utente.

## Autore

Simone Giannecchini



