import React, { useCallback, useEffect, useState } from "react";
import { useSocket } from "../context/SocketProvider";
import peer from "../service/peer";
import ReactPlayer from "react-player";
import { format } from "path";

const RoomPage = () => {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState("");
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);

  const handleUserCall = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: true,
    });
    const offer = await peer.getOffer();
    socket?.emit("user:call", { to: remoteSocketId, offer });
    setMyStream(stream);
  }, [socket, remoteSocketId]);

  const handleNewUserJoined = useCallback(
    ({ email, id }: { email: string; id: string }) => {
        console.log("Sandeep Room Joined", email, id);
        
      setRemoteSocketId(id);
    },
    [socket]
  );

  const handleIncomingCall = useCallback(
    async ({ from, offer }: { from: string; offer: MediaStream }) => {
      setRemoteSocketId(from);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: true,
        video: true,
      });
      setMyStream(stream);
      const ans = await peer.getAnswer(offer);
      socket?.emit("call:accepted", { to: from, ans });
    },
    [socket]
  );

  const sendStream = useCallback(() => {
    for (const track of myStream?.getTracks()!) {
        peer?.peer?.addTrack(track, myStream!);
      }
  }, [myStream])

  const handleCallAccepted = useCallback(
    ({ from, ans }: { from: string; ans: MediaStream }) => {
      peer.setLocalDescription(ans);
      console.log("Call is accepted!");
      sendStream();
    },
    [sendStream]
  );

  const handleNegoNeeded = useCallback( async () => {
    const offer = await peer.getOffer();
    socket?.emit("peer:nego:needed", {offer, to: remoteSocketId})
}, [remoteSocketId, socket])

  useEffect(() => {
    peer.peer?.addEventListener("negotiationneeded",handleNegoNeeded)
    return () => {
        peer.peer?.removeEventListener("negotiationneeded",handleNegoNeeded)
    }
  }, [handleNegoNeeded])

  useEffect(() => {
    peer?.peer?.addEventListener("track", async (ev) => {
      const remoteStream = ev?.streams;
      setRemoteStream(remoteStream?.[0]);
    });
  }, []);

  const handleNegoNeedIncoming = useCallback(async({from, offer}: { from: string; offer: MediaStream }) => {
    const ans = await peer.getAnswer(offer);
    socket?.emit("peer:nego:done", { to: from , ans})
  }, [socket])

  const handleNegoNeedFinal = useCallback(async ({ans}: {ans: MediaStream}) => {
    await peer.setLocalDescription(ans);
  }, [])

  useEffect(() => {
    socket?.on("room:joined", handleNewUserJoined);
    socket?.on("incoming:call", handleIncomingCall);
    socket?.on("call:accepted", handleCallAccepted);
    socket?.on("peer:nego:needed", handleNegoNeedIncoming);
    socket?.on("peer:nego:final", handleNegoNeedFinal);
    return () => {
      socket?.off("room:joined", handleNewUserJoined);
      socket?.off("incoming:call", handleIncomingCall);
      socket?.off("call:accepted", handleCallAccepted);
      socket?.off("peer:nego:needed", handleNegoNeedIncoming);
      socket?.off("peer:nego:final", handleNegoNeedFinal);
    };
  }, [socket, handleNewUserJoined, handleIncomingCall, handleCallAccepted, handleNegoNeedIncoming, handleNegoNeedFinal]);

  return (
    <div>
        <h1>Room Page</h1>
      <h4>{remoteSocketId ? "Connected" : "No one in room"}</h4>
      {myStream && <button onClick={sendStream}>Send Stream</button>}
      {remoteSocketId && <button onClick={handleUserCall}>CALL</button>}
     
      {myStream ? (
        <>
          <h1>My Stream</h1>
          <ReactPlayer
            url={myStream}
            muted
            height="300px"
            width="300px"
            playing
            volume={20}
          />
        </>
      ) : null}

      {remoteStream ? (
        <>
          <h1>Remote Stream</h1>
          <ReactPlayer
            url={remoteStream}
            muted
            height="300px"
            width="300px"
            playing
            volume={20}
          />
        </>
      ) : null}
    </div>
  );
};

export default RoomPage;
