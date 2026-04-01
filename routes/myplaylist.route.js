const express = require("express");
const {
  addSong,
  removeSong,
  myPlaylists,
  createPlaylist,
  getPlaylistById,
  deletePlaylist,
} = require("../controllers/playlist.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.get("/get/:id", authMiddleware, getPlaylistById);
router.get("/get", authMiddleware, myPlaylists);

router.post("/create", authMiddleware, createPlaylist);
router.delete("/delete", authMiddleware, deletePlaylist);

router.post("/add-song", authMiddleware, addSong);
router.delete("/remove-song", authMiddleware, removeSong);

module.exports = router;
