import faceapi from "face-api.js";
import { Canvas, Image, loadImage } from "canvas";

faceapi.env.monkeyPatch({ Canvas, Image });

async function compareFaces(image1Base64, image2Base64) {
  const image1 = await loadImage(`data:image/jpeg;base64, ${image1Base64}`);
  const image2 = await loadImage(`data:image/jpeg;base64, ${image2Base64}`);

  const detection1 = await faceapi
    .detectSingleFace(image1)
    .withFaceLandmarks()
    .withFaceDescriptor();

  const detection2 = await faceapi
    .detectSingleFace(image2)
    .withFaceLandmarks()
    .withFaceDescriptor();

  if (!detection1 || !detection2)
    throw new Error("no face detected in 1 or both images");
  const distance = faceapi.euclideanDistance(
    detection1.descriptor,
    detection2.descriptor
  );

  return distance < 0.4;
}
export { compareFaces };
