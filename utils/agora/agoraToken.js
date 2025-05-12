// import pkg from "agora-access-token";
// const { RtcTokenBuilder, RtcRole } = pkg;

// const generateAgoraToken = (channelName, userId) => {
//   const appID = process.env.AGORA_APP_ID;
//   const appCertificate = process.env.AGORA_APP_CERTIFICATE;

//   console.log("App ID:", appID);
//   console.log("App Certificate:", appCertificate);
//   console.log("Channel Name:", channelName);
//   console.log("User ID:", userId);

//   if (!appID || !appCertificate) {
//     throw new Error(
//       "AGORA_APP_ID or AGORA_APP_CERTIFICATE is not defined in the environment variables"
//     );
//   }

//   if (!channelName || typeof channelName !== "string") {
//     throw new Error("Invalid channelName provided");
//   }

//   // Convert userId to a number (UID)
//   const uid = parseInt(userId, 10);
//   if (isNaN(uid)) {
//     throw new Error("Invalid userId provided. userId must be a valid number.");
//   }

//   const role = RtcRole.PUBLISHER; // or RtcRole.SUBSCRIBER
//   const expireTime = 3600; // Token expiry time in seconds

//   const currentTime = Math.floor(Date.now() / 1000); // Current Unix timestamp
//   const privilegeExpireTime = currentTime + expireTime; // Expiry time for the privilege

//   // Generate the token with the Agora SDK
//   const token = RtcTokenBuilder.buildTokenWithUid(
//     appID,
//     appCertificate,
//     channelName,
//     uid,
//     role,
//     privilegeExpireTime
//   );

//   console.log(`Generated token: ${token}`);
//   return token;
// };

// export default generateAgoraToken;

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
  const UID = parseInt(uidHash(userId));
  const token = RtcTokenBuilder.buildTokenWithUid(
    appID,
    appCertificate,
    channelName,
    UID,
    role,
    privilegeExpireTime
  );

  console.log("Generated Agora token:", {
    channelName,
    UID,
    role,
    tokenPreview: token.slice(0, 20) + "...",
  });

  return token;
};

export default generateAgoraToken;

export function uidHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash; // convert to 32bit integer
  }
  return Math.abs(hash % 1000000); // Ensure it's positive and not too large
}
