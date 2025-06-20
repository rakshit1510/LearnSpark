import nodemailer from 'nodemailer';

const mailSender = async(email,title,body)=>{
    
    try {
        
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: process.env.SMTP_SECURE === 'true',
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });

        const info = await transporter.sendMail({
            from: `"LearnSpark" <${process.env.MAIL_USER}>`, // sender address
            to: email, // list of receivers
            subject: title, // Subject line
           html: body, // html body
        });

        return info;
        
    } catch (error) {
        console.error('Error creating mail transporter:', error);
        throw error; // Rethrow the error after logging
    }
}
export default mailSender;