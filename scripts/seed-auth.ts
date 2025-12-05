// scripts/seed-auth.ts
import admin from "firebase-admin";
import fs from "fs";

const serviceAccount = JSON.parse(
  fs.readFileSync("serviceAccountKey.json", "utf-8")
);

if (admin.apps.length === 0) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

const auth = admin.auth();

async function main() {
  // Admin global
  const email = "admin@supersorteios.com";
  const password = "SenhaForte123!";

  // verifica se existe
  let user;
  try {
    user = await auth.getUserByEmail(email);
    console.log("ℹ️ Usuário admin já existe:", user.uid);
  } catch {
    user = await auth.createUser({ email, password, displayName: "Admin Global" });
    console.log("✅ Usuário admin criado:", user.uid);
  }

  // seta custom claim de admin
  await auth.setCustomUserClaims(user.uid, { admin: true });
  console.log("✅ Claim de admin aplicada.");

  process.exit(0);
}

main().catch((err) => {
  console.error("Erro ao criar usuários:", err);
  process.exit(1);
});