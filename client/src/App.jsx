import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import LoadingScreen from './components/LoadingScreen';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CharacterCreation from './pages/CharacterCreation';
import Dashboard from './pages/Dashboard';
import QuestBoard from './pages/QuestBoard';
import QuestPlay from './pages/QuestPlay';
import MiniGameArcade from './pages/MiniGameArcade';
import Achievements from './pages/Achievements';
import Leaderboard from './pages/Leaderboard';
import Social from './pages/Social';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!user) return <Navigate to="/login" replace />;
  return children;
}

function CharacterRequired({ children }) {
  const { character, loading } = useAuth();
  if (loading) return <LoadingScreen />;
  if (!character) return <Navigate to="/create-character" replace />;
  return children;
}

export default function App() {
  const { user, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  return (
    <div className="min-h-screen">
      <div className="bg-animated" />
      {user && <Navbar />}
      <main className={user ? 'pt-20 pb-8 px-4 max-w-7xl mx-auto' : ''}>
        <Routes>
          <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <LoginPage />} />
          <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <RegisterPage />} />
          <Route path="/create-character" element={
            <ProtectedRoute><CharacterCreation /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute><CharacterRequired><Dashboard /></CharacterRequired></ProtectedRoute>
          } />
          <Route path="/quests" element={
            <ProtectedRoute><CharacterRequired><QuestBoard /></CharacterRequired></ProtectedRoute>
          } />
          <Route path="/quests/:id" element={
            <ProtectedRoute><CharacterRequired><QuestPlay /></CharacterRequired></ProtectedRoute>
          } />
          <Route path="/arcade" element={
            <ProtectedRoute><CharacterRequired><MiniGameArcade /></CharacterRequired></ProtectedRoute>
          } />
          <Route path="/achievements" element={
            <ProtectedRoute><CharacterRequired><Achievements /></CharacterRequired></ProtectedRoute>
          } />
          <Route path="/leaderboard" element={
            <ProtectedRoute><CharacterRequired><Leaderboard /></CharacterRequired></ProtectedRoute>
          } />
          <Route path="/social" element={
            <ProtectedRoute><CharacterRequired><Social /></CharacterRequired></ProtectedRoute>
          } />
          <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </main>
    </div>
  );
}
