import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";
import { getUserProfile } from "../services/userService";

function Dashboard() {
    const { currentUser, logout } = useAuth();

    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            if (!currentUser) {
                return;
            }

            try {
                const userProfile =
                    await getUserProfile(currentUser.uid);

                setProfile(userProfile);
            } catch (error) {
                console.error(
                    "Failed to load profile:",
                    error
                );
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [currentUser]);

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

    if (loading) {
        return <p>Loading profile...</p>;
    }

    return (
        <main>
            <h1>Dashboard</h1>

            {profile && (
                <>
                    <h2>
                        Welcome, {profile.displayName}!
                    </h2>

                    <p>
                        Email: {profile.email}
                    </p>

                    <p>
                        Account type: {profile.role}
                    </p>
                </>
            )}

            <h3>
                Movie Recommendation & Social Watchlist
            </h3>

            <p>
                Your personalized movie experience
                starts here.
            </p>

            <button onClick={handleLogout}>
                Logout
            </button>
        </main>
    );
}

export default Dashboard;