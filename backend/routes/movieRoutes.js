const express = require("express");

const {
    searchMovies,
    getMovie,
    getPopularMovies,
    getMovieGenres,
    discoverMovies,
    getMovieRecommendations
} = require("../controllers/movieController");

const router = express.Router();

router.get("/search", searchMovies);
router.get("/popular", getPopularMovies);
router.get("/genres", getMovieGenres);
router.get("/discover", discoverMovies);
router.get("/:id/recommendations", getMovieRecommendations);
router.get("/:id", getMovie);

module.exports = router;