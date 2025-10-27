import { Outlet } from "react-router-dom";
import { TopNavbar } from "../../../components/layout/TopNavbar";
import { Footer } from "../../../components/layout/Footer";

export default function StudentLayout() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <TopNavbar />
      <main className="flex-1">
        <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}
