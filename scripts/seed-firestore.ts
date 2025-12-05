// scripts/seed-firestore.ts
import admin from "firebase-admin";

const projectId = "studio-636794345-e4c0a";

// Inicializa o app com o ID do projeto, confiando nas credenciais do ambiente
if (admin.apps.length === 0) {
  admin.initializeApp({
    projectId: projectId,
  });
}

const db = admin.firestore();

async function main() {
  console.log(`Conectado ao projeto: ${projectId}`);
  // 1) Doc de configuração da campanha
  const campaignRef = db.doc("config/campaign");

  const snap = await campaignRef.get();
  if (!snap.exists) {
    await campaignRef.set({
      couponValueThreshold: 1000,
      campaignEndDate: "2025-12-31T23:59:59",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    console.log("✅ Documento 'config/campaign' criado com sucesso.");
  } else {
    console.log("ℹ️ Documento 'config/campaign' já existe, nenhuma ação foi tomada.");
  }

  // Adicione outras coleções/documentos para semear aqui, se necessário

  console.log("\nScript de seeding concluído.");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Erro ao semear o Firestore:", err);
  process.exit(1);
});
