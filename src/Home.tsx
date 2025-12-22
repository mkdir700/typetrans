import { Outlet } from "react-router-dom";
import Sidebar from "./components/Sidebar";
import { cn } from "./lib/utils";

export default function Home() {
  return (
    <div
      className="h-screen w-screen overflow-hidden flex font-['Inter','Noto_Sans_SC',sans-serif] select-none p-2 bg-transparent"
    >
      {/* Glass container */}
      <div 
        className={cn(
            "flex-1 flex rounded-xl overflow-hidden shadow-2xl border border-white/20 dark:border-slate-700/50",
            "bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl"
        )}
      >
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto no-scrollbar relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
