import { Routes, Route } from "react-router-dom";
import NavBar from "./components/NavBar";
import Footer from "./components/Footer";
import WhatsAppButton from "./components/WhatsAppButton";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Plans from "./pages/Plans";
import MealPlans from "./pages/MealPlans";
import Supplements from "./pages/Supplements";
import Progress from "./pages/Progress";
import Contact from "./pages/Contact";
import SignInPage from "./pages/SignIn";
import SignUpPage from "./pages/SignUp";
import Account from "./pages/Account";

export default function App() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavBar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/plans" element={<Plans />} />
          <Route path="/meal-plans" element={<MealPlans />} />
          <Route path="/supplements" element={<Supplements />} />
          <Route path="/progress" element={<Progress />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/sign-in/*" element={<SignInPage />} />
          <Route path="/sign-up/*" element={<SignUpPage />} />
          <Route
            path="/account"
            element={
              <ProtectedRoute>
                <Account />
              </ProtectedRoute>
            }
          />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}
