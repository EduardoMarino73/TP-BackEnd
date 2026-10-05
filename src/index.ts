import express from "express";
import { movieRouter } from "./Movie/movie.routes.js";
import { seriesRouter } from "./Series/series.routes.js";
import { seasonRouter } from "./Season/season.routes.js";
import { episodeRouter } from "./Episode/episode.routes.js";
import cors from "cors";
import path from "path";

//start the server
const app = express()
app.use(cors());

// Parse incoming requests with JSON payloads
app.use(express.json());

// Serve static media files for movies and series
app.use("/movies", express.static(path.resolve("src/Shared/database/content/movies")));
app.use("/series", express.static(path.resolve("src/Shared/database/content/series")));

const PORT = 3000;

// Start listening for HTTP connections
app.listen(PORT, () => {
    console.log(`Server listening at port: ${PORT}`);
});

