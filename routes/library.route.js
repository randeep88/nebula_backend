const express = require("express");
const {
  addArtist,
  addAlbum,
  addPlaylist,
  getArtist,
  getAlbum,
  getPlaylist,
  removeArtist,
  removeAlbum,
  removePlaylist,
  getLibrary,
  addSong,
  removeSong,
  getSong,
  updateLastPlayedSong,
  getLastPlayedSong,
} = require("../controllers/library.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const router = express.Router();

router.patch("/lastplayed/update", authMiddleware, updateLastPlayedSong);
router.get("/lastplayed", authMiddleware, getLastPlayedSong);

router.post("/song/add", authMiddleware, addSong);
router.delete("/song/remove", authMiddleware, removeSong);
router.get("/song", authMiddleware, getSong);

router.post("/artist/add", authMiddleware, addArtist);
router.delete("/artist/remove", authMiddleware, removeArtist);
router.get("/artist", authMiddleware, getArtist);

router.post("/album/add", authMiddleware, addAlbum);
router.delete("/album/remove", authMiddleware, removeAlbum);
router.get("/album", authMiddleware, getAlbum);

router.post("/playlist/add", authMiddleware, addPlaylist);
router.delete("/playlist/remove", authMiddleware, removePlaylist);
router.get("/playlist", authMiddleware, getPlaylist);

router.get("/", authMiddleware, getLibrary);

module.exports = router;
