
import React, { createContext, useReducer, useContext, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { AppState, Action, Quiz, Question, Result, User } from '../types';

const SUPER_ADMIN_EMAIL = 'bm424018@gmail.com';

const initialState: AppState = {
  quizzes: [],
  results: {},
  users: [
    {
      id: 'super_admin_01',
      email: SUPER_ADMIN_EMAIL,
      password: 'Admin040698',
      isSuperAdmin: true,
    }
  ],
  currentUser: null,
};

const AppContext = createContext<{ state: AppState; dispatch: React.Dispatch<Action> }>({
  state: initialState,
  dispatch: () => null,
});

function appReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_STATE':
      return action.payload;
    case 'ADD_QUIZ':
      return { ...state, quizzes: [...state.quizzes, action.payload] };
    case 'UPDATE_QUIZ':
      return {
        ...state,
        quizzes: state.quizzes.map(q => q.id === action.payload.id ? action.payload : q),
      };
    case 'DELETE_QUIZ':
      const newQuizzes = state.quizzes.filter(q => q.id !== action.payload);
      const newResults = { ...state.results };
      delete newResults[action.payload];
      return { ...state, quizzes: newQuizzes, results: newResults };
    case 'ADD_QUESTION': {
      return {
        ...state,
        quizzes: state.quizzes.map(q =>
          q.id === action.payload.quizId
            ? { ...q, questions: [...q.questions, action.payload.question] }
            : q
        ),
      };
    }
    case 'UPDATE_QUESTION': {
       return {
        ...state,
        quizzes: state.quizzes.map(q =>
          q.id === action.payload.quizId
            ? { ...q, questions: q.questions.map(qu => qu.id === action.payload.question.id ? action.payload.question : qu) }
            : q
        ),
      };
    }
    case 'DELETE_QUESTION': {
      return {
        ...state,
        quizzes: state.quizzes.map(q =>
          q.id === action.payload.quizId
            ? { ...q, questions: q.questions.filter(qu => qu.id !== action.payload.questionId) }
            : q
        ),
      };
    }
    case 'ADD_RESULT': {
        const { quizId } = action.payload;
        const quizResults = state.results[quizId] || [];
        return {
            ...state,
            results: {
                ...state.results,
                [quizId]: [...quizResults, action.payload],
            },
        };
    }
    case 'LOGIN': {
      const { email, password } = action.payload;
      const user = state.users.find(u => u.email === email && u.password === password);
      if (user) {
        return { ...state, currentUser: user };
      }
      return state;
    }
    case 'LOGOUT': {
      return { ...state, currentUser: null };
    }
    case 'ADD_ADMIN': {
      if (state.users.some(u => u.email === action.payload.email)) {
        return state; // Prevent duplicate emails
      }
      const newUser: User = {
        ...action.payload,
        id: `user_${Date.now()}`,
        isSuperAdmin: false,
      };
      return { ...state, users: [...state.users, newUser] };
    }
    case 'DELETE_ADMIN': {
      const userToDelete = state.users.find(u => u.id === action.payload);
      if (userToDelete && !userToDelete.isSuperAdmin) {
        return { ...state, users: state.users.filter(u => u.id !== action.payload) };
      }
      return state;
    }
    default:
      return state;
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [persistedState, setPersistedState] = useLocalStorage<AppState>('quiz-app-state', initialState);
  const [state, dispatch] = useReducer(appReducer, persistedState);
  
  useEffect(() => {
    setPersistedState(state);
  }, [state, setPersistedState]);
  
  return <AppContext.Provider value={{ state, dispatch }}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);
