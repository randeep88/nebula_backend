const MyPlaylist = require("../models/myplaylist.model");

const getPlaylistById = async (req, res) => {
  const userId = req.user.userId;
  const playlistId = req.params.id;

  const playlist = await MyPlaylist.findOne({ userId, _id: playlistId });
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  res.status(200).json({ message: "Playlist found", data: playlist });
};

const myPlaylists = async (req, res) => {
  const userId = req.user.userId;

  const playlists = await MyPlaylist.find({ userId }).populate("songs");
  res.status(200).json({ message: "User's playlists", data: playlists });
};

const createPlaylist = async (req, res) => {
  const userId = req.user.userId;
  const { name, coverImage } = req.body;

  const existingPlaylist = await MyPlaylist.findOne({ userId, name });
  console.log(existingPlaylist);
  if (existingPlaylist) {
    return res
      .status(400)
      .json({ message: "Playlist with this name already exists" });
  }

  const newPlaylist = await MyPlaylist.create({ userId, name, coverImage });

  console.log(newPlaylist);

  res.status(201).json({ message: "Playlist created", data: newPlaylist });
};

const deletePlaylist = async (req, res) => {
  const { playlistId } = req.body;

  if (!playlistId) return res.json("Playlist id is required");

  await MyPlaylist.findByIdAndDelete(playlistId);

  res.status(201).json({ message: "Playlist Deleted" });
};

const addSong = async (req, res) => {
  const { songId, playlistIds } = req.body;
  const userId = req.user.userId;

  if (!playlistIds || playlistIds.length === 0) {
    return res.status(400).json({ message: "No playlists selected" });
  }

  const result = await MyPlaylist.updateMany(
    {
      userId,
      _id: { $in: playlistIds },
      songs: { $ne: songId },
    },
    {
      $push: { songs: songId },
    },
  );

  res.status(200).json({
    message: "Song added to selected playlists",
    modifiedCount: result.modifiedCount,
  });
};

const removeSong = async (req, res) => {
  const { songId, playlistId } = req.body;
  const userId = req.user.userId;

  const playlist = await MyPlaylist.findOne({ userId, _id: playlistId });
  if (!playlist) {
    return res.status(404).json({ message: "Playlist not found" });
  }

  const songExists = playlist.songs.some((song) => song.toString() === songId);

  if (!songExists) {
    return res.status(400).json({ message: "Song do not exist in playlist" });
  }

  const updatedPlaylist = await MyPlaylist.findByIdAndUpdate(
    playlistId,
    { $pull: { songs: songId } },
    { new: true },
  );

  res
    .status(200)
    .json({ message: "Song removed from playlist", data: updatedPlaylist });
};

module.exports = {
  addSong,
  removeSong,
  myPlaylists,
  createPlaylist,
  getPlaylistById,
  deletePlaylist,
};
