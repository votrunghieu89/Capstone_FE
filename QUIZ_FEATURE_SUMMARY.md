# Tóm Tắt Tính Năng Quiz Cho Sinh Viên

## 🎯 Yêu Cầu Đã Hoàn Thành

### 1. **Xem Chi Tiết Quiz**

- Click vào nút "**Xem chi tiết**" (dù đã làm hay chưa làm)
- → Chuyển đến trang **Quiz Preview** (`/quiz/preview/:quizId?classId=xxx`)
- Hiển thị thông tin chi tiết quiz giống như ở trang chủ
- Có nút "Bắt đầu làm Quiz" để bắt đầu làm bài

### 2. **Nút "Đã Hoàn Thành"**

- Chỉ hiển thị khi quiz đã hoàn thành
- Click vào → Chuyển đến **Bảng Xếp Hạng** (`/student/quiz/:quizId/result`)
- Hiển thị ranking của tất cả học sinh trong lớp đã làm bài

### 3. **Sau Khi Làm Xong Quiz**

- **Quiz từ lớp học** → Hiển thị **Bảng Xếp Hạng** lớp 🏆
  - Route: `/play/live/class-{classId}-{quizId}`
  - Kết quả: `/student/quiz/:quizId/result`
- **Quiz từ trang chủ** → Hiển thị **Kết Quả Cá Nhân** 📊
  - Route: `/play/live/solo-{quizId}`
  - Kết quả: `/quiz/result/:quizId` (SoloResult)

---

## 🔄 Luồng Hoạt Động

```
📚 Lớp Học (Classes)
  │
  ├─ Quiz chưa được giao
  │   └─ Nút "Xem chi tiết" → 🔒 Disabled
  │
  ├─ Quiz đã giao, chưa làm
  │   ├─ Nút "Xem chi tiết" → 📖 Preview (?classId=xxx)
  │   └─ Nút "Bắt đầu làm" → 📖 Preview (?classId=xxx)
  │
  └─ Quiz đã hoàn thành
      ├─ Nút "Xem chi tiết" → 📖 Preview (?classId=xxx)
      └─ Nút "Đã hoàn thành" → 🏆 Bảng Xếp Hạng ⭐


📖 Quiz Preview (/quiz/preview/:quizId?classId=xxx)
  ├─ Có classId → Quiz từ lớp học
  │   └─ "Bắt đầu làm Quiz" → /play/live/class-{classId}-{quizId}
  │
  └─ Không có classId → Quiz solo
      └─ "Bắt đầu làm Quiz" → /play/live/solo-{quizId}


� Làm Bài (/play/live/{sessionId})
  ├─ sessionId = "solo-{quizId}"
  │   └─ Sau khi xong → 📊 Kết Quả Cá Nhân (/quiz/result/:quizId)
  │
  ├─ sessionId = "class-{classId}-{quizId}"
  │   └─ Sau khi xong → 🏆 Bảng Xếp Hạng (/student/quiz/:quizId/result)
  │
  └─ sessionId = {liveSessionId}
      └─ Sau khi xong → 🏆 Kết Quả Live (/play/result/:sessionId)


🏆 Bảng Xếp Hạng (/student/quiz/:quizId/result)
  ├─ Kết quả của bạn (highlight)
  ├─ Danh sách xếp hạng (🥇🥈🥉)
      └─ Điểm, % chính xác, thời gian của từng người
```

---

## 📁 Cấu Trúc Files & Thay Đổi

### Files Mới

- **`QuizResultView.tsx`** - Bảng xếp hạng các học sinh trong lớp

### Files Đã Cập Nhật

#### 1. **Classes.tsx**

- `handleViewQuizDetail(quizId, classId)`: Chuyển đến Preview với classId
- `handleViewResult(quizId)`: Chuyển đến Bảng xếp hạng
- Nút "Xem chi tiết": Luôn hiển thị Preview (dù đã làm hay chưa)
- Nút "Đã hoàn thành": Chỉ hiện khi quiz đã hoàn thành, click vào xem bảng xếp hạng

#### 2. **Preview.tsx**

- Nhận `classId` từ URL query params (`?classId=xxx`)
- Nếu có `classId` → Làm bài theo mode lớp học
- Nếu không → Làm bài theo mode solo
- Route khi bắt đầu:
  - Từ lớp: `/play/live/class-{classId}-{quizId}`
  - Solo: `/play/live/solo-{quizId}`

#### 3. **Live.tsx**

- Phát hiện 3 loại session từ `sessionId`:
  - `solo-{quizId}`: Solo mode
  - `class-{classId}-{quizId}`: Class mode
  - `{sessionId}`: Live multiplayer mode
- Sau khi hoàn thành chuyển đến:
  - Solo → `/quiz/result/:quizId` (SoloResult - kết quả cá nhân)
  - Class → `/student/quiz/:quizId/result` (Leaderboard - bảng xếp hạng)
  - Live → `/play/result/:sessionId` (Live result)

