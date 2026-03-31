import type { VercelRequest, VercelResponse } from "@vercel/node";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env["EMAIL_USER"] ?? "",
    pass: process.env["EMAIL_PASSWORD"] ?? "",
  },
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  const { firstName, lastName, email, company, interest, message } = req.body;

  if (!firstName || !lastName || !email) {
    res.status(400).json({ error: "First name, last name, and email are required." });
    return;
  }

  const htmlBody = `
    <h2>New Contact Form Submission</h2>
    <table style="border-collapse:collapse;width:100%;max-width:600px;">
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Name</td><td style="padding:8px;border-bottom:1px solid #eee;">${firstName} ${lastName}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Email</td><td style="padding:8px;border-bottom:1px solid #eee;">${email}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Company</td><td style="padding:8px;border-bottom:1px solid #eee;">${company || "N/A"}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Interest</td><td style="padding:8px;border-bottom:1px solid #eee;">${interest || "N/A"}</td></tr>
      <tr><td style="padding:8px;font-weight:bold;border-bottom:1px solid #eee;">Message</td><td style="padding:8px;border-bottom:1px solid #eee;">${message || "N/A"}</td></tr>
    </table>
  `;

  const textBody = [
    `Name: ${firstName} ${lastName}`,
    `Email: ${email}`,
    `Company: ${company || "N/A"}`,
    `Interest: ${interest || "N/A"}`,
    `Message: ${message || "N/A"}`,
  ].join("\n");

  const fromEmail = process.env["EMAIL_FROM"] ?? process.env["EMAIL_USER"] ?? "";
  const toEmail = process.env["EMAIL_TO"] ?? "info@goai.solutions";

  try {
    await transporter.sendMail({
      from: `"goAI Website" <${fromEmail}>`,
      to: toEmail,
      replyTo: email,
      subject: `New Contact: ${firstName} ${lastName} — ${interest || "General Inquiry"}`,
      text: textBody,
      html: htmlBody,
    });

    res.status(200).json({ success: true, message: "Email sent successfully." });
  } catch {
    res.status(500).json({ error: "Failed to send email. Please try again later." });
  }
}
