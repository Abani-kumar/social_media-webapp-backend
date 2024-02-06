import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config({
  path: "./.env",
});

const mailSender = async (email, title, body) => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      secure: true,
      host: process.env.MAIL_HOST,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    let info = await transporter.sendMail({
      from: "ChitChat",
      to: `${email}`,
      subject: `${title}`,
      html: `${body}`,
    });
   
    return info;
  } catch (error) {
    console.error("error in mailSending", error.message);
  }
};

export default mailSender;
