import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; 
import { doc, onSnapshot, updateDoc } from "firebase/firestore"; 
import { Button } from 'react-bootstrap';

const CurrBalance = () => {
  const [balance, setBalance] = useState(() => {
    const savedBalance = localStorage.getItem('balance');
    return savedBalance ? parseInt(savedBalance, 10) : 0;
  });
  const [totalIncome, setTotalIncome] = useState(() => {
    const savedIncome = localStorage.getItem('income');
    return savedIncome ? parseInt(savedIncome, 10) : 0;
  });
  const [totalExpense, setTotalExpense] = useState(() => {
    const savedExpense = localStorage.getItem('expense');
    return savedExpense ? parseInt(savedExpense, 10) : 0;
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBalanceData = () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const newIncome = data.income || 0;
            const newExpense = data.expense || 0;

            setTotalIncome(newIncome);
            setTotalExpense(newExpense);

            const newBalance = newIncome - newExpense;
            setBalance(newBalance);

            // Save to localStorage
            localStorage.setItem('balance', newBalance);
            localStorage.setItem('income', newIncome);
            localStorage.setItem('expense', newExpense);

            console.log("Balance updated:", newBalance);
          } else {
            console.log("User document does not exist.");
          }
        }, (err) => {
          console.error("Error listening to document:", err);
          setError("Failed to listen for updates. Please try again.");
        });

        return () => unsubscribe();
      }
    };
    fetchBalanceData();
  }, []);

  const handleReset = async () => {
    const user = auth.currentUser;
    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      try {
        // Reset income, expense, and balance in Firestore
        await updateDoc(userDocRef, { income: 0, expense: 0, balance: 0 });

        // Reset local state and localStorage
        setBalance(0);
        setTotalIncome(0);
        setTotalExpense(0);
        localStorage.setItem('balance', 0);
        localStorage.setItem('income', 0);
        localStorage.setItem('expense', 0);

        console.log("Balance reset to 0.");
      } catch (err) {
        console.error("Error resetting balance:", err);
        setError("Failed to reset balance. Please try again.");
      }
    }
  };

  return (
    <div className="card">
      <h2>Current Balance</h2>
      {error && <p className="text-danger">{error}</p>}
      <p>${balance}</p>
      <Button variant="danger" onClick={handleReset}>Reset</Button>
    </div>
  );
};

export default CurrBalance;
