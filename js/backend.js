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
    const rows = s => s.docs.map(d => ({ id: d.id, ...d.data({ serverTimestamps: 'estimate' }) }));
    const byNewest = (a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0);

    return {
      onUser: cb => A.onAuthStateChanged(auth, cb),
      currentUser: async () => { await auth.authStateReady(); return auth.currentUser; },
      login: (email, pw) => A.signInWithEmailAndPassword(auth, email, pw),
      logout: () => A.signOut(auth),
      reset: email => A.sendPasswordResetEmail(auth, email),
      async register({ name, phone, email, password }) {
        const { user } = await A.createUserWithEmailAndPassword(auth, email, password);
        await this.saveProfile(user.uid, { name, phone, company: '', email: user.email });
      },
      getProfile: async uid => (await F.getDoc(F.doc(db, 'profiles', uid))).data(),
      saveProfile: (uid, p) => F.setDoc(F.doc(db, 'profiles', uid), { ...p, updatedAt: now() }),
      isAdmin: async uid => (await F.getDoc(F.doc(db, 'admins', uid))).exists(),

      createRequest: async data => {
        await auth.authStateReady();
        return F.addDoc(F.collection(db, 'requests'),
          { ...data, uid: auth.currentUser?.uid || null, status: 'new', createdAt: now() });
      },
      myRequests: async uid => rows(await F.getDocs(
        F.query(F.collection(db, 'requests'), F.where('uid', '==', uid)))).sort(byNewest),
      watchRequests: (cb, fail) => F.onSnapshot(
        F.query(F.collection(db, 'requests'), F.orderBy('createdAt', 'desc'), F.limit(200)), s => cb(rows(s)), fail),
      setStatus: (id, status) => F.updateDoc(F.doc(db, 'requests', id), { status }),
      deleteRequest: id => F.deleteDoc(F.doc(db, 'requests', id)),

      watchThreads: (cb, fail) => F.onSnapshot(
        F.query(F.collection(db, 'threads'), F.orderBy('updatedAt', 'desc'), F.limit(200)), s => cb(rows(s)), fail),
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
