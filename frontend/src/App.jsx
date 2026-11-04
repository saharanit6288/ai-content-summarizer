
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Register from "./pages/Register";

function Dashboard() {
  return <h1>Dashboard - Coming soon</h1>;
}

function Summarize() {
  return <h1>Summarize - Coming soon</h1>;
}

function SummaryHistory() {
  return <h1>Summary History - Coming soon</h1>;
}

function SummaryDetails() {
  return <h1>Summary Details - Coming soon</h1>;
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/summarize" element={<Summarize />} />
            <Route path="/history" element={<SummaryHistory />} />
            <Route path="/history/:id" element={<SummaryDetails />} />
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
