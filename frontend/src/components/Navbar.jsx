import { Link } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

function Navbar() {
    const {
        currentUser,
        logout
    } = useAuth();

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error(
                "Logout failed:",
                error
            );
        }
    }

    return (
        <nav className="navbar">

            <div className="navbar-container">

                {/* =========================
                    BRAND
                ========================== */}

                <Link
                    to="/"
                    className="navbar-brand"
                >
                    <span className="navbar-brand-icon">
                        🎬
                    </span>

                    <span className="navbar-brand-text">
                        Movie Recommendations
                        <span className="navbar-brand-subtitle">
                            & Social Watchlist
                        </span>
                    </span>
                </Link>


                {/* =========================
                    NAVIGATION
                ========================== */}

                <div className="navbar-links">

                    <Link to="/">
                        Home
                    </Link>

                    <Link to="/movies">
                        Movies
                    </Link>

                    {currentUser && (
                        <>
                            <Link to="/dashboard">
                                Dashboard
                            </Link>

                            <Link to="/watchlist">
                                Watchlist
                            </Link>

                            <Link to="/friends">
                                Friends
                            </Link>

                            <Link to="/activity">
                                Activity
                            </Link>

                            <Link to="/history">
                                History
                            </Link>
                        </>
                    )}

                </div>


                {/* =========================
                    AUTH LINKS
                ========================== */}

                <div className="navbar-auth">

                    {currentUser ? (

                        <>
                            <Link
                                to="/profile"
                                className="navbar-profile"
                            >
                                Profile
                            </Link>

                            <button
                                className="navbar-logout"
                                onClick={handleLogout}
                            >
                                Logout
                            </button>
                        </>

                    ) : (

                        <>
                            <Link
                                to="/login"
                                className="navbar-login"
                            >
                                Login
                            </Link>

                            <Link
                                to="/register"
                                className="navbar-register"
                            >
                                Register
                            </Link>
                        </>
                    )}

                </div>

            </div>

        </nav>
    );
}

export default Navbar;