import { Coordinates, Position } from '../../types'

const sumSequence = (n: number): number => {
  let value = 0

  for (let i = 0; i <= n; i++) {
    value += i
  }

  return value
}

export const gridFactory = (n: number) => {
  function getCoords(): Coordinates[] {
    const coordinatesArray: Coordinates[] = []

    let r = n - 1

    for (let x = -r; x <= r; x++) {
      if (x <= 0) {
        for (let y = r; y >= -r + Math.abs(x); y--) {
          const z = -y - x
          coordinatesArray.push({ x, y, z })
        }
      } else {
        for (let y = r - x; y >= -r; y--) {
          const z = -y - x
          coordinatesArray.push({ x, y, z })
        }
      }
    }
    return coordinatesArray
  }

  const getCellsCount = (): number => {
    return 1 + sumSequence(n - 1) * 6
  }

  const getColCount = (): number => 2 * n - 1
  const getMaxColLength = (): number => 2 * n - 1
  const getMinX = (): number => -n + 1
  const getRowIndex = (x: number): number => x + n - 1
  const getColIndex = (y: number): number => y + n - 1
  const getIndexInCol = (x: number, y: number): number => {
    if (x <= 0) return n - y - 1
    else return n - x - y - 1
  }
  const getPositionByCoords = (rowIndex: number, colIndex: number): Position => {
    return {
      x: rowIndex - n + 1,
      y: colIndex - n + 1,
    }
  }
  const getYByCol = (col: number): number => col - n + 1
  const getMaxIndexInRow = (x: number): number => {
    let maxIndex = 0
    const minX = getMinX()
    for (let i = minX; i <= x; i++) {
      maxIndex += getMaxColLength() - Math.abs(i)
    }
    return maxIndex - 1
  }

  const getEmptyCellsCount = (x: number): number => {
    let emptyCellsCount = 0

    for (let i = -n + 1; i <= x; i++) {
      emptyCellsCount += Math.abs(i)
    }

    return emptyCellsCount
  }

  const positionToIndex = ({ x, y }: Position): number => {
    const row = getRowIndex(x)
    const col = getColIndex(y)
    const maxColLength = getMaxColLength()
    const emptyCellsCount = getEmptyCellsCount(x)
    if (x < 0) return (row + 1) * maxColLength - emptyCellsCount - (col + x) - 1
    return (row + 1) * maxColLength - col - emptyCellsCount - 1
  }

  const indexToPosition = (index: number): Position => {
    const minX = getMinX()
    const maxColLength = getMaxColLength()
    let maxIndex = -1
    let emptyCellsCount = 0
    let searchedX = 0

    for (let x = minX; x <= Math.abs(minX); x++) {
      emptyCellsCount += Math.abs(x)
      maxIndex = maxIndex + maxColLength - Math.abs(x)
      if (index <= maxIndex) {
        searchedX = x
        break
      }
    }

    const row = getRowIndex(searchedX)
    let col
    if (searchedX < 0) {
      col = (row + 1) * maxColLength - emptyCellsCount - index - searchedX - 1
    } else {
      col = (row + 1) * maxColLength - emptyCellsCount - index - 1
    }
    return {
      x: searchedX,
      y: getYByCol(col),
    }
  }

  return {
    getPositionByCoords,
    getCellsCount,
    getColCount,
    getMaxColLength,
    getMinX,
    getRowIndex,
    getColIndex,
    getIndexInCol,
    getYByCol,
    getMaxIndexInRow,
    positionToIndex,
    indexToPosition,
    getCoords,
  }
}
