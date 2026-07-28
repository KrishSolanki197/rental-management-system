
import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  // port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export default async function sendregistationmail() {
  await transport.sendMail({
    to: "harminv251@gmail.com",
    from: "vekariyaharmin96@gmail.com",
    subject: "Hello, this is just testing mail from harminv00",

    html: `
        <h1> Hello this is just a testing mail, do not response, website testing </h1>
    `,
  });
}
