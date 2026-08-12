import { Link } from "react-router-dom";

const IMAGE_BASE_URL =
    "https://image.tmdb.org/t/p/w500";

function MovieCard({ movie }) {

    const posterUrl = movie.poster_path
        ? `${IMAGE_BASE_URL}${movie.poster_path}`
        : null;

    return (
        <article className="movie-card">

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


            <div className="movie-card-content">

                <h3>
                    {movie.title}
                </h3>

                {movie.release_date && (
                    <p>
                        {movie.release_date}
                    </p>
                )}

                {movie.vote_average !== undefined && (
                    <p>
                        ⭐{" "}
                        {movie.vote_average.toFixed(1)}
                        / 10
                    </p>
                )}

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