import React, { useState, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface Message {
  id: string;
  user: string;
  content: string;
  type: "text" | "file";
  file?: {
    name: string;
    type: string;
    data: string;
  };
}

interface ChatProps {
  username: string;
  room: string;
}

const Chat: React.FC<ChatProps> = ({ username, room }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);

    newSocket.emit("join", { username, room });

    return () => {
      newSocket.disconnect();
    };
  }, [username, room]);

  useEffect(() => {
    if (socket) {
      socket.on("chat message", (msg: Message) => {
        setMessages((prevMessages) => [...prevMessages, msg]);
      });
    }
  }, [socket]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue && socket) {
      const newMessage: Message = {
        id: Date.now().toString(),
        user: username,
        content: inputValue,
        type: "text",
      };
      socket.emit("chat message", newMessage);
      setInputValue("");
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.size <= 10 * 1024 * 1024) {
      // 10MB limit
      setFile(selectedFile);
    } else {
      alert("File size should be less than 10MB");
    }
  };

  const sendFile = () => {
    if (file && socket) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const newMessage: Message = {
          id: Date.now().toString(),
          user: username,
          content: file.name,
          type: "file",
          file: {
            name: file.name,
            type: file.type,
            data: e.target?.result as string,
          },
        };
        socket.emit("chat message", newMessage);
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const renderFileContent = (msg: Message) => {
    if (!msg.file) return null;

    const { type, data, name } = msg.file;

    if (type.startsWith("image/")) {
      return <img src={data} alt={name} className="mt-2 max-w-full h-auto" />;
    } else if (type.startsWith("video/")) {
      return (
        <video src={data} controls className="mt-2 max-w-full h-auto">
          Your browser does not support the video tag.
        </video>
      );
    } else if (type.startsWith("audio/")) {
      return (
        <audio src={data} controls className="mt-2 max-w-full">
          Your browser does not support the audio tag.
        </audio>
      );
    } else {
      return (
        <div className="mt-2">
          <a
            href={data}
            download={name}
            className="text-blue-500 hover:underline"
          >
            Download {name}
          </a>
        </div>
      );
    }
  };

  return (
    <div className="flex flex-col h-screen">
      <div className="flex-grow overflow-auto p-4">
        {messages.map((msg) => (
          <Card
            key={msg.id}
            className={`mb-2 ${msg.user === username ? "ml-auto" : "mr-auto"}`}
            style={{ maxWidth: "70%" }}
          >
            <CardContent className="p-3">
              <div className="flex items-center mb-2">
                <Avatar className="mr-2">
                  <AvatarFallback>{msg.user[0].toUpperCase()}</AvatarFallback>
                </Avatar>
                <span className="font-semibold">{msg.user}</span>
              </div>
              {msg.type === "text" ? (
                <p>{msg.content}</p>
              ) : (
                <div>
                  <p>{msg.content}</p>
                  {renderFileContent(msg)}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <form onSubmit={handleSubmit} className="p-4 bg-gray-100">
        <div className="flex items-center">
          <Input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-grow mr-2"
          />
          <input
            type="file"
            onChange={handleFileUpload}
            className="hidden"
            ref={fileInputRef}
          />
          <Button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="mr-2"
          >
            Upload
          </Button>
          {file && (
            <Button type="button" onClick={sendFile} className="mr-2">
              Send File
            </Button>
          )}
          <Button type="submit">Send</Button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
