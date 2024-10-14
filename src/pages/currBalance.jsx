import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Import firestore and auth
import { doc, onSnapshot, updateDoc } from "firebase/firestore"; // Import onSnapshot for real-time updates
import { Modal, Button } from 'react-bootstrap';
const CurrBalance = () => {
  const [balance, setBalance] = useState(0);
  const [error, setError] = useState(null); // State to hold any errors

  // Listen for real-time updates to the user's document
  useEffect(() => {
    const user = auth.currentUser;
    
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      
      // Set up the real-time listener
      const unsubscribe = onSnapshot(userDocRef, (doc) => {
        if (doc.exists()) {
          const data = doc.data();
          const totalIncome = data.income || 0;
          const totalExpense = data.expense || 0;
          const newBalance = totalIncome - totalExpense; // Calculate balance
          setBalance(newBalance); // Update state with calculated balance

          // Update the balance in Firestore
          updateDoc(userDocRef, { balance: newBalance }).catch((err) => {
            console.error("Error updating balance:", err);
            setError("Failed to update balance. Please try again."); // Set error message
          });
        }
      }, (error) => {
        console.error("Error listening to document:", error);
        setError("Failed to listen for updates. Please try again."); // Set error message
      });

      // Clean up the listener on unmount
      return () => unsubscribe();
    } 
  }, []);

  return (
    <div className="card">
      <h2>Current Balance</h2>
      {error && <p className="error">{error}</p>} {/* Display error if exists */}
      <p>${balance}</p>
      <Button onClick={() => setShow(true)}>Reset</Button>
    </div>
    
  );
};

export default CurrBalance;
