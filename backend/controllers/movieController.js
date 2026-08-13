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

async function discoverMovies(
    req,
    res
) {

    try {

        const {
            genre,
            year
        } = req.query;


        // At least one filter should exist.
        if (!genre && !year) {

            return res.status(400).json({
                error:
                    "Genre or release year is required."
            });

        }


        // Validate year if provided.
        if (year) {

            const numericYear =
                Number(year);


            if (
                !Number.isInteger(
                    numericYear
                ) ||
                numericYear < 1870 ||
                numericYear > 2100
            ) {

                return res.status(400).json({
                    error:
                        "Release year is invalid."
                });

            }

        }


        const movies =
            await tmdbService.discoverMovies(
                genre || null,
                year || null
            );


        res.json(
            movies
        );


    } catch (error) {

        console.error(
            "Movie discovery error:",
            error.response?.data ||
            error.message
        );


        res.status(500).json({
            error:
                "Unable to discover movies."
        });

    }

}

// ==========================================
// GET RELATED MOVIE RECOMMENDATIONS
// ==========================================

async function getMovieRecommendations(
    req,
    res
) {

    try {

        const { id } =
            req.params;


        if (!id) {

            return res.status(400).json({
                error:
                    "Movie ID is required."
            });

        }


        const recommendations =
            await tmdbService
                .getMovieRecommendations(
                    id
                );


        res.json(
            recommendations
        );


    } catch (error) {

        console.error(
            "Movie recommendations error:",
            error.response?.data ||
            error.message
        );


        res.status(500).json({
            error:
                "Unable to retrieve related movies."
        });

    }

}

module.exports = {
    searchMovies,
    getMovie,
    getPopularMovies,
    getMovieGenres,
    discoverMovies,
    getMovieRecommendations
};