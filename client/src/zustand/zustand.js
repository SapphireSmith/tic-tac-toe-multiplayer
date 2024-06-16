import { create } from 'zustand';

const useStore = create((set) => ({
    usersOnline: 0,
    playerName: '',
    roomDetails: '',

    setUsersOnline: (usersOnline) => set({ usersOnline }),

    setPlayerName: (playerName) => set({ playerName }),

    setRoomDetails: (roomDetails) => set({ roomDetails }),
    
    setCalculateMove: (calculateMove) => set({ calculateMove })
}));

export default useStore;
