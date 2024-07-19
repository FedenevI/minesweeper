import React, { useState, useEffect } from 'react';
import './App.css';


export const TOTAL_COUNT = 90

function App() {
  const [sizeBoard, setSizeBoard] = useState(10);
  const [manyBombs, setManyBombs] = useState(5);
  const [board, setBoard] = useState([]);
  const [openedCells, setOpenedCells] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [stopGame, setStopGame] = useState(false);
  const [winGame, setWinGame] = useState('');
  const [leftFlgs, setLeftFlgs] = useState(manyBombs);
  const [counter, setCounter] = useState(TOTAL_COUNT)
  const [inter, setInter] = useState('')


  useEffect(() => {
    setLeftFlgs(manyBombs - flagged.length)
  }, [flagged, manyBombs])

  useEffect(() => {
    if (counter === 0) {
      clearInterval(inter)
      setCounter(counter)
      setStopGame(true)
      revealAllBombs()
      setWinGame('loss')

    }
  }, [counter])


  //Функция для создания начального игрового поля
  const initializeBoard = (size, manyBombs) => {
    const bombsArray = new Array(manyBombs).fill('bomb');
    const emptyArray = new Array(size * size - manyBombs).fill(0);
    const shuffledArray = [...emptyArray, ...bombsArray].sort(() => Math.random() - 0.5);
    const newBoard = [];
    while (shuffledArray.length > 0) {
      const row = shuffledArray.splice(0, size);
      newBoard.push(row);
    }
    return newBoard.map((row, x) =>
      row.map((cell, y) => cell === 'bomb' ? '💣' : countBombs(x, y, newBoard))
    );
  };

  // Функция для подсчета бомб вокруг ячейки
  const countBombs = (x, y, board) => {
    let counter = 0;
    for (let i = -1; i <= 1; i++) {
      for (let k = -1; k <= 1; k++) {
        if (i === 0 && k === 0) continue;
        const sumX = x + i;
        const sumY = y + k;
        if (sumX >= 0
          && sumX < sizeBoard
          && sumY >= 0
          && sumY < sizeBoard
          && board[sumX][sumY] === 'bomb')
          counter++;
      }
    }
    return counter;
  };

  // Используем useEffect для инициализации игрового поля при монтировании компонента
  // useEffect(() => {
  //   setBoard(initializeBoard(sizeBoard, manyBombs));
  // }, []);

  console.log('board', board);

  const cordBombs = board.reduce((acc, row, x) => {
    row.forEach((cell, y) => {
      if (cell === '💣') {
        acc.push(`${x}-${y}`);
      }
    });
    return acc;
  }, []);

  // Ркурсивная функция открытия клетки
  const openAdjacentCells = (x, y, newOpenedCells) => {
    for (let i = -1; i <= 1; i++) {
      for (let k = -1; k <= 1; k++) {
        const newX = x + i;
        const newY = y + k;
        // Проверяем, что не выходим за границы поля и что клетка не открыта и не помечена флагом
        if (newX >= 0
          && newX < sizeBoard
          && newY >= 0
          && newY < sizeBoard
          && !flagged.includes(`${newX}-${newY}`)
          && !newOpenedCells.includes(`${newX}-${newY}`)) {
          newOpenedCells.push(`${newX}-${newY}`);
          // Если клетка пустая, рекурсивно открываем смежные
          if (board[newX][newY] === 0) {
            openAdjacentCells(newX, newY, newOpenedCells);
          }
        }
      }
    }
  };

  //  функция для обработки клика по ячейке
  const handleCellClick = (x, y) => {
    if (flagged.includes(`${x}-${y}`)) {
      return;
    }
    if (stopGame) {
      return;
    }
    setOpenedCells(prevOpenedCells => {
      const newOpenedCells = [...prevOpenedCells];
      console.log(newOpenedCells)
      if (!newOpenedCells.includes(`${x}-${y}`)) {
        newOpenedCells.push(`${x}-${y}`);
        // Если клетка пустая, открываем смежные клетки
        if (board[x][y] === 0) {
          openAdjacentCells(x, y, newOpenedCells);
        } else if (board[x][y] === '💣') {
          setStopGame(true)
          revealAllBombs()
          setWinGame('loss');
          clearInterval(inter)
          setCounter(counter)
        }
      }
      return newOpenedCells;
    });
  };


  const handleRightClick = (event, x, y) => {
    event.preventDefault(); // Предотвратить стандартное поведение контекстного меню

    if (stopGame) {
      return;
    }

    // const cellKey = `${x}-${y}`;
    if (!openedCells.includes(`${x}-${y}`)) { // Добавить флаг только если ячейка не открыта
      setFlagged(flags => {
        const newFlags = flags.filter(flag => flag !== `${x}-${y}`);

        // Удалить флаг, если он уже установлен
        if (newFlags.length === flags.length && newFlags.length < manyBombs) {
          newFlags.push(`${x}-${y}`); // Добавить флаг, если его нет
        }
        if (checkToWin(newFlags, cordBombs)) {
          setStopGame(true);
          setWinGame('win');
          clearInterval(inter)
          setCounter(counter)
        }

        return newFlags;
      });

    }
  };



  // Проверка на победу.
  const checkToWin = (flagged, cordBombs) => cordBombs.every(element => flagged.includes(element));
  // Функция для открытия всех ячеек с бомбами
  const revealAllBombs = () => {
    setOpenedCells(prevOpenedCells => {
      const newOpenedCells = [...prevOpenedCells];
      cordBombs.forEach(cell => {
        if (!newOpenedCells.includes(cell)) {
          newOpenedCells.push(cell);
        }
      });
      return newOpenedCells;
    });
  };



  const resetGame = () => {
    setBoard(initializeBoard(sizeBoard, manyBombs));
    setOpenedCells([]);
    setFlagged([]);
    setStopGame(false);
    setWinGame('')
    setLeftFlgs(manyBombs)

    const t = setInterval(() => {
      setCounter(prevState => prevState - 1)
    }, 1000)

    setInter(t)
    setCounter(TOTAL_COUNT)
  }


  // Проверка, открыта ли ячейка
  const isCellOpened = (x, y) => {
    return openedCells.includes(`${x}-${y}`);
  };
  // Проверка, поставлен ли флаг
  const isFlagged = (x, y) => {
    return flagged.includes(`${x}-${y}`);
  }


  return (
    <div className='page'>

      <header className='header'>
        <h1 className='header__title'>Wake up Neo</h1>
      </header>

      <main className='main'>

        <section className='board'>

          <div className='board__size'>
            <button onClick={() => {
              setSizeBoard(10)
            }}>10</button>
            <button onClick={() => {
              setSizeBoard(15)
            }}>15</button>
            <button onClick={() => {
              setSizeBoard(20)
            }}>20</button>
          </div>

          <div className='board__manybombs'>
            <button onClick={() => {
              setManyBombs(10)
            }}>10</button>
            <button onClick={() => {
              setManyBombs(30)
            }}>30</button>
            <button onClick={() => {
              setManyBombs(50)
            }}>50</button>
          </div>

          <button className='board__restart' onClick={resetGame}>🙂</button>


          <div className='board__flags'>
            left {leftFlgs} flags
          </div>

          <div className='board__timer'>{
            counter + '/' + TOTAL_COUNT
          }</div>


        </section>

        <section className="playground">
          {board.map((row, x) => (
            <div key={x} className="playground__row">
              {row.map((cell, y) => (
                <div
                  key={`${x}-${y}`}
                  className={`playground__cell ${isCellOpened(x, y) ? 'playground__cell-open' : ''}`}
                  onClick={() => handleCellClick(x, y)}
                  onContextMenu={(event) => handleRightClick(event, x, y)}
                >
                  {isCellOpened(x, y) ? cell : (isFlagged(x, y) ? '🚩' : '')}
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className='result'>
          <h2 className='result__message'>{winGame}</h2>
        </section>

      </main>
    </div>
  );

}

export default App;