import { useEffect, useState } from "react";
import { checkAccessibilityPermission, requestAccessibilityPermission } from "tauri-plugin-macos-permissions-api";
import { Button } from "../components/ui/button";
import { ShieldAlert, Settings, CheckCircle2 } from "lucide-react";

interface AccessibilityGuardProps {
    children?: React.ReactNode;
    onPermissionGranted?: () => void;
}

export function AccessibilityGuard({ children, onPermissionGranted }: AccessibilityGuardProps) {
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [isMac, setIsMac] = useState(false);

    const [success, setSuccess] = useState(false);

    useEffect(() => {
        // Detect OS
        if (navigator.userAgent.includes("Mac")) {
            setIsMac(true);
            // Initial check
            checkPermission(true);
        } else {
            setHasPermission(true);
            onPermissionGranted?.();
        }
    }, [onPermissionGranted]);

    const checkPermission = async (isInitial = false) => {
        try {
            // First try the plugin
            let granted = false;
            try {
                granted = await checkAccessibilityPermission();
            } catch (e) {
                console.warn("Plugin check failed, trying custom command", e);
            }

            // If plugin says no or failed, try our custom command
            if (!granted) {
                try {
                     const { invoke } = await import("@tauri-apps/api/core");
                     granted = await invoke<boolean>("check_accessibility");
                } catch (e) {
                    console.error("Custom check failed", e);
                }
            }

            console.log(`Accessibility permission check (initial=${isInitial}):`, granted);
            setHasPermission(granted);
            
            if (granted === true) {
                 if (isInitial) {
                     // If granted on initial load, auto-proceed without showing success screen
                     onPermissionGranted?.();
                 } else {
                     // If granted during polling (was previously false), show success screen
                     setSuccess(true);
                 }
            }

        } catch (error) {
            console.error("Failed to check accessibility permission:", error);
        }
    };

    const handleEnterApp = async () => {
        onPermissionGranted?.();
    };

    const handleRequestPermission = async () => {
        try {
            await requestAccessibilityPermission();
        } catch (error) {
            console.error("Failed to request permission:", error);
        }
    };

    // Poll for permission when the window is focused
    useEffect(() => {
        if (isMac && hasPermission === false) { 
            // Only poll if we know it's false. If null (loading), we wait for initial check.
            // If true, we stop polling.
            const handleFocus = () => {
                checkPermission(false);
            };
            window.addEventListener("focus", handleFocus);
            
            const interval = setInterval(() => checkPermission(false), 2000); // Relax interval slightly

            return () => {
                window.removeEventListener("focus", handleFocus);
                clearInterval(interval);
            };
        }
    }, [hasPermission, isMac]);

    // Cleanup effects:
    // We removed the auto-trigger effect because we handle it in checkPermission(true)
    
    if (hasPermission === true && !success) {
         // Should have triggered callback, but render nothing or children while waiting for parent update
        return children ? <>{children}</> : null;
    }
    
    if (hasPermission === true && success) {
        // Fallthrough to success view
    } else if (hasPermission === false) {
        // Fallthrough to Request view
    } else {
         // hasPermission is null (loading)
         return null; 
    }
    if (success) {
        return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-transparent select-none font-sans overflow-hidden">
                <div className="w-full h-full flex flex-col items-center justify-center bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
                    <div className="mb-6 p-4 bg-green-500/10 rounded-full shadow-sm ring-1 ring-green-500/20 animate-in zoom-in spin-in-12 duration-500">
                        <CheckCircle2 className="h-16 w-16 text-green-500 drop-shadow-sm" />
                    </div>
                    <h1 className="text-2xl font-semibold tracking-tight text-foreground mb-2">
                        Permission Granted
                    </h1>
                    <p className="text-muted-foreground text-sm mb-8">
                        You're all set!
                    </p>
                    
                    <Button 
                        size="default" 
                        onClick={handleEnterApp}
                        className="w-[200px] h-10 text-sm font-medium shadow-sm hover:shadow-md transition-all animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200"
                    >
                        Enter App
                    </Button>
                </div>
            </div>
        );
    }
    
    // If we are checking (null) or true (but skipping success screen handled by effect), return null or loader?
    if (hasPermission === null) {
        return null; // Or a loading spinner?
    }
    
    // If hasPermission is true (and we are here, means success is false, which means it was auto-skipped),
    // we should render null (or children if used as wrapper). 
    // If App.tsx unmounts us, this doesn't matter.
    if (hasPermission === true) {
        return null; 
    }

    // Default: Permission Missing View
    return (
            <div className="h-screen w-screen flex flex-col items-center justify-center bg-transparent select-none font-sans overflow-hidden">
                {/* Native macOS Setup Style Container */}
                <div className="w-full h-full flex flex-col items-center pt-8 px-6 bg-background/95 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300">
                    
                    {/* Icon Area */}
                    <div className="mb-4 shrink-0">
                        <div className="p-3 bg-red-500/10 rounded-2xl shadow-sm ring-1 ring-red-500/20">
                            <ShieldAlert className="h-10 w-10 text-red-500 drop-shadow-sm" />
                        </div>
                    </div>

                    {/* Title Area */}
                    <div className="text-center space-y-1 mb-6 shrink-0">
                        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                            Enable Accessibility
                        </h1>
                        <p className="text-muted-foreground text-sm max-w-[260px] leading-relaxed mx-auto">
                            TypeTrans needs this permission to detect shortcuts and translate seamlessly.
                        </p>
                    </div>

                    {/* Features List - Compact */}
                    <div className="w-full max-w-[280px] mb-6 space-y-2 shrink-0">
                        <div className="flex items-center gap-2.5 p-2 rounded-md bg-card/40 border border-border/30 transition-colors">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            <span className="text-xs font-medium text-foreground/80">Auto-paste translations</span>
                        </div>
                        <div className="flex items-center gap-2.5 p-2 rounded-md bg-card/40 border border-border/30 transition-colors">
                            <CheckCircle2 className="h-4 w-4 text-green-500 shrink-0" />
                            <span className="text-xs font-medium text-foreground/80">Global shortcut detection</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col gap-2.5 w-full max-w-[280px] mt-auto mb-8 shrink-0">
                        <Button 
                            size="default" 
                            onClick={handleRequestPermission}
                            className="w-full h-10 text-sm font-medium shadow-sm hover:shadow-md transition-all"
                        >
                            <Settings className="mr-2 h-4 w-4" />
                            Open System Settings
                        </Button>
                    </div>

                    <div className="text-[10px] text-muted-foreground/30 absolute bottom-2 shrink-0">
                        System Settings &gt; Accessibility
                    </div>
                </div>
            </div>
    );
}
