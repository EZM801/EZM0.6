// This module is server-side only
import type { Transporter } from 'nodemailer';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

let nodemailer: typeof import('nodemailer');

// Dynamically import nodemailer only on the server side
if (typeof window === 'undefined') {
  nodemailer = require('nodemailer');
}

export async function sendEmail({ to, subject, html }: EmailOptions) {
  if (typeof window !== 'undefined') {
    throw new Error('sendEmail can only be called from the server side');
  }

  // Create a test account if we're in development
  const account = process.env.NODE_ENV === 'development'
    ? await nodemailer.createTestAccount()
    : null;

  // Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || (account ? 'smtp.ethereal.email' : undefined),
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER || (account ? account.user : undefined),
      pass: process.env.SMTP_PASS || (account ? account.pass : undefined),
    },
  });

  try {
    // Send the email
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM || '"EZM" <noreply@ezm.com>',
      to,
      subject,
      html,
    });

    if (account) {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Failed to send email:', error);
    throw new Error('Failed to send email');
  }
} 