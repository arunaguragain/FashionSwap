import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

dotenv.config();

const EMAIL_PASS = process.env.EMAIL_PASS || process.env.SMTP_PASS;
const EMAIL_USER = process.env.EMAIL_USER || process.env.SMTP_USER;
const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const EMAIL_FROM = process.env.EMAIL_FROM || EMAIL_USER || 'noreply@fashionswap.com';

export const transporter = SENDGRID_API_KEY
    ? nodemailer.createTransport({
        host: 'smtp.sendgrid.net',
        port: 587,
        secure: false,
        auth: {
            user: 'apikey',
            pass: SENDGRID_API_KEY,
        },
    })
    : nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: EMAIL_USER,
            pass: EMAIL_PASS,
        },
    });

export const sendEmail = async (to: string, subject: string, html: string) => {
    if (SENDGRID_API_KEY) {
        if (!EMAIL_FROM) {
            console.log('Skipping email send: email sender not configured');
            return;
        }
    } else if (!EMAIL_USER || !EMAIL_PASS) {
        console.log('Skipping email send: email credentials not configured');
        return;
    }

    const mailOptions = {
        from: `FashionSwap <${EMAIL_FROM}>`,
        to,
        subject,
        html,
    };

    await transporter.sendMail(mailOptions);
}