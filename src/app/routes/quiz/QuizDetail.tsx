import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
// Giả định các Component UI đã tồn tại ở các thư mục đã cho
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card'; 
import { Button } from '../../../components/common/Button'; 
import { Avatar, AvatarFallback, AvatarImage } from '../../../components/common/Avatar'; 
import { Badge } from '../../../components/common/Badge'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/common/Tabs';
import { ArrowLeft, Calendar, Clock, Users, Trophy, Target, CheckCircle, XCircle } from 'lucide-react';

// 🛑 MOCK DATA ĐÃ ĐƯỢC CHUẨN HÓA SANG PASCALCASE 🛑
const mockQuizDetails = {
    '1': {
        QuizTitle: 'Toán học cơ bản lớp 6',
        NumberOfCorrectAnswers: 17,
        NumberOfWrongAnswers: 3,
        TotalQuestions: 20,
        FinalScore: 85,
        Rank: 2,
        StartDate: '2024-11-03T14:00:00Z',
        CompletedAt: '2024-11-03T14:30:00Z',
        CompletedBy: 'Nguyễn Văn An',
        Participants: [
            { id: '1', nickname: 'Nguyễn Văn An', rank: 2, correctAnswers: 17, unanswered: 0, finalScore: 85, avatarUrl: 'https://i.pravatar.cc/150?img=1' },
            { id: '2', nickname: 'Trần Thị Bình', rank: 1, correctAnswers: 19, unanswered: 1, finalScore: 95, avatarUrl: 'https://i.pravatar.cc/150?img=2' },
            { id: '3', nickname: 'Lê Văn Cường', rank: 3, correctAnswers: 15, unanswered: 2, finalScore: 75, avatarUrl: 'https://i.pravatar.cc/150?img=3' }
        ],
        Questions: [
            { id: '1', questionText: 'Tính 15 + 27 = ?', userAnswer: '42', correctAnswer: '42', isCorrect: true, options: ['40', '41', '42', '43'] },
            { id: '2', questionText: 'Tính 8 × 7 = ?', userAnswer: '54', correctAnswer: '56', isCorrect: false, options: ['54', '55', '56', '57'] }
        ]
    }
    // ... các quiz khác ...
};

