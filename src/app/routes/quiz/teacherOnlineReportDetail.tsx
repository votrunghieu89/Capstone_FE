import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "../../../components/common/Card";
    import { Button } from "../../../components/common/Button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/common/Tabs";
import { ArrowLeft } from "lucide-react";
import { apiClient } from "../../../libs/apiClient";

export default function TeacherOnlineReportDetail() {
    const { quizId, reportId } = useParams<{
        quizId: string;
        reportId: string;
    }>();

    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState("summary");

    const [summary, setSummary] = useState<any>(null);
    const [students, setStudents] = useState<any[]>([]);
    const [questions, setQuestions] = useState<any[]>([]);

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                if (!quizId || !reportId) return;

                // ===============================
                // 1) SUMMARY ONLINE
                // ===============================
                const summaryRes: any = await apiClient.get(
                    `/TeacherReport/online/detail-report?QuizId=${quizId}&OnlineReportId=${reportId}`
                );

                // ===============================
                // 2) STUDENTS ONLINE
                // ===============================
                const studentRes: any = await apiClient.get(
                    `/TeacherReport/online/student-report?QuizId=${quizId}&OnlineReportId=${reportId}`
                );

                // ===============================
                // 3) QUESTIONS ONLINE
                // ===============================
                const questionRes: any = await apiClient.get(
                    `/TeacherReport/online/question-report?QuizId=${quizId}&OnlineReportId=${reportId}`
                );

                // ===============================
                // MAP SUMMARY
                // ===============================
                setSummary({
                    quizTitle: summaryRes.quizTitle,
                    totalQuestions: summaryRes.totalQuestion,
                    totalStudents: summaryRes.totalStudent,
                    highestScore: summaryRes.highestScore,
                    lowestScore: summaryRes.lowestScore,
                    avgScore: summaryRes.averageScore,
                    startDate: summaryRes.createAt,
                   
                });

                // ===============================
                // MAP STUDENTS  (Online KHÔNG có số lần làm)
                // ===============================
                setStudents(
                    studentRes.map((s: any) => ({
                        studentId: s.studentId,
                        fullName: s.studentName,
                        correct: s.correctCount,
                        wrong: s.wrongCount,
                        totalQuestions: s.totalQuestion,
                        finalScore: s.score,
                        completedAt: s.completedAt,
                        rank: s.rank,
                    }))
                );

                // ===============================
                // MAP QUESTIONS
                // ===============================
                setQuestions(
                    questionRes.map((q: any) => ({
                        questionId: q.questionId,
                        questionContent: q.questionContent,
                        totalAnswers: q.totalAnswers,
                        correctCount: q.correctCount,
                        wrongCount: q.wrongCount,
                        percentageCorrect: q.percentageCorrect,
                    }))
                );
            } catch (err) {
                console.error(err);
                setError("Không thể tải dữ liệu báo cáo.");
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [quizId, reportId]);

    const formatDate = (dateStr: string) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleString("vi-VN");
    };

    if (loading)
        return (
            <div className="min-h-screen flex items-center justify-center text-gray-600">
                Đang tải dữ liệu...
            </div>
        );

    if (error || !summary)
        return (
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">
                        {error || "Không có dữ liệu."}
                    </h2>
                    <Button onClick={() => navigate(-1)}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Quay lại
                    </Button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8 max-w-4xl">

                <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Quay lại danh sách
                </Button>

                <h1 className="text-3xl font-bold">{summary.quizTitle}</h1>
                <p className="text-gray-600">Báo cáo chi tiết (ONLINE)</p>

                {/* ============================ */}
                {/* TABS */}
                {/* ============================ */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-6">
                    <TabsList className="grid grid-cols-3 w-full">
                        <TabsTrigger value="summary">Summary</TabsTrigger>
                        <TabsTrigger value="students">Students</TabsTrigger>
                        <TabsTrigger value="questions">Questions</TabsTrigger>
                    </TabsList>

                    {/* SUMMARY TAB */}
                    <TabsContent value="summary" className="mt-6">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

                            <Card>
                                <CardHeader><CardTitle>Tổng câu hỏi</CardTitle></CardHeader>
                                <CardContent className="text-2xl font-bold text-blue-600">
                                    {summary.totalQuestions}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Số học sinh</CardTitle></CardHeader>
                                <CardContent className="text-2xl font-bold text-green-600">
                                    {summary.totalStudents}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Điểm trung bình</CardTitle></CardHeader>
                                <CardContent className="text-2xl font-bold text-purple-600">
                                    {summary.avgScore}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Điểm cao nhất</CardTitle></CardHeader>
                                <CardContent className="text-2xl font-bold text-yellow-600">
                                    {summary.highestScore}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader><CardTitle>Điểm thấp nhất</CardTitle></CardHeader>
                                <CardContent className="text-2xl font-bold text-red-600">
                                    {summary.lowestScore}
                                </CardContent>
                            </Card>

                            <Card className="md:col-span-2 lg:col-span-3">
                                <CardHeader><CardTitle>Thời gian</CardTitle></CardHeader>
                                <CardContent>
                                    <div className="flex gap-6">
                                        <div>Bắt đầu: <strong>{formatDate(summary.startDate)}</strong></div>
                                        
                                    </div>
                                </CardContent>
                            </Card>

                        </div>
                    </TabsContent>

                    {/* STUDENTS TAB */}
                    <TabsContent value="students" className="mt-6">
                        <h2 className="text-xl font-bold mb-4">Danh sách học sinh</h2>

                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full border border-gray-300 rounded-md overflow-hidden text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 border">#</th>
                                            <th className="p-3 border text-left">Họ tên</th>
                                            <th className="p-3 border">Thứ hạng</th>
                                            <th className="p-3 border">Đúng</th>
                                            <th className="p-3 border">Sai</th>
                                            <th className="p-3 border">Tổng câu hỏi</th>
                                            <th className="p-3 border">Điểm số</th>
                                            {/* KHÔNG có cột "số lần làm" */}
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {students.map((s, i) => (
                                            <tr key={i} className="text-center">
                                                <td className="p-3 border">{i + 1}</td>
                                                <td className="p-3 border text-left">{s.fullName}</td>
                                                <td className="p-3 border font-semibold">{s.rank}</td>
                                                <td className="p-3 border">{s.correct}</td>
                                                <td className="p-3 border">{s.wrong}</td>
                                                <td className="p-3 border">{s.totalQuestions}</td>
                                                <td className="p-3 border font-semibold">{s.finalScore}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* QUESTIONS TAB */}
                    <TabsContent value="questions" className="mt-6">
                        <h2 className="text-xl font-bold mb-4">Chi tiết câu hỏi</h2>

                        <Card>
                            <CardContent className="p-0">
                                <table className="w-full border border-gray-300 rounded-md overflow-hidden text-sm">
                                    <thead className="bg-gray-100">
                                        <tr>
                                            <th className="p-3 border">#</th>
                                            <th className="p-3 border text-left">Câu hỏi</th>
                                            <th className="p-3 border">Tổng lượt</th>
                                            <th className="p-3 border">Đúng</th>
                                            <th className="p-3 border">Sai</th>
                                            <th className="p-3 border">Tỉ lệ đúng</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {questions.map((q, index) => (
                                            <tr key={q.questionId} className="text-center">
                                                <td className="p-3 border">{index + 1}</td>
                                                <td className="p-3 border text-left">{q.questionContent}</td>
                                                <td className="p-3 border">{q.totalAnswers}</td>
                                                <td className="p-3 border">{q.correctCount}</td>
                                                <td className="p-3 border">{q.wrongCount}</td>
                                                <td className="p-3 border font-semibold">{q.percentageCorrect}%</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
