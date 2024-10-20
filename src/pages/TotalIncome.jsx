// TotalIncome.jsx

import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; 
import { doc, getDoc, setDoc, runTransaction } from "firebase/firestore";
import { Modal, Button } from 'react-bootstrap';

const TotalIncome = () => {
  const [income, setIncome] = useState(() => {
    const savedIncome = localStorage.getItem('income');
    return savedIncome ? parseInt(savedIncome, 10) : 0;
  });
  const [show, setShow] = useState(false);
  const [newIncome, setNewIncome] = useState({ name: "", amount: "", date: "", tag: "salary" });
  const [error, setError] = useState(null); // State to hold any errors

  useEffect(() => {
    const fetchIncome = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        try {
          const userDocSnap = await getDoc(userDocRef);

          if (userDocSnap.exists()) {
            const fetchedIncome = userDocSnap.data().income || 0;
            setIncome(fetchedIncome);
            localStorage.setItem('income', fetchedIncome);
            console.log("Fetched income:", fetchedIncome);
          } else {
            // Initialize income, expense, and balance
            await setDoc(userDocRef, { income: 0, expense: 0, balance: 0 });
            setIncome(0);
            localStorage.setItem('income', 0);
            localStorage.setItem('expense', 0);
            localStorage.setItem('balance', 0);
            console.log("Initialized income, expense, and balance to 0.");
          }
        } catch (err) {
          console.error("Error fetching income:", err);
          setError("Failed to fetch income. Please try again.");
        }
      }
    };
    fetchIncome();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const amountToAdd = parseInt(newIncome.amount, 10);

      try {
        await runTransaction(db, async (transaction) => {
          const userDoc = await transaction.get(userDocRef);
          if (!userDoc.exists()) {
            throw "User document does not exist!";
          }

          const currentIncome = userDoc.data().income || 0;
          const currentExpense = userDoc.data().expense || 0;
          const updatedIncome = currentIncome + amountToAdd;
          const updatedBalance = updatedIncome - currentExpense;

          console.log(`Updating income: ${currentIncome} + ${amountToAdd} = ${updatedIncome}`);
          console.log(`Updating balance: ${updatedIncome} - ${currentExpense} = ${updatedBalance}`);

          // Update income and balance atomically
          transaction.update(userDocRef, { income: updatedIncome, balance: updatedBalance });
        });

        // Fetch the latest data after transaction
        const updatedDoc = await getDoc(userDocRef);
        const latestIncome = updatedDoc.data().income || 0;
        const latestBalance = updatedDoc.data().balance || 0;

        // Update state and localStorage
        setIncome(latestIncome);
        localStorage.setItem('income', latestIncome);
        localStorage.setItem('balance', latestBalance);

        console.log("Transaction successful. Updated income:", latestIncome, "Updated balance:", latestBalance);

        setShow(false);
        setNewIncome({ name: "", amount: "", date: "", tag: "salary" }); // Reset form
      } catch (err) {
        console.error("Transaction failed: ", err);
        setError("Failed to add income. Please try again.");
      }
    }
  };

  return (
    <div className="card">
      <h2>Total Income</h2>
      {error && <p className="text-danger">{error}</p>}
      <p>${income}</p>
      <Button variant="primary" onClick={() => setShow(true)}>Add Income</Button>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Income</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input 
                type="text" 
                className="form-control" 
                value={newIncome.name} 
                onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })} 
                required 
              />
            </div>
            <div className="mb-3">
              <label>Amount</label>
              <input 
                type="number" 
                className="form-control" 
                value={newIncome.amount} 
                onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} 
                required 
                min="0" 
              />
            </div>
            <div className="mb-3">
              <label>Date</label>
              <input 
                type="date" 
                className="form-control" 
                value={newIncome.date} 
                onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} 
                required 
              />
            </div>
            <div className="mb-3">
              <label>Tag</label>
              <select 
                className="form-select" 
                value={newIncome.tag} 
                onChange={(e) => setNewIncome({ ...newIncome, tag: e.target.value })}
              >
                <option value="salary">Salary</option>
                <option value="gift">Gift</option>
                <option value="business">Business</option>
              </select>
            </div>
            <Button type="submit" className="w-100">Add Income</Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default TotalIncome;
