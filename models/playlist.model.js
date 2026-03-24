const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  playlistId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  addedAt: { type: Date, default: Date.now },
});

const Playlist = mongoose.model("Playlist", playlistSchema);
module.exports = Playlist;
