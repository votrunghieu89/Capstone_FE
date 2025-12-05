import React, { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import AlertModal from "../../../components/common/AlertModal";
import { z } from "zod";
import {
    Plus,
    Trash2,
    Save,
    ArrowLeft,
    BookOpen,
    Clock,
    Target,
    Eye,
    Image,
    Sparkles,
    Loader2,
    Info, 
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Input } from "../../../components/common/Input";
import { TopNavbar } from "../../../components/layout/TopNavbar";
import { Footer } from "../../../components/layout/Footer";
import { apiClient } from "../../../libs/apiClient";
import { storage } from '../../../libs/storage';

// --- REUSED SCHEMAS & TYPES (GIỮ NGUYÊN) ---
const questionSchema = z.object({
    // ... (definitions)
    content: z.string().min(5, "Nội dung câu hỏi phải có ít nhất 5 ký tự"),
    questionType: z.enum(["MultipleChoice", "TrueFalse"]),
    timeLimit: z.number().min(10, "Thời gian tối thiểu 10 giây").max(300, "Thời gian tối đa 300 giây"),
    points: z.number().min(1, "Điểm tối thiểu 1").max(100, "Điểm tối đa 100"),
    options: z.array(z.object({ content: z.string().min(1, "Nội dung đáp án không được để trống"), isCorrect: z.boolean() })).min(2, "Phải có ít nhất 2 đáp án"),
});

const AICreateQuizSchema = z.object({
    title: z.string().min(3, "Tiêu đề phải có ít nhất 3 ký tự"),
    description: z.string().optional(),
    topicId: z.string().min(1, "Vui lòng chọn chủ đề"),
    isPrivate: z.boolean(),
    folderId: z.string().optional(),
    avatarUrl: z.string().optional(),
    numberOfQuestions: z.number().min(1, "Ít nhất 1 câu hỏi").max(50, "Tối đa 50 câu hỏi"),
    score: z.number().min(1, "Điểm tối thiểu 1").max(100, "Điểm tối đa 100"),
    time: z.number().min(10, "Thời gian tối thiểu 10 giây").max(300, "Thời gian tối đa 300 giây"),
    questions: z.array(questionSchema).min(1, "Vui lòng tạo câu hỏi bằng AI trước khi lưu."),
});

type AICreateQuizForm = z.infer<typeof AICreateQuizSchema>;
interface Option { id: string; content: string; isCorrect: boolean; }
interface Question { id: string; content: string; questionType: "MultipleChoice" | "TrueFalse"; timeLimit: number; points: number; options: Option[]; }
interface AIQuestionResponse { questionContent: string; questionType: "MultipleChoice" | "TrueFalse"; timeLimit: number; score: number; options: { optionContent: string; isCorrect: boolean; }[]; }


// --- MAIN COMPONENT ---

export default function CreateQuizAI() {
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [isAIGenerating, setIsAIGenerating] = useState(false);
    const [questions, setQuestions] = useState<Question[]>([]); 
    const [topics, setTopics] = useState<{ id: string; name: string }[]>([]);
    const [folders, setFolders] = useState<{ id: string; name: string; parentId: string | null }[]>([]);

    // ⬅️ NEW: State cho file Thumbnail (AvatarURL)
    const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
    const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

    // ⬅️ KEEP: State cho file dữ liệu AI (formFile)
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const [filePreview, setFilePreview] = useState<string | null>(null); 
    const [alertOpen, setAlertOpen] = useState(false);
    const [alertMsg, setAlertMsg] = useState("");
    const [alertIsError, setAlertIsError] = useState(false);

    // ✅ HÀM ĐÓNG ALERT VÀ CHUYỂN HƯỚNG
    const handleCloseAlert = () => {
        setAlertOpen(false);
        setAlertIsError(false);
        // Chuyển hướng về folders nếu không phải là lỗi
        if (!alertIsError) {
            navigate("/teacher/folders"); 
        }
    };
    // Helper functions cho File Dữ liệu AI (formFile)
    const setFileInputAndPreview = (file: File | null) => {
        setFileToUpload(file);
        if (file) {
            setFilePreview(URL.createObjectURL(file));
        } else {
            setFilePreview(null);
        }
    };
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setFileInputAndPreview(file);
    };
    const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            setFileInputAndPreview(file);
            event.dataTransfer.clearData();
        }
    };
    useEffect(() => {
        const fetchData = async () => {
            const user = storage.getUser();
            const currentTeacherId = user?.id;
            if (!currentTeacherId) return;

            try {
                // Tải Topics và Folders song song
                const [topicsResponse, foldersResponse] = await Promise.all([
                    apiClient.get("/Topic/getAllTopic") as any,
                    apiClient.get(`/TeacherFolder/getAllFolder?teacherID=${currentTeacherId}`) as any,
                ]);

                const rawTopicsData = (topicsResponse as any).data || (topicsResponse as any);
                const rawFoldersData = (foldersResponse as any).data || (foldersResponse as any);

                // Xử lý Topics
                setTopics(
                    (Array.isArray(rawTopicsData) ? rawTopicsData : [])
                        .map((t: any) => ({
                            id: t.topicId ? t.topicId.toString() : t.id.toString(),
                            name: t.topicName || t.name,
                        }))
                );

                // Xử lý Folders
                setFolders(
                    (Array.isArray(rawFoldersData) ? rawFoldersData : [])
                        .map((f: any) => ({
                            id: f.folderId ? f.folderId.toString() : f.id.toString(),
                            name: f.folderName || f.name,
                            parentId: f.parentFolderId !== undefined && f.parentFolderId !== null
                                ? f.parentFolderId.toString()
                                : null,
                        }))
                );
            } catch (error) {
                console.error("❌ Lỗi khi tải dữ liệu:", error);
                setTopics([]);
                setFolders([]);
            }
        };
        fetchData();
    }, []);
    
    // ⬅️ NEW: Helper functions cho Ảnh Thumbnail (AvatarURL)
    const renderFolderOptions = () => {
        const result: JSX.Element[] = [];

        const renderFolder = (folderId: string | null, level: number) => {
            const subfolders = folders.filter((f) => f.parentId === folderId);
            subfolders.forEach((folder) => {
                const indent = "\u00A0\u00A0".repeat(level * 2);
                result.push(
                    <option key={folder.id} value={folder.id}>
                        {indent}
                        {level > 0 ? "└─ " : ""}
                        {folder.name}
                    </option>
                );
                renderFolder(folder.id, level + 1);
            });
        };
        renderFolder(null, 0);
        return result;
    };

    const setThumbnailInputAndPreview = (file: File | null) => {
        setThumbnailFile(file);
        if (file) {
            setThumbnailPreview(URL.createObjectURL(file));
        } else {
            setThumbnailPreview(null);
        }
    };
    const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files ? event.target.files[0] : null;
        setThumbnailInputAndPreview(file);
    };
    const handleThumbnailDrop = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            const file = event.dataTransfer.files[0];
            setThumbnailInputAndPreview(file);
            event.dataTransfer.clearData();
        }
    };
    const uploadThumbnail = async (data: AICreateQuizForm) => {
  // Nếu user nhập thủ công một URL thì giữ lại (fallback)
  let avatarURL: string = (data.avatarUrl || "").trim();

  if (!thumbnailFile) {
    console.log("LOG: No thumbnail file provided. Using manual URL (if any):", avatarURL);
    return avatarURL;
  }

  try {
    console.log("LOG: Starting thumbnail upload...", thumbnailFile.name);
    const formData = new FormData();
    // giữ key giống bạn dùng ở createQuiz
    formData.append("AvatarURL", thumbnailFile);

    const uploadResponse: any = await apiClient.post(
      "/Quiz/uploadImage",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    // Log toàn bộ response để debug nhanh
    console.log("LOG: raw uploadResponse =", uploadResponse);

    // Thử nhiều vị trí khả dĩ nơi backend có thể trả URL
    const candidates = [
      uploadResponse?.data?.avatarURL,
      uploadResponse?.data?.imageUrl,
      uploadResponse?.data?.url,
      uploadResponse?.avatarURL,
      uploadResponse?.imageUrl,
      uploadResponse?.url,
      // một số wrapper phổ biến: { data: { data: { avatarURL: ... } } }
      uploadResponse?.data?.data?.avatarURL,
      uploadResponse?.data?.data?.imageUrl,
    ];

    // Lấy giá trị đầu tiên khác falsy (không null/undefined/"")
    const found = candidates.find((v) => typeof v === "string" && v.length > 0);

    if (found) {
      avatarURL = found;
      console.log("LOG: Resolved avatarURL from upload response:", avatarURL);
    } else {
      // Nếu không tìm thấy, log rõ để bạn kiểm tra Network tab
      console.warn("WARN: Could not find avatar URL in upload response. Response logged above.");
      // giữ avatarURL đã có (có thể là manual URL hoặc empty string)
    }

    return avatarURL;
  } catch (err: any) {
    console.error("ERROR uploading thumbnail:", err);
    return data.avatarUrl || "";
  }
};
    
    // --- RHF Setup (GIỮ NGUYÊN) ---
    const { register, handleSubmit, formState: { errors }, watch, setValue, getValues, trigger, } = useForm<AICreateQuizForm>({
        resolver: zodResolver(AICreateQuizSchema),
        defaultValues: {
            title: "", description: "", isPrivate: true, numberOfQuestions: 5,
            score: 10, time: 30, questions: [], 
        },
    });

    useEffect(() => {
        setValue('questions', questions as any, { shouldValidate: true });
    }, [questions, setValue]);


    // --- AI GENERATION LOGIC (UPDATED FOR CORRECT API CALL) ---

    // Hàm này không cần thiết vì API đã trả về Quiz hoàn chỉnh, nhưng tôi giữ lại mock để tránh lỗi.
    const mapAIResponseToLocalQuestions = (aiQuestions: AIQuestionResponse[]): Question[] => {
        // ... (Logic giữ nguyên)
        return aiQuestions.map((q, index) => {
            const defaults = getValues(); 
            return {
                id: Date.now().toString() + index,
                content: q.questionContent,
                questionType: q.questionType,
                timeLimit: q.timeLimit || defaults.time, 
                points: q.score || defaults.score, 
                options: q.options.map((opt, i) => ({ id: (i + 1).toString(), content: opt.optionContent, isCorrect: opt.isCorrect, })),
            };
        });
    };

    const handleGenerateQuiz = async () => {
        const formData = getValues();
        const isValid = await trigger(['topicId', 'numberOfQuestions', 'score', 'time', 'title']); 
        if (!isValid) return;

        setIsAIGenerating(true);
        
        const user = storage.getUser();
        const teacherId = user?.id;

        if (!teacherId) {
            alert("Thông tin giáo viên không hợp lệ. Vui lòng đăng nhập lại.");
            setIsAIGenerating(false);
            return;
        }

        try {
            console.log("LOG 1: Starting AI Quiz Creation...");

            // 1. UPLOAD THUMBNAIL và lấy URL
            const avatarURL = await uploadThumbnail(formData); 
            
            // 2. Chuẩn bị FormData cho API call Gemini
            const payloadFormData = new FormData();
            
            // Thêm file dữ liệu AI (formfile) nếu có
            if (fileToUpload) {
                payloadFormData.append("formfile", fileToUpload); 
            }
            
            // Thêm các tham số khác (dùng PascalCase cho thuộc tính API)
            payloadFormData.append("TeacherId", teacherId.toString()); 
            payloadFormData.append("TopicId", formData.topicId); 
            payloadFormData.append("Title", formData.title);
            payloadFormData.append("Description", formData.description || "");
            payloadFormData.append("IsPrivate", formData.isPrivate.toString());
            payloadFormData.append("FolderId", formData.folderId || "0");
            //payloadFormData.append("avatarURL", avatarURL||""); // ⬅️ GỬI URL ẢNH ĐÃ UPLOAD
            if (thumbnailFile) {
                payloadFormData.append("AvatarURL", thumbnailFile);  // gửi file, không gửi string
            } else {
                payloadFormData.append("AvatarURL", ""); // cho backend khỏi lỗi
            }
            // Các tham số cấu hình AI
            payloadFormData.append("NumberOfQuestion", formData.numberOfQuestions.toString());
            payloadFormData.append("Score", formData.score.toString());
            payloadFormData.append("Time", formData.time.toString());
            
            console.log("LOG 4: Calling Gemini API with final payload (including AvatarURL)...");
            
            
            const apiEndpoint = "/Gemini/CreateQuizByGemini";
            
            const response = (await apiClient.post(
                apiEndpoint,
                payloadFormData,
                { headers: { "Content-Type": "multipart/form-data" } }
            )) as any;

            if (response.status === 200 || response.status === 201 || response.message === "Quiz created successfully.") {
               setAlertIsError(false);
                setAlertMsg("🎉 Tạo quiz bằng AI thành công!");
                setAlertOpen(true);
            } else {
                const errorMessage = response.message || response.data?.message || "Lỗi không xác định khi tạo quiz bằng AI.";
                throw new Error(errorMessage);
            }
        } catch (error: any) {
            console.error("❌ Lỗi khi gọi API Gemini:", error);
            alert(`Đã xảy ra lỗi: ${error.message || error.toString()}. Vui lòng thử lại.`);
        } finally {
            setIsAIGenerating(false);
        }
    };


    // --- FINAL SUBMISSION LOGIC (CHỈ LÀM CHỨC NĂNG LƯU QUIZ) ---
    const onSubmit = async (data: AICreateQuizForm) => {
         // Nếu người dùng nhấn nút "Lưu Quiz" mà chưa chạy AI
        if (questions.length === 0) {
            alert("Quiz được tạo bằng AI sẽ tự động lưu sau khi quá trình tạo hoàn tất. Vui lòng nhấn 'Tạo Quiz bằng AI' trước.");
            return;
        }

        setIsLoading(true);
        try {
            const user = storage.getUser();
            const teacherId = user?.id;

            if (!teacherId) {
                throw new Error("Thông tin giáo viên không hợp lệ. Vui lòng đăng nhập lại.");
            }

            // 1. Upload ảnh Thumbnail (AvatarURL)
            let avatarURL: string | undefined = data.avatarUrl;
            if (thumbnailFile) {
                const formData = new FormData();
                formData.append("AvatarURL", thumbnailFile);
                const uploadResponse = (await apiClient.post("/Quiz/uploadImage", formData, { headers: { "Content-Type": "multipart/form-data" } })) as any;
                avatarURL = uploadResponse.imageUrl;
            }

            alert("Lỗi: Quiz đã được lưu tự động sau khi tạo bằng AI. Không cần nhấn nút này.");
        } catch (error) {
             alert("Lỗi khi xử lý lưu. Hãy thử lại.");
        } finally {
            setIsLoading(false);
        }
    };
    
    // --- JSX RENDERING ---

    return (
        <div className="min-h-screen bg-white flex flex-col">
            <TopNavbar />
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg">
                <div className="container mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                        <Button
                            variant="ghost"
                            onClick={() => navigate("/teacher/folders")}
                            className="p-2 text-white hover:bg-white/10"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Button>
                        <div>
                            <h1 className="text-2xl font-bold flex items-center gap-2">
                                <Sparkles className="w-6 h-6" />
                                Tạo Quiz bằng AI
                            </h1>
                        </div>
                    </div>
                    {/* "Powered by AI" tag */}
                    <div className="text-xs font-semibold py-1 px-3 rounded-full bg-white/20">
                        Powered by AI
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-6 py-8">
                <div className="max-w-4xl mx-auto">
                    {/* Vẫn dùng handleSubmit(onSubmit) để có validation Zod tổng thể */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8"> 
                        
                        {/* Quiz Information & AI Input (Combined Card) */}
                        <div className="card">
                            <div className="card-content space-y-6">
                                
                                <Input label="Tiêu đề Quiz" placeholder="Nhập tiêu đề quiz" error={errors.title?.message} {...register("title")} />
                                
                                <div>
                                    <label className="text-sm font-medium text-secondary-700 mb-2 block">Mô tả</label>
                                    <textarea className="input min-h-[100px] resize-none" placeholder="Nhập mô tả" {...register("description")}/>
                                </div>
                                
                                {/* Quiz riêng tư */}
                                    <div className="flex items-center space-x-2 mt-4">
                                        <input
                                            type="checkbox"
                                            id="private-quiz"
                                            className="w-4 h-4 cursor-pointer"
                                            {...register("isPrivate")}
                                            onChange={(e) => {
                                                // react-hook-form cần nhận boolean
                                                setValue("isPrivate", e.target.checked);
                                            }}
                                        />

                                        <label
                                            htmlFor="private-quiz"
                                            className="text-sm text-secondary-700 cursor-pointer"
                                        >
                                            Quiz riêng tư (chỉ học sinh trong lớp mới thấy)
                                        </label>
                                    </div>
                                
                                {/* ⬅️ THÊM: AvatarURL Upload (Thumbnail) */}
                                <div>
                                    <label className="text-sm font-medium text-secondary-700 mb-2 block">Ảnh đại diện</label>
                                    <div
                                        className="relative flex flex-col items-center justify-center w-full h-36 border border-secondary-300 rounded-lg cursor-pointer bg-secondary-50 hover:bg-secondary-100 transition-colors duration-200"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleThumbnailDrop}
                                        onClick={() => document.getElementById('hidden-thumbnail-input')?.click()}
                                    >
                                        <input
                                            id="hidden-thumbnail-input"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            onChange={handleThumbnailChange}
                                        />
                                        {thumbnailPreview ? (
                                            <img src={thumbnailPreview} alt="Thumbnail Preview" className="absolute inset-0 w-full h-full object-cover rounded-lg" />
                                        ) : (
                                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                <Image className="w-8 h-8 mb-3 text-secondary-500" />
                                                <p className="mb-2 text-sm text-secondary-500">Choose Image</p>
                                                <p className="text-xs text-secondary-600">
                                                    {thumbnailFile ? thumbnailFile.name : "No file chosen"}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex items-center mt-2">
                                        <input type="checkbox" className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500" />
                                        <span className="ml-2 text-sm text-secondary-600">Send empty value</span>
                                    </div>
                                </div>


                                {/* AI Input Fields */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Input label="Số lượng câu hỏi" type="number" placeholder="Send empty value" error={errors.numberOfQuestions?.message} {...register("numberOfQuestions", { valueAsNumber: true })} />
                                    <Input label="Điểm số" type="number" placeholder="Send empty value" error={errors.score?.message} {...register("score", { valueAsNumber: true })} />
                                    <Input label="Thời gian" type="number" placeholder="Send empty value" error={errors.time?.message} {...register("time", { valueAsNumber: true })} />
                                </div>

                                {/* Upload FormFile (File Dữ liệu AI) */}
                                <div>
                                    <label className="text-sm font-medium text-secondary-700 mb-2 block">File dữ liệu tạo Quiz</label>
                                    <div
                                        className="relative flex flex-col items-center justify-center w-full h-36 border border-secondary-300 rounded-lg cursor-pointer bg-secondary-50 hover:bg-secondary-100 transition-colors duration-200"
                                        onDragOver={(e) => e.preventDefault()}
                                        onDrop={handleDrop}
                                        onClick={() => document.getElementById('hidden-file-input')?.click()}
                                    >
                                        <input
                                            id="hidden-file-input"
                                            type="file"
                                            accept="*/*" 
                                            className="hidden"
                                            onChange={handleFileChange}
                                        />
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            {/* CHỈ HIỆN ICON + CHOOSE FILE KHI CHƯA CÓ FILE */}
                                                {!fileToUpload && (
                                                    <>
                                                        <svg className="w-8 h-8 mb-3 text-secondary-500" fill="none" stroke="currentColor"
                                                            viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                                                                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                                                        </svg>

                                                        <p className="mb-2 text-sm text-secondary-500">Choose File</p>
                                                    </>
                                                )}

                                                {/* HIỆN TÊN FILE TO, ĐẬM KHI ĐÃ CHỌN */}
                                                {fileToUpload && (
                                                    <p className="text-base font-semibold text-secondary-800 text-center px-4">
                                                        {fileToUpload.name}
                                                    </p>
                                                )}

                                        </div>
                                    </div>
                                    
                                </div>
                                
                                {/* Topic and Folder */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                    <div>
                                        <label className="text-sm font-medium text-secondary-700 mb-2 block">Chủ đề</label>
                                        <select className="input" {...register("topicId")}>
                                            <option value="">Chọn chủ đề</option>
                                            {topics.map((topic) => (<option key={topic.id} value={topic.id}>{topic.name}</option>))}
                                        </select>
                                        {errors.topicId && (<p className="text-sm text-error-600 mt-1">{errors.topicId.message}</p>)}
                                    </div>

                                    <div>
                                        <label className="text-sm font-medium text-secondary-700 mb-2 block">Lưu vào thư mục</label>
                                        <select className="input" {...register("folderId")}>
                                            <option value="">Chọn thư mục</option>
                                            {renderFolderOptions()}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                

                        {/* Footer Actions */}
                        <div className="flex items-center justify-end">
                            <div className="flex space-x-3">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => navigate("/teacher/folders")}
                                    disabled={isLoading || isAIGenerating}
                                >Hủy</Button>
                                <Button
                                    type="button" 
                                    onClick={handleGenerateQuiz} 
                                    loading={isAIGenerating}
                                    disabled={isAIGenerating || isLoading || !watch('topicId') || !watch('title')|| !watch("folderId") || !fileToUpload} // Thêm validate Title
                                    className="bg-purple-600 hover:bg-purple-700 text-white"
                                >
                                    {isAIGenerating ? (
                                        "Đang tạo..."
                                    ) : (
                                        <><Sparkles className="w-4 h-4 mr-2" />Tạo Quiz bằng AI</>
                                    )}
                                </Button>
                                {/* Nút "Lưu Quiz" đã bị loại bỏ/vô hiệu hóa vì API AI đã tự động lưu */}
                            </div>
                        </div>
                    </form>
                </div>
            </div>
              <AlertModal
                open={alertOpen}
                message={alertMsg}
                onClose={handleCloseAlert}
            />
            <Footer />
        </div>
    );
}