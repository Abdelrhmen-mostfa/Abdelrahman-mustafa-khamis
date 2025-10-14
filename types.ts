export interface Question {
  id: string;
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

export interface Quiz {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

export interface Result {
  id: string; // Unique ID for each quiz attempt
  quizId: string;
  studentName: string; // The name of the student who took the quiz
  score: number;
  totalQuestions: number;
  answers: number[]; // array of selected option indices
  timestamp: number;
}

export interface User {
  id:string;
  email: string;
  password: string;
  isSuperAdmin: boolean;
}

export interface AppState {
  quizzes: Quiz[];
  results: { [quizId: string]: Result[] };
  users: User[];
  currentUser: User | null;
}

export type Action =
  | { type: 'SET_STATE'; payload: AppState }
  | { type: 'ADD_QUIZ'; payload: Quiz }
  | { type: 'UPDATE_QUIZ'; payload: Quiz }
  | { type: 'DELETE_QUIZ'; payload: string } // quizId
  | { type: 'ADD_QUESTION'; payload: { quizId: string; question: Question } }
  | { type: 'UPDATE_QUESTION'; payload: { quizId: string; question: Question } }
  | { type: 'DELETE_QUESTION'; payload: { quizId: string; questionId: string } }
  | { type: 'ADD_RESULT'; payload: Result }
  | { type: 'LOGIN'; payload: { email: string; password: string } }
  | { type: 'LOGOUT' }
  | { type: 'ADD_ADMIN'; payload: Omit<User, 'id' | 'isSuperAdmin'> }
  | { type: 'DELETE_ADMIN'; payload: string }; // userId