export default function QuizDetail() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('summary');

    // 🛑 Dùng hook API thật thay thế mockQuizDetails[id] sau này 🛑
    const quizData = id ? mockQuizDetails[id as keyof typeof mockQuizDetails] : null;

    if (!quizData) {
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Quiz không tồn tại</h2>
                    <Button onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                
                {/* Header */}
                <div className="mb-6">
                    <Button 
                        variant="ghost" 
                        onClick={() => navigate(-1)} // Quay lại trang trước đó
                        className="mb-4"
                    >
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại danh sách
                    </Button>
                    {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">{quizData.QuizTitle}</h1>
                    <p className="text-gray-600">Chi tiết kết quả quiz</p>
                    
                </div>

                {/* Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="participants">Participants ({quizData.Participants.length})</TabsTrigger>
                        <TabsTrigger value="questions">Questions ({quizData.TotalQuestions})</TabsTrigger>
                    </TabsList>

                    {/* Summary Tab */}
                    <TabsContent value="summary" className="mt-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Tổng số câu hỏi */}
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-600">Tổng số câu hỏi</CardTitle></CardHeader>
                                {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                <CardContent><div className="text-2xl font-bold text-blue-600">{quizData.TotalQuestions}</div></CardContent>
                            </Card>

                            {/* Câu trả lời đúng */}
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-600">Câu trả lời đúng</CardTitle></CardHeader>
                                {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                <CardContent><div className="text-2xl font-bold text-green-600">{quizData.NumberOfCorrectAnswers}</div></CardContent>
                            </Card>

                            {/* Câu trả lời sai */}
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-600">Câu trả lời sai</CardTitle></CardHeader>
                                {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                <CardContent><div className="text-2xl font-bold text-red-600">{quizData.NumberOfWrongAnswers}</div></CardContent>
                            </Card>

                            {/* Điểm số cuối cùng */}
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-600">Điểm số cuối cùng</CardTitle></CardHeader>
                                {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                <CardContent><div className="text-2xl font-bold text-purple-600">{quizData.FinalScore}%</div></CardContent>
                            </Card>

                            {/* Xếp hạng */}
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-600">Xếp hạng</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-2">
                                        <Trophy className="h-6 w-6 text-yellow-500" />
                                        {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                        <div className="text-2xl font-bold text-yellow-600">#{quizData.Rank}</div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Người hoàn thành */}
                            <Card>
                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-600">Người hoàn thành</CardTitle></CardHeader>
                                {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                <CardContent><div className="text-lg font-medium text-gray-900">{quizData.CompletedBy}</div></CardContent>
                            </Card>

                            {/* Thời gian */}
                            <Card className="md:col-span-2 lg:col-span-3">
                                <CardHeader className="pb-3"><CardTitle className="text-sm font-medium text-gray-600">Thời gian</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Bắt đầu:</span>
                                            {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                            <span className="font-medium">{formatDate(quizData.StartDate)}</span> 
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-gray-500" />
                                            <span className="text-sm text-gray-600">Hoàn thành:</span>
                                            {/* 🛑 SỬ DỤNG PASCALCASE 🛑 */}
                                            <span className="font-medium">{formatDate(quizData.CompletedAt)}</span> 
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Participants Tab */}
                    <TabsContent value="participants" className="mt-6">
                        <Card>
                            <CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" />Danh sách người tham gia</CardTitle></CardHeader>
                            <CardContent>
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[600px]">
                                        <thead>
                                            <tr className="border-b">
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Nickname</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Rank</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Correct answers</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Unanswered</th>
                                                <th className="text-left py-3 px-4 font-medium text-gray-600">Final score</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {quizData.Participants.map((participant) => ( // 🛑 SỬ DỤNG PASCALCASE 🛑
                                                <tr key={participant.id} className="border-b hover:bg-gray-50">
                                                    <td className="py-3 px-4">
                                                        <div className="flex items-center gap-3">
                                                            <Avatar className="h-8 w-8"><AvatarImage src={participant.avatarUrl} /></Avatar>
                                                            <span className="font-medium">{participant.nickname}</span>
                                                        </div>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <Badge variant={participant.rank === 1 ? 'default' : 'secondary'}>#{participant.rank}</Badge>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-green-600 font-medium">{participant.correctAnswers}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="text-gray-600">{participant.unanswered}</span>
                                                    </td>
                                                    <td className="py-3 px-4">
                                                        <span className="font-bold text-purple-600">{participant.finalScore}%</span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Questions Tab */}
                    <TabsContent value="questions" className="mt-6">
                        <div className="space-y-6">
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiết từng câu hỏi</h2>
                            {quizData.Questions.map((question, index) => ( // 🛑 SỬ DỤNG PASCALCASE 🛑
                                <Card key={question.id}>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <span className="text-sm bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">{index + 1}</span>
                                            {question.questionText}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-3">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {question.options.map((option, optionIndex) => (
                                                    <div
                                                        key={optionIndex}
                                                        className={`p-3 rounded-lg border ${
                                                            option === question.correctAnswer
                                                                ? 'bg-green-50 border-green-200 text-green-800'
                                                                : option === question.userAnswer && !question.isCorrect
                                                                ? 'bg-red-50 border-red-200 text-red-800'
                                                                : 'bg-gray-50 border-gray-200'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {option === question.correctAnswer && (<CheckCircle className="h-4 w-4 text-green-600" />)}
                                                            {option === question.userAnswer && !question.isCorrect && (<XCircle className="h-4 w-4 text-red-600" />)}
                                                            <span>{option}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                            <div className="flex items-center gap-4 text-sm pt-2 border-t mt-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Câu trả lời của bạn:</span>
                                                    <span className={`font-medium ${question.isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                                                        {question.userAnswer}
                                                    </span>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    <span className="text-gray-600">Đáp án đúng:</span>
                                                    <span className="font-medium text-green-600">{question.correctAnswer}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}