#### 4. **router.tsx**

- Route đã có: `/student/quiz/:quizId/result` → QuizResultView---

## 🎨 Giao Diện Bảng Xếp Hạng

### Header Quiz Info

- Tên quiz và tên lớp
- Tổng số câu hỏi

### My Result Card (Gradient)

- Icon Trophy
- **Hạng của bạn**: Top X
- **3 số liệu chính**: Điểm | Câu đúng | Thời gian

### Leaderboard Table

Mỗi dòng hiển thị:

- **Rank Badge**: 🥇 🥈 🥉 hoặc #4, #5...
- **Avatar**: Ảnh đại diện hoặc chữ cái đầu
- **Tên học sinh**: Highlight nếu là bạn
- **Điểm số**: Font lớn, màu primary
- **% Chính xác**: Tính từ số câu đúng
- **Thời gian**: Format MM:SS
- **Thời gian hoàn thành**: HH:MM

### Styling

- Dòng của bạn: `bg-primary-50 border-primary-300` (highlight)
- Top 1: `bg-yellow-50 text-yellow-600` 🥇
- Top 2: `bg-gray-50 text-gray-600` 🥈
- Top 3: `bg-orange-50 text-orange-600` 🥉
- Các vị trí khác: `bg-secondary-50`

---

## 🔧 API Cần Implement

### 1. GET `/api/student/classes/:classId/quiz/:quizId/leaderboard`

Lấy bảng xếp hạng quiz trong lớp

```json
{
  "quizTitle": "Kiểm tra Toán chương 1",
  "className": "Lớp 10A1 - Toán học",
  "maxScore": 100,
  "totalQuestions": 10,
  "myResult": {
    "studentId": "current-user",
    "studentName": "Học sinh (Bạn)",
    "score": 85,
    "correctAnswers": 8,
    "totalQuestions": 10,
    "timeSpent": 240,
    "completedAt": "2024-10-10T10:30:00",
    "rank": 3
  },
  "leaderboard": [
    {
      "studentId": "1",
      "studentName": "Nguyễn Văn A",
      "avatarUrl": "...",
      "score": 100,
      "correctAnswers": 10,
      "totalQuestions": 10,
      "timeSpent": 180,
      "completedAt": "2024-10-10T09:15:00",
      "rank": 1
    }
    // ... more students
  ]
}
```

### 2. GET `/api/quizzes/:quizId/preview`

Lấy thông tin chi tiết quiz để preview (đã có)

---

## ✅ Tính Năng Đã Hoàn Thành

- ✅ Click "Xem chi tiết" (chưa làm) → hiển thị Quiz Preview
- ✅ Click "Bắt đầu làm" → hiển thị Quiz Preview
- ✅ Click "Xem chi tiết" (đã làm) → hiển thị Bảng Xếp Hạng ⭐
- ✅ Click "Đã hoàn thành" → hiển thị Bảng Xếp Hạng ⭐
- ✅ Bảng xếp hạng hiển thị tất cả học sinh trong lớp
- ✅ Highlight kết quả của bản thân
- ✅ Hiển thị rank với icon (🥇🥈🥉)
- ✅ Hiển thị điểm, % chính xác, thời gian của từng người
- ✅ Phân biệt rõ: Quiz từ lớp → Leaderboard, Quiz từ trang chủ → Kết quả cá nhân
- ✅ Navigation giữa các trang hoạt động tốt
- ✅ Responsive design cho mobile & desktop

---

## 📝 Notes Quan Trọng

### 🎯 Điểm Khác Biệt Chính

1. **Quiz từ Lớp Học (Class Quiz)**:

   - Sau khi làm xong → Hiển thị **Bảng Xếp Hạng**
   - So sánh với bạn bè trong lớp
   - Component: `QuizResultView.tsx`
   - Route: `/student/quiz/:quizId/result`

2. **Quiz từ Trang Chủ (Solo/Practice)**:
   - Sau khi làm xong → Hiển thị **Kết Quả Cá Nhân**
   - Chi tiết từng câu đúng/sai
   - Component: `SoloResult.tsx`
   - Route: `/quiz/result/:quizId`

### ⚠️ Lưu Ý

- Tất cả data hiện tại là **MOCK DATA**
- Quiz Preview sử dụng component có sẵn từ `/quiz/preview/:quizId`
- Bảng xếp hạng chỉ hiển thị cho quiz trong lớp học
- Avatar có fallback là chữ cái đầu nếu không có ảnh

---

## 🚀 Next Steps

1. Integrate với API backend
2. Test toàn bộ luồng với dữ liệu thật
3. Add error handling khi API fail
4. Có thể thêm loading states khi fetch data
5. Thêm tính năng "Làm lại quiz" nếu cần
