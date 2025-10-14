
import React from 'react';
import { Link } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const QuizList: React.FC = () => {
  const { state } = useAppContext();

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        اختر مغامرتك!
      </h1>
      {state.quizzes.length === 0 ? (
        <p className="text-center text-gray-500 text-lg">
          لا توجد اختبارات متاحة حاليًا. يرجى التحقق مرة أخرى لاحقًا!
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {state.quizzes.map((quiz) => (
            <div key={quiz.id} className="bg-white rounded-xl shadow-lg hover:shadow-2xl transform hover:-translate-y-2 transition-all duration-300 overflow-hidden">
              <div className="p-6">
                <h2 className="text-2xl font-bold text-blue-600 mb-2">{quiz.title}</h2>
                <p className="text-gray-600 mb-6 h-16">{quiz.description}</p>
                <Link
                  to={`/quiz/start/${quiz.id}`}
                  // FIX: Changed text color to white for better contrast
                  className="w-full inline-block text-center bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors"
                >
                  ابدأ الاختبار
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default QuizList;
