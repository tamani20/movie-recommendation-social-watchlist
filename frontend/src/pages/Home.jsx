import { useEffect, useState } from "react";
import { checkBackendHealth } from "../services/api";

function Home() {
    const [backendStatus, setBackendStatus] = useState("Checking...");
    const [error, setError] = useState("");

    useEffect(() => {
        checkBackendHealth()
            .then((data) => {
                setBackendStatus(data.status);
            })
            .catch(() => {
                setBackendStatus("Unavailable");
                setError("Could not connect to the backend.");
            });
    }, []);

    return (
        <main>
            <h2>Welcome</h2>

            <p>
                Search for movies, manage your watchlist,
                rate movies, and connect with friends.
            </p>

            <h3>System Status</h3>

            <p>
                Backend: {backendStatus}
            </p>

            {error && (
                <p>{error}</p>
            )}
        </main>
    );
}

export default Home;