import React, { createContext, useContext, useMemo } from "react";
import { io, Socket } from 'socket.io-client';

type SocketContextType = Socket | null;

const socketContext = createContext<SocketContextType>(null);

export const useSocket = () => {
    const socket = useContext(socketContext);
    return socket;
}

export const SocketProvider = ({children}: {children: React.ReactNode}) => {
    const socket = useMemo(() => io("https://webrtc-imhw.onrender.com"), []);
    return (
        <socketContext.Provider value={socket }>
            {children}
        </socketContext.Provider>
    )
}
