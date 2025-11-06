import './App.css';
import "./i18n";
import { Routes, Route, Outlet } from "react-router-dom";

import Login from './routes/Login';
import Home from './routes/Home';
import Transactions from './routes/Transactions';
import Help from './routes/Help';
import Reports from './routes/Reports';

import ProtectedRoute from './auth/ProtectedRoute';
import PublicOnlyRoute from "./auth/PublicOnlyRoute";

import Navbar from "./components/Navbar";

import Home2 from './routes2/Home2';
import Digital from './routes2/Digital';
import Esim from './routes2/eSim';
import Steam from './routes2/Steam';
import Transactions2 from './routes2/Transactions2';

// Shell with Navbar shown on ALL protected pages
function ProtectedLayout() {
  return (
    <div className="App">
      <Navbar />
      <Outlet />
    </div>
  );
}

function App() {
  return (
    <div className="App">
      <Routes>
        {/* Public: NO Navbar */}
        <Route
          path="/"
          element={
            <PublicOnlyRoute>
              <Login />
            </PublicOnlyRoute>
          }
        />

        {/* Protected: Navbar visible on every child route */}
        <Route
          element={
            <ProtectedRoute>
              <ProtectedLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/home" element={<Home />} />
          <Route path="/transactions" element={<Transactions />} />
          <Route path="/help" element={<Help />} />
          <Route path="/reports" element={<Reports />} />

          <Route path="/operator" element={<Home2 />} />
          <Route path="/digital" element={<Digital />} />
          <Route path="/esim" element={<Esim />} />
          <Route path="/steam" element={<Steam />} />
          <Route path="/operator_transactions" element={<Transactions2 />} />
        </Route>
      </Routes>
    </div>
  );
}

export default App;