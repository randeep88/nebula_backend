const mongoose = require("mongoose");

const myplaylistSchema = new mongoose.Schema({
  coverImage: { type: String, required: true },
  name: { type: String, required: true, unique: true },
  songs: [String],
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  createdAt: { type: Date, default: Date.now },
});

const MyPlaylist = mongoose.model("MyPlaylist", myplaylistSchema);
module.exports = MyPlaylist;
