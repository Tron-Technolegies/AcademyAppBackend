import axios from "axios";

// Extract YouTube Video ID from URL
export const getYouTubeVideoId = (url) => {
  const regex =
    /(?:youtube(?:-nocookie)?\.com\/(?:.*(?:v=|\/(embed|shorts)\/)|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
  const match = url.match(regex);
  return match ? match[2] || match[1] : null;
};

// Convert YouTube ISO 8601 duration to a readable format

export const parseISODuration = (isoDuration) => {
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  const hours = parseInt(match[1] || 0);
  const minutes = parseInt(match[2] || 0);
  const seconds = parseInt(match[3] || 0);
  return hours > 0
    ? `${hours}:${minutes.toString().padStart(2, "0")}:${seconds
        .toString()
        .padStart(2, "0")}`
    : `${minutes}:${seconds.toString().padStart(2, "0")}`;
};

// Fetch video duration from YouTube Data API

export const getYouTubeVideoDuration = async (videoId) => {
  const API_KEY = process.env.YOUTUBE_API_KEY; // Your API key from .env
  const url = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${API_KEY}`;
  const response = await axios.get(url);
  const durationISO = response.data.items[0]?.contentDetails?.duration;
  return durationISO;
};
