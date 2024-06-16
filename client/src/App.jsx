import './App.css'
import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GamePlay from './pages/GamePlay'


function App() {

  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/match' element={<GamePlay />} />
      </Routes>
    </>
  )
}

export default App
