const API_BASE_URL = "http://localhost:5001/api";

export async function checkBackendHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);

    if (!response.ok) {
        throw new Error("Backend request failed");
    }

    return response.json();
}