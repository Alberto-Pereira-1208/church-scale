import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AppProvider } from "./contexts/AppContext";
import Home from "./pages/Home";


import Escalas from "./pages/Escalas";
import NovaEscala from "./pages/NovaEscala";
import EditarEscala from "./pages/EditarEscala";
import Voluntarios from "./pages/Voluntarios";
import Ministerios from "./pages/Ministerios";
import Configuracoes from "./pages/Configuracoes";
import HistoricoNotificacoes from "./pages/HistoricoNotificacoes";
import CustomizarNotificacoes from "./pages/CustomizarNotificacoes";
import Dashboard from "./pages/Dashboard";
import HistoricoPresenca from "./pages/HistoricoPresenca";
import AnalisePresenca from "./pages/AnalisePresenca";
import HistoricoExclusoes from "./pages/HistoricoExclusoes";

function Router() {
  return (
    <Switch>
      <Route path={"/"} component={Home} />
      <Route path={"/escalas"} component={Escalas} />
      <Route path={"/escalas/nova"} component={NovaEscala} />
      <Route path={"/escalas/editar"} component={EditarEscala} />
      <Route path={"/voluntarios"} component={Voluntarios} />
      <Route path={"/ministerios"} component={Ministerios} />
      <Route path={"/configuracoes"} component={Configuracoes} />
      <Route path={"/historico-notificacoes"} component={HistoricoNotificacoes} />
      <Route path={"/customizar-notificacoes"} component={CustomizarNotificacoes} />
      <Route path={"/dashboard"} component={Dashboard} />
      <Route path={"/historico-presenca"} component={HistoricoPresenca} />
      <Route path={"/analise-presenca"} component={AnalisePresenca} />
      <Route path={"/historico-exclusoes"} component={HistoricoExclusoes} />
      <Route path={"/404"} component={NotFound} />
      {/* Final fallback route */}
      <Route component={NotFound} />
    </Switch>
  );
}

// NOTE: About Theme
// - First choose a default theme according to your design style (dark or light bg), than change color palette in index.css
//   to keep consistent foreground/background color across components
// - If you want to make theme switchable, pass `switchable` ThemeProvider and use `useTheme` hook

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider
        defaultTheme="dark"
        // switchable
      >
        <AppProvider>
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </AppProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
