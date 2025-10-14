import React, { useEffect, useReducer } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { AppProvider, useAppContext } from './context/AppContext';
import Header from './components/Header';
import QuizList from './components/QuizList';
import QuizStart from './components/QuizStart';
import Quiz from './components/Quiz';
import Results from './components/Results';
import Login from './components/Login';
import AdminDashboard from './components/AdminDashboard';
import ProtectedRoute from './components/ProtectedRoute';

// This component will bridge the context dispatch to a global variable
const DispatcherSetter = () => {
  const { dispatch } = useAppContext();
  useEffect(() => {
    (window as any).appDispatch = dispatch;
  }, [dispatch]);
  return null;
};

const App: React.FC = () => {
  return (
    <AppProvider>
      <Router>
        {/* Make dispatch globally available for components outside context tree like Quiz */}
        <DispatcherSetter /> 
        <div className="bg-blue-50 min-h-screen font-sans" dir="rtl">
          <Header />
          <main className="container mx-auto p-4">
            <Routes>
              <Route path="/" element={<QuizList />} />
              <Route path="/quiz/start/:quizId" element={<QuizStart />} />
              <Route path="/quiz/:quizId" element={<Quiz />} />
              <Route path="/results/:quizId" element={<Results />} />
              <Route path="/login" element={<Login />} />
              <Route 
                path="/admin/*" 
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AppProvider>
  );
};

export default App;