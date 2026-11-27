// Everything that talks to Firebase lives in this file.
import { firebaseConfig } from './firebase-config.js';

export const configured = Boolean(firebaseConfig.apiKey && firebaseConfig.projectId);
const SDK = 'https://www.gstatic.com/firebasejs/10.12.2/';
let ready;

export function backend() {
  if (!configured) return Promise.reject(new Error('Firebase is not connected yet.'));
  return ready ||= (async () => {
    const [{ initializeApp }, A, F] = await Promise.all(
      ['app', 'auth', 'firestore'].map(m => import(`${SDK}firebase-${m}.js`)));
    const app = initializeApp(firebaseConfig);
    const auth = A.getAuth(app), db = F.getFirestore(app);
    const now = F.serverTimestamp;
    const rows = s => s.docs.map(d => ({ ...d.data({ serverTimestamps: 'estimate' }), id: d.id }));
    const byNewest = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);
    const watch = (name, order, cb, fail) => F.onSnapshot(
      F.query(F.collection(db, name), F.orderBy(order, 'desc'), F.limit(500)), s => cb(rows(s)), fail);
    // Creates the client profile the first time, and counts every sign-in after that.
    async function recordLogin(user, extra = {}) {
      const ref = F.doc(db, 'profiles', user.uid), seen = await F.getDoc(ref);
      const stamp = { lastLogin: now(), logins: F.increment(1), updatedAt: now() };
      if (seen.exists()) return F.setDoc(ref, stamp, { merge: true });
      return F.setDoc(ref, { name: (extra.name || user.displayName || '').slice(0, 100), phone: (extra.phone || '').slice(0, 20),
        company: '', email: user.email, provider: user.providerData[0]?.providerId || 'password', createdAt: now(), ...stamp });
    }
    const counted = async (user, extra) => { try { await recordLogin(user, extra); } catch (err) { console.warn('Sign-in not recorded', err); } };
    const googleSignIn = () => {
      const p = new A.GoogleAuthProvider(); p.setCustomParameters({ prompt: 'select_account' });
      return A.signInWithPopup(auth, p);
    };

    return {
      onUser: cb => A.onAuthStateChanged(auth, cb),
      currentUser: async () => { await auth.authStateReady(); return auth.currentUser; },
      async login(email, pw) { const r = await A.signInWithEmailAndPassword(auth, email, pw); await counted(r.user); return r; },
      async google() { const r = await googleSignIn(); await counted(r.user); return r; },
      adminLogin: (email, pw) => A.signInWithEmailAndPassword(auth, email, pw),
      adminGoogle: googleSignIn,
      logout: () => A.signOut(auth),
      reset: email => A.sendPasswordResetEmail(auth, email),
      async register({ name, phone, email, password }) {
        const { user } = await A.createUserWithEmailAndPassword(auth, email, password);
        await counted(user, { name, phone });
      },
      getProfile: async uid => (await F.getDoc(F.doc(db, 'profiles', uid))).data(),
      saveProfile: (uid, p) => F.setDoc(F.doc(db, 'profiles', uid), { ...p, updatedAt: now() }, { merge: true }),
      isAdmin: async uid => (await F.getDoc(F.doc(db, 'admins', uid))).exists(),

      createRequest: async data => {
        await auth.authStateReady();
        return F.addDoc(F.collection(db, 'requests'),
          { ...data, uid: auth.currentUser?.uid || null, status: 'new', createdAt: now() });
      },
      myRequests: async uid => rows(await F.getDocs(
        F.query(F.collection(db, 'requests'), F.where('uid', '==', uid)))).sort(byNewest),
      watchRequests: (cb, fail) => watch('requests', 'createdAt', cb, fail),
      setStatus: (id, status) => F.updateDoc(F.doc(db, 'requests', id), { status }),
      deleteRequest: id => F.deleteDoc(F.doc(db, 'requests', id)),
      watchProfiles: (cb, fail) => F.onSnapshot(F.query(F.collection(db, 'profiles'), F.limit(1000)), s => cb(rows(s)), fail),

      // Site content: services, projects, promotions, mastery, faqs
      list: async name => rows(await F.getDocs(F.collection(db, name))),
      watchList: (name, cb, fail) => F.onSnapshot(F.collection(db, name), s => cb(rows(s)), fail),
      save(name, id, data) {
        const ref = id ? F.doc(db, name, id) : F.doc(F.collection(db, name));
        return F.setDoc(ref, { ...data, updatedAt: now() }, { merge: true });
      },
      remove: (name, id) => F.deleteDoc(F.doc(db, name, id)),
      seed(name, items) {
        const batch = F.writeBatch(db);
        items.forEach(({ id, ...data }) => batch.set(F.doc(db, name, id), data));
        return batch.commit();
      },

      watchThreads: (cb, fail) => watch('threads', 'updatedAt', cb, fail),
      watchMessages: (uid, cb, fail) => F.onSnapshot(
        F.query(F.collection(db, 'threads', uid, 'messages'), F.orderBy('createdAt', 'desc'), F.limit(200)),
        s => cb(rows(s).reverse()), fail),
      // from is 'client' or 'admin'. The rules reject anything else.
      async sendMessage(uid, text, from, who) {
        const batch = F.writeBatch(db), thread = F.doc(db, 'threads', uid);
        batch.set(F.doc(F.collection(thread, 'messages')), { text, from, createdAt: now() });
        batch.set(thread, { ...(who || {}), lastMessage: text.slice(0, 120), unread: from === 'client', updatedAt: now() }, { merge: true });
        await batch.commit();
      },
      markRead: uid => F.updateDoc(F.doc(db, 'threads', uid), { unread: false })
    };
  })();
}
