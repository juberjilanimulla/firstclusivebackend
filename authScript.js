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
