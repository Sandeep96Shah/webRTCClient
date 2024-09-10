import React from 'react';
import logo from './logo.svg';
import './App.css';
import { Routes, Route } from 'react-router-dom';
import LobbyScreen from './screens/lobbyScreen';
import RoomPage from './screens/RoomPage';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/' element={<LobbyScreen />} />
        <Route path='/room/:roomId' element={<RoomPage />} />
      </Routes>
    </div>
  );
}

export default App;
