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
            "flex-1 flex rounded-xl overflow-hidden shadow-2xl transition-all duration-300",
            "bg-background/80 backdrop-blur-xl border border-border"
        )}
      >
        <Sidebar />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto scrollbar-none relative">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
