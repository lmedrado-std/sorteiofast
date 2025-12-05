'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';

let firebaseApp: FirebaseApp;

const isEmulator = process.env.NEXT_PUBLIC_USE_EMULATOR === 'true';

if (getApps().length === 0) {
  firebaseApp = initializeApp(firebaseConfig);
  console.log("[FIREBASE] App inicializado com projeto:", firebaseConfig.projectId);
} else {
  firebaseApp = getApp();
  console.log("[FIREBASE] App reaproveitado:", firebaseApp.name);
}

export const auth = getAuth(firebaseApp);
export const db = getFirestore(firebaseApp);

if (isEmulator) {
    console.log("[FIREBASE] Conectando ao emulador local...");
    connectFirestoreEmulator(db, 'localhost', 8080);
    connectAuthEmulator(auth, 'http://localhost:9099');
}

onAuthStateChanged(auth, (user) => {
  console.log("[FIREBASE AUTH] usuário atual:", user ? user.uid : "nenhum");
});

export { firebaseApp };
export * from './non-blocking-updates';
