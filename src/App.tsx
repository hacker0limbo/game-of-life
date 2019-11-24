import React, { useState, useCallback, useRef } from 'react'
import { numRows, numCols } from './constants'
import produce from 'immer'

const gridStyles = {
  display: 'grid',
  gridTemplateColumns: `repeat(${numCols}, 20px)`
}

// 得到除自己本身之外(0, 0), 其余 8 个 cell 的坐标
const operations = [
  [0, 1],
  [0, -1],
  [1, -1],
  [-1, 1],
  [1, 1],
  [-1, -1],
  [1, 0],
  [-1, 0]
]

const countNeighbours = (grid: number[][], x: number, y: number): number => {
  // grid 代表坐标系统, x, y 分别代表其中的坐标
  return operations.reduce((acc, coord) => {
    const [i, j] = coord
    const row = (x + i + numRows) % numRows
    const col = (y + j + numCols) % numCols
    acc += grid[row][col]
    return acc
  }, 0)
}

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return [...Array(numRows)].map(row => new Array(numCols).fill(0))
  })
  const [speed, setSpeed] = useState(100)
  const [running, setRunning] = useState(false)
  // 使用 ref 保存最新的 running state
  const runningRef = useRef(running)
  runningRef.current = running
  const speedRef = useRef(speed)
  speedRef.current = speed

  const runSimulation = useCallback(() => {
    // 由于不想在每次 render 时候重新改变调用这一函数, 因此使用
    // useCallback 进行包装, 并且依赖数组为空表示该函数不管这个组件 
    // render 多少次, 永远只执行一次
    // 但是这个函数本身是一个递归
    if (!runningRef.current) {
      // 同时注意, 由于该函数只执行一次, 里面的 running 对应的是第一次执行的 running, 尽管后面 running 改变
      // 但由于闭包性质, 函数里面获取的 running 并不会发生改变, 因此需要使用 ref 追踪最新的 running state
      // 这样获取的 runningRef 永远都是最新的
      return
    }

    // 设置新 grid
    setGrid(prevGrid => {
      return produce(prevGrid, draftGrid => {
        for (let x = 0; x < numRows; x++) {
          for (let y = 0; y < numCols; y++) {
            const neighbours = countNeighbours(prevGrid, x, y)

            if (neighbours < 2 || neighbours > 3) {
              draftGrid[x][y] = 0
            } else if (prevGrid[x][y] === 0 && neighbours === 3) {
              draftGrid[x][y] = 1
            }
          }
        }    
      })
    })
    // 递归不断调用
    setTimeout(runSimulation, speedRef.current)
  }, [])

  const handleClearGrid = () => {
    setGrid([...Array(numRows)].map(row => new Array(numCols).fill(0)))
  }

  const handleRandomGrid = () => {
    const rows = []
    for (let i = 0; i < numRows; i++) {
      rows.push(Array.from(Array(numCols), () => Math.random() > 0.5 ? 1 : 0))
    }
    setGrid(rows)
  }

  const handleColClick = (i: number, j: number): void => {
    const newGrid = produce(grid, draftGrid => {
      draftGrid[i][j] = grid[i][j] ? 0 : 1
    })
    setGrid(newGrid)
  }

  const handleRunning = () => {
    setRunning(!running)
    if (!running) {
      runningRef.current = true
      runSimulation()  
    }
  }

  const handleRunningSpeed = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpeed(Number(e.target.value))
  }

  return (
    <>
      <div>
        <button onClick={handleRunning}>
          {running ? 'stop' : 'start'}
        </button>
        <button onClick={handleClearGrid}>clear</button>
        <button onClick={handleRandomGrid}>random</button>
      </div>
      <div>
        <span>Speed(50~2000):</span>
        <input 
          type="range"
          min="50"
          max="2000"
          value={speed}
          onChange={handleRunningSpeed}
        />
      </div>
      <div style={gridStyles}>
        {grid.map((row, i) => row.map((col, j) => (
          <div 
            key={`${i}-${j}`}
            className="col" 
            style={{backgroundColor: grid[i][j] ? 'blue' : undefined}}
            onClick={() => handleColClick(i, j)}
          />
        )))}
      </div>
    </>
  )
}

export default App
