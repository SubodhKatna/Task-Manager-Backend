const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    service: "gmail",
    host: "smtp.gmail.com",
    auth: {
        user: process.env.SEND_MAIL_GMAIL_ACCOUNT,
        pass: process.env.SEND_MAIL_GMAIL_ACCOUNT_PASSWORD,
    },
});

const sendEmail = async (to, subject, html) => {
    try {
        const info = await transporter.sendMail({
            from: '"Task Management Tool" <cloudfile2024@gmail.com>',
            to,
            subject,
            html,
        });
        console.log("Email sent:", info.response);
        return true;
    } catch (err) {
        console.error("Error occurred in sendEmail:", err);
        return false;
    }
};



const sendOtpEmail = async (email, otp) => {
    console.log(`Generated OTP: ${otp}`);
    const isEmailSent = await sendEmail(
        email,
        "OTP verification from Task Management Tool",
        `<p>Your OTP is <span style="color:brown">${otp}</span></p>`
    );
    return isEmailSent;
};

const sendReminderMail = async (email, task) => {
    const isEmailSent = await sendEmail(email, "Task Reminder", `<p>Your task is pending ${task}</p>`);
    return isEmailSent;
};

module.exports = {
    sendOtpEmail,
    sendReminderMail,
};
