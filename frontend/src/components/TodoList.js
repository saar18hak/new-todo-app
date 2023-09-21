import React, { useEffect, useState } from 'react';

const TodoList = () => {
  const [todos, setTodos] = useState([]);
  const [todoItem, setTodoItem] = useState(''); // State for input field
  const [editIndex, setEditIndex] = useState(-1); // Index of todo being edited
  const [editedTodo, setEditedTodo] = useState(''); // State for edited todo
  const [nextTodoId, setNextTodoId] = useState(1); // Unique ID for the next todo
  const userId = localStorage.getItem('userId');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (userId) {
        fetch(`http://localhost:4000/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          // Set user's name in state
          setUserName(data.user.name);
        })
        .catch((error) => {
          console.error('Error fetching user name:', error);
        });
      // Fetch todos for the user using userId
      fetch(`http://localhost:4000/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          // Set todos in state
          setTodos(data.user.todos.map((text, index) => ({ id: index, text })));
        })
        .catch((error) => {
          console.error('Error fetching todos:', error);
        });
    }
  }, []);

  const handleAddTodo = () => {
    if (userId && todoItem.trim() !== '') {
      // Send a POST request to add the todo item
      fetch('http://localhost:4000/addtodo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          todoItem,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Check if the todo was added successfully
          if (data.status === 'To-do item added successfully') {
            // Add the todo to the state with a unique ID
            const newTodo = { id: nextTodoId, text: todoItem };
            setTodos([...todos, newTodo]);
            // Increment the next todo ID
            setNextTodoId(nextTodoId + 1);
            // Clear the input field
            setTodoItem('');
          } else {
            console.error('Error adding todo:', data.status);
          }
        })
        .catch((error) => {
          console.error('Error adding todo:', error);
        });
    }
  };

  const handleEdit = (todoId, updatedTodo) => {
    if (userId) {
      // Send a POST request to edit the todo item
      fetch('http://localhost:4000/edittodo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          todoId,
          updatedTodo,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Check if the todo was edited successfully
          if (data.status === 'To-do item updated successfully') {
            // Update the todo in the state
            const updatedTodos = todos.map((todo) =>
              todo.id === todoId ? { ...todo, text: updatedTodo } : todo
            );
            setTodos(updatedTodos);
            // Clear the editing state
            setEditIndex(-1);
            // Clear the edited todo
            setEditedTodo('');
          } else {
            console.error('Error editing todo:', data.status);
          }
        })
        .catch((error) => {
          console.error('Error editing todo:', error);
        });
    }
  };

  const handleEditCancel = () => {
    // Clear the editing state and edited todo
    setEditIndex(-1);
    setEditedTodo('');
  };

  const handleDelete = (todoId) => {
    if (userId) {
      // Send a POST request to delete the todo item
      fetch('http://localhost:4000/deletetodo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          todoId,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Check if the todo was deleted successfully
          if (data.status === 'To-do item deleted successfully') {
            // Remove the todo from the state
            const updatedTodos = todos.filter((todo) => todo.id !== todoId);
            setTodos(updatedTodos);
          } else {
            console.error('Error deleting todo:', data.status);
          }
        })
        .catch((error) => {
          console.error('Error deleting todo:', error);
        });
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-900 via-gray-700 to-gray-500 min-h-screen flex flex-col justify-center items-center">
    <div className="max-w-md mx-auto mt-8 p-4 bg-white shadow-md rounded-md">
         
         <h1 className="text-4xl font-semibold mb-4">
  Welcome <span style={{ 
    background: `linear-gradient(45deg, #ff7f00, #ff00ff)`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    }}>{userName}</span>
</h1>


<h2 className="text-2xl font-semibold mb-4" style={{ 
  background: 'linear-gradient(60deg, #00ff99, #ff00cc)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
}}>
  Todo List
</h2>

      <div className="mb-4">
        <input
          type="text"
          placeholder="Enter a new todo"
          value={todoItem}
          onChange={(e) => setTodoItem(e.target.value)}
          className="w-full px-3 py-2 border rounded-md"
        />
        <button
  onClick={handleAddTodo}
  className="mt-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-md hover:from-blue-500 hover:to-blue-900 hover:shadow-lg hover:scale-105 transition-transform duration-300 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
>
  Add Todo
</button>
      </div>
      <ul>
        {todos.map((todo) => (
          <li key={todo.id} className="mb-2 flex justify-between items-center">
            {editIndex === todo.id ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={editedTodo}
                  onChange={(e) => setEditedTodo(e.target.value)}
                  className="w-full px-2 py-1 border rounded-md"
                />
                <button
                  onClick={() => handleEdit(todo.id, editedTodo)}
                  className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  Save
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
              <span className="font-bold text-gray-700 text-lg">{todo.text}</span>


                <div className="space-x-2">
                  <button
                    onClick={() => setEditIndex(todo.id)}
                    className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
    </div>
  );
};

export default TodoList;
