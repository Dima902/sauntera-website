const { onRequest } = require("firebase-functions/v2/https");
const nodemailer = require("nodemailer");

exports.contactForm = onRequest(
  {
    secrets: ["SMTP_USER", "SMTP_PASS"],
    region: "us-central1",
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const { name, email, _subject, message } = req.body;

    if (!name || !email || !message) {
      res.status(400).send("Missing required fields");
      return;
    }

    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASS;

    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    try {
      await transporter.sendMail({
        from: `"Sauntera Contact Form" <${smtpUser}>`,
        replyTo: email,
        to: "dev@sauntera.com",
        subject: _subject || "Contact Form Submission",
        text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
        html: `<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
<hr/>
<p>${message.replace(/\n/g, "<br/>")}</p>`,
      });

      res.redirect(303, "/thank-you.html");
    } catch (error) {
      console.error("Email send error:", error);
      res.status(500).send("Failed to send message. Please try again later.");
    }
  }
);
