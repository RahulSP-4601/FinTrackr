import React, { useState } from "react";
import { auth } from "../firebase"; // Adjust this path if necessary
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import './Dashboard.css'; // Add your CSS for styling
import CurrBalance from './currBalance';
import TotalIncome from './TotalIncome';
import TotalExpense from './TotalExpense';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'; // Import FontAwesomeIcon
import { faUser } from '@fortawesome/free-solid-svg-icons'; // Import user icon

const Dashboard = () => {
  const user = auth.currentUser; // Get the current user
  const navigate = useNavigate(); // Initialize useNavigate
  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // State to manage dropdown visibility

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log("User signed out");
      navigate("/"); // Redirect to the login page after logout
    } catch (error) {
      console.error("Error signing out:", error.message);
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  };

  return (
    <div className="dashboard">
      <nav className="navbar">
        <div className="user-account">
          <FontAwesomeIcon 
            icon={faUser} // Use the FontAwesome user icon
            className="user-icon" 
            onClick={toggleDropdown} // Toggle dropdown on click
            style={{ cursor: 'pointer', fontSize: '24px', marginLeft: '1410px' }} // Adjust size and cursor
          />
          {isDropdownOpen && ( // Render dropdown if open
            <div className="dropdown-content">
              {user?.displayName || "User"}
              <button onClick={handleLogout}>Log Out</button>
            </div>
          )}
        </div>
      </nav>
      
      {/* Add more dashboard content here */}
      <div className="dashboard-content">
        <CurrBalance />
        <TotalIncome />
        <TotalExpense />
      </div>
    </div>
  );
};

export default Dashboard;
