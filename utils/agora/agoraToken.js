import pkg from "agora-access-token";
import { BadRequestError } from "../../errors/customErrors.js";
const { RtcTokenBuilder, RtcRole } = pkg;

const generateAgoraToken = (channelName, userId, userRole = "subscriber") => {
  // 1. Validate environment variables
  const appID = process.env.AGORA_APP_ID;
  const appCertificate = process.env.AGORA_APP_CERTIFICATE;

  if (!appID || !appCertificate) {
    throw new BadRequestError(
      "AGORA_APP_ID and AGORA_APP_CERTIFICATE must be set",
    );
  }

  // 2. Validate inputs
  if (!channelName?.trim()) {
    throw new Error(`Invalid channel name: ${channelName}`);
  }

  if (!userId?.trim()) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  // 3. Configure token
  const role =
    userRole.toLowerCase() === "teacher"
      ? RtcRole.PUBLISHER
      : RtcRole.SUBSCRIBER;

  const expireTime = 3600;
  const privilegeExpireTime = Math.floor(Date.now() / 1000) + expireTime;

  // // 4. Generate token (using string UID approach)
  // const UID = parseInt(uidHash(userId));
  // const token = RtcTokenBuilder.buildTokenWithUid(
  //   appID,
  //   appCertificate,
  //   channelName,
  //   UID,
  //   role,
  //   privilegeExpireTime,
  // );

  // 4. Generate token using the account (string) approach — no numeric UID,
  // no collision risk, and the client authenticates with the same string.
  const token = RtcTokenBuilder.buildTokenWithAccount(
    appID,
    appCertificate,
    channelName,
    userId,
    role,
    privilegeExpireTime,
  );

  console.log("Generated Agora token:", {
    channelName,
    account: userId,
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
