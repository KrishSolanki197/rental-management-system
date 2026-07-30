
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  // port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});


export default async function send_register_mail(email:String): Promise<void> {
  await transport.sendMail({
    from: "Harminvp00",
    to: email,
    subject: "Hello, this is just testing mail from harminv00",

    html: `
        <h1> Data </h1>
        <p> New user created with mail id: ${email} </p>
    `,
  });
}
