import nodemailer from "nodemailer";

async function sendMail(to_email) {
  try {
    console.log(to_email)
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: "maddison53@ethereal.email",
        pass: "jn7jnAPss4f63QBp6D",
      },
    });
    const info = await transporter.sendMail({
      from: 'maddison53@ethereal.email',
      to: to_email,
      subject: "Hello ✔",
      text: "Hello world?",
      html: "<b>Hello world?</b>",
    });
    console.log("Message sent: %s", info);
  } catch (err) {
    console.log("error in send message", err);
  }
}
export default sendMail;
