import React,{ useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, Navigate } from 'react-router-dom';
import TodoList from './components/TodoList';
import Register from './components/Register';
import Login from './components/Login';

function App() {

  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if there's a userId in local storage
    const storedUserId = localStorage.getItem('userId');

    if (storedUserId) {
      // User is authenticated, set the user state
      setUser({ _id: storedUserId });
    } else {
      // User is not authenticated, set the user state to null
      setUser(null);
    }
  }, []);
  return (
    <Router>
      <Routes>
      <Route
          path="/"
          element={user ? <TodoList /> : <Navigate to="/login" />}
        />
        {/* <Route path="/" element={<TodoList />} /> */}
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
}

export default App;
