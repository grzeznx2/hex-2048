export interface Position {
  x: number
  y: number
}

export interface Coordinates extends Position {
  z: number
}

export interface CellMeta {
  id: number
  value: number
  x: number
  y: number
  z: number
}
