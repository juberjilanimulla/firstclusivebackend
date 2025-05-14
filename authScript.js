// authScript.js
import fs from "fs";
import readline from "readline";
import { google } from "googleapis";

// Load your OAuth 2.0 credentials from credentials.json
const credentials = JSON.parse(fs.readFileSync("credentials.json"));
const { client_secret, client_id, redirect_uris } = credentials.installed;

const oAuth2Client = new google.auth.OAuth2(
  client_id,
  client_secret,
  redirect_uris[0]
);

// Define the scopes required for Google Drive
const SCOPES = ["https://www.googleapis.com/auth/drive"];

const authUrl = oAuth2Client.generateAuthUrl({
  access_type: "offline",
  scope: SCOPES,
});

console.log(" Visit this URL to authorize access:");
console.log(authUrl);

// Ask user for the authorization code
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question("Paste the code here ", async (code) => {
  try {
    const { tokens } = await oAuth2Client.getToken(code);
    oAuth2Client.setCredentials(tokens);
    fs.writeFileSync("token.json", JSON.stringify(tokens));
    console.log(" Token saved to token.json");
    rl.close();
  } catch (err) {
    console.error("Error getting token", err);
    rl.close();
  }
});

// authScript.js
// import fs from "fs";
// import path from "path";
// import readline from "readline";
// import { google } from "googleapis";

// // Load OAuth 2.0 credentials
// const credentials = JSON.parse(fs.readFileSync("credentials.json"));
// const { client_secret, client_id, redirect_uris } = credentials.installed;

// // Set up the OAuth2 client
// const oAuth2Client = new google.auth.OAuth2(
//   client_id,
//   client_secret,
//   redirect_uris[0]
// );

// // Define scope
// const SCOPES = ["https://www.googleapis.com/auth/drive"];

// // Generate auth URL
// const authUrl = oAuth2Client.generateAuthUrl({
//   access_type: "offline",
//   scope: SCOPES,
// });

// console.log("Visit this URL to authorize the app:\n");
// console.log(authUrl);

// // Get the code from user input
// const rl = readline.createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// rl.question("Paste the code here: ", async (code) => {
//   try {
//     // Exchange code for tokens
//     const { tokens } = await oAuth2Client.getToken(code);
//     oAuth2Client.setCredentials(tokens);

//     // Save tokens for future use
//     fs.writeFileSync("token.json", JSON.stringify(tokens));
//     console.log("Token saved to token.json");

//     // Start Drive API with authenticated client
//     const drive = google.drive({ version: "v3", auth: oAuth2Client });

//     // Prepare file metadata and media content
//     const fileMetadata = {
//       name: "myresume.pdf", // change to your actual filename
//     };

//     const media = {
//       mimeType: "application/pdf",
//       body: fs.createReadStream(path.join(__dirname, "myresume.pdf")),
//     };

//     // Upload file
//     const response = await drive.files.create({
//       resource: fileMetadata,
//       media: media,
//       fields: "id",
//     });

//     console.log(`File uploaded successfully! File ID: ${response.data.id}`);
//     rl.close();
//   } catch (err) {
//     console.log("Error during auth or upload:", err.message);
//     rl.close();
//   }
// });
