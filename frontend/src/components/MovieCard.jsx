import { Link } from "react-router-dom";


const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";


function MovieCard({ movie }) {

    // ==========================================
    // POSTER
    // ==========================================

    const posterUrl =
        movie.poster_path
            ? `${IMAGE_BASE_URL}${movie.poster_path}`
            : null;


    // ==========================================
    // RELEASE YEAR
    // ==========================================

    const releaseYear =
        movie.release_date
            ? movie.release_date.split("-")[0]
            : "Unknown";


    // ==========================================
    // RATING
    // ==========================================

    const rating =
        typeof movie.vote_average === "number"
            ? movie.vote_average.toFixed(1)
            : "N/A";


    // ==========================================
    // MOVIE CARD
    // ==========================================

    return (

        <article className="movie-card">

            {/* POSTER */}

            {posterUrl ? (

                <img
                    src={posterUrl}
                    alt={`${movie.title} poster`}
                />

            ) : (

                <div className="movie-card-placeholder">

                    No poster available

                </div>

            )}


            {/* MOVIE INFORMATION */}

            <div className="movie-card-content">

                <h3>
                    {movie.title}
                </h3>


                <p>
                    {releaseYear}
                </p>


                <p>
                    ★ {rating}
                </p>


                <Link
                    to={`/movies/${movie.id}`}
                    className="movie-card-link"
                >
                    View Details →
                </Link>

            </div>

        </article>

    );

}


export default MovieCard;