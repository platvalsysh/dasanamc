import nodemailer from 'nodemailer';
import { prisma } from '@repo/database';

export async function sendEmail({
  to,
  subject,
  html,
}: {
  to: string | string[];
  subject: string;
  html: string;
}) {
  const configs = await prisma.configs.findMany({
    where: {
      scope: 'core',
      key: { in: ['smtp_host', 'smtp_port', 'smtp_user', 'smtp_password', 'smtp_secure', 'smtp_sender'] },
    },
  });

  const configMap = configs.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {} as Record<string, any>);

  const host = configMap.smtp_host || process.env.SMTP_HOST;
  const port = Number(configMap.smtp_port || process.env.SMTP_PORT || 587);
  const user = configMap.smtp_user || process.env.SMTP_USER;
  const pass = configMap.smtp_password || process.env.SMTP_PASSWORD;
  const secure = configMap.smtp_secure === true || process.env.SMTP_SECURE === 'true';
  const from = configMap.smtp_sender || process.env.SMTP_SENDER || '"SNU Chemical Engineering" <noreply@example.com>';

  if (!host || !user || !pass) {
    console.warn('SMTP configuration not found, skipping email send.');
    return;
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });

  await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
}
