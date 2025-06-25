// lib/sendVerificationEmail.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendVerificationEmail(email: string, link: string) {
  return resend.emails.send({
    from: "Inlevor <noreply@inlevor.com.br>",
    to: [email],
    subject: "Confirme seu e-mail na Inlevor",
    html: `
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8" />
        <title>Confirme seu e-mail</title>
        <style>
          body { background: #f7fafc; font-family: Arial, sans-serif; }
          .container {
            max-width: 420px;
            margin: 36px auto;
            background: #fff;
            border-radius: 10px;
            box-shadow: 0 2px 10px #0001;
            padding: 32px 24px;
          }
          .logo {
            text-align: center;
            margin-bottom: 18px;
          }
          .btn {
            display: inline-block;
            padding: 12px 36px;
            background: #93c5fd;
            color: #fff;
            border-radius: 7px;
            font-weight: bold;
            font-size: 16px;
            text-decoration: none;
            margin: 28px 0 16px 0;
            transition: background .2s;
          }
          .btn:hover { background: #bfdbfe; }
          .footer {
            font-size: 13px;
            color: #999;
            margin-top: 22px;
            text-align: center;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="logo">
            <img src="https://inlevor.com.br/logo.png" alt="Inlevor" width="110" />
          </div>
          <h2 style="text-align:center;margin-bottom:16px;">Bem-vindo à Inlevor!</h2>
          <p>Para ativar sua conta, basta clicar no botão abaixo:</p>
          <div style="text-align:center;">
            <a href="${link}" class="btn" target="_blank" rel="noopener noreferrer">Verificar meu e-mail</a>
          </div>
          <p style="margin-top:20px;">
            Se você não solicitou este cadastro, ignore este e-mail.<br>
            <b>Dica:</b> Após clicar no botão, finalize o processo clicando em "Continue" na página aberta.
          </p>
          <div class="footer">
            &copy; ${new Date().getFullYear()} Inlevor
          </div>
        </div>
      </body>
      </html>
    `,
  });
}
