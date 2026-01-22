const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.onNewLead = functions.firestore
    .document("leads/{leadId}")
    .onCreate(async (snap, context) => {
        const newVal = snap.data();
        const name = newVal.name;
        const email = newVal.email;
        const service = newVal.service;

        console.log(`New lead received: ${name} (${email}) for ${service}`);

        // TODO: Implement email sending logic using Nodemailer or Firebase Extensions
        // Example: await sendEmail(email, "Welcome", "Thanks for contacting us!");

        return null;
    });
