"use client";

import { useState } from "react";
import UserRegistration from "@/components/UserRegistration";
import Chat from "@/components/Chat";

export default function Home() {
  const [user, setUser] = useState<{ username: string; room: string } | null>(
    null
  );

  const handleJoinRoom = (username: string, room: string, password: string) => {
    // Here you would typically validate the room and password with the server
    setUser({ username, room });
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">WebSocket Chat</h1>
      {!user ? (
        <UserRegistration onJoinRoom={handleJoinRoom} />
      ) : (
        <Chat username={user.username} room={user.room} />
      )}
    </main>
  );
}
