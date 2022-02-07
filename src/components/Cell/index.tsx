import { useScale } from '../../hooks/useScale'
import { BOARD_WIDTH } from '../../constants'

import './Cell.css'

type Props = {
  x: number
  y: number
  row: number
  indexInCol: number
  n: number
  value: number
  id?: number
}

const Cell = ({ x, y, row, indexInCol, n, value, id }: Props) => {
  const scale = useScale(value)
  const size = BOARD_WIDTH / (3 * n - 1)
  const width = size * 2
  const height = size * Math.sqrt(3)
  const z = -y - x
  const delta = 18 / n
  const left = delta + (row * (3 * size)) / 2 - delta * row
  const top = delta * 2 + (Math.abs(x) * height) / 2 + indexInCol * height - delta * indexInCol

  const dataAttributes =
    value >= 0
      ? {
          'data-x': x,
          'data-y': y,
          'data-z': z,
          'data-value': value,
        }
      : {}

  return (
    <div
      {...dataAttributes}
      className="cell"
      style={{
        width: `${width}px`,
        height: `${height}px`,
        left: `${left}px`,
        top: `${top}px`,
        transform: `scale(${scale})`,
        zIndex: `${id}`,
      }}
    >
      {value > 0 ? (
        <span
          className={`cell__value cell__value--${value}`}
          style={{ fontSize: `${width / 4}px` }}
        >
          {value}
        </span>
      ) : null}
    </div>
  )
}

export default Cell
