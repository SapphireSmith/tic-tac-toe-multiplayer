import React, { useEffect, useState } from 'react';
import { useSocketContext } from '../context/SocketContext';
import useStore from '../zustand/zustand';
import { useNavigate } from 'react-router-dom';

const GamePlay = () => {
  const [opponentName, setOpponentName] = useState('');
  const [disableButton, setDisableButton] = useState(false);
  const [turn, setTurn] = useState('');
  const [board, setBoard] = useState(['', '', '', '', '', '', '', '', '']);
  const { socket } = useSocketContext();
  const [endGameMessage, setEndGameMessage] = useState('')
  const navigateTo = useNavigate();
  const { playerName, roomDetails } = useStore();

  useEffect(() => {
    if (roomDetails) {
      const opponent = roomDetails.playersName.find(player => playerName !== player);
      setOpponentName(opponent);
      const initialTurn = roomDetails.value[Object.keys(roomDetails.value)[0]];
      setTurn(initialTurn);
      setDisableButton(initialTurn !== roomDetails.value[playerName]);
    } else {
      navigateTo('/');
    }
  }, [roomDetails, navigateTo, playerName]);

  useEffect(() => {
    if (roomDetails) {
      if (turn !== roomDetails.value[playerName]) {
        setDisableButton(true);
      } else {
        setDisableButton(false);
      }
    }
  }, [turn, roomDetails, playerName]);

  const whosTurn = (e) => {
    if (socket) {
      const emitObj = {
        btnId: e.target.id,
        value: roomDetails.value[playerName],
        roomDetails
      };
      socket.emit('playing', emitObj);
    }
  };

  useEffect(() => {
    if (socket) {
      const handlePlaying = ({ btnId, value }) => {
        const index = parseInt(btnId.replace('btn', ''), 10);
        setBoard(prevBoard => {
          const newBoard = [...prevBoard];
          newBoard[index] = value;
          return newBoard;
        });
        setTurn(prevTurn => prevTurn === 'X' ? 'O' : 'X');
      };

      const handleGameOver = ({ winner }) => {
        if (winner === 'Draw') {
          setTimeout(() => {
            setEndGameMessage('Game Draw')
            setTimeout(() => {
              navigateTo('/');
            }, 3000);
          }, 500)

        } else {
          const whoWin = Object.entries(roomDetails.value).find(([key, val]) => val === winner)?.[0];
          setTimeout(() => {
            setEndGameMessage(`${whoWin === playerName ? 'You' : whoWin} won the game`)
            setTimeout(() => {
              navigateTo('/');
            }, 4000);
          }, 500)

        }
      };

      const handleOpponentDisconnect = () => {
        setTimeout(() => {
          setEndGameMessage('Opponent has been disconnected. this room is deleted ')
          setTimeout(() => {
            navigateTo('/');
          }, 3000);
        }, 500)
      }

      socket.on('playing', handlePlaying);
      socket.on('game-over', handleGameOver);
      socket.on('opponent-disconnected', handleOpponentDisconnect)

      return () => {
        socket.off('playing', handlePlaying);
        socket.off('game-over', handleGameOver);
      };
    }
  }, [socket, roomDetails, navigateTo, playerName]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white">
      <h1 className="text-5xl text-violet-500 font-bold mb-10">Tic-Tac-Toe</h1>
      <div className="w-[1000px] flex justify-center">
        <p className="mr-auto">You - <span id="user">{playerName}</span></p>
        <p className="ml-auto">Opponent - <span id="oppName">{opponentName || ''}</span></p>
      </div>
      {endGameMessage === '' ? (
        <>
          <p className="mt-5">You are playing as <span id="value">{roomDetails && roomDetails.value[playerName]}</span></p>
          <p id="whosTurn" className="text-xl">{turn}'s Turn</p>
          <img id="loading" src="loading.gif" alt="" className="w-10 mt-5" />
          <div id="bigcont" className="">
            <div id="cont" className="grid grid-cols-3 gap-4">
              {board.map((btn, index) => (
                <button
                  key={index}
                  id={`btn${index}`}
                  onClick={whosTurn}
                  disabled={disableButton || btn !== ''}
                  className={`${disableButton ? 'cursor-not-allowed' : 'cursor-pointer'} btn text-2xl w-24 h-24 bg-gray-300 rounded-lg`}
                >
                  {btn}
                </button>
              ))}
            </div>
          </div>
        </>
      ) : (
        <p className="mt-5 text-2xl text-red-500">{endGameMessage}</p>
      )}

    </div>
  );
};

export default GamePlay;
