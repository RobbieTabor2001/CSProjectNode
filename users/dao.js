import model from "./model.js";
import Song from './songSchema.js';
import Review from './reviewSchema.js';
import Follow from "../follows/model.js"
export const findAllUsers = () => model.find();
export const findUserById = (id) => model.findById(id); // model.find({ _id: id });
export const findUserByUsername = (username) =>
  model.findOne({ username: username });
//   model.find({ username: username });
export const findUserByCredentials = (username, password) =>
  model.findOne({ username: username, password: password });
export const createUser = (user) => model.create(user);
export const updateUser = (id, user) =>
  model.updateOne({ _id: id }, { $set: user });
export const deleteUser = (id) => model.deleteOne({ _id: id });
export const findMostRecentUser = () => {
  return model.findOne().sort({ doh: -1 }).limit(1);
};
export const saveSong = async (songData) => {
  // Check if a song with the same trackId already exists
  const existingSong = await Song.findOne({ trackId: songData.trackId });

  if (existingSong) {
    // Song already exists, return existing song without creating a new one
    return existingSong;
  } else {
    // Song doesn't exist, create a new one
    return Song.create(songData);
  }
};
export const saveReview = (reviewData) => {
  return Review.create(reviewData);
};



export const fetchFollowedUserReviews = async (currentUserId) => {
  // Fetch the IDs of users that the current user follows
  const followedUsers = await Follow.find({ follower: currentUserId }).select('followed -_id');
  const followedUserIds = followedUsers.map(f => f.followed);

  // Fetch reviews made by these followed users
  const reviews = await Review.find({
    userId: { $in: followedUserIds }
  }).populate('userId', 'username'); // Ensure this matches your user model's structure

  return reviews;
};

export const fetchSongDetails = async (trackId) => {
  try {
      return await Song.findOne({ trackId: trackId });
  } catch (error) {
      console.error('Error fetching song details from DB:', error);
      throw error;
  }
};


export const fetchSongReviews = async (songId) => {
  try {
      return await Review.find({ songId: songId }).populate('userId', 'username');
  } catch (error) {
      console.error('Error fetching song reviews from DB:', error);
      throw error;
  }
};

// In your DAO file
export const fetchUserReviews = async (userId) => {
  try {
      return await Review.find({ userId: userId }).populate('songId');
  } catch (error) {
      console.error('Error fetching user reviews from DB:', error);
      throw error;
  }
};


// In your DAO file

export const fetchAllSongs = async () => {
  try {
    return await Song.find(); // Assuming 'Song' is your Mongoose model for songs
  } catch (error) {
    console.error('Error fetching all songs from DB:', error);
    throw error;
  }
};
