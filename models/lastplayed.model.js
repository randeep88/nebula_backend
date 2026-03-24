const mongoose = require("mongoose");

const lastPlayedSchema = new mongoose.Schema({
  songId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
});

module.exports = mongoose.model("LastPlayed", lastPlayedSchema);
