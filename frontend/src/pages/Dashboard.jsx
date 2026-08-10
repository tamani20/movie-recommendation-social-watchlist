import { useAuth } from "../context/AuthContext";

function Dashboard() {
    const { currentUser, logout } = useAuth();

    async function handleLogout() {
        try {
            await logout();
        } catch (error) {
            console.error("Logout failed:", error);
        }
    }

    return (
        <main>
            <h1>Dashboard</h1>

            <p>Welcome back!</p>

            <p>
                Logged in as: {currentUser?.email}
            </p>

            <h2>Movie Recommendation & Social Watchlist</h2>

            <p>
                Your personalized movie experience starts here.
            </p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </main>
    );
}

export default Dashboard;