import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Catalogues from "@/pages/catalogues";
import Products from "@/pages/products";
import Orders from "@/pages/orders";
import Storefront from "@/pages/storefront";
import StoreView from "@/pages/public/store-view";
import CatalogueView from "@/pages/public/catalogue-view";
import { AppLayout } from "@/components/layout/app-layout";

function Router() {
  return (
    <Switch>
      {/* Admin Dashboard Routes */}
      <Route path="/" component={Dashboard} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/catalogues" component={Catalogues} />
      <Route path="/products" component={Products} />
      <Route path="/orders" component={Orders} />
      <Route path="/storefront" component={Storefront} />
      
      {/* Public Routes */}
      <Route path="/store" component={StoreView} />
      <Route path="/catalogue/:id">
        {params => <CatalogueView id={parseInt(params.id)} />}
      </Route>
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppLayout>
        <Router />
      </AppLayout>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
