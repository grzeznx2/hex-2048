import { useReducer, useEffect, useRef, useState, useCallback } from 'react'
import Cell from '../Cell'
import { gridFactory } from './gridFactory'
import { initialState, reducer } from './reducer'
import { useIds } from '../../hooks/useIds'
import { BOARD_WIDTH, BOARD_HEIGHT, ANIMATION_DURATION } from '../../constants'

import './Game.css'
import { CellMeta } from '../../types'

type Props = {
  port: string
  radius: string
  hostname: string
}

enum GameStatus {
  Playing = 'playing',
  GameOver = 'game-over',
  NetworkIssues = 'network-issues',
}

const Game = ({ port, radius, hostname }: Props) => {
  const [nextId] = useIds()
  const [state, dispatch] = useReducer(reducer, initialState)
  const { cells, byIds, isMoving, hasChanged } = state
  const [gameStatus, setGameStatus] = useState(GameStatus.Playing)
  const [isLoading, setIsLoading] = useState(false)
  const initialRender = useRef(true)
  const n = parseInt(radius)
  const {
    getPositionByCoords,
    getCellsCount,
    getColCount,
    getRowIndex,
    getColIndex,
    getIndexInCol,
    positionToIndex,
    indexToPosition,
    getCoords,
  } = gridFactory(n)
  const maxColumnsCount = getColCount()
  const maxIndex = 2 * n - 2
  const middleIndex = n - 1

  const getCell = (id: number) => cells[id]
  const cellList = byIds.map(getCell)

  const createArray = (): CellMeta[] => {
    const length = getCellsCount()
    const array: CellMeta[] = Array.from({ length })

    cellList.forEach(cell => {
      const index = positionToIndex({ x: cell.x, y: cell.y })
      array[index] = cell
    })

    return array
  }

  const createCellsMatrix = (): CellMeta[][] => {
    const cellsMatrix: CellMeta[][] = Array.from({ length: maxColumnsCount }).map(() =>
      Array.from({ length: maxColumnsCount })
    )

    cellList.forEach(cell => {
      const rowIndex = getRowIndex(cell.x)
      const colIndex = getColIndex(cell.y)
      cellsMatrix[rowIndex][colIndex] = cell
    })

    return cellsMatrix
  }

  const arr = createArray()
  const cellsMatrix = createCellsMatrix()
  const coordinates = getCoords()

  const checkGameOver = () => {
    if (byIds.length < getCellsCount()) return

    const checkHorizontal = () => {
      let startRow = 0
      let startCol = middleIndex
      let endCol = maxIndex

      for (let row = startRow; row <= maxIndex; row++) {
        for (let col = startCol; col < endCol; col++) {
          const currentCell = cellsMatrix[row][col]
          const nextCell = cellsMatrix[row][col + 1]
          if (currentCell === undefined || nextCell === undefined) continue
          if (currentCell.value === nextCell.value) return true
        }

        if (startCol > 0) {
          startCol--
        } else {
          endCol--
        }
      }
    }

    const checkVertical = () => {
      let startRow = 0
      let startCol = maxIndex
      let endRow = middleIndex

      while (startCol >= 0) {
        for (let row = startRow; row < endRow; row++) {
          const currentCell = cellsMatrix[row][startCol]
          const nextCell = cellsMatrix[row + 1][startCol]
          if (currentCell === undefined || nextCell === undefined) continue
          if (currentCell.value === nextCell.value) return true
        }

        startCol--

        if (endRow < maxIndex) {
          endRow++
        } else {
          startRow++
        }
      }
    }

    const checkDiagonal = () => {
      let startRowIndex = middleIndex
      let startColIndex = 0

      for (let i = 0; i <= maxIndex; i++) {
        let col = startColIndex
        for (let row = startRowIndex; row > 0; row--) {
          const currentCell = cellsMatrix[row][col]
          const nextCell = cellsMatrix[row - 1][col + 1]
          col++
          if (currentCell === undefined || nextCell === undefined) continue
          if (currentCell.value === nextCell.value) return true
        }
        if (startRowIndex < maxIndex) {
          startRowIndex++
        } else {
          startColIndex++
        }
      }
    }

    if (checkHorizontal()) return
    if (checkVertical()) return
    if (checkDiagonal()) return
    setGameStatus(GameStatus.GameOver)
  }

  useEffect(() => {
    if (!isMoving) checkGameOver()
  }, [isMoving, byIds])

  const createCell = (cell: CellMeta) => {
    dispatch({ type: 'CREATE_CELL', cell })
  }

  const mergeCell = (source: CellMeta, destination: CellMeta) => {
    dispatch({ type: 'MERGE_CELLS', source, destination })
  }

  const throttledMergeCell = (source: CellMeta, destination: CellMeta) => {
    setTimeout(() => mergeCell(source, destination), ANIMATION_DURATION)
  }

  const updateCell = (cell: CellMeta) => {
    dispatch({ type: 'UPDATE_CELL', cell })
  }

  useEffect(() => {
    console.log(port)
    console.log(hostname)
    console.log(radius)
  }, [port, hostname, radius])

  useEffect(() => {
    if (isLoading) return
    const fetcher = async () => {
      try {
        setIsLoading(true)
        const res = await fetch(`http://${hostname}:${port}/${n}`, {
          method: 'POST',
          body: JSON.stringify(cellList),
          headers: {
            'Content-Type': 'application/json',
          },
        })
        const data: {
          x: number
          y: number
          z: number
          value: number
        }[] = await res.json()

        data.forEach(cell => {
          createCell({
            x: cell.x,
            y: cell.y,
            z: cell.z,
            value: cell.value,
            id: nextId(),
          })
        })
        setIsLoading(false)
      } catch (error) {
        setIsLoading(false)
        setGameStatus(GameStatus.NetworkIssues)
      }
    }

    if (initialRender.current) {
      fetcher()
      initialRender.current = false
    }

    !isMoving && hasChanged && fetcher()
  }, [isMoving, hasChanged, cellList, nextId, isLoading, hostname, port, n])

  const didCellMove = (source: CellMeta, destination: CellMeta): boolean => {
    const hasXChanged = source.x !== destination.x
    const hasYChanged = source.y !== destination.y

    return hasXChanged || hasYChanged
  }

  const shiftHorizontalRowAndColumn = (inputRowIndex: number, inputColIndex: number) => {
    let outputColIndex

    if (inputRowIndex < middleIndex) {
      outputColIndex = inputColIndex + (middleIndex - inputRowIndex)
    } else {
      outputColIndex = inputColIndex
    }

    return {
      outputRowIndex: inputRowIndex,
      outputColIndex,
    }
  }
  const shiftVerticalRowAndColumn = (inputRowIndex: number, inputColIndex: number) => {
    if (inputRowIndex > middleIndex) {
      return {
        outputRowIndex: inputColIndex + (inputRowIndex + 1 - n),
        outputColIndex: maxIndex - inputRowIndex,
      }
    } else
      return {
        outputRowIndex: inputColIndex,
        outputColIndex: maxIndex - inputRowIndex,
      }
  }
  const shiftDiagonalRowAndColumn = (inputRowIndex: number, inputColIndex: number) => {
    if (inputRowIndex > middleIndex) {
      return {
        outputRowIndex: maxIndex - inputColIndex,
        outputColIndex: inputColIndex + Math.abs(middleIndex - inputRowIndex),
      }
    } else
      return {
        outputRowIndex: inputRowIndex + n - inputColIndex - 1,
        outputColIndex: inputColIndex,
      }
  }

  enum IterationDirection {
    FromEnd = 'fromEnd',
    FromStart = 'fromStart',
  }

  type Shifter = (
    inputRowIndex: number,
    inputColIndex: number
  ) => { outputRowIndex: number; outputColIndex: number }

  type GetRows = () => CellMeta[][]

  const move =
    (getRows: GetRows, shifter: Shifter, iterationDirection: IterationDirection) => () => {
      if (isMoving || isLoading) return
      dispatch({ type: 'START_MOVE' })

      const rows = getRows()

      rows.forEach((row, rowIndex) => {
        const newArray = Array.from({ length: row.length }) as CellMeta[]

        let currentLastIndex =
          iterationDirection === IterationDirection.FromEnd ? row.length - 1 : 0

        const updateCurrentLastIndex = () =>
          iterationDirection === IterationDirection.FromEnd
            ? currentLastIndex--
            : currentLastIndex++

        const handleRow = (i: number) => {
          const currentCell = row[i]
          const previousCell = newArray[currentLastIndex]
          if (currentCell !== undefined) {
            if (previousCell === undefined) {
              const { outputRowIndex, outputColIndex } = shifter(rowIndex, currentLastIndex)
              const { x, y } = getPositionByCoords(outputRowIndex, outputColIndex)
              const cell: CellMeta = {
                ...currentCell,
                x,
                y,
                z: -y - x,
              }
              newArray[currentLastIndex] = cell
              if (didCellMove(currentCell, cell)) updateCell(cell)
            } else {
              if (currentCell.value === previousCell.value) {
                //   const { x, y, z, id } = previousCell
                const { x, y, z, id } = previousCell

                newArray[currentLastIndex] = {
                  ...currentCell,
                  value: previousCell.value + currentCell.value,
                  x,
                  y,
                  z,
                  id,
                }

                updateCurrentLastIndex()

                const cell = {
                  ...currentCell,
                  x,
                  y,
                  z,
                }
                throttledMergeCell(cell, previousCell)

                updateCell(cell)
              } else {
                updateCurrentLastIndex()

                const { outputRowIndex, outputColIndex } = shifter(rowIndex, currentLastIndex)
                const { x, y } = getPositionByCoords(outputRowIndex, outputColIndex)

                const cell = {
                  ...currentCell,
                  x,
                  y,
                  z: -y - x,
                }
                newArray[currentLastIndex] = cell

                if (didCellMove(currentCell, cell)) updateCell(cell)
              }
            }
          }
        }

        if (iterationDirection === IterationDirection.FromEnd) {
          for (let i = row.length - 1; i >= 0; i--) {
            handleRow(i)
          }
        } else if (iterationDirection === IterationDirection.FromStart) {
          for (let i = 0; i <= row.length - 1; i++) {
            handleRow(i)
          }
        }
      })

      setTimeout(() => {
        dispatch({ type: 'END_MOVE' })
      }, ANIMATION_DURATION)
    }

  const getHorizontalRows = () => {
    let startRowIndex = 0
    let startColIndex = middleIndex
    let endColIndex = maxIndex
    const results = []

    for (let rowIndex = startRowIndex; rowIndex <= maxIndex; rowIndex++) {
      results.push(cellsMatrix[rowIndex].slice(startColIndex, endColIndex + 1))

      if (startColIndex > 0) {
        startColIndex--
      } else {
        endColIndex--
      }
    }
    return results
  }

  const getVerticalRows = () => {
    const results = []
    let startRow = 0
    let startCol = maxIndex
    let endRow = middleIndex

    while (startCol >= 0) {
      const currentCol = []
      for (let row = startRow; row <= endRow; row++) {
        currentCol.push(cellsMatrix[row][startCol])
      }

      results.push(currentCol)

      startCol--

      if (endRow < maxIndex) {
        endRow++
      } else {
        startRow++
      }
    }
    return results
  }

  const getDiagonalRows = () => {
    let counter = middleIndex
    let startRowIndex = middleIndex
    let startColIndex = 0
    const results = []

    for (let i = 0; i <= maxIndex; i++) {
      const currentCol = []
      let currentStartRowIndex = startRowIndex
      let currentStartColIndex = startColIndex
      while (currentStartRowIndex >= 0 && currentStartColIndex <= maxIndex) {
        currentCol.push(cellsMatrix[currentStartRowIndex][currentStartColIndex])
        currentStartRowIndex--
        currentStartColIndex++
      }
      results.push(currentCol)

      if (counter > 0) {
        counter--
        startRowIndex++
      } else {
        startColIndex++
      }
    }
    return results
  }

  const moveNorth = move(getHorizontalRows, shiftHorizontalRowAndColumn, IterationDirection.FromEnd)
  const moveSouth = move(
    getHorizontalRows,
    shiftHorizontalRowAndColumn,
    IterationDirection.FromStart
  )
  const moveNorthEast = move(getVerticalRows, shiftVerticalRowAndColumn, IterationDirection.FromEnd)
  const moveSouthWest = move(
    getVerticalRows,
    shiftVerticalRowAndColumn,
    IterationDirection.FromStart
  )
  const moveNorthWest = move(getDiagonalRows, shiftDiagonalRowAndColumn, IterationDirection.FromEnd)
  const moveSouthEast = move(
    getDiagonalRows,
    shiftDiagonalRowAndColumn,
    IterationDirection.FromStart
  )

  const handleKeyDown = useCallback(
    e => {
      e.preventDefault()
      switch (e.key) {
        case 'q':
          moveNorthWest()
          break
        case 'w':
          moveNorth()
          break
        case 'e':
          moveNorthEast()
          break
        case 'a':
          moveSouthWest()
          break
        case 's':
          moveSouth()
          break
        case 'd':
          moveSouthEast()
          break
        default: {
        }
      }
    },
    [moveNorth, moveNorthEast, moveNorthWest, moveSouth, moveSouthEast, moveSouthWest]
  )

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [handleKeyDown])

  return (
    <>
      <div className="game" style={{ width: `${BOARD_WIDTH}px`, height: `${BOARD_HEIGHT}px` }}>
        {coordinates.map((_, i) => {
          const { x, y } = indexToPosition(i)
          const value = arr[i] === undefined ? 0 : -1
          return (
            <Cell
              n={n}
              value={value}
              key={i}
              x={x}
              y={y}
              row={getRowIndex(x)}
              indexInCol={getIndexInCol(x, y)}
            />
          )
        })}
        {cellList.map(cell => (
          <Cell
            id={cell.id}
            n={n}
            value={cell.value}
            key={cell.id}
            x={cell.x}
            y={cell.y}
            row={getRowIndex(cell.x)}
            indexInCol={getIndexInCol(cell.x, cell.y)}
          />
        ))}
      </div>
      <div style={{ textAlign: 'center' }}>
        Game Status: <span data-status={gameStatus}>{gameStatus}</span>
      </div>
    </>
  )
}

export default Game
