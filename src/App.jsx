import React, { useState, createContext, useContext } from "react";
import { BrowserRouter as Router, Route, Routes, useNavigate } from "react-router-dom";
import { auth, provider, db, doc, setDoc } from "./firebase"; // Ensure db is imported
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import Dashboard from './pages/dashboard'; // Import your Dashboard component
import './App.css';
import { UserProvider } from './context/userContext';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

const UserContext = createContext(); // Create User Context

const App = () => {
  const [isSignUp, setIsSignUp] = useState(true);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState(""); // State for error messages
  const [successMessage, setSuccessMessage] = useState(""); // State for success messages
  const [userName, setUserName] = useState(""); // State for the user's name
  const navigate = useNavigate(); // Hook to programmatically navigate

  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, provider);
      console.log("Signed in with Google");
      navigate("/dashboard"); // Navigate to dashboard after sign in
    } catch (error) {
      console.error("Error signing in with Google:", error.message);
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Signed up user:", user);

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        fullName: fullName,
        email: user.email
      });

      setSuccessMessage("User signed up successfully!"); // Set success message
      setErrorMessage(""); // Clear any previous error messages
      setUserName(fullName); // Set the user's name
      setTimeout(() => {
        setSuccessMessage(""); // Clear success message after 3 seconds
      }, 3000);

      navigate("/"); // Navigate to login section after sign up
    } catch (error) {
      if (error.code === "auth/email-already-in-use") {
        setErrorMessage("This email is already registered. Please log in."); // Set error message
      } else {
        setErrorMessage("Error signing up: " + error.message); // Set generic error message
      }
      console.error("Error signing up:", error.message);
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Signed in user:", user);
      navigate("/dashboard"); // Navigate to dashboard after sign in
    } catch (error) {
      setErrorMessage("Error signing in: " + error.message); // Set error message for sign in failures
      console.error("Error signing in:", error.message);
    }
  };

  return (
    <UserContext.Provider value={{ userName }}> {/* Provide userName to the context */}
      <div className="container">
        <div className="form-box">
          {errorMessage && <p className="error-message">{errorMessage}</p>} {/* Display error message */}
          {successMessage && <p className="success-message">{successMessage}</p>} {/* Display success message */}
          {isSignUp ? (
            <form onSubmit={handleSignUp}>
              <h2>Create an Account</h2>
              <input type="text" placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <input type="password" placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
              <button type="submit">Sign Up with Email and Password</button>
              <p>or</p>
              <button type="button" onClick={handleGoogleSignIn}>Sign Up with Google</button>
              <p>
                Already have an account?{" "}
                <span onClick={() => setIsSignUp(false)} className="toggle-link">Click here</span>
              </p>
            </form>
          ) : (
            <form onSubmit={handleSignIn}>
              <h2>Sign In</h2>
              <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
              <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
              <button type="submit">Sign In with Email and Password</button>
              <p>or</p>
              <button type="button" onClick={handleGoogleSignIn}>Sign In with Google</button>
              <p>
                Don't have an account?{" "}
                <span onClick={() => setIsSignUp(true)} className="toggle-link">Click here</span>
              </p>
            </form>
          )}
        </div>
      </div>
    </UserContext.Provider>
  );
};

// Wrap the App component with Router
const AppWrapper = () => (
  <Router>
    <Routes>
      <Route path="/" element={<App />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  </Router>
);

export default AppWrapper;
