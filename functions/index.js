const { onCall } = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require('firebase-admin');
const nodemailer = require('nodemailer');

// Initialize Firebase Admin
admin.initializeApp();

// Securely access your Gmail credentials using Firebase Functions config
const gmailEmail = process.env.GMAIL_EMAIL || "support@subliva.com";
const gmailPassword = process.env.GMAIL_PASSWORD || "Subaru247$";

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: gmailEmail,
    pass: gmailPassword,
  },
});

// Firebase Functions v2 onCall example
exports.sendLeaseStatusEmail = onCall(async (request) => {
  const { email, status, leaseId, propertyId } = request.data;

  if (!email || !status || !leaseId || !propertyId) {
    throw new Error('Missing required parameters.');
  }

  let subject, text;
  if (status === 'approved') {
    subject = 'Lease Approved';
    text = `Dear Owner,\n\nYour lease (ID: ${leaseId}) for Property ID: ${propertyId} has been approved and is now live on our platform.\n\nThank you!`;
  } else if (status === 'rejected') {
    subject = 'Lease Rejected';
    text = `Dear Owner,\n\nUnfortunately, your lease (ID: ${leaseId}) for Property ID: ${propertyId} has been rejected.\n\nPlease check your submission and try again.\n\nThank you!`;
  } else {
    throw new Error('Invalid status');
  }

  const mailOptions = {
    from: gmailEmail,
    to: email,
    subject: subject,
    text: text,
  };

  try {
    await transporter.sendMail(mailOptions);
    logger.info(`Email sent to ${email} regarding lease ${status}.`);
    return { success: true };
  } catch (error) {
    logger.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
});
