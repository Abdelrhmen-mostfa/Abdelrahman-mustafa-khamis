import React, { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAppContext } from '../context/AppContext';

const QuizStart: React.FC = () => {
    const { quizId } = useParams<{ quizId: string }>();
    const { state } = useAppContext();
    const navigate = useNavigate();
    const quiz = state.quizzes.find(q => q.id === quizId);
    
    const [studentName, setStudentName] = useState('');
    const [error, setError] = useState('');

    const handleStartQuiz = (e: React.FormEvent) => {
        e.preventDefault();
        if (studentName.trim()) {
            navigate(`/quiz/${quiz?.id}`, { state: { studentName: studentName.trim() } });
        } else {
            setError('الرجاء إدخال اسمك لبدء الاختبار!');
        }
    };

    if (!quiz) {
        return (
            <div className="text-center p-8">
                <h1 className="text-2xl font-bold text-red-500">الاختبار غير موجود!</h1>
                <Link to="/" className="text-blue-500 hover:underline mt-4 inline-block">العودة إلى القائمة الرئيسية</Link>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] text-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-2xl w-full">
                <h1 className="text-4xl md:text-5xl font-extrabold text-gray-800 mb-4">{quiz.title}</h1>
                <p className="text-lg text-gray-600 mb-8">{quiz.description}</p>
                
                <form onSubmit={handleStartQuiz} className="w-full max-w-sm mx-auto">
                    <div className="mb-4">
                        <label htmlFor="studentName" className="block text-xl font-semibold text-gray-700 mb-4">
                            أدخل اسمك لتبدأ
                        </label>
                        <input
                            id="studentName"
                            type="text"
                            placeholder="اكتب اسمك هنا"
                            value={studentName}
                            onChange={(e) => {
                                setStudentName(e.target.value);
                                if (error) setError('');
                            }}
                            className="w-full px-4 py-3 text-center border-2 border-gray-300 rounded-full shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-lg"
                            required
                        />
                         {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                    </div>
                   
                    <div className="flex justify-center gap-4 mt-6">
                         <button
                            type="submit"
                            disabled={!studentName.trim()}
                            className="bg-purple-600 text-white font-bold py-4 px-10 rounded-full text-lg hover:bg-purple-700 transition-transform transform hover:scale-105 disabled:bg-purple-300 disabled:cursor-not-allowed"
                        >
                            لنبدأ!
                        </button>
                        <button
                            type="button"
                            onClick={() => navigate('/')}
                            className="bg-gray-300 text-gray-800 font-bold py-4 px-10 rounded-full text-lg hover:bg-gray-400 transition-colors"
                        >
                            العودة
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default QuizStart;