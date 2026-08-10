const express = require("express");

const {
    searchMovies,
    getMovie,
    getPopularMovies
} = require("../controllers/movieController");

const router = express.Router();

router.get("/search", searchMovies);
router.get("/popular", getPopularMovies);
router.get("/:id", getMovie);

module.exports = router;