import React, { useState, useCallback, useEffect } from "react";
import { useSocket } from "../context/SocketProvider";
import { useNavigate } from "react-router-dom";

const LobbyScreen = () => {
    const navigation = useNavigate();
  const [email, setEmail] = useState("");
  const [room, setRoom] = useState("");

  const socket = useSocket();
  

  const handleSubmit = useCallback(
    (event: React.FormEvent<HTMLFormElement>) => {
      event?.preventDefault();
      socket?.emit("room:join", { email, room })
    },
    [email, room]
  );

  const handleJoinRoom = useCallback((data: any) => {
    const { email, room } = data;
    navigation(`/room/${room}`)
    
  }, [navigation])

  useEffect(() => {
    socket?.on("room:join", handleJoinRoom)
    return () => {
        socket?.off("room:join");
    }
  }, [socket])
  return (
    <div className="dashboard">
      <h1>Memories</h1>
      <form onSubmit={handleSubmit}>
        <div className="inputContainer">
        <label htmlFor="email">Email</label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(event) => setEmail(event?.target?.value)}
        />
        </div>
       
        <div className="inputContainer">
        <label htmlFor="room">Room Number</label>
        <input
          type="room"
          id="room"
          value={room}
          onChange={(event) => setRoom(event?.target?.value)}
        />
        </div>
        <div >
        <button>Join</button>
        </div>
        
      </form>
    </div>
  );
};

export default LobbyScreen;
