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

export async function AuthEmailAlert(
  email: string,
  username: string,
  subject: string,
  content: string,
): Promise<void> {
  await transport.sendMail({
    from: "Harminvp00",
    to: email,
    subject: subject,

    html: `
    <body
        style="
          height: 100vh;
          background: rgba(255, 255, 255, 0.856);">
          
      <main style="padding: 10px 30px; margin: 0">
          <h1>Rental Management</h1>
          <h2>Welcome to the rental management</h2>

          Hello, <b> ${username} </b>

          ${content}

            <p> Activity Time : ${loginTime} </p>

            <p>
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

export async function OTPEmail(
  username: string,
  email: string,
  otp: string,
  subject: string,
): Promise<void> {
  // writing a email for the OTP send service,
  await transport.sendMail({
    from: "Harmin Vekariya",
    to: email,
    subject,
    html: `
      <body style="font-family: sans-serif; padding: 10px 30px;">
        <h1> OTP request received from your account </h1>

        <p> Dear, <b> ${username} </b> </p>

        <div>
          Our system has received an otp request from your account "${email}", with purpose of verify the emails and start exploring the <b> RentPe</b>.  
        </div>

        <br> <br>
        OTP code:
        <div style="">
          <p style="background: whitesmoke; width: 100px; font-size: 30px; text-align:center; padding: 10px 15px; border-radius: 10px; box-shadow: 0 0 1px #000;">
            <b>
              ${otp}
            </b>
          </p>
        </div>
        
        <b>
          OTP is valid upto 10 min after creation only!
        </b>
        <br> <br>

        <div> 
        If you was not request any OTP, you can safely ignore this mail and there is no trouble, <b> <mark> DO NOT SHARE THE OTP WITH ANYONE EVEN WITH US </mark> </b> also.
        </div>

        <p> Team <b> RentPe </b> </p>
        <p> Thank you! </p>
      </body>
    `,
  });
}
