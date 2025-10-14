import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { Result, Quiz } from '../types';
import Confetti from './Confetti';

const AnimatedStar = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-10 w-10 text-yellow-400 inline-block"
    viewBox="0 0 24 24"
    fill="currentColor"
    style={{ animation: 'pop-in 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55) forwards' }}
  >
    <style>{`
      @keyframes pop-in {
        0% { transform: scale(0); opacity: 0; }
        100% { transform: scale(1); opacity: 1; }
      }
    `}</style>
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);


const Results: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppContext();
  
  const [result, setResult] = useState<Result | null>(null);
  const [quiz, setQuiz] = useState<Quiz | null>(null);

  const lastResultId = location.state?.lastResultId;

  useEffect(() => {
    if (!quizId) return;

    const quizData = state.quizzes.find(q => q.id === quizId);
    setQuiz(quizData || null);

    const quizResults = state.results[quizId];
    if (quizResults && quizResults.length > 0) {
      const specificResult = lastResultId 
        ? quizResults.find(r => r.id === lastResultId) 
        : null;
      setResult(specificResult || quizResults[quizResults.length - 1]);
    }
  }, [quizId, state, navigate, lastResultId]);

  if (!result || !quiz) {
    return <div className="text-center p-8">تحميل النتائج...</div>;
  }

  const scorePercentage = Math.round((result.score / result.totalQuestions) * 100);
  const getMessage = () => {
      if(scorePercentage >= 80) return "عمل رائع! أنت نجم!";
      if(scorePercentage >= 50) return "أحسنت! استمر في المحاولة!";
      return "لا بأس، المحاولة القادمة ستكون أفضل!";
  }

  return (
    <div className="container mx-auto p-4 md:p-8 relative">
       {scorePercentage >= 50 && <Confetti />}
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center text-purple-600 mb-2 flex items-center justify-center gap-3">
            {getMessage()} {scorePercentage >= 50 && <AnimatedStar />}
        </h1>
        <p className="text-center text-xl text-gray-700 mb-2">
            مرحباً <span className="font-bold text-blue-600">{result.studentName}</span>!
        </p>
        <p className="text-center text-2xl text-gray-700 mb-6">
          نتيجتك هي: <span className="font-extrabold text-green-500">{result.score}</span> من <span className="font-extrabold">{result.totalQuestions}</span>
        </p>

        <div className="w-full bg-gray-200 rounded-full h-8 mb-8 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-yellow-400 to-orange-500 h-8 rounded-full flex items-center justify-center text-white font-bold text-lg [text-shadow:1px_1px_2px_rgba(0,0,0,0.4)] transition-all duration-1000" 
              style={{width: `${scorePercentage}%`}}>
                {scorePercentage}%
            </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-4 border-b-2 pb-2">مراجعة إجاباتك</h2>
        <div className="space-y-4">
          {quiz.questions.map((question, index) => {
            const userAnswerIndex = result.answers[index];
            const isCorrect = userAnswerIndex === question.correctAnswerIndex;
            return (
              <div key={question.id} className={`p-4 rounded-lg border-2 ${isCorrect ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                <p className="font-bold text-lg text-black">{index + 1}. {question.question}</p>
                <p className="mt-2">
                  <span className="font-semibold">إجابتك: </span> 
                  <span className={`${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                    {userAnswerIndex > -1 ? question.options[userAnswerIndex] : 'لم تتم الإجابة'}
                  </span>
                </p>
                {!isCorrect && (
                  <p className="mt-1">
                    <span className="font-semibold">الإجابة الصحيحة: </span>
                    <span className="text-blue-700">{question.options[question.correctAnswerIndex]}</span>
                  </p>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex justify-center gap-4 mt-8">
          <button onClick={() => navigate(`/quiz/start/${quizId}`)} className="bg-blue-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-600 transition-colors">
            المحاولة مرة أخرى
          </button>
          <button onClick={() => navigate('/')} className="bg-gray-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-600 transition-colors">
            العودة للقائمة الرئيسية
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;