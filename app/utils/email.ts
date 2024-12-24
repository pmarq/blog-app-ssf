import nodemailer from "nodemailer";

// Configuração do Mailtrap
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS,
  },
});

export const sendVerificationEmail = async (
  email: string,
  verificationLink: string
) => {
  const mailOptions = {
    from: '"Your App" <no-reply@yourapp.com>',
    to: email,
    subject: "Verify your email",
    text: `Click the link to verify your email: ${verificationLink}`,
    html: `<p>Click the link to verify your email:</p><a href="${verificationLink}">${verificationLink}</a>`,
  };

  await transporter.sendMail(mailOptions);
};
