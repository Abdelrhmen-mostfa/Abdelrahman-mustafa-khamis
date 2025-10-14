import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';
import type { Quiz as QuizType } from '../types';
import { ChevronLeftIcon, ChevronRightIcon } from './icons/Icons';

const Quiz: React.FC = () => {
  const { quizId } = useParams<{ quizId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = useAppContext();
  const dispatch = (window as any).appDispatch; // Use shared dispatcher

  const studentName = location.state?.studentName;

  const [quiz, setQuiz] = useState<QuizType | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [timeLeft, setTimeLeft] = useState(15);

  useEffect(() => {
    if (!studentName && quizId) {
      // If no name is provided, redirect back to the start page to enter it.
      navigate(`/quiz/start/${quizId}`, { replace: true });
    }
  }, [studentName, quizId, navigate]);

  useEffect(() => {
    const foundQuiz = state.quizzes.find(q => q.id === quizId);
    if (foundQuiz) {
      setQuiz(foundQuiz);
      setAnswers(new Array(foundQuiz.questions.length).fill(-1));
    } else {
      navigate('/');
    }
  }, [quizId, state.quizzes, navigate]);

  useEffect(() => {
    if (!quiz || currentQuestionIndex >= quiz.questions.length || !studentName) return;

    setTimeLeft(15);
    const timer = setInterval(() => {
      setTimeLeft(prevTime => {
        if (prevTime <= 1) {
          clearInterval(timer);
          handleNextQuestion();
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestionIndex, quiz, studentName]);

  const handleAnswerSelect = (optionIndex: number) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestionIndex] = optionIndex;
    setAnswers(newAnswers);
  };

  const handleNextQuestion = () => {
    if (quiz && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      handleSubmit();
    }
  };
  
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    return answers.reduce((score, answer, index) => {
      if (quiz && answer === quiz.questions[index].correctAnswerIndex) {
        return score + 1;
      }
      return score;
    }, 0);
  };

  const handleSubmit = () => {
    if (!quiz || !studentName) return;
    
    const score = calculateScore();
    const resultId = `result_${Date.now()}`;

    dispatch({
      type: 'ADD_RESULT',
      payload: {
        id: resultId,
        quizId: quiz.id,
        studentName,
        score,
        totalQuestions: quiz.questions.length,
        answers,
        timestamp: Date.now(),
      },
    });
    navigate(`/results/${quiz.id}`, { state: { lastResultId: resultId } });
  };
  
  if (!quiz || !studentName) {
    return <div className="text-center p-8">تحميل الاختبار...</div>;
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const progress = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;

  return (
    <div className="container mx-auto p-4 md:p-8 flex justify-center">
      <div className="bg-white rounded-2xl shadow-2xl p-6 md:p-10 w-full max-w-3xl">
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold text-gray-700">سؤال {currentQuestionIndex + 1} من {quiz.questions.length}</h2>
             <div className="text-lg font-bold text-red-500">الوقت المتبقي: {timeLeft} ثانية</div>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-4">
            <div className="bg-blue-500 h-4 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
          </div>
        </div>

        <div className="mb-8">
          <p className="text-2xl md:text-3xl font-semibold text-right text-black mb-8 min-h-[80px]">{currentQuestion.question}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {currentQuestion.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`p-4 rounded-lg text-lg font-semibold text-right border-4 transition-all duration-200
                  ${answers[currentQuestionIndex] === index
                    ? 'bg-yellow-200 border-yellow-400 scale-105'
                    : 'bg-white border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="flex justify-between items-center">
            <button
                onClick={handlePrevQuestion}
                disabled={currentQuestionIndex === 0}
                className="bg-gray-300 text-gray-700 font-bold py-3 px-6 rounded-lg hover:bg-gray-400 disabled:bg-gray-200 disabled:cursor-not-allowed flex items-center gap-2"
            >
                <ChevronRightIcon />
                السابق
            </button>
            
            {currentQuestionIndex < quiz.questions.length - 1 ? (
            <button
                onClick={handleNextQuestion}
                className="bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 flex items-center gap-2"
            >
                التالي
                <ChevronLeftIcon />
            </button>
            ) : (
            <button
                onClick={handleSubmit}
                className="bg-purple-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-purple-700"
            >
                إنهاء وتسليم
            </button>
            )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;