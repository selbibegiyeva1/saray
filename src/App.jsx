import './App.css';
import { Routes, Route } from "react-router-dom";

import Login from './routes/Login';
import Home from './routes/Home';
import Transactions from './routes/Transactions';
import Help from './routes/Help';
import Reports from './routes/Reports';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/transactions" element={<Transactions />} />
        <Route path="/help" element={<Help />} />
        <Route path="/reports" element={<Reports />} />
      </Routes>
    </div>
  )
}

export default App
