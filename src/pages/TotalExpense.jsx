import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; // Import firestore and auth
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Modal, Button } from 'react-bootstrap';

const TotalExpense = () => {
  const [expense, setExpense] = useState(0); // Initial expense is ₹0
  const [show, setShow] = useState(false); // Modal visibility state
  const [newExpense, setNewExpense] = useState({ name: "", amount: "", date: "", tag: "Food" });

  // Fetch expense from Firestore on component mount
  useEffect(() => {
    const fetchExpense = async () => {
      const user = auth.currentUser;
      const userDocRef = doc(db, "users", user.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        setExpense(userDocSnap.data().expense || 0); // Set expense to Firestore value
      } else {
        await setDoc(userDocRef, { expense: 0 }); // Initialize expense to 0 if new user
      }
    };
    fetchExpense();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = auth.currentUser;
    const userDocRef = doc(db, "users", user.uid);

    const updatedExpense = expense + parseInt(newExpense.amount);
    setExpense(updatedExpense);
    setShow(false); // Close modal after submission

    // Update Firestore with new expense
    await updateDoc(userDocRef, { expense: updatedExpense });
  };

  return (
    <div className="card">
      <h2>Total Expenses</h2>
      <p>${expense}</p>
      <Button onClick={() => setShow(true)}>Add Expense</Button>

      {/* Modal for adding expense */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input type="text" className="form-control" value={newExpense.name} onChange={(e) => setNewExpense({ ...newExpense, name: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label>Amount</label>
              <input type="number" className="form-control" value={newExpense.amount} onChange={(e) => setNewExpense({ ...newExpense, amount: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label>Date</label>
              <input type="date" className="form-control" value={newExpense.date} onChange={(e) => setNewExpense({ ...newExpense, date: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label>Tag</label>
              <select className="form-select" value={newExpense.tag} onChange={(e) => setNewExpense({ ...newExpense, tag: e.target.value })}>
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
