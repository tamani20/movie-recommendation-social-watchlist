const tmdbService = require("../services/tmdbService");

async function searchMovies(req, res) {
    try {
        const { query } = req.query;

        if (!query || query.trim() === "") {
            return res.status(400).json({
                error: "Movie search query is required."
            });
        }

        const movies = await tmdbService.searchMovies(
            query.trim()
        );

        res.json(movies);
    } catch (error) {
        console.error(
            "Movie search error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Unable to search for movies."
        });
    }
}

async function getMovie(req, res) {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({
                error: "Movie ID is required."
            });
        }

        const movie = await tmdbService.getMovieById(id);

        res.json(movie);
    } catch (error) {
        console.error(
            "Movie details error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Unable to retrieve movie details."
        });
    }
}

async function getPopularMovies(req, res) {
    try {
        const movies =
            await tmdbService.getPopularMovies();

        res.json(movies);
    } catch (error) {
        console.error(
            "Popular movies error:",
            error.response?.data || error.message
        );

        res.status(500).json({
            error: "Unable to retrieve popular movies."
        });
    }
}

async function getMovieGenres(req, res) {

    try {

        const genres =
            await tmdbService.getMovieGenres();

        res.json(genres);

    } catch (error) {

        console.error(
            "Movie genres error:",
            error.response?.data ||
            error.message
        );

        res.status(500).json({
            error:
                "Unable to retrieve movie genres."
        });
    }
}

module.exports = {
    searchMovies,
    getMovie,
    getPopularMovies,
    getMovieGenres
};