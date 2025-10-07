import { useEffect } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { WalletProvider } from "@/contexts/WalletContext";
import { Navigation } from "@/components/navigation";
import Home from "@/pages/home";
import ExecutiveSummary from "@/pages/executive-summary";
import Introduction from "@/pages/introduction";
import Solution from "@/pages/solution";
import X402Sol from "@/pages/x402-sol";
import DeviceIdentity from "@/pages/device-identity";
import SDK from "@/pages/sdk";
import Tokenomics from "@/pages/tokenomics";
import Roadmap from "@/pages/roadmap";
import ChatPage from "@/pages/chat";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/executive-summary" component={ExecutiveSummary} />
      <Route path="/introduction" component={Introduction} />
      <Route path="/solution" component={Solution} />
      <Route path="/x402-sol" component={X402Sol} />
      <Route path="/device-identity" component={DeviceIdentity} />
      <Route path="/sdk" component={SDK} />
      <Route path="/tokenomics" component={Tokenomics} />
      <Route path="/roadmap" component={Roadmap} />
      <Route path="/chat" component={ChatPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WalletProvider>
          <div className="min-h-screen flex flex-col">
            <Navigation />
            <main className="flex-1">
              <Router />
            </main>
          </div>
          <Toaster />
        </WalletProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
