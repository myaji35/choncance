/**
 * Email sending utility for ChonCance
 *
 * To use in production, install and configure an email service:
 *
 * Option 1: SendGrid (recommended)
 * npm install @sendgrid/mail
 * SENDGRID_API_KEY=your_api_key
 *
 * Option 2: Resend (modern alternative)
 * npm install resend
 * RESEND_API_KEY=your_api_key
 *
 * Option 3: Nodemailer (self-hosted SMTP)
 * npm install nodemailer
 */

export interface EmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
}

export async function sendEmail(options: EmailOptions): Promise<boolean> {
  try {
    // Development mode: Log email instead of sending
    if (process.env.NODE_ENV !== "production") {
      console.log("📧 Email would be sent (dev mode):");
      console.log("To:", options.to);
      console.log("Subject:", options.subject);
      console.log("HTML:", options.html.substring(0, 200) + "...");
      return true;
    }

    // Production mode: Use configured email service
    const emailService = process.env.EMAIL_SERVICE || "sendgrid";

    switch (emailService) {
      case "sendgrid":
        return await sendWithSendGrid(options);
      case "resend":
        return await sendWithResend(options);
      case "nodemailer":
        return await sendWithNodemailer(options);
      default:
        console.warn(`Unknown email service: ${emailService}`);
        return false;
    }
  } catch (error) {
    console.error("Email sending error:", error);
    return false;
  }
}

// SendGrid implementation
async function sendWithSendGrid(options: EmailOptions): Promise<boolean> {
  try {
    // Uncomment when SendGrid is installed:
    /*
    const sgMail = require('@sendgrid/mail');
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);

    await sgMail.send({
      from: process.env.EMAIL_FROM || 'noreply@choncance.com',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    */

    console.log("SendGrid email would be sent:", options.subject);
    return true;
  } catch (error) {
    console.error("SendGrid error:", error);
    return false;
  }
}

// Resend implementation
async function sendWithResend(options: EmailOptions): Promise<boolean> {
  try {
    // Uncomment when Resend is installed:
    /*
    const { Resend } = require('resend');
    const resend = new Resend(process.env.RESEND_API_KEY);

    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'ChonCance <noreply@choncance.com>',
      to: Array.isArray(options.to) ? options.to : [options.to],
      subject: options.subject,
      html: options.html,
    });
    */

    console.log("Resend email would be sent:", options.subject);
    return true;
  } catch (error) {
    console.error("Resend error:", error);
    return false;
  }
}

// Nodemailer implementation
async function sendWithNodemailer(options: EmailOptions): Promise<boolean> {
  try {
    // Uncomment when Nodemailer is installed:
    /*
    const nodemailer = require('nodemailer');

    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: process.env.SMTP_PORT,
      secure: true,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: process.env.EMAIL_FROM || 'noreply@choncance.com',
      to: Array.isArray(options.to) ? options.to.join(',') : options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    });
    */

    console.log("Nodemailer email would be sent:", options.subject);
    return true;
  } catch (error) {
    console.error("Nodemailer error:", error);
    return false;
  }
}
