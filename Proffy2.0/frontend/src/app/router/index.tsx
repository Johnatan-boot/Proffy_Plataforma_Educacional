import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Landing } from "@/pages/Landing";
import { TeacherList } from "@/pages/TeacherList";
import { TeacherForm } from "@/pages/TeacherForm";
import { Login } from "@/pages/Login";
import { Register } from "@/pages/Register";
import { Dashboard } from "@/pages/Dashboard";
import { AdminTeachers } from "@/pages/AdminTeachers";
import { AdminSubjects } from "@/pages/AdminSubjects";
import { AdminSchedules } from "@/pages/AdminSchedules";
import { AdminStudents } from "@/pages/AdminStudents";
import { StudentForm } from "@/pages/StudentForm";
import { ScheduleForm } from "@/pages/ScheduleForm";
import { ProtectedRoute } from "@/components/layout/ProtectedRoute";
import { AdminTimesheet } from "@/pages/AdminTimesheet";
import { AnimatePresence } from "motion/react";

const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/study", element: <TeacherList /> },
  { path: "/give-classes", element: <TeacherForm /> },
  { path: "/teachers/:id/edit", element: <ProtectedRoute><TeacherForm /></ProtectedRoute> },
  { path: "/login", element: <Login /> },
  { path: "/register", element: <Register /> },
  { path: "/dashboard", element: <ProtectedRoute><Dashboard /></ProtectedRoute> },
  { path: "/teachers", element: <ProtectedRoute><AdminTeachers /></ProtectedRoute> },
  { path: "/students", element: <ProtectedRoute><AdminStudents /></ProtectedRoute> },
  { path: "/students/new", element: <ProtectedRoute><StudentForm /></ProtectedRoute> },
  { path: "/students/:id/edit", element: <ProtectedRoute><StudentForm /></ProtectedRoute> },
  { path: "/subjects", element: <ProtectedRoute><AdminSubjects /></ProtectedRoute> },
  { path: "/schedules", element: <ProtectedRoute><AdminSchedules /></ProtectedRoute> },
  { path: "/schedules/new", element: <ProtectedRoute><ScheduleForm /></ProtectedRoute> },
  { path: "/timesheet", element: <ProtectedRoute><AdminTimesheet /></ProtectedRoute> },
]);

export function AppRouter() {
  return (
    <AnimatePresence mode="wait">
      <RouterProvider router={router} />
    </AnimatePresence>
  );
}
