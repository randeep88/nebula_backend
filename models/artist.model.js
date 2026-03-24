const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  artistId: { type: String, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    addedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Artist", artistSchema);
