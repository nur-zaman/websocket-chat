import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

interface Room {
  name: string;
  requiresPassword: boolean;
}

interface UserRegistrationProps {
  onJoinRoom: (username: string, room: string, password: string) => void;
}

const UserRegistration: React.FC<UserRegistrationProps> = ({ onJoinRoom }) => {
  const [username, setUsername] = useState("");
  const [roomName, setRoomName] = useState("");
  const [password, setPassword] = useState("");
  const [availableRooms, setAvailableRooms] = useState<Room[]>([
    { name: "ALL", requiresPassword: false },
    { name: "General", requiresPassword: false },
    { name: "Tech", requiresPassword: true },
  ]);

  const handleJoinRoom = (room: Room) => {
    if (username && room.name) {
      onJoinRoom(username, room.name, room.requiresPassword ? password : "");
    }
  };

  const handleCreateRoom = () => {
    if (username && roomName) {
      onJoinRoom(username, roomName, password);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Join a Chat Room</CardTitle>
      </CardHeader>
      <CardContent>
        <Input
          className="mb-4"
          placeholder="Enter your name"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Available Rooms</h3>
          {availableRooms.map((room) => (
            <Button
              key={room.name}
              className="mr-2 mb-2"
              onClick={() => handleJoinRoom(room)}
              disabled={!username}
            >
              Join {room.name}
            </Button>
          ))}
        </div>
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Create a Room</h3>
          <Input
            className="mb-2"
            placeholder="Room name"
            value={roomName}
            onChange={(e) => setRoomName(e.target.value)}
          />
          <Input
            className="mb-2"
            type="password"
            placeholder="Password (optional)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <Button onClick={handleCreateRoom} disabled={!username || !roomName}>
            Create and Join Room
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default UserRegistration;
