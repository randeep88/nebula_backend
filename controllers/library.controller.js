const Artist = require("../models/artist.model.js");
const Album = require("../models/album.model.js");
const Song = require("../models/song.model.js");
const LastPlayed = require("../models/lastplayed.model.js");
const Playlist = require("../models/playlist.model.js");
const { ObjectId } = require("mongodb");

const fixedId = new ObjectId("64f1a2b3c4d5e6f7890abcde");

//Song
const updateLastPlayedSong = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user.userId;

    const song = await LastPlayed.replaceOne(
      { _id: fixedId, user: userId },
      { songId, user: userId },
      { upsert: true },
    );
    res.status(200).json(song);
  } catch (error) {
    console.error("Error updating last played song:", error);
    return res.status(500).json({
      message: "Failed to update last played song",
      error: error.message,
    });
  }
};

const getLastPlayedSong = async (req, res) => {
  try {
    const userId = req.user.userId;

    const song = await LastPlayed.findOne({ _id: fixedId, user: userId });
    res.status(200).json(song);
  } catch (error) {
    console.error("Error getting last played song:", error);
    return res.status(500).json({
      message: "Failed to get last played song",
      error: error.message,
    });
  }
};

//Song
const addSong = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user.userId;

    const existingSong = await Song.findOne({ songId, user: userId });
    if (existingSong) {
      return res
        .status(200)
        .json({ message: "Song already exists in library" });
    }

    const song = await Song.create({ songId, user: userId });
    res.status(200).json(song);
  } catch (error) {
    console.error("Error adding song:", error);
    return res
      .status(500)
      .json({ message: "Failed to add song", error: error.message });
  }
};

const removeSong = async (req, res) => {
  try {
    const { songId } = req.body;
    const userId = req.user.userId;

    const song = await Song.deleteOne({ songId, user: userId });
    res.status(200).json(song);
  } catch (error) {
    console.error("Error removing song:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove song", error: error.message });
  }
};

const getSong = async (req, res) => {
  try {
    const userId = req.user.userId;
    const song = await Song.find({ user: userId });
    res.status(200).json(song);
  } catch (error) {
    console.error("Error getting song:", error);
    return res
      .status(500)
      .json({ message: "Failed to get song", error: error.message });
  }
};

//Artist
const addArtist = async (req, res) => {
  try {
    const { artistId } = req.body;
    const userId = req.user.userId;

    const artist = await Artist.create({ artistId, user: userId });
    res.status(200).json(artist);
  } catch (error) {
    console.error("Error adding artist:", error);
    return res
      .status(500)
      .json({ message: "Failed to add artist", error: error.message });
  }
};

const removeArtist = async (req, res) => {
  try {
    const { artistId } = req.body;
    const userId = req.user.userId;

    const artist = await Artist.deleteOne({ artistId, user: userId });
    res.status(200).json(artist);
  } catch (error) {
    console.error("Error removing artist:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove artist", error: error.message });
  }
};

const getArtist = async (req, res) => {
  try {
    const userId = req.user.userId;
    const artist = await Artist.find({ user: userId });
    res.status(200).json(artist);
  } catch (error) {
    console.error("Error getting artist:", error);
    return res
      .status(500)
      .json({ message: "Failed to get artist", error: error.message });
  }
};

//Album
const addAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;
    const userId = req.user.userId;

    const existingAlbum = await Album.findOne({ albumId, user: userId });
    if (existingAlbum) {
      return res
        .status(200)
        .json({ message: "Album already exists in library" });
    }

    const album = await Album.create({ albumId, user: userId });
    return res.status(201).json({ message: "Album added successfully", album });
  } catch (error) {
    console.error("Error adding album:", error);
    return res
      .status(500)
      .json({ message: "Failed to add album", error: error.message });
  }
};

const removeAlbum = async (req, res) => {
  try {
    const { albumId } = req.body;
    const userId = req.user.userId;

    const deleted = await Album.deleteOne({ albumId, user: userId });
    return res.status(200).json(deleted);
  } catch (error) {
    console.error("Error removing album:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove album", error: error.message });
  }
};

const getAlbum = async (req, res) => {
  try {
    const userId = req.user.userId;
    const album = await Album.find({ user: userId });
    res.status(200).json(album);
  } catch (error) {
    console.error("Error getting album:", error);
    return res
      .status(500)
      .json({ message: "Failed to get album", error: error.message });
  }
};

//Playlist
const addPlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const userId = req.user.userId;

    const playlist = await Playlist.create({ playlistId, user: userId });
    res.status(200).json(playlist);
  } catch (error) {
    console.error("Error adding playlist:", error);
    return res
      .status(500)
      .json({ message: "Failed to add playlist", error: error.message });
  }
};

const removePlaylist = async (req, res) => {
  try {
    const { playlistId } = req.body;
    const userId = req.user.userId;

    const playlist = await Playlist.deleteOne({
      playlistId,
      user: userId,
    });
    res.status(200).json(playlist);
  } catch (error) {
    console.error("Error removing playlist:", error);
    return res
      .status(500)
      .json({ message: "Failed to remove playlist", error: error.message });
  }
};

const getPlaylist = async (req, res) => {
  try {
    const userId = req.user.userId;

    const playlist = await Playlist.find({ user: userId });
    res.status(200).json(playlist);
  } catch (error) {
    console.error("Error getting playlist:", error);
    return res
      .status(500)
      .json({ message: "Failed to get playlist", error: error.message });
  }
};

const getLibrary = async (req, res) => {
  const userId = req.user.userId;
  const playlists = await Playlist.find({ user: userId });
  const albums = await Album.find({ user: userId });
  const artists = await Artist.find({ user: userId });
  res.status(200).json({ playlists, albums, artists });
};

module.exports = {
  addSong,
  removeSong,
  getSong,
  addArtist,
  removeArtist,
  getArtist,
  addAlbum,
  removeAlbum,
  getAlbum,
  addPlaylist,
  removePlaylist,
  getPlaylist,
  getLibrary,
  updateLastPlayedSong,
  getLastPlayedSong,
};
