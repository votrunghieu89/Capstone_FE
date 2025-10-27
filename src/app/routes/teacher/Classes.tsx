import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Users,
  BookOpen,
  Settings,
  Edit,
  Trash2,
  UserPlus,
  Calendar,
  Clock,
  Eye,
  Play,
  Hash,
  Copy,
} from "lucide-react";
import { Button } from "../../../components/common/Button";
import { Modal } from "../../../components/common/Modal";
import { Input } from "../../../components/common/Input";
import { apiClient } from "../../../libs/apiClient";
import { mockAdapter } from "../../../mocks/adapter";
import { CreateGroupRequest, Group } from "../../../types/classroom";

interface Class {
  id: string;
  name: string;
  description: string;
  studentCount: number;
  quizCount: number;
  createdAt: string;
  students: Student[];
  quizzes: Quiz[];
  joinCode?: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  joinedAt: string;
}

interface Quiz {
  id: string;
  title: string;
  isAssigned: boolean;
  assignedAt?: string;
}

export default function TeacherClasses() {
  const navigate = useNavigate();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [showAddQuizModal, setShowAddQuizModal] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [creating, setCreating] = useState(false);
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [classesState, setClassesState] = useState<Class[]>([]);
  const [joinedClassesState, setJoinedClassesState] = useState<Class[]>([]);

  // Mock data - sẽ thay thế bằng API call thực tế
  const classes: Class[] = [
    {
      id: "1",
      name: "Lớp 10A1",
      description: "Lớp Toán học nâng cao",
      studentCount: 12,
      quizCount: 8,
      createdAt: "2024-09-01",
      joinCode: "A1B2C3",
      students: [
        {
          id: "1",
          name: "Nguyễn Văn An",
          email: "nguyenvanan@student.edu.vn",
          joinedAt: "2024-09-01",
        },
        {
          id: "2",
          name: "Trần Thị Bình",
          email: "tranthibinh@student.edu.vn",
          joinedAt: "2024-09-01",
        },
        {
          id: "3",
          name: "Lê Minh Cường",
          email: "leminhcuong@student.edu.vn",
          joinedAt: "2024-09-01",
        },
        {
          id: "4",
          name: "Phạm Thu Dung",
          email: "phamthudung@student.edu.vn",
          joinedAt: "2024-09-02",
        },
        {
          id: "5",
          name: "Hoàng Văn Em",
          email: "hoangvanem@student.edu.vn",
          joinedAt: "2024-09-02",
        },
        {
          id: "6",
          name: "Đặng Thị Hoa",
          email: "dangthihoa@student.edu.vn",
          joinedAt: "2024-09-03",
        },
        {
          id: "7",
          name: "Vũ Minh Khoa",
          email: "vuminhkhoa@student.edu.vn",
          joinedAt: "2024-09-03",
        },
        {
          id: "8",
          name: "Ngô Thu Lan",
          email: "ngothulan@student.edu.vn",
          joinedAt: "2024-09-04",
        },
        {
          id: "9",
          name: "Bùi Văn Minh",
          email: "buivanminh@student.edu.vn",
          joinedAt: "2024-09-05",
        },
        {
          id: "10",
          name: "Đinh Thị Nga",
          email: "dinhthinga@student.edu.vn",
          joinedAt: "2024-09-05",
        },
        {
          id: "11",
          name: "Trương Văn Phong",
          email: "truongvanphong@student.edu.vn",
          joinedAt: "2024-09-06",
        },
        {
          id: "12",
          name: "Lý Thị Quỳnh",
          email: "lythiquynh@student.edu.vn",
          joinedAt: "2024-09-07",
        },
      ],
      quizzes: [
        {
          id: "q1",
          title: "Kiểm tra Toán chương 1: Hàm số",
          isAssigned: true,
          assignedAt: "2024-09-15",
        },
        {
          id: "q2",
          title: "Quiz Hình học: Tam giác",
          isAssigned: true,
          assignedAt: "2024-09-18",
        },
        {
          id: "q3",
          title: "Đại số: Phương trình bậc 2",
          isAssigned: true,
          assignedAt: "2024-09-22",
        },
        {
          id: "q4",
          title: "Lượng giác cơ bản",
          isAssigned: true,
          assignedAt: "2024-09-25",
        },
        {
          id: "q5",
          title: "Kiểm tra giữa kỳ",
          isAssigned: false,
        },
        {
          id: "q6",
          title: "Bất phương trình",
          isAssigned: false,
        },
        {
          id: "q7",
          title: "Hệ phương trình",
          isAssigned: false,
        },
        {
          id: "q8",
          title: "Vectơ và toạ độ",
          isAssigned: false,
        },
      ],
    },
    {
      id: "2",
      name: "Lớp 11B2",
      description: "Lớp Vật lý cơ bản",
      studentCount: 6,
      quizCount: 4,
      createdAt: "2024-09-05",
      joinCode: "X7Y8Z9",
      students: [
        {
          id: "s1",
          name: "Cao Văn Sơn",
          email: "caovanson@student.edu.vn",
          joinedAt: "2024-09-05",
        },
        {
          id: "s2",
          name: "Mai Thị Tâm",
          email: "maithitam@student.edu.vn",
          joinedAt: "2024-09-05",
        },
        {
          id: "s3",
          name: "Phan Văn Tùng",
          email: "phanvantung@student.edu.vn",
          joinedAt: "2024-09-06",
        },
        {
          id: "s4",
          name: "Đỗ Thị Uyên",
          email: "dothiuyen@student.edu.vn",
          joinedAt: "2024-09-06",
        },
        {
          id: "s5",
          name: "Võ Minh Vũ",
          email: "vominhvu@student.edu.vn",
          joinedAt: "2024-09-07",
        },
        {
          id: "s6",
          name: "Hồ Thị Xuân",
          email: "hothixuan@student.edu.vn",
          joinedAt: "2024-09-08",
        },
      ],
      quizzes: [
        {
          id: "p1",
          title: "Chuyển động thẳng đều",
          isAssigned: true,
          assignedAt: "2024-09-10",
        },
        {
          id: "p2",
          title: "Lực và chuyển động",
          isAssigned: true,
          assignedAt: "2024-09-14",
        },
        {
          id: "p3",
          title: "Định luật Newton",
          isAssigned: false,
        },
        {
          id: "p4",
          title: "Năng lượng cơ học",
          isAssigned: false,
        },
      ],
    },
  ];

  // Mock các lớp đã tham gia
  const joinedClasses: Class[] = [
    {
      id: "j1",
      name: "Lớp 12C3",
      description: "Lớp Hóa nâng cao",
      studentCount: 40,
      quizCount: 6,
      createdAt: "2024-09-10",
      joinCode: "J12C3",
      students: [],
      quizzes: [],
    },
    {
      id: "j2",
      name: "Lớp Anh văn giao tiếp",
      description: "Câu lạc bộ tiếng Anh",
      studentCount: 22,
      quizCount: 3,
      createdAt: "2024-09-12",
      joinCode: "ENGCLB",
      students: [],
      quizzes: [],
    },
  ];

  // Khởi tạo state từ mock data
  React.useEffect(() => {
    setClassesState(classes);
    setJoinedClassesState(joinedClasses);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [newClassName, setNewClassName] = useState("");
  const [newClassDescription, setNewClassDescription] = useState("");
  const [activeTab, setActiveTab] = useState<"owned" | "joined">("owned");
  const [headerInfo, setHeaderInfo] = useState<"none" | "students" | "quizzes">(
    "none"
  );

  const handleCreateClass = async () => {
    if (!newClassName.trim()) return;
    try {
      setCreating(true);
      const payload: CreateGroupRequest = {
        groupName: newClassName.trim(),
        groupDescription: newClassDescription.trim() || undefined,
      };

      const useMock = (import.meta as any).env?.VITE_USE_MOCK === "true";
      if (useMock) {
        await mockAdapter.post("/groups", payload);
      } else {
        const created = await apiClient.post<Group>("/groups", payload);
        console.log("Created group:", created);
      }
      setShowCreateModal(false);
      setNewClassName("");
      setNewClassDescription("");
    } catch (err) {
      console.error("Create group failed", err);
      alert("Tạo lớp thất bại. Vui lòng thử lại.");
    } finally {
      setCreating(false);
    }
  };

  const handleAddStudent = (classId: string) => {
    setSelectedClass(classesState.find((c) => c.id === classId) || null);
    setShowAddStudentModal(true);
  };

  const handleAddQuiz = (classId: string) => {
    setSelectedClass(classesState.find((c) => c.id === classId) || null);
    setShowAddQuizModal(true);
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-secondary-900">
            Lớp học của tôi
          </h1>
          <p className="text-secondary-600 mt-1">
            Quản lý các lớp học và học sinh
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <Button onClick={() => setShowCreateModal(true)}>Tạo Lớp</Button>
        </div>
      </div>

      {/* Layout with sidebar + content */}
      <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
        {/* Sidebar */}
        <aside className="card h-max">
          <div className="card-content">
            <div className="space-y-4">
              <div className="flex flex-col gap-2">
                <button
                  className="px-3 py-2 rounded-md text-left text-sm font-medium bg-primary-50 text-primary-700"
                  onClick={() => {
                    setActiveTab("owned");
                    setSelectedClass(null);
                  }}
                >
                  Lớp do bạn sở hữu
                </button>
              </div>

              {/* Recent classes from joined list */}
              <div className="mt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-sm font-semibold text-secondary-700">
                    Lớp gần đây
                  </h4>
                  <span className="text-xs text-secondary-500">
                    {joinedClassesState.length}
                  </span>
                </div>
                <div className="space-y-1">
                  {joinedClassesState
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((c) => (
                      <div
                        key={c.id}
                        className="px-2 py-1 rounded hover:bg-secondary-50 cursor-pointer"
                        onClick={() => setSelectedClass(c)}
                      >
                        <span className="text-sm text-secondary-700">
                          {c.name}
                        </span>
                      </div>
                    ))}
                </div>
              </div>

              <div>
                <button
                  className="text-sm text-primary-600 hover:text-primary-700"
                  onClick={() => setShowCreateModal(true)}
                >
                  + Tạo Lớp
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Content */}
        <section>
          {/* Search removed as requested */}

          {/* List or Detail */}
          {selectedClass ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedClass(null)}
                  >
                    Quay lại
                  </Button>
                  <h2 className="text-2xl font-semibold text-secondary-900">
                    {selectedClass.name}
                  </h2>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddStudent(selectedClass.id);
                    }}
                  >
                    Thêm thành viên
                  </Button>
                </div>
              </div>

              {/* Mô tả lớp học */}
              <div className="card">
                <div className="card-content">
                  <p className="text-secondary-700 text-lg mb-2">
                    {selectedClass.description || "Chưa có mô tả"}
                  </p>
                  <div className="text-sm text-secondary-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    Tạo ngày:{" "}
                    {new Date(selectedClass.createdAt).toLocaleDateString(
                      "vi-VN"
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    headerInfo === "none"
                      ? "bg-secondary-100 text-secondary-700"
                      : "text-secondary-700 hover:bg-secondary-50"
                  }`}
                  onClick={() => setHeaderInfo("none")}
                >
                  Hoạt động
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    headerInfo === "students"
                      ? "bg-primary-50 text-primary-700"
                      : "text-secondary-700 hover:bg-secondary-50"
                  }`}
                  onClick={() => setHeaderInfo("students")}
                >
                  Học sinh ({selectedClass.studentCount})
                </button>
                <button
                  className={`px-3 py-1.5 rounded-md text-sm ${
                    headerInfo === "quizzes"
                      ? "bg-primary-50 text-primary-700"
                      : "text-secondary-700 hover:bg-secondary-50"
                  }`}
                  onClick={() => setHeaderInfo("quizzes")}
                >
                  Quiz ({selectedClass.quizCount})
                </button>
              </div>

              {headerInfo === "students" && (
                <div className="card">
                  <div className="card-content">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      Danh sách học sinh ({selectedClass.studentCount})
                    </h3>
                    <div className="space-y-2">
                      {selectedClass.students.map((st) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-secondary-50"
                        >
                          <div>
                            <span className="font-medium text-secondary-900">
                              {st.name}
                            </span>
                            <span className="text-secondary-500 ml-2">
                              ({st.email})
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-error-600"
                            onClick={() =>
                              setClassesState((prev) =>
                                prev.map((c) =>
                                  c.id === selectedClass.id
                                    ? {
                                        ...c,
                                        students: c.students.filter(
                                          (s) => s.id !== st.id
                                        ),
                                        studentCount: c.studentCount - 1,
                                      }
                                    : c
                                )
                              )
                            }
                          >
                            Xóa
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
              {headerInfo === "quizzes" && (
                <div className="card">
                  <div className="card-content">
                    <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                      Danh sách quiz ({selectedClass.quizCount})
                    </h3>
                    <div className="space-y-2">
                      {selectedClass.quizzes.map((qz) => (
                        <div
                          key={qz.id}
                          className="flex items-center justify-between text-sm px-2 py-1 rounded hover:bg-secondary-50"
                        >
                          <div>
                            <span className="font-medium text-secondary-900">
                              {qz.title}
                            </span>
                            {qz.isAssigned && (
                              <span className="text-success-600 ml-2">
                                ✓ Đã giao
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Button variant="ghost" size="sm">
                              Sửa
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-error-600"
                              onClick={() =>
                                setClassesState((prev) =>
                                  prev.map((c) =>
                                    c.id === selectedClass.id
                                      ? {
                                          ...c,
                                          quizzes: c.quizzes.filter(
                                            (q) => q.id !== qz.id
                                          ),
                                          quizCount: c.quizCount - 1,
                                        }
                                      : c
                                  )
                                )
                              }
                            >
                              Xóa
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {headerInfo === "none" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="card">
                    <div className="card-content h-32 flex flex-col items-center justify-center text-center">
                      <p className="font-medium">Mời thành viên</p>
                      <Button
                        className="mt-2"
                        size="sm"
                        onClick={() => handleAddStudent(selectedClass.id)}
                      >
                        Thêm
                      </Button>
                    </div>
                  </div>
                  <div className="card">
                    <div className="card-content h-32 flex flex-col items-center justify-center text-center">
                      <p className="font-medium">Giao</p>
                      <Button
                        className="mt-2"
                        size="sm"
                        onClick={() => handleAddQuiz(selectedClass.id)}
                      >
                        Giao bài
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              <div className="card">
                <div className="card-content text-center text-secondary-600">
                  Chưa có hoạt động nào trong nhóm này – hãy bắt đầu bằng cách
                  tạo nội dung.
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {(activeTab === "owned" ? classesState : joinedClassesState).map(
                (classItem) => (
                  <div
                    key={classItem.id}
                    className="card hover:shadow-xl transition-all duration-200 cursor-pointer"
                    onClick={() => setSelectedClass(classItem)}
                  >
                    <div className="card-content relative">
                      {/* Top-right: edit/delete */}
                      <div className="absolute top-0 right-0 mt-2 mr-2 flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setEditingClass(classItem);
                          }}
                          title="Sửa lớp"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-error-600"
                          title="Xóa lớp"
                          onClick={async (e) => {
                            e.stopPropagation();
                            const useMock =
                              (import.meta as any).env?.VITE_USE_MOCK ===
                              "true";
                            if (useMock) {
                              await mockAdapter.delete(
                                `/groups/${classItem.id}`
                              );
                            } else {
                              await apiClient.delete(`/groups/${classItem.id}`);
                            }
                            setClassesState((prev) =>
                              prev.filter((c) => c.id !== classItem.id)
                            );
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      <div className="flex items-start justify-between mb-5">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-xl font-bold text-secondary-900">
                              {classItem.name}
                            </h3>
                            {classItem.joinCode && (
                              <div className="flex items-center gap-1.5 bg-secondary-50 text-secondary-700 px-3 py-1 rounded-lg text-sm shadow-sm">
                                <Hash className="w-4 h-4" />
                                <span className="font-mono font-semibold">
                                  {classItem.joinCode}
                                </span>
                                <button
                                  className="text-primary-600 hover:text-primary-700"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigator.clipboard.writeText(
                                      classItem.joinCode || ""
                                    );
                                  }}
                                  title="Sao chép mã lớp"
                                >
                                  <Copy className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </div>
                          <p className="text-base text-secondary-600 mb-4">
                            {classItem.description}
                          </p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-5 mb-5">
                        <div className="text-center p-4 bg-primary-50 rounded-xl">
                          <Users className="w-6 h-6 text-primary-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-primary-900">
                            {classItem.studentCount}
                          </p>
                          <p className="text-sm text-primary-600">Học sinh</p>
                        </div>
                        <div className="text-center p-4 bg-success-50 rounded-xl">
                          <BookOpen className="w-6 h-6 text-success-600 mx-auto mb-2" />
                          <p className="text-2xl font-bold text-success-900">
                            {classItem.quizCount}
                          </p>
                          <p className="text-sm text-success-600">Quiz</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-base text-secondary-500 mb-5 pt-4 border-t border-secondary-100">
                        <div className="flex items-center">
                          <Calendar className="w-5 h-5 mr-2" />
                          <span className="font-medium">Tạo:</span>{" "}
                          {new Date(classItem.createdAt).toLocaleDateString(
                            "vi-VN"
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <Button
                          variant="outline"
                          size="md"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddStudent(classItem.id);
                          }}
                        >
                          <UserPlus className="w-5 h-5 mr-2" />
                          Thêm HS
                        </Button>
                        <Button
                          size="md"
                          className="flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleAddQuiz(classItem.id);
                          }}
                        >
                          <BookOpen className="w-5 h-5 mr-2" />
                          Thêm Quiz
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
          {classesState.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-secondary-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Chưa có lớp học nào
              </h3>
              <p className="text-secondary-600 mb-6">
                Tạo lớp học đầu tiên để bắt đầu
              </p>
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Tạo lớp học mới
              </Button>
            </div>
          )}
        </section>
      </div>

      {/* Create Class Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Tạo lớp học mới"
      >
        <div className="space-y-4">
          <Input
            label="Tên lớp học"
            placeholder="Nhập tên lớp học"
            value={newClassName}
            onChange={(e) => setNewClassName(e.target.value)}
          />

          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              Mô tả
            </label>
            <textarea
              className="input min-h-[80px] resize-none"
              placeholder="Nhập mô tả lớp học"
              value={newClassDescription}
              onChange={(e) => setNewClassDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3">
            <Button variant="outline" onClick={() => setShowCreateModal(false)}>
              Hủy
            </Button>
            <Button onClick={handleCreateClass} disabled={creating}>
              Tạo lớp học
            </Button>
          </div>
        </div>
      </Modal>

      {/* Edit Class Modal */}
      <Modal
        isOpen={!!editingClass}
        onClose={() => setEditingClass(null)}
        title="Sửa thông tin lớp học"
      >
        {!!editingClass && (
          <div className="space-y-4">
            <Input
              label="Tên lớp học"
              value={editingClass.name}
              onChange={(e) =>
                setEditingClass({ ...editingClass, name: e.target.value })
              }
            />
            <div>
              <label className="text-sm font-medium text-secondary-700 mb-2 block">
                Mô tả
              </label>
              <textarea
                className="input min-h-[80px] resize-none"
                value={editingClass.description}
                onChange={(e) =>
                  setEditingClass({
                    ...editingClass,
                    description: e.target.value,
                  })
                }
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setEditingClass(null)}>
                Hủy
              </Button>
              <Button
                onClick={async () => {
                  if (!editingClass) return;
                  const useMock =
                    (import.meta as any).env?.VITE_USE_MOCK === "true";
                  const payload = {
                    groupName: editingClass.name,
                    groupDescription: editingClass.description,
                  };
                  if (useMock) {
                    await mockAdapter.patch(
                      `/groups/${editingClass.id}`,
                      payload
                    );
                  } else {
                    await apiClient.patch(
                      `/groups/${editingClass.id}`,
                      payload
                    );
                  }
                  setClassesState((prev) =>
                    prev.map((c) =>
                      c.id === editingClass.id ? editingClass : c
                    )
                  );
                  setEditingClass(null);
                }}
              >
                Lưu
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add Student Modal */}
      <Modal
        isOpen={showAddStudentModal}
        onClose={() => setShowAddStudentModal(false)}
        title={`Thêm học sinh vào ${selectedClass?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              ID học sinh
            </label>
            <Input placeholder="Nhập ID học sinh" type="text" />
            <p className="text-xs text-secondary-500 mt-1">
              Học sinh có thể tìm ID của mình trong phần Hồ sơ
            </p>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary-900 mb-2">
              Học sinh hiện tại ({selectedClass?.studentCount})
            </h4>
            <div className="space-y-2">
              {selectedClass?.students.map((student) => (
                <div
                  key={student.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-secondary-900">
                      {student.name}
                    </span>
                    <span className="text-secondary-500 ml-2">
                      (ID: {student.id})
                    </span>
                  </div>
                  <Button variant="ghost" size="sm" className="text-error-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddStudentModal(false)}
            >
              Hủy
            </Button>
            <Button>Thêm học sinh</Button>
          </div>
        </div>
      </Modal>

      {/* Add Quiz Modal */}
      <Modal
        isOpen={showAddQuizModal}
        onClose={() => setShowAddQuizModal(false)}
        title={`Thêm quiz vào ${selectedClass?.name}`}
      >
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-secondary-700 mb-2 block">
              Chọn quiz
            </label>
            <select className="input">
              <option value="">Chọn quiz để thêm</option>
              <option value="1">Kiểm tra Toán chương 1</option>
              <option value="2">Quiz Hình học</option>
              <option value="3">Bài tập Vật lý</option>
            </select>
          </div>

          <div className="bg-secondary-50 rounded-lg p-4">
            <h4 className="text-sm font-medium text-secondary-900 mb-2">
              Quiz đã gán ({selectedClass?.quizCount})
            </h4>
            <div className="space-y-2">
              {selectedClass?.quizzes.map((quiz) => (
                <div
                  key={quiz.id}
                  className="flex items-center justify-between text-sm"
                >
                  <div>
                    <span className="font-medium text-secondary-900">
                      {quiz.title}
                    </span>
                    {quiz.isAssigned && (
                      <span className="text-success-600 ml-2">✓ Đã gán</span>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" className="text-error-600">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowAddQuizModal(false)}
            >
              Hủy
            </Button>
            <Button>Thêm quiz</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
