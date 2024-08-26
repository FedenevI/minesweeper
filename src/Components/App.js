import React, { useState, useEffect } from 'react';
import './App.css';


const TOTAL_COUNT = 180;

function App() {
  const [sizeBoard, setSizeBoard] = useState(0);
  const [manyBombs, setManyBombs] = useState(0);
  const [isCheckManyBomb, setIsCheckManyBomb] = useState(0);
  const [isCheckSizeBoard, setIsCheckSizeBoard] = useState(0)
  const [board, setBoard] = useState([]);
  const [openedCells, setOpenedCells] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [stopGame, setStopGame] = useState(false);
  const [winGame, setWinGame] = useState('');
  const [leftFlgs, setLeftFlgs] = useState(isCheckManyBomb);
  const [counter, setCounter] = useState(TOTAL_COUNT)
  const [inter, setInter] = useState('');
  

  useEffect(() => {
    setLeftFlgs(isCheckManyBomb - flagged.length)
  }, [flagged])

  useEffect(() => {
    if (counter === 0) {
      clearInterval(inter)
      setCounter(counter)
      setStopGame(true)
      revealAllBombs()
      setWinGame('matrix has you')

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
          && newX < isCheckSizeBoard
          && newY >= 0
          && newY < isCheckSizeBoard
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
          setWinGame('matrix has you');
          clearInterval(inter)
          setCounter(counter)
        }
      }
      return newOpenedCells;
    });
  };


  const handleRightClick = (event, x, y) => {
    event.preventDefault(); 

    if (stopGame) {
      return;
    }

    if (!openedCells.includes(`${x}-${y}`)) { // Добавить флаг только если ячейка не открыта
      setFlagged(flags => {
        // Удалить флаг, если он уже установлен
        const newFlags = flags.filter(flag => flag !== `${x}-${y}`);
        if (newFlags.length === flags.length && newFlags.length < isCheckManyBomb) {
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
    clearInterval(inter)
    setBoard(initializeBoard(sizeBoard, manyBombs));
    setIsCheckSizeBoard(sizeBoard);
    setIsCheckManyBomb(manyBombs)
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
          <div className='board__cell board__size'>
            <button className ={`board__buttone ${sizeBoard === 10 ? 'board__buttone_on' : ''}`} onClick={() => { setSizeBoard(10) }}>10</button>
            <button className ={`board__buttone ${sizeBoard === 15 ? 'board__buttone_on' : ''}`} onClick={() => { setSizeBoard(15) }}>15</button>
            <button className ={`board__buttone ${sizeBoard === 20 ? 'board__buttone_on' : ''}`} onClick={() => { setSizeBoard(20) }}>20</button>
          </div>

          <button className='board__cell board__restart' onClick={resetGame} disabled = {sizeBoard  === 0 || manyBombs === 0 ? true : false}>🙂</button>
          
          <div className='board__cell board__manybombs'>
            <button className ={`board__buttone ${manyBombs === 10 ? 'board__buttone_on' : ''}`} onClick={() => { setManyBombs(10) }}>10</button>
            <button className ={`board__buttone ${manyBombs === 30 ? 'board__buttone_on' : ''}`} onClick={() => { setManyBombs(30) }}>30</button>
            <button className ={`board__buttone ${manyBombs === 50 ? 'board__buttone_on' : ''}`} onClick={() => { setManyBombs(50) }}>50</button>
          </div>
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
                  {isCellOpened(x, y) ? (cell === 0 ? '' : cell) : (isFlagged(x, y) ? '🚩' : '')}
                </div>
              ))}
            </div>
          ))}
        </section>

        <section className='board'>
          <div className='board__cell board__flags'>Осталось {leftFlgs} Флагов</div>
          <h2 className=' board__cell result__message'>{winGame}</h2>
          <div className='board__cell board__timer'>{counter + '/' + TOTAL_COUNT}</div>
        </section>

      </main>

      <footer className='footer'>
        <p className='footer__message'>
        {sizeBoard  === 0 || manyBombs === 0 ? 
        ("для начала игры выбери размер поля(слева) и кол-во мин(справа)"):
        ('Кликай по смайлу для запуска/рестарта игры. Размер поля(слева) и кол-во мин(справа)')}
        </p>
      </footer>

    </div>
  );

}

export default App;