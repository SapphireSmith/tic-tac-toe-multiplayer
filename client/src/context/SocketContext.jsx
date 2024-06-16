import { createContext, useContext, useEffect, useState } from 'react'
import { io } from 'socket.io-client'
import useStore from '../zustand/zustand';

const SOCKET_URL_LOCAL = 'http://localhost:3000';
const SOCKET_URL = 'https://tic-tac-toe-multiplayer-8ezu.onrender.com';

export const SocketContext = createContext();




export const useSocketContext = () => {
    return useContext(SocketContext);
}

export const SocketContextProvider = ({ children }) => {
    const [socket, setSocket] = useState(null);
    const {
        setUsersOnline,
    } = useStore();

    useEffect(() => {
        const socket = io(SOCKET_URL)
        setSocket(socket)
        socket.on('total-onlines', (count) => {
            setUsersOnline(count)
        })
    }, [])

    return (
        <SocketContext.Provider value={{ socket }}>
            {children}
        </SocketContext.Provider>
    )
}
