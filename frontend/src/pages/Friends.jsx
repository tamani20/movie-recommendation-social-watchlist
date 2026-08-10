import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
    searchUsers,
    sendFriendRequest,
    getFriends,
    getReceivedFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest
} from "../services/friendService";

function Friends() {
    const { currentUser } = useAuth();

    const [friends, setFriends] = useState([]);
    const [requests, setRequests] = useState([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchTerm, setSearchTerm] = useState("");
    const [searchResults, setSearchResults] = useState([]);

    const [searchLoading, setSearchLoading] =
        useState(false);

    const [searchMessage, setSearchMessage] =
        useState("");

    async function loadSocialData() {
        try {
            const friendsData =
                await getFriends(currentUser.uid);

            const requestsData =
                await getReceivedFriendRequests(
                    currentUser.uid
                );

            setFriends(friendsData);
            setRequests(requestsData);
        } catch (error) {
            console.error(error);

            setError(
                "Unable to load friends."
            );
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        if (currentUser) {
            loadSocialData();
        }
    }, [currentUser]);

    async function handleSearch(event) {
        event.preventDefault();

        const trimmedSearch =
            searchTerm.trim();

        if (!trimmedSearch) {
            setSearchResults([]);

            setSearchMessage(
                "Enter a name to search."
            );

            return;
        }

        setSearchLoading(true);
        setSearchMessage("");
        setSearchResults([]);

        try {
            const results =
                await searchUsers(
                    currentUser.uid,
                    trimmedSearch
                );

            setSearchResults(results);

            if (results.length === 0) {
                setSearchMessage(
                    "No users found."
                );
            }
        } catch (error) {
            console.error(error);

            setSearchMessage(
                "Unable to search for users."
            );
        } finally {
            setSearchLoading(false);
        }
    }

    async function handleSendFriendRequest(
        receiverId
    ) {
        try {
            await sendFriendRequest(
                currentUser.uid,
                receiverId
            );

            setSearchMessage(
                "Friend request sent!"
            );
        } catch (error) {
            console.error(error);

            setSearchMessage(
                error.message ||
                "Unable to send friend request."
            );
        }
    }

    async function handleAccept(request) {
        try {
            await acceptFriendRequest(
                request.id,
                request.senderId,
                request.receiverId
            );

            await loadSocialData();
        } catch (error) {
            console.error(error);

            setError(
                "Unable to accept request."
            );
        }
    }

    async function handleReject(request) {
        try {
            await rejectFriendRequest(
                request.id
            );

            await loadSocialData();
        } catch (error) {
            console.error(error);

            setError(
                "Unable to reject request."
            );
        }
    }

    if (loading) {
        return (
            <main>
                <p>Loading friends...</p>
            </main>
        );
    }

    return (
        <main>
            <h1>Friends</h1>

            {error && (
                <p>{error}</p>
            )}

            {/* Find Friends */}
            <section>
                <h2>Find Friends</h2>

                <form onSubmit={handleSearch}>
                    <input
                        type="text"
                        placeholder="Search by display name..."
                        value={searchTerm}
                        onChange={(event) =>
                            setSearchTerm(
                                event.target.value
                            )
                        }
                    />

                    <button type="submit">
                        Search
                    </button>
                </form>

                {searchLoading && (
                    <p>Searching...</p>
                )}

                {searchMessage && (
                    <p>{searchMessage}</p>
                )}

                {searchResults.length > 0 && (
                    <div>
                        {searchResults.map(
                            (user) => (
                                <article
                                    key={user.id}
                                >
                                    <h3>
                                        {
                                            user.displayName
                                        }
                                    </h3>

                                    <p>
                                        {user.email}
                                    </p>

                                    <button
                                        onClick={() =>
                                            handleSendFriendRequest(
                                                user.id
                                            )
                                        }
                                    >
                                        Add Friend
                                    </button>
                                </article>
                            )
                        )}
                    </div>
                )}
            </section>

            {/* Friend Requests */}
            <section>
                <h2>
                    Friend Requests
                </h2>

                {requests.length === 0 ? (
                    <p>
                        No pending friend
                        requests.
                    </p>
                ) : (
                    requests.map(
                        (request) => (
                            <article
                                key={
                                    request.id
                                }
                            >
                                <p>
                                    User ID:{" "}
                                    {
                                        request.senderId
                                    }
                                </p>

                                <button
                                    onClick={() =>
                                        handleAccept(
                                            request
                                        )
                                    }
                                >
                                    Accept
                                </button>

                                <button
                                    onClick={() =>
                                        handleReject(
                                            request
                                        )
                                    }
                                >
                                    Reject
                                </button>
                            </article>
                        )
                    )
                )}
            </section>

            {/* Friends List */}
            <section>
                <h2>My Friends</h2>

                {friends.length === 0 ? (
                    <p>
                        You don't have any
                        friends yet.
                    </p>
                ) : (
                    friends.map(
                        (friend) => (
                            <article
                                key={
                                    friend.id
                                }
                            >
                                <p>
                                    Friend ID:{" "}
                                    {
                                        friend.userId
                                    }
                                </p>
                            </article>
                        )
                    )
                )}
            </section>
        </main>
    );
}

export default Friends;