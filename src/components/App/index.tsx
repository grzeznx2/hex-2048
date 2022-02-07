import { useSearchParams } from 'react-router-dom'
import Game from '../Game'
import Wizard from '../Wizard'

import './App.css'

const App = () => {
  const [searchParams] = useSearchParams()
  const radius = searchParams.get('radius')
  const port = searchParams.get('port')
  const hostname = searchParams.get('hostname')

  if (port && radius && hostname) {
    return (
      <div className="app">
        <Game port={port} radius={radius} hostname={hostname} />
      </div>
    )
  }

  return (
    <div className="app">
      <Wizard />
    </div>
  )
}

export default App
