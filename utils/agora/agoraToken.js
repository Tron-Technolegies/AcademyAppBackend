// utils/agoraTokenGenerator.js
import pkg from "agora-access-token";
const { RtcTokenBuilder, RtcRole } = pkg;

const generateAgoraToken = (channelName, userId, userRole = "subscriber") => {
  // 1. Validate environment variables
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  console.assert(appID, "AGORA_APP_ID is required");
  console.assert(appCertificate, "AGORA_APP_CERTIFICATE is required");

  // 2. Validate inputs
  if (!channelName?.trim()) {
    throw new Error(`Invalid channel name: ${channelName}`);
  }

  if (!userId?.trim()) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  // 3. Configure token
  const role =
    userRole.toLowerCase() === "instructor"
      ? RtcRole.PUBLISHER
      : RtcRole.SUBSCRIBER;

  const expireTime = 3600;
  const privilegeExpireTime = Math.floor(Date.now() / 1000) + expireTime;

  // 4. Generate token (using string UID approach)
  const token = RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appCertificate,
    channelName,
    userId.toString(),
    role,
    privilegeExpireTime
  );

  console.log("Generated Agora token:", {
    channelName,
    userId,
    role,
    tokenPreview: token.slice(0, 20) + "...",
  });

  return token;
};

export default generateAgoraToken;
