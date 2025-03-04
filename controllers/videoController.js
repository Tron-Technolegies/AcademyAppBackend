import { NotFoundError } from "../errors/customErrors.js";
import Video from "../models/VideoModel.js";

export const addVideo = async (req, res) => {
  const { videoName, videoURL, relatedModule, relatedCourse } = req.body;
  const newVideo = new Video({
    videoName: videoName,
    videoURL: videoURL,
    relatedModule: relatedModule,
    relatedCourse: relatedCourse,
  });
  await newVideo.save();
  res.status(201).json({ message: "successfully created" });
};

export const getAllVideo = async (req, res) => {
  const videos = await Video.find();
  if (!videos) throw new NotFoundError("videos not found");
  res.status(200).json(videos);
};

export const updateVideos = async (req, res) => {
  const { videoName, videoURL, relatedModule, relatedCourse } = req.body;
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) throw new NotFoundError("videos not found");
  video.videoName = videoName;
  video.videoURL = videoURL;
  video.relatedModule = relatedModule;
  video.relatedCourse = relatedCourse;
  await video.save();
  res.status(200).json({ message: "successfully updated" });
};

export const getSingleVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findById(id);
  if (!video) throw new NotFoundError("videos not found");
  res.status(200).json(video);
};

export const deleteVideo = async (req, res) => {
  const { id } = req.params;
  const video = await Video.findByIdAndDelete(id);
  if (!video) throw new NotFoundError("videos not found");
  res.status(200).json({ message: "successfully deleted" });
};
export const getVideoByCourse = async (req, res) => {
  //we are passing the courseId through body
  const { courseId } = req.query;
  const videos = await Video.find({ relatedCourse: courseId }); //we are filtering all the videos related to course,
  if (!videos) throw new NotFoundError("videos not found");
  res.status(200).json(videos);
};

export const getVideoByModule = async (req, res) => {
  const { moduleId } = req.query;
  const videos = await Video.find({ relatedModule: moduleId });
  if (!videos) throw new NotFoundError("videos not found ");
  res.status(200).json(videos);
};
