import { createBrowserRouter, Navigate } from "react-router-dom";
import { RequireAuth } from "../app/routes/protected/RequireAuth";
import { RequireRole } from "../app/routes/protected/RequireRole";

// Auth routes
import Login from "../app/routes/auth/Login";
import Register from "../app/routes/auth/Register";
import ForgotPassword from "../app/routes/auth/ForgotPassword";
import VerifyOtp from "../app/routes/auth/VerifyOtp";
import ResetPassword from "../app/routes/auth/ResetPassword";

// Admin routes
import AdminLayout from "../app/routes/admin/layout";
import AdminDashboard from "../app/routes/admin/Dashboard";
import AdminUsers from "../app/routes/admin/Users";
import AdminUserDetail from "../app/routes/admin/UserDetail";

// Teacher routes
import TeacherLayout from "../app/routes/teacher/layout";
import TeacherFolders from "../app/routes/teacher/Folders";
import TeacherHistory from "../app/routes/teacher/History";
import TeacherClasses from "../app/routes/teacher/Classes";

// Student routes
import StudentLayout from "../app/routes/student/layout";
import StudentClasses from "../app/routes/student/Classes";
import StudentHistory from "../app/routes/student/History";
import QuizResultView from "../app/routes/student/QuizResultView";

// Host/Play routes
import HostLobby from "../app/routes/host/Lobby";
import HostLive from "../app/routes/host/Live";
import HostResults from "../app/routes/host/Results";
import JoinByPin from "../app/routes/play/JoinByPin";
import PlayLive from "../app/routes/play/Live";
import PlayResult from "../app/routes/play/Result";

// Search routes
import BrowseQuizzes from "../app/routes/search/Browse";
import FavouriteQuizzes from "../app/routes/favourites/List";
import Home from "../app/routes/Home";
import QuizPreview from "../app/routes/quiz/Preview";

// Additional routes
import Profile from "../app/routes/Profile";
import CreateQuiz from "../app/routes/quiz/CreateQuiz";
import EditQuiz from "../app/routes/quiz/EditQuiz";
import SoloResult from "../app/routes/quiz/SoloResult";
import QuizDetail from "../app/routes/quiz/QuizDetail";
export const router = createBrowserRouter(
  [
    {
      path: "/",
      element: <Home />,
    },
    {
      path: "/auth",
      children: [
        { path: "login", element: <Login /> },
        { path: "register", element: <Register /> },
        { path: "forgot", element: <ForgotPassword /> },
        { path: "verify-otp", element: <VerifyOtp /> },
        { path: "reset", element: <ResetPassword /> },
        { path: "reset-password", element: <ResetPassword /> },
      ],
    },
    {
      path: "/admin",
      element: (
        <RequireAuth>
          <RequireRole roles={["Admin"]}>
            <AdminLayout />
          </RequireRole>
        </RequireAuth>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: "users", element: <AdminUsers /> },
        { path: "users/:userId", element: <AdminUserDetail /> },
      ],
    },
    {
      path: "/teacher",
      element: (
        <RequireAuth>
          <RequireRole roles={["Teacher"]}>
            <TeacherLayout />
          </RequireRole>
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="/" replace /> },
        { path: "folders", element: <TeacherFolders /> },
        { path: "history", element: <TeacherHistory /> },
        { path: "classes", element: <TeacherClasses /> },
      ],
    },
    {
      path: "/student",
      element: (
        <RequireAuth>
          <RequireRole roles={["Student"]}>
            <StudentLayout />
          </RequireRole>
        </RequireAuth>
      ),
      children: [
        { index: true, element: <Navigate to="/" replace /> },
        { path: "classes", element: <StudentClasses /> },
        {
          path: "quiz/:quizId/result",
          element: <QuizResultView />,
        },
        { path: "history", element: <StudentHistory /> },
      ],
    },
    {
      path: "/host",
      children: [
        {
          path: "lobby/:quizId",
          element: (
            <RequireAuth>
              <RequireRole roles={["Teacher"]}>
                <HostLobby />
              </RequireRole>
            </RequireAuth>
          ),
        },
        {
          path: "live/:quizId",
          element: (
            <RequireAuth>
              <RequireRole roles={["Teacher"]}>
                <HostLive />
              </RequireRole>
            </RequireAuth>
          ),
        },
        {
          path: "results/:quizId",
          element: (
            <RequireAuth>
              <RequireRole roles={["Teacher"]}>
                <HostResults />
              </RequireRole>
            </RequireAuth>
          ),
        },
      ],
    },
    {
      path: "/play",
      children: [
        { path: "join", element: <JoinByPin /> },
        { path: "live/:sessionId", element: <PlayLive /> },
        { path: "result/:sessionId", element: <PlayResult /> },
      ],
    },
    // Shared lobby for both host and players (no role restriction)
    { path: "/lobby/:sessionId", element: <HostLobby /> },
    { path: "/quiz/preview/:quizId", element: <QuizPreview /> },
    { path: "/quiz/result/:quizId", element: <SoloResult /> },
    { 
      path: "/report/detail/:id", 
      element: (
        <RequireAuth>
          <QuizDetail />
        </RequireAuth>
      ),
    },
    { path: "/search", element: <BrowseQuizzes /> },
    {
      path: "/favourites",
      element: (
        <RequireAuth>
          <FavouriteQuizzes />
        </RequireAuth>
      ),
    },
    {
      path: "/profile",
      element: (
        <RequireAuth>
          <Profile />
        </RequireAuth>
      ),
    },
    {
      path: "/quiz/create",
      element: (
        <RequireAuth>
          <RequireRole roles={["Teacher"]}>
            <CreateQuiz />
          </RequireRole>
        </RequireAuth>
      ),
    },
    {
      path: "/quiz/edit/:quizId",
      element: (
        <RequireAuth>
          <RequireRole roles={["Teacher"]}>
            <EditQuiz />
          </RequireRole>
        </RequireAuth>
      ),
    },
    { path: "*", element: <div>404 - Page Not Found</div> },
  ],
  {
    future: {
      v7_startTransition: true,
    },
  }
);
