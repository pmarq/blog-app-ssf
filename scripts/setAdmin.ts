// scripts/setAdmin.ts

const { admin } = require("../firebase/server");

async function setAdminClaims() {
  const emailsString = process.env.ADMIN_EMAILS;
  if (!emailsString) {
    throw new Error("ADMIN_EMAILS não está definido no .env");
  }

  const emails = emailsString.split(",").map((e) => e.trim());

  for (const email of emails) {
    try {
      const user = await admin.auth().getUserByEmail(email);
      await admin.auth().setCustomUserClaims(user.uid, { admin: true });
      console.log(`✅ Admin claim aplicada para: ${email}`);
    } catch (error) {
      console.error(`❌ Erro ao aplicar claim para ${email}:`, error);
    }
  }
}

setAdminClaims();
