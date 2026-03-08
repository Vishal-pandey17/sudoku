
import { useState } from "react";

const initialBoard = () => Array(9).fill(null).map(() => Array(9).fill(""));

export default function App() {
  const [board, setBoard] = useState(initialBoard());
  const [status, setStatus] = useState(null); // null | 'valid' | 'invalid'
  const [conflicts, setConflicts] = useState(new Set());

  const handleChange = (row, col, value) => {
    if (value === "" || (/^[1-9]$/.test(value))) {
      const newBoard = board.map((r, ri) =>
        r.map((c, ci) => (ri === row && ci === col ? value : c))
      );
      setBoard(newBoard);
      setStatus(null);
      setConflicts(new Set());
    }
  };

  const validate = () => {
    const conflictCells = new Set();

    // Check rows
    for (let r = 0; r < 9; r++) {
      const seen = {};
      for (let c = 0; c < 9; c++) {
        const val = board[r][c];
        if (val === "") continue;
        if (seen[val] !== undefined) {
          conflictCells.add(`${r}-${c}`);
          conflictCells.add(`${r}-${seen[val]}`);
        } else {
          seen[val] = c;
        }
      }
    }

    // Check columns
    for (let c = 0; c < 9; c++) {
      const seen = {};
      for (let r = 0; r < 9; r++) {
        const val = board[r][c];
        if (val === "") continue;
        if (seen[val] !== undefined) {
          conflictCells.add(`${r}-${c}`);
          conflictCells.add(`${seen[val]}-${c}`);
        } else {
          seen[val] = r;
        }
      }
    }

    // Check 3x3 boxes
    for (let boxR = 0; boxR < 3; boxR++) {
      for (let boxC = 0; boxC < 3; boxC++) {
        const seen = {};
        for (let r = 0; r < 3; r++) {
          for (let c = 0; c < 3; c++) {
            const row = boxR * 3 + r;
            const col = boxC * 3 + c;
            const val = board[row][col];
            if (val === "") continue;
            const key = `${row}-${col}`;
            if (seen[val] !== undefined) {
              conflictCells.add(key);
              conflictCells.add(seen[val]);
            } else {
              seen[val] = key;
            }
          }
        }
      }
    }

    setConflicts(conflictCells);
    setStatus(conflictCells.size === 0 ? "valid" : "invalid");
  };

  const clear = () => {
    setBoard(initialBoard());
    setStatus(null);
    setConflicts(new Set());
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Nunito:wght@400;600;700;800;900&display=swap');

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Nunito', sans-serif;
          background: #f0f4f8;
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .app-container {
          background: white;
          border-radius: 20px;
          padding: 40px 36px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.12);
          max-width: 420px;
          width: 100%;
          text-align: center;
        }

        h1 {
          font-size: 2rem;
          font-weight: 900;
          color: #1a1a2e;
          margin-bottom: 6px;
        }

        .subtitle {
          font-size: 0.9rem;
          color: #777;
          margin-bottom: 24px;
        }

        .board {
          display: grid;
          grid-template-rows: repeat(9, 1fr);
          border: 2px solid #333;
          width: 100%;
          aspect-ratio: 1;
          margin: 0 auto 24px;
        }

        .board-row {
          display: grid;
          grid-template-columns: repeat(9, 1fr);
        }

        .cell {
          border: 1px solid #555;
          background: #2d2d2d;
          color: white;
          font-family: 'Nunito', sans-serif;
          font-size: 1rem;
          font-weight: 700;
          text-align: center;
          width: 100%;
          aspect-ratio: 1;
          outline: none;
          caret-color: transparent;
          transition: background 0.2s;
        }

        .cell:focus {
          background: #444;
        }

        .cell.conflict {
          background: #ffcccc;
          color: #cc0000;
        }

        /* Thicker borders for 3x3 boxes */
        .cell:nth-child(3n) {
          border-right: 2px solid #888;
        }

        .board-row:nth-child(3n) .cell {
          border-bottom: 2px solid #888;
        }

        .buttons {
          display: flex;
          gap: 12px;
          justify-content: center;
          margin-bottom: 16px;
        }

        .btn-validate {
          background: #2563eb;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-validate:hover {
          background: #1d4ed8;
        }

        .btn-clear {
          background: #ef4444;
          color: white;
          border: none;
          border-radius: 8px;
          padding: 10px 28px;
          font-size: 1rem;
          font-weight: 700;
          font-family: 'Nunito', sans-serif;
          cursor: pointer;
          transition: background 0.2s;
        }

        .btn-clear:hover {
          background: #dc2626;
        }

        .status {
          font-size: 0.95rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }

        .status.valid {
          color: #16a34a;
        }

        .status.invalid {
          color: #dc2626;
        }
      `}</style>

      <div className="app-container">
        <h1>Sudoku Validator</h1>
        <p className="subtitle">Enter numbers 1–9 and validate the board.</p>

        <div className="board">
          {board.map((row, ri) => (
            <div className="board-row" key={ri}>
              {row.map((cell, ci) => (
                <input
                  key={ci}
                  className={`cell${conflicts.has(`${ri}-${ci}`) ? " conflict" : ""}`}
                  type="text"
                  maxLength={1}
                  value={cell}
                  onChange={(e) => handleChange(ri, ci, e.target.value)}
                />
              ))}
            </div>
          ))}
        </div>

        <div className="buttons">
          <button className="btn-validate" onClick={validate}>Validate</button>
          <button className="btn-clear" onClick={clear}>Clear</button>
        </div>

        {status === "valid" && (
          <p className="status valid">✅ Sudoku is valid so far!</p>
        )}
        {status === "invalid" && (
          <p className="status invalid">❌ Invalid Sudoku! Conflicts found.</p>
        )}
      </div>
    </>
  );
}
