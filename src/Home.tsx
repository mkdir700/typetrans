import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";

export default function Home() {
  return (
    <div
      className="h-screen w-screen overflow-hidden flex font-['Inter','Noto_Sans_SC',sans-serif] select-none rounded-2xl"
      style={{ background: "transparent" }}
    >
      {/* Glass container */}
      <div className="flex-1 flex glass-container rounded-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.12)] overflow-hidden">
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 overflow-auto custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
