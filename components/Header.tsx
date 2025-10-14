
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const Header: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const navigate = useNavigate();

  const handleLogout = () => {
    dispatch({ type: 'LOGOUT' });
    navigate('/');
  };

  return (
    <header className="bg-white shadow-md p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600 hover:text-blue-800 transition-colors">
          مغامرة الألغاز
        </Link>
        <nav>
          {state.currentUser ? (
            <div className="flex items-center gap-4">
               <span className="text-gray-700">مرحباً, {state.currentUser.email}</span>
               {/* FIX: Changed text color to white for better contrast */}
               <button onClick={handleLogout} className="bg-red-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-red-600 transition-colors">
                 تسجيل الخروج
               </button>
            </div>
          ) : (
            <Link to="/admin" className="text-gray-700 hover:text-blue-600 font-semibold transition-colors">
              لوحة التحكم
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
