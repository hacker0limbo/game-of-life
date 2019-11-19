import React, { useState } from 'react'
import { numRows, numCols } from './constants'

const App: React.FC = () => {
  const [grid, setGrid] = useState(() => {
    return [...Array(numRows)].map(row => new Array(numCols).fill(0))
  })
  return (
    <div> 
      {grid.map((row, i) => row.map((col, k) => (
        <div>a</div>
      )))}
    </div>
  )
}

export default App
