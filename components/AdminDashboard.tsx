import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { PlusIcon, EditIcon, TrashIcon, SparklesIcon } from './icons/Icons';
import type { Quiz, Question } from '../types';
import { generateQuizQuestions } from '../services/geminiService';

const AdminDashboard: React.FC = () => {
  const { state, dispatch } = useAppContext();
  const [activeTab, setActiveTab] = useState('quizzes'); // 'quizzes', 'admins'
  
  // Quiz Management State
  const [isQuizModalOpen, setIsQuizModalOpen] = useState(false);
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const [editingQuiz, setEditingQuiz] = useState<Quiz | null>(null);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentQuizIdForQuestion, setCurrentQuizIdForQuestion] = useState<string | null>(null);

  // Admin Management State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');

  // AI Generation State
  const [aiTopic, setAiTopic] = useState('');
  const [aiQuestionCount, setAiQuestionCount] = useState(5);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiError, setAiError] = useState('');

  // Handlers for Quizzes
  const openQuizModal = (quiz: Quiz | null = null) => {
    setEditingQuiz(quiz);
    setIsQuizModalOpen(true);
  };
  
  const closeQuizModal = () => {
    setEditingQuiz(null);
    setIsQuizModalOpen(false);
  };

  const handleQuizSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;

    if (editingQuiz) {
      dispatch({ type: 'UPDATE_QUIZ', payload: { ...editingQuiz, title, description } });
    } else {
      const newQuiz: Quiz = {
        id: `quiz_${Date.now()}`,
        title,
        description,
        questions: [],
      };
      dispatch({ type: 'ADD_QUIZ', payload: newQuiz });
    }
    closeQuizModal();
  };
  
  const deleteQuiz = (quizId: string) => {
    if (window.confirm('هل أنت متأكد من أنك تريد حذف هذا الاختبار وجميع نتائجه؟')) {
        dispatch({ type: 'DELETE_QUIZ', payload: quizId });
    }
  };

  // Handlers for Questions
  const openQuestionModal = (quizId: string, question: Question | null = null) => {
      setCurrentQuizIdForQuestion(quizId);
      setEditingQuestion(question);
      setIsQuestionModalOpen(true);
  };

  const closeQuestionModal = () => {
      setCurrentQuizIdForQuestion(null);
      setEditingQuestion(null);
      setIsQuestionModalOpen(false);
  };

  const handleQuestionSubmit = (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const formData = new FormData(e.currentTarget);
      const questionText = formData.get('question') as string;
      const options = [
          formData.get('option0') as string,
          formData.get('option1') as string,
          formData.get('option2') as string,
          formData.get('option3') as string,
      ];
      const correctAnswerIndex = parseInt(formData.get('correctAnswerIndex') as string, 10);

      if (!currentQuizIdForQuestion) return;

      if (editingQuestion) {
          const updatedQuestion: Question = { ...editingQuestion, question: questionText, options, correctAnswerIndex };
          dispatch({ type: 'UPDATE_QUESTION', payload: { quizId: currentQuizIdForQuestion, question: updatedQuestion }});
      } else {
          const newQuestion: Question = {
              id: `question_${Date.now()}`,
              question: questionText,
              options,
              correctAnswerIndex,
          };
          dispatch({ type: 'ADD_QUESTION', payload: { quizId: currentQuizIdForQuestion, question: newQuestion }});
      }
      closeQuestionModal();
  };

  const deleteQuestion = (quizId: string, questionId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا السؤال؟')) {
        dispatch({ type: 'DELETE_QUESTION', payload: { quizId, questionId }});
    }
  };

  // Handlers for AI Generation
  const openAiModal = (quizId: string) => {
    setCurrentQuizIdForQuestion(quizId);
    setAiTopic('');
    setAiQuestionCount(5);
    setAiError('');
    setIsAiModalOpen(true);
  };

  const closeAiModal = () => {
    setIsAiModalOpen(false);
    setCurrentQuizIdForQuestion(null);
  };

  const handleAiGenerate = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!currentQuizIdForQuestion) return;

    setIsGenerating(true);
    setAiError('');
    try {
        const questions = await generateQuizQuestions(aiTopic, aiQuestionCount);
        questions.forEach(q => {
            const newQuestion: Question = {
                id: `question_${Date.now()}_${Math.random()}`,
                ...q,
            };
            dispatch({ type: 'ADD_QUESTION', payload: { quizId: currentQuizIdForQuestion!, question: newQuestion }});
        });
        closeAiModal();
    } catch (error: any) {
        setAiError(error.message || 'فشل في إنشاء الأسئلة.');
    } finally {
        setIsGenerating(false);
    }
  };

  // Handlers for Admins
  const openAdminModal = () => setIsAdminModalOpen(true);
  const closeAdminModal = () => {
    setAdminEmail('');
    setAdminPassword('');
    setIsAdminModalOpen(false);
  }

  const handleAdminSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch({ type: 'ADD_ADMIN', payload: { email: adminEmail, password: adminPassword } });
    closeAdminModal();
  };

  const deleteAdmin = (userId: string) => {
    if (window.confirm('هل أنت متأكد أنك تريد حذف هذا المسؤول؟')) {
        dispatch({ type: 'DELETE_ADMIN', payload: userId });
    }
  };
  
  const renderQuizManager = () => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">إدارة الاختبارات</h2>
            <button onClick={() => openQuizModal()} className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
                <PlusIcon /> اختبار جديد
            </button>
        </div>
        <div className="space-y-4">
            {state.quizzes.map(quiz => {
                const quizResults = (state.results && state.results[quiz.id]) || [];
                return (
                    <div key={quiz.id} className="bg-white p-4 rounded-lg shadow">
                        <div className="flex justify-between items-center">
                            <div>
                                <h3 className="text-xl font-bold">{quiz.title}</h3>
                                <p className="text-gray-600">{quiz.description}</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => openQuizModal(quiz)} className="p-2 hover:bg-gray-200 rounded-full"><EditIcon /></button>
                                <button onClick={() => deleteQuiz(quiz.id)} className="p-2 hover:bg-gray-200 rounded-full"><TrashIcon /></button>
                            </div>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <div className="flex justify-between items-center mb-2">
                               <h4 className="font-semibold">الأسئلة ({quiz.questions.length})</h4>
                               <div className="flex gap-2">
                                 <button onClick={() => openAiModal(quiz.id)} className="bg-purple-500 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-purple-600 flex items-center gap-1">
                                    <SparklesIcon /> إنشاء بالذكاء الاصطناعي
                                 </button>
                                 <button onClick={() => openQuestionModal(quiz.id)} className="bg-green-500 text-white text-sm font-semibold px-3 py-1 rounded-md hover:bg-green-600 flex items-center gap-1">
                                    <PlusIcon /> سؤال جديد
                                 </button>
                               </div>
                            </div>
                            <ul className="space-y-2">
                                {quiz.questions.map((q, index) => (
                                    <li key={q.id} className="flex justify-between items-center bg-gray-50 p-2 rounded">
                                        <span className="text-black">{index + 1}. {q.question}</span>
                                        <div className="flex items-center gap-2">
                                            <button onClick={() => openQuestionModal(quiz.id, q)} className="p-1 hover:bg-gray-200 rounded-full"><EditIcon /></button>
                                            <button onClick={() => deleteQuestion(quiz.id, q.id)} className="p-1 hover:bg-gray-200 rounded-full"><TrashIcon /></button>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="mt-4 pt-4 border-t">
                            <h4 className="font-semibold mb-2">نتائج الطلاب ({quizResults.length})</h4>
                            {quizResults.length > 0 ? (
                                <div className="overflow-x-auto relative rounded-lg border">
                                    <table className="w-full text-sm text-left text-gray-500">
                                        <thead className="text-xs text-gray-700 uppercase bg-gray-100">
                                            <tr>
                                                <th scope="col" className="px-6 py-3">اسم الطالب</th>
                                                <th scope="col" className="px-6 py-3">النتيجة</th>
                                                <th scope="col" className="px-6 py-3">التاريخ</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quizResults.sort((a,b) => b.timestamp - a.timestamp).map(result => (
                                                <tr key={result.id} className="bg-white border-b hover:bg-gray-50">
                                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap">{result.studentName}</td>
                                                    <td className="px-6 py-4">{result.score} / {result.totalQuestions}</td>
                                                    <td className="px-6 py-4">{new Date(result.timestamp).toLocaleString('ar-EG')}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 text-sm">لا توجد نتائج لهذا الاختبار حتى الآن.</p>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
  );

  const renderAdminManager = () => (
    <div>
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-3xl font-bold">إدارة المسؤولين</h2>
            <button onClick={openAdminModal} className="bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2">
                <PlusIcon /> مسؤول جديد
            </button>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
            <ul className="divide-y">
                {state.users.map(user => (
                    <li key={user.id} className="flex justify-between items-center py-3">
                        <div>
                            <p className="font-semibold">{user.email}</p>
                            {user.isSuperAdmin && <span className="text-xs bg-yellow-300 text-yellow-800 px-2 py-1 rounded-full">مشرف خارق</span>}
                        </div>
                        {!user.isSuperAdmin && (
                            <button onClick={() => deleteAdmin(user.id)} className="p-2 hover:bg-gray-200 rounded-full"><TrashIcon /></button>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    </div>
  );

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8">لوحة التحكم</h1>
      
      <div className="mb-6 border-b">
        <nav className="flex gap-4">
          <button onClick={() => setActiveTab('quizzes')} className={`py-2 px-4 font-semibold ${activeTab === 'quizzes' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
            الاختبارات
          </button>
          {state.currentUser?.isSuperAdmin && (
            <button onClick={() => setActiveTab('admins')} className={`py-2 px-4 font-semibold ${activeTab === 'admins' ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}>
              المسؤولون
            </button>
          )}
        </nav>
      </div>

      {activeTab === 'quizzes' ? renderQuizManager() : renderAdminManager()}

      {/* Quiz Modal */}
      {isQuizModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{editingQuiz ? 'تعديل الاختبار' : 'إضافة اختبار جديد'}</h2>
                <form onSubmit={handleQuizSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block mb-2 font-semibold">العنوان</label>
                        <input type="text" id="title" name="title" defaultValue={editingQuiz?.title || ''} required className="w-full p-2 border rounded"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="description" className="block mb-2 font-semibold">الوصف</label>
                        <textarea id="description" name="description" defaultValue={editingQuiz?.description || ''} required className="w-full p-2 border rounded"></textarea>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={closeQuizModal} className="px-4 py-2 bg-gray-300 rounded">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">{editingQuiz ? 'تحديث' : 'إنشاء'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-lg">
                <h2 className="text-2xl font-bold mb-4">{editingQuestion ? 'تعديل السؤال' : 'إضافة سؤال جديد'}</h2>
                <form onSubmit={handleQuestionSubmit} className="space-y-4">
                    <div>
                        <label className="block mb-1 font-semibold">نص السؤال</label>
                        <input type="text" name="question" defaultValue={editingQuestion?.question || ''} required className="w-full p-2 border rounded" />
                    </div>
                    {[0,1,2,3].map(i => (
                        <div key={i}>
                            <label className="block mb-1 font-semibold">الخيار {i + 1}</label>
                            <input type="text" name={`option${i}`} defaultValue={editingQuestion?.options[i] || ''} required className="w-full p-2 border rounded" />
                        </div>
                    ))}
                    <div>
                        <label className="block mb-1 font-semibold">الإجابة الصحيحة</label>
                        <select name="correctAnswerIndex" defaultValue={editingQuestion?.correctAnswerIndex ?? 0} className="w-full p-2 border rounded">
                           <option value="0">الخيار 1</option>
                           <option value="1">الخيار 2</option>
                           <option value="2">الخيار 3</option>
                           <option value="3">الخيار 4</option>
                        </select>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={closeQuestionModal} className="px-4 py-2 bg-gray-300 rounded">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">{editingQuestion ? 'تحديث' : 'إضافة'}</button>
                    </div>
                </form>
            </div>
        </div>
      )}

      {/* AI Modal */}
      {isAiModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2"><SparklesIcon /> إنشاء أسئلة بالذكاء الاصطناعي</h2>
                <form onSubmit={handleAiGenerate}>
                    <div className="mb-4">
                        <label htmlFor="topic" className="block mb-2 font-semibold">موضوع الاختبار</label>
                        <input type="text" id="topic" value={aiTopic} onChange={e => setAiTopic(e.target.value)} required className="w-full p-2 border rounded" placeholder="مثال: الكواكب في المجموعة الشمسية"/>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="count" className="block mb-2 font-semibold">عدد الأسئلة</label>
                        <input type="number" id="count" value={aiQuestionCount} onChange={e => setAiQuestionCount(parseInt(e.target.value))} min="1" max="10" required className="w-full p-2 border rounded"/>
                    </div>
                    {aiError && <p className="text-red-500 mb-4">{aiError}</p>}
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={closeAiModal} className="px-4 py-2 bg-gray-300 rounded" disabled={isGenerating}>إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-purple-500 text-white rounded flex items-center gap-2" disabled={isGenerating}>
                            {isGenerating ? 'جاري الإنشاء...' : 'إنشاء'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
      )}

       {/* Admin Modal */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">إضافة مسؤول جديد</h2>
                <form onSubmit={handleAdminSubmit}>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">البريد الإلكتروني</label>
                        <input type="email" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} required className="w-full p-2 border rounded"/>
                    </div>
                    <div className="mb-4">
                        <label className="block mb-2 font-semibold">كلمة المرور</label>
                        <input type="password" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} required className="w-full p-2 border rounded"/>
                    </div>
                    <div className="flex justify-end gap-4">
                        <button type="button" onClick={closeAdminModal} className="px-4 py-2 bg-gray-300 rounded">إلغاء</button>
                        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded">إضافة</button>
                    </div>
                </form>
            </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;