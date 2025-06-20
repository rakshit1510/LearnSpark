import nodemailer from 'nodemailer';

const mailSender = async(email,title,body)=>{
    
    try {

        const transporter = nodemailer.createTransport({
            host: 	"smtp.gmail.com",
            port: 465,
            secure: true,

            auth: {
                user: "gargrakshit10@gmail.com",
                pass:"lvoamjnpkkntirdk",
            },
        });
        // console.log('Mail transporter created successfully.');
        // console.log(transporter);
        const info = await transporter.sendMail({
            from: "LearnSpark",
            to: email, // list of receivers
            subject: title, // Subject line
            html: body, // html body
        });
        console.log('Creating mail transporter...');

        return info;
        
    } catch (error) {
        console.error('Error creating mail transporter:', error);
        throw error; // Rethrow the error after logging
    }
}
export default mailSender;