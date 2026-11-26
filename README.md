# Mo2IT Technologies website

Plain HTML, CSS and JavaScript. No build step.

## 1. Preview on your computer
    python -m http.server 8000
Open http://localhost:8000 (double-clicking the files will not work).

## 2. Edit first
- `js/data.js`: phone, email, services and **prices (the current ones are examples)**
- `privacy.html`: check it matches how you really work
- `projects.html`: add projects later

## 3. Publish on GitHub Pages
1. Create a repository, for example `mo2it-website`.
2. Upload everything in this folder (index.html must be at the top level).
3. Repository Settings > Pages > Deploy from a branch > `main` / root.
4. Your site appears at `https://YOUR-USERNAME.github.io/mo2it-website/`.

GitHub Pages is meant for project and portfolio sites and restricts using it to run an online business
or process transactions. Check its current terms, and move to Firebase Hosting or similar when you grow.

## 4. Finish the Firebase setup (config already added)
Until you do this, sending from the quote and contact forms fails over to email or WhatsApp,
and client and admin login will not work.

1. console.firebase.google.com > open the `mo2it-technologies` project.
2. The web app config is in `js/firebase-config.js`.
3. Authentication > Sign-in method > enable **Email/Password**.
4. Authentication > Settings > Authorized domains > add `YOUR-USERNAME.github.io`.
5. Firestore Database > Create database (production mode).
6. Firestore > Rules > paste all of `firestore.rules` > **Publish**.

## 5. Create your admin
1. Authentication > Users > Add user (your admin email and a strong password).
2. Copy that user's **UID**.
3. Firestore > Start collection `admins` > document ID = the UID > add any field, e.g. `role: "admin"`.

Open the admin page by clicking the **footer logo 3 times** quickly.

The hidden click only keeps the link out of sight. Anyone who reads your code can find `admin.html`.
What protects client data is the password plus `firestore.rules`, so keep both in place.

## Later
- Anyone can send the public forms. Enable Firebase **App Check** if spam appears.
- There are no email alerts for new messages yet; check the admin page.
- Requests sent while signed out do not appear in a client's profile.
