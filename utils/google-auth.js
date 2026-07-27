const { OAuth2Client } = require("google-auth-library");

let client = null;
function getClient() {
  if (!process.env.GOOGLE_CLIENT_ID) return null;
  if (!client) client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
  return client;
}

// Verifies a Google ID token sent from the browser and returns the
// verified email/name, or null if verification fails or isn't configured.
async function verifyGoogleToken(idToken) {
  const oauthClient = getClient();
  if (!oauthClient) return null;
  try {
    const ticket = await oauthClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID
    });
    const payload = ticket.getPayload();
    if (!payload || !payload.email) return null;
    return {
      googleId: payload.sub,
      email: payload.email,
      name: payload.name || payload.email.split("@")[0],
      emailVerified: !!payload.email_verified
    };
  } catch (err) {
    console.error("Google token verification failed:", err.message);
    return null;
  }
}

module.exports = { verifyGoogleToken };
