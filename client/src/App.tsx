import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Personnel from "@/pages/personnel";
import Projects from "@/pages/projects";
import Documents from "@/pages/documents";
import Certifications from "@/pages/certifications";
import Compliance from "@/pages/compliance";
import Crews from "@/pages/crews";
import WorkOrders from "@/pages/work-orders";
import Routes from "@/pages/routes";
import Procedures from "@/pages/procedures";
import Transformers from "@/pages/transformers";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Alerts from "@/pages/alerts";
import Reports from "@/pages/reports";
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || !isAuthenticated) {
    return (
      <Switch>
        <Route path="/" component={Landing} />
        <Route component={NotFound} />
      </Switch>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex">
        <Sidebar />
        <div className="flex-1 flex flex-col">
          <Header />
          <main className="flex-1 p-6">
            <Switch>
              <Route path="/" component={Home} />
              <Route path="/dashboard" component={Dashboard} />
              <Route path="/personnel" component={Personnel} />
              <Route path="/projects" component={Projects} />
              <Route path="/documents" component={Documents} />
              <Route path="/certifications" component={Certifications} />
              <Route path="/compliance" component={Compliance} />
              <Route path="/crews" component={Crews} />
              <Route path="/work-orders" component={WorkOrders} />
              <Route path="/routes" component={Routes} />
              <Route path="/procedures" component={Procedures} />
              <Route path="/transformers" component={Transformers} />
              <Route path="/alerts" component={Alerts} />
              <Route path="/reports" component={Reports} />
              <Route component={NotFound} />
            </Switch>
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
