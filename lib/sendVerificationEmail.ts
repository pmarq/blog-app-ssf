// lib/sendVerificationEmail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, link: string) {
  return resend.emails.send({
    from: "Inlevor <noreply@inlevor.com.br>", // ou onboarding@resend.dev para testes/dev
    to: [email],
    subject: "Confirme seu e-mail na Inlevor",
    html: `
      <h2>Bem-vindo à Inlevor!</h2>
      <p>Por favor, confirme seu e-mail clicando no link abaixo:</p>
      <a href="${link}" target="_blank" rel="noopener noreferrer">Verificar meu e-mail</a>
      <br/><br/>
      <small>Se você não solicitou este cadastro, ignore este e-mail.</small>
    `,
  });
}
