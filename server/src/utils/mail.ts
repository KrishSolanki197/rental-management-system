import nodemailer from "nodemailer";

const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  // port: process.env.SMTP_PORT,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

 const loginTime = new Date().toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });


export async function registerAlert(
  email: string,
  first_name: string,
  last_name: string,
): Promise<void> {
  await transport.sendMail({
    from: "Harminvp00",
    to: email,
    subject: "Hello, this is just testing mail from harminv00",

    html: `
    <body
        style="
          height: 100vh;
          background: rgba(255, 255, 255, 0.856);">
          
      <main style="padding: 10px 30px; margin: 0">
          <h1>Rental Management</h1>
          <h2>Welcome to the rental management</h2>

          Hello, <b> ${first_name} ${last_name} </b>
          <p>
            Your account created on RentPe Successfully with the email account <b> "${email}" </b>, if
            your do that then you can safely ignore this email, In case
            <mark> if you didn't know about the new account creation activity, </mark> then contact to our helpline for help. <br />
            <br />

            <p> Activity Time : ${loginTime} </p>

            Thank You! <br />
            <b> Team RentPe </b>
            </p>

            <p style="background: whitesmoke; padding: 10px 15px; border-radius: 10px">
               This is auto generated mail by system, <b> DO NOT REPLY </b> on this mail.
            </p>
      </main>
    </body>
    `,
  });
}


export async function loginAlert(
  email: string,
  username: string,
): Promise<void> {
  await transport.sendMail({
    from: "Harminvp00",
    to: email,
    subject: "Hello, this is just testing mail from harminv00",

    html: `
      <body
        style="
          height: 100vh;
          background: rgba(255, 255, 255, 0.856);">
          
        <main style="padding: 10px 30px; margin: 0">
          <h1>Rental Management</h1>
          <h2>Welcome to the rental management</h2>

          Hello, <b> ${username} </b>
          <p>
            Our system recieve login request from your email address <b> "${email}" </b>, if
            your do that then you can safely ignore this email, In case
            <mark> if you didn't know about the login activity, </mark> then reset
            your password or contact to our helpline for help. <br />
            <br />

            <p> Login Time : ${loginTime} </p>

            Thank You! <br />
            <b> Team RentPe </b>
            </p>

            <p style="background: whitesmoke; padding: 10px 15px; border-radius: 10px">
               This is auto generated mail by system, <b> DO NOT REPLY </b> on this mail.
            </p>
          </main>
        </body>
    `,
  });
}