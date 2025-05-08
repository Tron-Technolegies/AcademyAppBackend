import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

const generateAgoraToken = (channelName, userId) => {
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  console.log("App ID:", appID);
  console.log("App Certificate:", appCertificate);
  console.log("Channel Name:", channelName);
  console.log("User ID:", userId);

  if (!appID || !appCertificate) {
    throw new Error(
      "AGORA_APP_ID or AGORA_APP_CERTIFICATE is not defined in the environment variables"
    );
  }

  if (!channelName || typeof channelName !== "string") {
    throw new Error("Invalid channelName provided");
  }

  // Convert userId to a number (UID)
  const uid = parseInt(userId, 10);
  if (isNaN(uid)) {
    throw new Error("Invalid userId provided. userId must be a valid number.");
  }

  const role = RtcRole.PUBLISHER; // or RtcRole.SUBSCRIBER
  const expireTime = 3600; // Token expiry time in seconds

  const currentTime = Math.floor(Date.now() / 1000); // Current Unix timestamp
  const privilegeExpireTime = currentTime + expireTime; // Expiry time for the privilege

  // Generate the token with the Agora SDK
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    uid,
    role,
    privilegeExpireTime
  );

  console.log(`Generated token: ${token}`);
  return token;
};

export default generateAgoraToken;
