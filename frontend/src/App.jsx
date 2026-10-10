import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Register from "./pages/Register";
import Login from "./pages/Login";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import ErrorBoundary from "./components/ErrorBoundary";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { ShoppingListProvider } from "./context/ShoppingListContext";

// Signed-in pages are loaded on demand, so the login screen opens faster.
const Home = lazy(() => import("./pages/Home"));
const Favorites = lazy(() => import("./pages/Favorites"));
const History = lazy(() => import("./pages/History"));
const ShoppingList = lazy(() => import("./pages/ShoppingList"));
const NotFound = lazy(() => import("./pages/NotFound"));

function protectedPage(element) {
  return <ProtectedRoute>{element}</ProtectedRoute>;
}

// The list is stored per account, so remount it whenever the signed-in user changes.
function ShoppingScope({ children }) {
  const { user } = useAuth();
  return (
    <ShoppingListProvider key={user?.email || "guest"} owner={user?.email}>
      {children}
    </ShoppingListProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FavoritesProvider>
          <ShoppingScope>
            <div className="app-shell">
              <Navbar />
              <main className="page-container">
                <ErrorBoundary>
                  <Suspense fallback={<p className="results-loading">Loading…</p>}>
                    <Routes>
                      <Route path="/" element={<Login />} />
                      <Route path="/register" element={<Register />} />
                      <Route path="/home" element={protectedPage(<Home />)} />
                      <Route path="/favorites" element={protectedPage(<Favorites />)} />
                      <Route path="/shopping" element={protectedPage(<ShoppingList />)} />
                      <Route path="/history" element={protectedPage(<History />)} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                </ErrorBoundary>
              </main>
            </div>
          </ShoppingScope>
        </FavoritesProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
