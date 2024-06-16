import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom';
import { useSocketContext } from '../context/SocketContext';
import useStore from '../zustand/zustand';
import Loader from '../assets/loading.gif'


const Home = () => {
    const { socket } = useSocketContext();
    const {
        usersOnline,
        playerName,
        setPlayerName,
        setRoomDetails
    } = useStore();
    const [loader, setLoader] = useState(false)


    const navigateTo = useNavigate();

    useEffect(() => {
        if (socket) {
            const handleMatchFound = (roomData) => {
                setLoader(false)
                setRoomDetails(roomData)
                navigateTo('/match')
            };
            socket.on('match-found', handleMatchFound);

            return () => {
                socket.off('total-onlines')
                socket.off('match-found', handleMatchFound);
            }
        }
    }, [socket, navigateTo])

    const onSubmitHandler = (e) => {
        setLoader(true)
        e.preventDefault();
        const id = e.nativeEvent.submitter.id;
        if (socket) {
            if (id === 'find-opponent') {
                socket.emit('find-opponent', playerName);
            } else {
                socket.emit('play-with-friend')
            }
        } else {
            console.log("Error: In Home.jsx, in socket @ onSubmitHandler function");
        }
    }

    return (
        <div className=" h-screen container mx-auto flex flex-col items-center justify-center py-12">
            <div className='absolute top-10 '>
                <p>Total Players Online - {usersOnline}</p>
            </div>
            <form className="flex flex-col space-y-4 w-full max-w-md" onSubmit={onSubmitHandler}>
                <div className="flex items-center">
                    <label className="text-lg font-medium text-gray-700 mr-4">Player Name:</label>
                    <input type="text" id="player-name" name="player-name" className="shadow-sm focus:ring-violet-100 bg-violet-200 font-semibold focus:outline-none rounded-md w-full px-3 py-2 text-gray-700"
                        value={playerName} onChange={(e) => setPlayerName(e.target.value)} required />
                </div>

                <div className="flex justify-between">
                    <button type="submit" id="find-opponent" className="bg-violet-500 text-white hover:bg-violet-300 duration-500 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Find Opponent</button>
                    {/* <button type="submit" id="play-with-friend" className="bg-gray-200 text-gray-700 hover:bg-gray-300 focus:ring-4 focus:outline-none focus:ring-gray-400 font-medium rounded-lg text-sm px-5 py-2.5 text-center">Play with Friend</button> */}
                </div>
                {
                    loader ?
                        <div className='flex justify-center'>
                            <img src={Loader} alt="loader" className='h-[100px]' />
                        </div> : ''
                }
            </form>
        </div>

    )
}

export default Home