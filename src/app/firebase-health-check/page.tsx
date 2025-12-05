'use client';

import { useEffect } from "react";
import { collection, getDocs, limit, query } from "firebase/firestore";
import { db } from "@/firebase";

export default function FirebaseHealthCheck() {
  useEffect(() => {
    async function test() {
      try {
        const q = query(collection(db, "config"), limit(1));
        const snap = await getDocs(q);
        console.log("[FIREBASE TEST] OK, documentos em 'config':", snap.size);
      } catch (err) {
        console.error("[FIREBASE TEST] ERRO ao ler Firestore:", err);
      }
    }
    test();
  }, []);

  return <p>Verifique o console para o resultado do teste do Firebase.</p>;
}