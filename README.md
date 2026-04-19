# GoREST Angular App

Applicazione Angular per la gestione di utenti, post e commenti tramite le REST API di GoREST.

## 📖 Descrizione

Il progetto permette di autenticarsi con un token personale GoREST e di lavorare sulle principali risorse della piattaforma attraverso un'interfaccia moderna e responsive.

## ✅ Funzionalità principali

- Login con token GoREST  
- Visualizzazione e ricerca utenti  
- Creazione ed eliminazione utenti  
- Dettaglio utente con post e commenti  
- Creazione post e commenti  
- Visualizzazione e ricerca post globali  
- Logout con gestione sessione  

## 🔐 Login

Per accedere è necessario un token personale GoREST:

👉 https://gorest.co.in/consumer/login  

Il token viene utilizzato per:
- autenticazione  
- chiamate API tramite Bearer Token  

## 🛠️ Tecnologie utilizzate

- Angular  
- TypeScript  
- SCSS  
- Bootstrap  
- RxJS  
- GoREST REST API  

## 🧱 Architettura

- Lazy modules:
  - `auth`
  - `users`
  - `posts`
- Guard per protezione route  
- HTTP Interceptor per token  
- Servizi separati (users, posts, comments)  
- Componenti condivisi  

## 🚀 Setup del Progetto

### 📥 Clonare il progetto

```bash
git clone https://github.com/simonegiannecchini/gorest-angular-app.git
cd gorest-angular-app
📦 Installazione dipendenze
npm install
▶️ Avvio progetto
ng serve

Apri il browser su:

http://localhost:4200
🧪 Test
Esecuzione test unitari
npm test -- --watch=false
Coverage
npx ng test --watch=false --coverage
🚀 Deploy su GitHub Pages
Build produzione
npx ng build --configuration production --base-href /gorest-angular-app/
Applicazione online

👉 https://simonegiannecchini.github.io/gorest-angular-app/

⚠️ Note

Le API GoREST possono avere comportamenti instabili su alcuni endpoint.
L'applicazione gestisce gli errori mostrando messaggi chiari all'utente.

👨‍💻 Autore

Simone Giannecchini
