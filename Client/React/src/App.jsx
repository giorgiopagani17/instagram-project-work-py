import React, { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Login from './pages/login.jsx'
import Home from './pages/home.jsx'
import Profile from './pages/profile.jsx'
import Esplora from './pages/esplora.jsx'
import Register from './pages/register.jsx'
import Unauthorized from './pages/unauthorized.jsx'


function App() {
  //reindirizzamenti Url
  return (
    <div> 
      <Routes> 
        <Route path="/" element = {<Login />} />
        <Route path="/home" element = {<Home />} />
        <Route path="/unauthorized" element = {<Unauthorized />} />
        <Route path="/register" element = {<Register />} />
        <Route path="/esplora" element = {<Esplora />} />
        <Route path="/profile/:id" element = {<Profile />} />
      </Routes>
    </div>
  )
}

export default App
