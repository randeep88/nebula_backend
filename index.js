const express = require("express");
const mongoose = require("mongoose");
require("dotenv").config();
const cors = require("cors");

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const sharp = require("sharp");

const allowedOrigins = [
  "https://nebula-frontend-one.vercel.app",
  "http://localhost:5173",
  "http://localhost:8081",
  "http://192.168.1.36:8081",
  "exp://192.168.1.36:8081",
  "exp://192.168.1.36:19000",
  "exp://192.168.1.36:19006",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      // Dev mode mein Expo/mobile allow kar
      if (process.env.NODE_ENV !== "production") {
        return callback(null, true); // dev mein sab allow
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

app.use("/auth", require("./routes/auth.route.js"));
app.use("/library", require("./routes/library.route.js"));
app.use("/playlist", require("./routes/myplaylist.route.js"));

app.get("/dominant-color", async (req, res) => {
  try {
    const { url } = req.query;

    const response = await fetch(decodeURIComponent(url));
    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const { data, info } = await sharp(buffer)
      .resize(100, 100)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const pixels = [];
    for (let i = 0; i < data.length; i += info.channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const brightness = (r + g + b) / 3;
      const saturation = max === 0 ? 0 : (max - min) / max;

      // light, pale, washed out colors filter karo
      if (brightness > 180) continue;   // too light (white, cream, light blue)
      if (brightness < 25) continue;    // too dark (pure black)
      if (saturation < 0.25) continue;  // too gray/dull (no color)

      pixels.push({ r, g, b, saturation, brightness });
    }

    if (pixels.length === 0) {
      return res.json({ color: "#444444" });
    }

    // saturation aur medium brightness dono ko weight do
    pixels.sort((a, b) => {
      const scoreA = a.saturation * 0.7 + (1 - a.brightness / 255) * 0.3;
      const scoreB = b.saturation * 0.7 + (1 - b.brightness / 255) * 0.3;
      return scoreB - scoreA;
    });

    // top 10% pixels ka average lo — single pixel noise se bachne ke liye
    const topCount = Math.max(1, Math.floor(pixels.length * 0.1));
    const topPixels = pixels.slice(0, topCount);

    const avgR = Math.round(topPixels.reduce((s, p) => s + p.r, 0) / topCount);
    const avgG = Math.round(topPixels.reduce((s, p) => s + p.g, 0) / topCount);
    const avgB = Math.round(topPixels.reduce((s, p) => s + p.b, 0) / topCount);

    const hex = `#${((1 << 24) + (avgR << 16) + (avgG << 8) + avgB).toString(16).slice(1)}`;

    res.json({ color: hex });
  } catch (err) {
    console.log("Error:", err.message);
    res.json({ color: "#000000" });
  }
});
app.listen(3000, () => {
  console.log("Server is listening at port 3000");
});
