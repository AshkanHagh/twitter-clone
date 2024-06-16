import nodemailer from 'nodemailer';

type TMailOption = {
    subject : string,
    text : string,
    email : string,
    html : string
}

const sendEmail = async (option : TMailOption) : Promise<void> => {

    const transport = nodemailer.createTransport({
        host: process.env.SMTP_HOST, port: parseInt(process.env.SMTP_PORT || '587'), service : process.env.SMTP_SERVICE,
        auth: {
          user: process.env.SMTP_MAIL, pass: process.env.SMTP_PASSWORD
        }
    });

    const mailOption = {
        from : process.env.MAIL, to : option.email, subject : option.subject, html : option.html
    }

    await transport.sendMail(mailOption);
}

export default sendEmail;