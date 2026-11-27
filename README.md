# Mo2IT Technologies website

Plain HTML, CSS and JavaScript. No build step.

## 1. Preview on your computer
    python -m http.server 8000
Open http://localhost:8000 (double-clicking the files will not work).

## 2. Edit first
- `js/data.js`: phone and email. Change services and **prices (examples)** from the admin page.
- `privacy.html`: check it matches how you really work
- `terms.html` is a draft: have it checked

## 3. Publish on GitHub Pages
1. Create a repository, for example `mo2it-website`.
2. Upload everything in this folder (index.html must be at the top level).
3. Repository Settings > Pages > Deploy from a branch > `main` / root.
4. Your site appears at `https://YOUR-USERNAME.github.io/mo2it-website/`.

GitHub Pages is meant for project and portfolio sites and restricts using it to run an online business
or process transactions. Check its current terms, and move to Firebase Hosting or similar when you grow.

## 4. Finish the Firebase setup (project mo2it-technologies, config already added)
1. Authentication > Sign-in method > enable **Email/Password** and **Google** (pick a support email).
2. Authentication > Settings > Authorized domains > add `YOUR-USERNAME.github.io`.
   To test on your computer, `localhost` must be in that list too.
3. Firestore Database > Create database (production mode) if you have not.
4. Firestore > Rules > replace everything with `firestore.rules` > **Publish**. Do this again whenever the file changes.

## 5. Make someone an admin
1. The person needs a user: Authentication > Users (add them, or let them sign in once).
2. **Copy** their User UID. Do not retype it.
3. Firestore > `admins` collection > **Add document**.
4. **Document ID = the UID.** Field: `role`, type string, value `admin`. Save.

    admins (collection)
      iBhe...the full UID... (document ID)
        role: "admin"

To remove an admin, delete that document. If someone signs in on the admin page without being
an admin, the page shows their UID so you can copy it.

Open the admin page by clicking the **footer logo 3 times** quickly. That only hides the link;
the password and `firestore.rules` are what protect your data.

## Admin page
Dashboard (sign-ins, bookings, clients), Inbox (quotes, messages, chats), Services and prices,
Promotions, Projects, Mastery and FAQ. Pictures are shrunk and stored in Firestore.

Deleting every item in a list brings the starter content back for services, mastery and FAQ.

## Good to know
- Quotations are generated in the visitor's browser from the prices shown at the time. A copy
  downloaded by a client is not tamper-proof, so confirm prices against your own records.
- Sign-in counts are recorded by the visitor's browser, so treat them as a guide.
- Public forms can be spammed. Enable Firebase **App Check** if that happens.
- There are no email alerts yet; check the admin inbox.
- Requests sent while signed out do not appear in a client's profile.
