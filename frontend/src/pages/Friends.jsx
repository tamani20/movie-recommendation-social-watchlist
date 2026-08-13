import { useEffect, useState } from "react";

import { useAuth } from "../context/AuthContext";

import {
    searchUsers,
    sendFriendRequest,
    getFriends,
    getReceivedFriendRequests,
    acceptFriendRequest,
    rejectFriendRequest,
    getUserProfile,
    removeFriend
} from "../services/friendService";

import { Link } from "react-router-dom";

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
            setLoading(true);
            setError("");

            const friendsData =
                await getFriends(
                    currentUser.uid
                );

            const friendsWithProfiles =
                await Promise.all(
                    friendsData.map(
                        async (friend) => {

                            const profile =
                                await getUserProfile(
                                    friend.friendId
                                );

                            return {
                                ...friend,
                                profile
                            };
                        }
                    )
                );

            setFriends(
                friendsWithProfiles
            );

            const requestsData =
                await getReceivedFriendRequests(
                    currentUser.uid
                );

            const requestsWithProfiles =
                await Promise.all(
                    requestsData.map(
                        async (request) => {

                            const senderProfile =
                                await getUserProfile(
                                    request.senderId
                                );

                            return {
                                ...request,
                                senderProfile
                            };
                        }
                    )
                );

            setRequests(
                requestsWithProfiles
            );

        } catch (error) {
            console.error(error);

            setError(
                "Unable to load social information."
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
                "Unable to accept friend request."
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

    async function handleRemoveFriend(
        friendshipId
    ) {
        const confirmed =
            window.confirm(
                "Are you sure you want to remove this friend?"
            );

        if (!confirmed) {
            return;
        }

        try {

            await removeFriend(
                friendshipId
            );

            await loadSocialData();

        } catch (error) {
            console.error(error);

            setError(
                "Unable to remove friend."
            );
        }
    }

    if (loading) {
        return (
            <main className="friends-page">

                <div className="page-message">
                    <p>
                        Loading your friends...
                    </p>
                </div>

            </main>
        );
    }

    return (
        <main className="friends-page">

            {/* =========================
                PAGE HEADER
            ========================== */}

            <section className="friends-header">

                <p className="friends-eyebrow">
                    SOCIAL
                </p>

                <h1>Friends</h1>

                <p>
                    Find people, manage friend
                    requests, and connect with
                    your movie community.
                </p>

            </section>


            {error && (
                <div className="error-message">
                    {error}
                </div>
            )}


            {/* =========================
                FIND FRIENDS
            ========================== */}

            <section className="friends-section">

                <div className="friends-section-header">

                    <div>
                        <h2>Find Friends</h2>

                        <p>
                            Search for other users
                            by display name.
                        </p>
                    </div>

                </div>

                <form
                    className="friends-search-form"
                    onSubmit={handleSearch}
                >

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
                    <p className="friends-status">
                        Searching...
                    </p>
                )}

                {searchMessage && (
                    <p className="friends-status">
                        {searchMessage}
                    </p>
                )}


                {searchResults.length > 0 && (

                    <div className="friends-user-grid">

                        {searchResults.map(
                            (user) => (

                                <article
                                    className="friend-user-card"
                                    key={user.id}
                                >

                                    <div className="friend-avatar">
                                        {user.displayName
                                                ?.charAt(0)
                                                .toUpperCase() ||
                                            "?"}
                                    </div>

                                    <div className="friend-user-info">

                                        <h3>
                                            {
                                                user.displayName
                                            }
                                        </h3>

                                        <p>
                                            {user.email}
                                        </p>

                                    </div>

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


            {/* =========================
                FRIEND REQUESTS
            ========================== */}

            <section className="friends-section">

                <div className="friends-section-header">

                    <div>
                        <h2>
                            Friend Requests
                        </h2>

                        <p>
                            People who want to
                            connect with you.
                        </p>
                    </div>

                    {requests.length > 0 && (
                        <span className="friends-count">
                            {requests.length}
                        </span>
                    )}

                </div>


                {requests.length === 0 ? (

                    <div className="friends-empty">

                        <p>
                            No pending friend
                            requests.
                        </p>

                    </div>

                ) : (

                    <div className="friend-list">

                        {requests.map(
                            (request) => (

                                <article
                                    className="friend-list-card"
                                    key={request.id}
                                >

                                    <div className="friend-avatar">
                                        {request.senderProfile
                                                ?.displayName
                                                ?.charAt(0)
                                                .toUpperCase() ||
                                            "?"}
                                    </div>

                                    <div className="friend-list-info">

                                        <h3>
                                            {
                                                request
                                                    .senderProfile
                                                    ?.displayName ||
                                                "Unknown User"
                                            }
                                        </h3>

                                        <p>
                                            wants to be
                                            your friend
                                        </p>

                                    </div>

                                    <div className="friend-actions">

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
                                            className="friend-reject"
                                            onClick={() =>
                                                handleReject(
                                                    request
                                                )
                                            }
                                        >
                                            Reject
                                        </button>

                                    </div>

                                </article>

                            )
                        )}

                    </div>

                )}

            </section>


            {/* =========================
                MY FRIENDS
            ========================== */}

            <section className="friends-section">

                <div className="friends-section-header">

                    <div>
                        <h2>My Friends</h2>

                        <p>
                            People you're connected
                            with.
                        </p>
                    </div>

                    {friends.length > 0 && (
                        <span className="friends-count">
                            {friends.length}
                        </span>
                    )}

                </div>


                {friends.length === 0 ? (

                    <div className="friends-empty">

                        <p>
                            You don't have any
                            friends yet.
                        </p>

                    </div>

                ) : (

                    <div className="friends-user-grid">

                        {friends.map(
                            (friend) => (

                                <article
                                    className="friend-profile-card"
                                    key={friend.id}
                                >

                                    <div className="friend-avatar large">
                                        {friend.profile
                                                ?.displayName
                                                ?.charAt(0)
                                                .toUpperCase() ||
                                            "?"}
                                    </div>

                                    <h3>
                                        {
                                            friend.profile
                                                ?.displayName ||
                                            "Unknown User"
                                        }
                                    </h3>

                                    <p>
                                        {
                                            friend.profile
                                                ?.email ||
                                            "No email available"
                                        }
                                    </p>

                                    <Link
                                        to={`/friends/${friend.friendId}`}
                                        className="friend-profile-button"
                                    >
                                        View Profile
                                    </Link>

                                    <button
                                        className="friend-remove"
                                        onClick={() =>
                                            handleRemoveFriend(
                                                friend.id
                                            )
                                        }
                                    >
                                        Remove Friend
                                    </button>

                                </article>

                            )
                        )}

                    </div>

                )}

            </section>

        </main>
    );
}

export default Friends;