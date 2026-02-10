// server/utils/mailer.js
require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Setup mail transporter
 * 
 * You MUST set these in your .env:
 *
 * SMTP_HOST=smtp.gmail.com
 * SMTP_PORT=587
 * SMTP_USER=yourgmail@gmail.com
 * SMTP_PASS=your_app_password   (Not your gmail password)
 * 
 * For Gmail: enable 2FA and create an "App Password".
 */

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends order delivered email
 * @param {string} toEmail
 * @param {object} order
 */
async function sendOrderDeliveredEmail(toEmail, order) {
  const subject = `Your Order #${order._id} has been delivered!`;
  const html = `
    <h2>Order Delivered 🎉</h2>
    <p>Hello,</p>
    <p>Your order <strong>#${order._id}</strong> has been delivered successfully.</p>
    <p><strong>Total Amount:</strong> ₹${order.totalAmount}</p>
    <p><strong>Items:</strong></p>
    <ul>
      ${order.items.map(item => `<li>${item.title} (x${item.quantity})</li>`).join("")}
    </ul>
    <p>Thank you for shopping with <strong>ElectroMart</strong>!</p>
    <br/>
    <p>Regards,</p>
    <p><strong>ElectroMart Team</strong></p>
  `;

  try {
    await transporter.sendMail({
      from: `ElectroMart <${process.env.SMTP_USER}>`,
      to: toEmail,
      subject,
      html,
    });

    console.log(`📧 Delivery email sent to ${toEmail}`);
  } catch (err) {
    console.error("Failed to send email:", err);
  }
}

module.exports = {
  sendOrderDeliveredEmail,
};
