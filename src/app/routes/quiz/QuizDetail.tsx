import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios'; // ✅ thêm axios
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/common/Card'; 
import { Button } from '../../../components/common/Button'; 
import { Avatar, AvatarImage } from '../../../components/common/Avatar'; 
import { Badge } from '../../../components/common/Badge'; 
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/common/Tabs';
import { ArrowLeft, Calendar, Clock, Users, Trophy, CheckCircle, XCircle } from 'lucide-react';

export default function QuizDetail() {
  const { studentId, quizId } = useParams<{ studentId: string; quizId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('summary');

  // ✅ Dữ liệu từ API
  const [quizData, setQuizData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ Gọi API khi có studentId và quizId
  useEffect(() => {
    const fetchQuizDetail = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5119/api/StudentReport/quiz-detail/${studentId}/${quizId}`
        );
        setQuizData(response.data);
      } catch (err) {
        console.error("Lỗi khi tải chi tiết quiz:", err);
        setError("Không thể tải dữ liệu quiz.");
      } finally {
        setLoading(false);
      }
    };
    const searchParams = new URLSearchParams(location.search);
    const completedAt = searchParams.get('date') || '';
    console.log('Detail Params:', { studentId, quizId, completedAt });

    if (studentId && quizId) fetchQuizDetail();
  }, [studentId, quizId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        Đang tải dữ liệu...
      </div>
    );

  if (error || !quizData)
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {error || "Quiz không tồn tại"}
          </h2>
          <Button onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại
          </Button>
        </div>
      </div>
    );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Quay lại danh sách
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">
            {quizData.QuizTitle}
          </h1>
          <p className="text-gray-600">Chi tiết kết quả quiz</p>
        </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="summary">Summary</TabsTrigger>
            <TabsTrigger value="participants">
              Participants ({quizData.Participants?.length || 0})
            </TabsTrigger>
            <TabsTrigger value="questions">
              Questions ({quizData.TotalQuestions || 0})
            </TabsTrigger>
          </TabsList>

          {/* Summary */}
          <TabsContent value="summary" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Tổng số câu hỏi</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {quizData.TotalQuestions}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Câu trả lời đúng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {quizData.NumberOfCorrectAnswers}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Câu trả lời sai</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {quizData.NumberOfWrongAnswers}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Điểm số cuối cùng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {quizData.FinalScore}%
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Xếp hạng</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-6 w-6 text-yellow-500" />
                    <div className="text-2xl font-bold text-yellow-600">#{quizData.Rank}</div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Người hoàn thành</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-lg font-medium text-gray-900">
                    {quizData.CompletedBy}
                  </div>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-3">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm text-gray-600">Thời gian</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Bắt đầu:</span>
                      <span className="font-medium">{formatDate(quizData.StartDate)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span className="text-sm text-gray-600">Hoàn thành:</span>
                      <span className="font-medium">{formatDate(quizData.CompletedAt)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Participants */}
          <TabsContent value="participants" className="mt-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />Danh sách người tham gia
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[600px]">
                    <thead>
                      <tr className="border-b">
                        <th className="py-3 px-4 text-left text-gray-600">Nickname</th>
                        <th className="py-3 px-4 text-left text-gray-600">Rank</th>
                        <th className="py-3 px-4 text-left text-gray-600">Correct answers</th>
                        <th className="py-3 px-4 text-left text-gray-600">Unanswered</th>
                        <th className="py-3 px-4 text-left text-gray-600">Final score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {quizData.Participants?.map((p: any) => (
                        <tr key={p.id} className="border-b hover:bg-gray-50">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8">
                                <AvatarImage src={p.avatarUrl} />
                              </Avatar>
                              <span className="font-medium">{p.nickname}</span>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={p.rank === 1 ? 'default' : 'secondary'}>#{p.rank}</Badge>
                          </td>
                          <td className="py-3 px-4 text-green-600 font-medium">
                            {p.correctAnswers}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{p.unanswered}</td>
                          <td className="py-3 px-4 font-bold text-purple-600">
                            {p.finalScore}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Questions */}
          <TabsContent value="questions" className="mt-6">
            <div className="space-y-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Chi tiết từng câu hỏi</h2>
              {quizData.Questions?.map((q: any, index: number) => (
                <Card key={q.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <span className="text-sm bg-gray-100 rounded-full w-6 h-6 flex items-center justify-center">
                        {index + 1}
                      </span>
                      {q.questionText}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {q.options.map((option: string, i: number) => (
                          <div
                            key={i}
                            className={`p-3 rounded-lg border ${
                              option === q.correctAnswer
                                ? 'bg-green-50 border-green-200 text-green-800'
                                : option === q.userAnswer && !q.isCorrect
                                ? 'bg-red-50 border-red-200 text-red-800'
                                : 'bg-gray-50 border-gray-200'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {option === q.correctAnswer && (
                                <CheckCircle className="h-4 w-4 text-green-600" />
                              )}
                              {option === q.userAnswer && !q.isCorrect && (
                                <XCircle className="h-4 w-4 text-red-600" />
                              )}
                              <span>{option}</span>
                            </div>
                          </div>
                        ))}
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
