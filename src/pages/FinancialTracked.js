// FinancialTracker.js
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Adjust the path as needed
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Modal, Button } from 'react-bootstrap';

const FinancialTracker = () => {
  const [currBalance, setCurrBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);
  const [showIncomeModal, setShowIncomeModal] = useState(false);
  const [showExpenseModal, setShowExpenseModal] = useState(false);
  const [newIncome, setNewIncome] = useState({ name: "", amount: 0, date: "", tag: "salary" });
  const [newExpense, setNewExpense] = useState({ name: "", amount: 0, date: "", tag: "groceries" });

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setCurrBalance(userDocSnap.data().currBalance || 0);
          setTotalIncome(userDocSnap.data().totalIncome || 0);
          setTotalExpense(userDocSnap.data().totalExpense || 0);
        } else {
          // Initialize user document
          await setDoc(userDocRef, { currBalance: 0, totalIncome: 0, totalExpense: 0 });
        }
      }
    };
    fetchData();
  }, []);

  const handleIncomeSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const updatedIncome = totalIncome + parseInt(newIncome.amount, 10);
      const updatedBalance = currBalance + parseInt(newIncome.amount, 10);
      
      // Update Firestore
      await updateDoc(userDocRef, { totalIncome: updatedIncome, currBalance: updatedBalance });
      
      // Update local state
      setTotalIncome(updatedIncome);
      setCurrBalance(updatedBalance);
      setShowIncomeModal(false);
    }
  };

  const handleExpenseSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;

    if (user) {
      const userDocRef = doc(db, "users", user.uid);
      const updatedExpense = totalExpense + parseInt(newExpense.amount, 10);
      const updatedBalance = currBalance - parseInt(newExpense.amount, 10);
      
      // Update Firestore
      await updateDoc(userDocRef, { totalExpense: updatedExpense, currBalance: updatedBalance });
      
      // Update local state
      setTotalExpense(updatedExpense);
      setCurrBalance(updatedBalance);
      setShowExpenseModal(false);
    }
  };

  return (
    <div className="financial-tracker">
      <h2>Financial Tracker</h2>
      <p>Current Balance: ₹{currBalance}</p>
      <p>Total Income: ₹{totalIncome}</p>
      <p>Total Expense: ₹{totalExpense}</p>

      <Button onClick={() => setShowIncomeModal(true)}>Add Income</Button>
      <Button onClick={() => setShowExpenseModal(true)}>Add Expense</Button>

      {/* Income Modal */}
      <Modal show={showIncomeModal} onHide={() => setShowIncomeModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Income</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleIncomeSubmit}>
            <input type="text" placeholder="Name" value={newIncome.name} onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })} required />
            <input type="number" placeholder="Amount" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} required />
            <input type="date" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} required />
            <select value={newIncome.tag} onChange={(e) => setNewIncome({ ...newIncome, tag: e.target.value })}>
              <option value="salary">Salary</option>
              <option value="gift">Gift</option>
              <option value="business">Business</option>
            </select>
            <Button type="submit">Add Income</Button>
          </form>
        </Modal.Body>
      </Modal>

      {/* Expense Modal */}
      <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleExpenseSubmit}>
            <input type="text" placeholder="Name" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} required />
            <input type="number" placeholder="Amount" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required />
            <input type="date" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} required />
            <select value={newExpense.tag} onChange={(e) => setNewExpense({ ...newExpense, tag: e.target.value })}>
              <option value="groceries">Groceries</option>
              <option value="bills">Bills</option>
              <option value="entertainment">Entertainment</option>
            </select>
            <Button type="submit">Add Expense</Button>
          </form>
        </Modal.Body>
      </Modal>
    </div>
  );
};

export default FinancialTracker;
