import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase"; 
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { Modal, Button } from 'react-bootstrap';

const TotalIncome = () => {
  const [income, setIncome] = useState(0);
  const [show, setShow] = useState(false);
  const [newIncome, setNewIncome] = useState({ name: "", amount: "", date: "", tag: "salary" });

  useEffect(() => {
    const fetchIncome = async () => {
      const user = auth.currentUser;

      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
          setIncome(userDocSnap.data().income || 0);
        } else {
          await setDoc(userDocRef, { income: 0 });
          setIncome(0);
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
      const updatedIncome = income + parseInt(newIncome.amount, 10);
      setIncome(updatedIncome);
      setShow(false);

      await updateDoc(userDocRef, { income: updatedIncome });
    }
  };

  return (
    <div className="card">
      <h2>Total Income</h2>
      <p>${income}</p>
      <Button onClick={() => setShow(true)}>Add Income</Button>

      {/* Modal for adding income */}
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Add Income</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleSubmit}>
            <div className="mb-3">
              <label>Name</label>
              <input type="text" className="form-control" value={newIncome.name} onChange={(e) => setNewIncome({ ...newIncome, name: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label>Amount</label>
              <input type="number" className="form-control" value={newIncome.amount} onChange={(e) => setNewIncome({ ...newIncome, amount: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label>Date</label>
              <input type="date" className="form-control" value={newIncome.date} onChange={(e) => setNewIncome({ ...newIncome, date: e.target.value })} required />
            </div>
            <div className="mb-3">
              <label>Tag</label>
              <select className="form-select" value={newIncome.tag} onChange={(e) => setNewIncome({ ...newIncome, tag: e.target.value })}>
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
