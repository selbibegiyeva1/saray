import './App.css';
import "./i18n";
import { Routes, Route } from "react-router-dom";

import Login from './routes/Login';
import Home from './routes/Home';
import Transactions from './routes/Transactions';
import Help from './routes/Help';
import Reports from './routes/Reports';

import ProtectedRoute from './auth/ProtectedRoute';

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/home"
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path="/transactions"
          element={
            <ProtectedRoute>
              <Transactions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <Reports />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App
