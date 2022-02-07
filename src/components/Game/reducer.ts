import { CellMeta } from '../../types'

interface State {
  cells: {
    [id: number]: CellMeta
  }
  byIds: number[]
  hasChanged: boolean
  isMoving: boolean
}

export const initialState: State = {
  cells: {},
  byIds: [],
  hasChanged: false,
  isMoving: false,
}

type Action =
  | { type: 'CREATE_CELL'; cell: CellMeta }
  | { type: 'UPDATE_CELL'; cell: CellMeta }
  | { type: 'MERGE_CELLS'; source: CellMeta; destination: CellMeta }
  | { type: 'START_MOVE' }
  | { type: 'END_MOVE' }

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case 'CREATE_CELL':
      return {
        ...state,
        cells: {
          ...state.cells,
          [action.cell.id]: action.cell,
        },
        byIds: [...state.byIds, action.cell.id],
        hasChanged: false,
      }
    case 'UPDATE_CELL':
      return {
        ...state,
        cells: {
          ...state.cells,
          [action.cell.id]: action.cell,
        },
        hasChanged: true,
      }
    case 'MERGE_CELLS':
      const {
        [action.source.id]: source,
        [action.destination.id]: destination,
        ...restCells
      } = state.cells

      return {
        ...state,
        cells: {
          ...restCells,
          [action.destination.id]: {
            ...destination,
            value: action.destination.value + action.source.value,
          },
        },
        byIds: state.byIds.filter(id => id !== action.source.id),
        hasChanged: true,
      }
    case 'START_MOVE':
      return {
        ...state,
        isMoving: true,
      }
    case 'END_MOVE':
      return {
        ...state,
        isMoving: false,
      }
    default:
      return state
  }
}
