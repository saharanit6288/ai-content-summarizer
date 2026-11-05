
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AppLayout from "./components/layout/AppLayout";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Summarize from "./pages/Summarize";
import SummarizeUrl from "./pages/SummarizeUrl";
import SummarizeFile from "./pages/SummarizeFile";
import SummaryHistory from "./pages/SummaryHistory";
import SummaryDetails from "./pages/SummaryDetails";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route element={<ProtectedRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/summarize" element={<Summarize />} />
              <Route path="/summarize/url" element={<SummarizeUrl />} />
              <Route path="/summarize/file" element={<SummarizeFile />} />
              <Route path="/history" element={<SummaryHistory />} />
              <Route path="/history/:id" element={<SummaryDetails />} />
            </Route>
          </Route>

          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
