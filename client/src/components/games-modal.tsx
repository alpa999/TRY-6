import { useState } from "react";

interface GamesModalProps {
  isOpen: boolean;
  onClose: () => void;
  isConnected: boolean;
  sendMessage?: (type: string, payload: any) => void;
}

type GameType = 'rps' | 'number' | 'draw' | 'tictactoe' | null;

export default function GamesModal({ isOpen, onClose, isConnected, sendMessage }: GamesModalProps) {
  const [activeGame, setActiveGame] = useState<GameType>(null);
  const [rpsChoice, setRpsChoice] = useState<string>('');
  const [numberGuess, setNumberGuess] = useState<string>('');
  const [targetNumber] = useState<number>(Math.floor(Math.random() * 10) + 1);
  const [gameResult, setGameResult] = useState<string>('');
  const [ticTacToeBoard, setTicTacToeBoard] = useState<Array<string | null>>(Array(9).fill(null));
  const [isPlayerTurn, setIsPlayerTurn] = useState<boolean>(true);
  const [ticTacToeWinner, setTicTacToeWinner] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleRPSChoice = (choice: string) => {
    setRpsChoice(choice);
    
    if (sendMessage && isConnected) {
      sendMessage('game_rps', { choice });
    }
    
    // Simulate opponent choice for demo
    setTimeout(() => {
      const choices = ['rock', 'paper', 'scissors'];
      const opponentChoice = choices[Math.floor(Math.random() * choices.length)];
      
      let result = '';
      if (choice === opponentChoice) {
        result = "It's a tie!";
      } else if (
        (choice === 'rock' && opponentChoice === 'scissors') ||
        (choice === 'paper' && opponentChoice === 'rock') ||
        (choice === 'scissors' && opponentChoice === 'paper')
      ) {
        result = 'You win!';
      } else {
        result = 'You lose!';
      }
      
      setGameResult(`${result} Partner chose ${opponentChoice}.`);
    }, 2000);
  };

  const handleNumberGuess = () => {
    const guess = parseInt(numberGuess);
    if (guess === targetNumber) {
      setGameResult('Correct! You guessed it!');
    } else {
      setGameResult(`Wrong! The number was ${targetNumber}. Try again!`);
    }
  };

  const handleTicTacToeMove = (index: number) => {
    if (ticTacToeBoard[index] || ticTacToeWinner || !isPlayerTurn) return;
    
    const newBoard = [...ticTacToeBoard];
    newBoard[index] = 'X';
    setTicTacToeBoard(newBoard);
    setIsPlayerTurn(false);
    
    if (sendMessage && isConnected) {
      sendMessage('game_tictactoe', { move: index, board: newBoard });
    }
    
    // Check for winner
    const winner = checkWinner(newBoard);
    if (winner) {
      setTicTacToeWinner(winner);
      return;
    }
    
    // AI move
    setTimeout(() => {
      const emptySpots = newBoard.map((spot, idx) => spot === null ? idx : null).filter(val => val !== null);
      if (emptySpots.length > 0) {
        const aiMove = emptySpots[Math.floor(Math.random() * emptySpots.length)];
        newBoard[aiMove!] = 'O';
        setTicTacToeBoard(newBoard);
        setIsPlayerTurn(true);
        
        const aiWinner = checkWinner(newBoard);
        if (aiWinner) {
          setTicTacToeWinner(aiWinner);
        }
      }
    }, 1000);
  };

  const checkWinner = (board: Array<string | null>): string | null => {
    const lines = [
      [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
      [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
      [0, 4, 8], [2, 4, 6] // diagonals
    ];
    
    for (const [a, b, c] of lines) {
      if (board[a] && board[a] === board[b] && board[a] === board[c]) {
        return board[a];
      }
    }
    
    return board.every(cell => cell !== null) ? 'tie' : null;
  };

  const resetTicTacToe = () => {
    setTicTacToeBoard(Array(9).fill(null));
    setIsPlayerTurn(true);
    setTicTacToeWinner(null);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-purple-400">🎮 Space Games</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-xl"
          >
            ✕
          </button>
        </div>
        
        <div className="space-y-3">
          {!activeGame ? (
            <>
              <div className="grid grid-cols-2 gap-3">
                {/* Rock Paper Scissors */}
                <button
                  onClick={() => setActiveGame('rps')}
                  className="bg-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-gray-600 transition-colors"
                >
                  <span className="text-2xl">✊</span>
                  <div className="text-center">
                    <p className="text-white text-xs font-medium">Rock Paper Scissors</p>
                    <p className="text-gray-400 text-xs">vs Partner</p>
                  </div>
                </button>

                {/* Sound Game */}
                <button
                  onClick={() => setActiveGame('number')}
                  className="bg-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-gray-600 transition-colors"
                >
                  <span className="text-2xl">🎵</span>
                  <div className="text-center">
                    <p className="text-white text-xs font-medium">Sound Game</p>
                    <p className="text-gray-400 text-xs">Voice Challenge</p>
                  </div>
                </button>

                {/* Tic-Tac-Toe */}
                <button
                  onClick={() => setActiveGame('tictactoe')}
                  className="bg-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-gray-600 transition-colors"
                >
                  <span className="text-2xl">⭕</span>
                  <div className="text-center">
                    <p className="text-white text-xs font-medium">Tic-Tac-Toe</p>
                    <p className="text-gray-400 text-xs">vs Partner</p>
                  </div>
                </button>

                {/* Word Game */}
                <button
                  onClick={() => setActiveGame('draw')}
                  className="bg-gray-700 rounded-lg p-3 flex flex-col items-center gap-2 hover:bg-gray-600 transition-colors"
                >
                  <span className="text-2xl">💭</span>
                  <div className="text-center">
                    <p className="text-white text-xs font-medium">Word Galaxy</p>
                    <p className="text-gray-400 text-xs">Brain Game</p>
                  </div>
                </button>
              </div>

              <div className="text-center pt-2">
                <p className="text-xs text-gray-400">
                  {isConnected ? 'Play games with your voice partner' : 'Connect to play with others'}
                </p>
              </div>
            </>
          ) : null}

          {/* Rock Paper Scissors Game */}
          {activeGame === 'rps' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Rock Paper Scissors</h3>
                <button
                  onClick={() => setActiveGame(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Back
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-3">
                <button
                  onClick={() => handleRPSChoice('rock')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">🪨</span>
                    <span className="text-xs text-white">Rock</span>
                  </div>
                </button>
                <button
                  onClick={() => handleRPSChoice('paper')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">📄</span>
                    <span className="text-xs text-white">Paper</span>
                  </div>
                </button>
                <button
                  onClick={() => handleRPSChoice('scissors')}
                  className="bg-gray-700 hover:bg-gray-600 p-4 rounded-lg transition-colors"
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className="text-2xl">✂️</span>
                    <span className="text-xs text-white">Scissors</span>
                  </div>
                </button>
              </div>
              
              {rpsChoice && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-white">You chose: <span className="font-semibold">{rpsChoice}</span></p>
                  <p className="text-xs text-gray-400">Waiting for your partner...</p>
                </div>
              )}
              
              {gameResult && (
                <div className="text-center p-3 bg-gray-700 rounded-lg">
                  <p className="text-sm font-medium text-white">{gameResult}</p>
                </div>
              )}
            </div>
          )}

          {/* Sound Game */}
          {activeGame === 'number' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Sound Game</h3>
                <button
                  onClick={() => setActiveGame(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Back
                </button>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400">Guess the number I'm thinking of (1-10)!</p>
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={numberGuess}
                  onChange={(e) => setNumberGuess(e.target.value)}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-white"
                  placeholder="Enter your guess"
                />
                <button
                  onClick={handleNumberGuess}
                  className="w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors"
                >
                  Guess!
                </button>
                
                {gameResult && (
                  <div className="p-3 bg-gray-700 rounded-lg">
                    <p className="text-sm text-white">{gameResult}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tic-Tac-Toe Game */}
          {activeGame === 'tictactoe' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Tic-Tac-Toe</h3>
                <button
                  onClick={() => setActiveGame(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Back
                </button>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                {ticTacToeBoard.map((cell, index) => (
                  <button
                    key={index}
                    onClick={() => handleTicTacToeMove(index)}
                    className="bg-gray-700 hover:bg-gray-600 h-12 rounded-lg flex items-center justify-center text-xl font-bold text-white transition-colors"
                    disabled={!!cell || !!ticTacToeWinner || !isPlayerTurn}
                  >
                    {cell}
                  </button>
                ))}
              </div>
              
              {ticTacToeWinner && (
                <div className="text-center space-y-2">
                  <p className="text-sm text-white">
                    {ticTacToeWinner === 'tie' ? "It's a tie!" : `${ticTacToeWinner} wins!`}
                  </p>
                  <button
                    onClick={resetTicTacToe}
                    className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg text-sm transition-colors"
                  >
                    Play Again
                  </button>
                </div>
              )}
              
              {!ticTacToeWinner && (
                <p className="text-center text-xs text-gray-400">
                  {isPlayerTurn ? "Your turn (X)" : "Partner's turn (O)"}
                </p>
              )}
            </div>
          )}

          {/* Word Game */}
          {activeGame === 'draw' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-white">Word Galaxy</h3>
                <button
                  onClick={() => setActiveGame(null)}
                  className="text-gray-400 hover:text-white text-sm"
                >
                  ← Back
                </button>
              </div>
              
              <div className="text-center space-y-4">
                <p className="text-sm text-gray-400">Say a word and let your partner guess what you're thinking!</p>
                <div className="p-4 bg-gray-700 rounded-lg">
                  <p className="text-lg text-white">🌌 Galaxy</p>
                  <p className="text-xs text-gray-400 mt-2">Example word theme</p>
                </div>
                <p className="text-xs text-gray-400">Use your voice to play this game with your partner</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}