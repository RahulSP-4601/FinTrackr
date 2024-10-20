// TotalExpense.jsx

import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; 
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { Modal, Button } from 'react-bootstrap';

const TotalExpense = () => {
  const [expense, setExpense] = useState(() => {
    const savedExpense = localStorage.getItem('expense');
    return savedExpense ? parseInt(savedExpense, 10) : 0;
  });
  const [show, setShow] = useState(false);
  const [newExpense, setNewExpense] = useState({ name: "", amount: "", date: "", tag: "Food" });
  const [error, setError] = useState(null); // State to hold any errors

  useEffect(() => {
    const fetchExpense = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const fetchedExpense = userDocSnap.data().expense || 0;
            setExpense(fetchedExpense);
            localStorage.setItem('expense', fetchedExpense);
            console.log("Fetched expense:", fetchedExpense);
          } else {
            // Initialize income, expense, and balance
            await setDoc(userDocRef, { income: 0, expense: 0, balance: 0 });
            setExpense(0);
            localStorage.setItem('expense', 0);
            localStorage.setItem('income', 0);
            localStorage.setItem('balance', 0);
            console.log("Initialized income, expense, and balance to 0.");
          }
        } catch (err) {
          console.error("Error fetching expense:", err);
          setError("Failed to fetch expense. Please try again.");
        }
      }
    };
    fetchExpense();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const amountToAdd = parseInt(newExpense.amount, 10);

      try {
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userDocRef);
          if (!userDoc.exists()) {
            throw "User document does not exist!";
          }

          const currentExpense = userDoc.data().expense || 0;
          const currentIncome = userDoc.data().income || 0;
          const updatedExpense = currentExpense + amountToAdd;
          const updatedBalance = currentIncome - updatedExpense;

          console.log(`Updating expense: ${currentExpense} + ${amountToAdd} = ${updatedExpense}`);
          console.log(`Updating balance: ${currentIncome} - ${updatedExpense} = ${updatedBalance}`);

          // Update expense and balance atomically
          transaction.update(userDocRef, { expense: updatedExpense, balance: updatedBalance });
        });

        // Fetch the latest data after transaction
        const updatedDoc = await getDoc(userDocRef);
        const latestExpense = updatedDoc.data().expense || 0;
        const latestBalance = updatedDoc.data().balance || 0;

        // Update state and localStorage
        setExpense(latestExpense);
        localStorage.setItem('expense', latestExpense);
        localStorage.setItem('balance', latestBalance);

        console.log("Transaction successful. Updated expense:", latestExpense, "Updated balance:", latestBalance);

        setShow(false);
        setNewExpense({ name: "", amount: "", date: "", tag: "Food" }); // Reset form
      } catch (err) {
        console.error("Transaction failed: ", err);
        setError("Failed to add expense. Please try again.");
      }
    }
  };

  return (
    <div className="card">
      <h2>Total Expenses</h2>
      {error && <p className="text-danger">{error}</p>}
      <p>${expense}</p>
      <Button variant="primary" onClick={() => setShow(true)}>Add Expense</Button>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={newExpense.name} 
                onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} 
                required 
              />
            </div>
            <div className="mb-3">
              <label>Amount</label>
              <input 
                type="number" 
                className="form-control" 
                value={newExpense.amount} 
                onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} 
                required 
                min="0" 
              />
            </div>
            <div className="mb-3">
              <label>Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={newExpense.date} 
                onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} 
                required 
              />
            </div>
            <div className="mb-3">
              <label>Tag</label>
              <select 
                className="form-select" 
                value={newExpense.tag} 
                onChange={(e) => setNewExpense({ ...newExpense, tag: e.target.value })}
              >
                <option value="Food">Food</option>
                <option value="Education">Education</option>
                <option value="Travel">Travel</option>
              </select>
            </div>
            <Button type="submit" className="w-100">Add Expense</Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TotalExpense;
