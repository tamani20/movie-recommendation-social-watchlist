import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar() {
    const { currentUser, logout } = useAuth();
    const navigate = useNavigate();

    async function handleLogout() {
        try {
            await logout();
            navigate("/login");
        } catch (error) {
            console.error(
                "Error logging out:",
                error
            );
        }
    }

    return (
        <nav>
            <div>
                <Link to="/">
                    MovieSocial
                </Link>
            </div>

            <div>
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
                    </>
                )}
            </div>

            <div>
                {currentUser ? (
                    <>
                        <span>
                            {currentUser.email}
                        </span>

                        <button
                            onClick={
                                handleLogout
                            }
                        >
                            Logout
                        </button>
                    </>
                ) : (
                    <>
                        <Link to="/login">
                            Login
                        </Link>

                        <Link to="/register">
                            Register
                        </Link>
                    </>
                )}
            </div>
        </nav>
    );
}

export default Navbar;