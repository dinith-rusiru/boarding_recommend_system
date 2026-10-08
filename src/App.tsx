import React from 'react';
import { BrowserRouter, Routes, Route, HashRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';

import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { PreferencesPage } from './pages/PreferencesPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { BoardingDetailsPage } from './pages/BoardingDetailsPage';
import { LandlordDashboard } from './pages/LandlordDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { AlgorithmDocPage } from './pages/AlgorithmDocPage';
import { EvaluationPage } from './pages/EvaluationPage';

export function App() {
  return (
    <HashRouter>
      <AuthProvider>
        <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
          <Navbar />
          <main className="flex-1">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/recommendations" element={<RecommendationsPage />} />
              <Route path="/boarding/:id" element={<BoardingDetailsPage />} />
              <Route path="/algorithm" element={<AlgorithmDocPage />} />
              <Route path="/evaluation" element={<EvaluationPage />} />

              {/* Student Routes */}
              <Route
                path="/student/preferences"
                element={
                  <ProtectedRoute allowedRoles={['student', 'admin']}>
                    <PreferencesPage />
                  </ProtectedRoute>
                }
              />

              {/* Landlord Routes */}
              <Route
                path="/landlord/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['landlord', 'admin']}>
                    <LandlordDashboard />
                  </ProtectedRoute>
                }
              />

              {/* Admin Routes */}
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </HashRouter>
  );
}

export default App;
