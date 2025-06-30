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
import Header from "@/components/layout/header";
import Sidebar from "@/components/layout/sidebar";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/personal" component={Personnel} />
          <Route path="/proyectos" component={Projects} />
          <Route path="/documentos" component={Documents} />
          <Route path="/certificaciones" component={Certifications} />
          <Route path="/cumplimiento" component={Compliance} />
          <Route path="/cuadrillas" component={Crews} />
          <Route path="/ordenes-trabajo" component={WorkOrders} />
          <Route path="/rutas" component={Routes} />
          <Route path="/procedimientos" component={Procedures} />
          <Route path="/transformadores" component={Transformers} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
