import React, { useEffect, useState } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format } from 'date-fns';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {faBell,faTrash,faPenToSquare,faCheck,faXmark} from '@fortawesome/free-solid-svg-icons'



const TodoList = () => {
  const [scheduledDate, setScheduledDate] = useState(null); // State for scheduled date and time
  const [selectedTodoId, setSelectedTodoId] = useState(null);
  const [todos, setTodos] = useState([]);
  const [todoItem, setTodoItem] = useState(''); // State for input field
  const [editIndex, setEditIndex] = useState(-1); // Index of todo being edited
  const [editedTodo, setEditedTodo] = useState(''); // State for edited todo
  const [nextTodoId, setNextTodoId] = useState(1); // Unique ID for the next todo
  const userId = localStorage.getItem('userId');
  const [userName, setUserName] = useState('');

  useEffect(() => {
    if (userId) {
        fetch(`https://new-todo-app-chi.vercel.app/user/${userId}`)
        .then((response) => response.json())
        .then((data) => {
          // Set user's name in state
          setUserName(data.user.name);
        })
        .catch((error) => {
          console.error('Error fetching user name:', error);
        });
      // Fetch todos for the user using userId
      fetch(`https://new-todo-app-chi.vercel.app/user/${userId}`)
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


  const handleScheduleClick = (todoId) => {
    setSelectedTodoId(todoId);
  };

  const handleScheduleSubmit = () => {
    if (userId && selectedTodoId !== null && scheduledDate !== null) {
      const todoIndex = todos.findIndex((todo) => todo.id === selectedTodoId);

    if (todoIndex === -1) {
      console.error('Todo not found');
      return;
    }
      // Create a new Date object with the selected date and time
      const year = scheduledDate.getFullYear();
      const month = String(scheduledDate.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed, so we add 1
      const day = String(scheduledDate.getDate()).padStart(2, '0');
      const hours = String(scheduledDate.getHours()).padStart(2, '0');
      const minutes = String(scheduledDate.getMinutes()).padStart(2, '0');
      const seconds = String(scheduledDate.getSeconds()).padStart(2, '0');
  
      const customISOString = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}.000Z`;
  
      console.log('Request Body:', {
        userId,
        todoIndex,
        scheduledDate: customISOString,
      });
      // Send a POST request to schedule the todo
      fetch('https://new-todo-app-chi.vercel.app/schedule-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          todoIndex,
          scheduledDate: customISOString,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          if (data.status === 'Email scheduled successfully') {
            // Clear the selected todo and scheduled date
            setSelectedTodoId(null);
            setScheduledDate(null);
          } else {
            console.error('Error scheduling todo:', data.status);
          }
        })
        .catch((error) => {
          console.error('Error scheduling todo:', error);
        });
    }
  };
  

  const handleAddTodo = () => {
    if (userId && todoItem.trim() !== '') {
      // Send a POST request to add the todo item
      fetch('https://new-todo-app-chi.vercel.app/addtodo', {
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
      // Find the todo index in the array
      const todoIndex = todos.findIndex((todo) => todo.id === todoId);
  
      if (todoIndex === -1) {
        console.error('Todo not found');
        return;
      }
  
      // Send a POST request to edit the todo item
      fetch('https://new-todo-app-chi.vercel.app/edittodo', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          todoIndex, // Send the todoIndex directly
          updatedTodo,
        }),
      })
        .then((response) => response.json())
        .then((data) => {
          // Check if the todo was edited successfully
          if (data.status === 'To-do item updated successfully') {
            // Update the todo in the state
            const updatedTodos = [...todos];
            updatedTodos[todoIndex] = { ...updatedTodos[todoIndex], text: updatedTodo };
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
      fetch('https://new-todo-app-chi.vercel.app/deletetodo', {
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


<h2 className="text-3xl font-semibold mb-4" style={{ 
  background: 'linear-gradient(60deg, #5DADE2, #1ABC9C )',
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
                  <FontAwesomeIcon icon={faCheck} />
                </button>
                <button
                  onClick={handleEditCancel}
                  className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                >
                  <FontAwesomeIcon icon={faXmark} />
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between w-full">
              <span className="font-bold text-gray-700 text-lg">{todo.text}</span>

              

                <div className="space-x-2 ml-5">
                  <button
                    onClick={() => setEditIndex(todo.id)}
                    className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                  >
                    <FontAwesomeIcon icon={faPenToSquare} />
                  </button>
                  <button
                    onClick={() => handleDelete(todo.id)}
                    className="px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600"
                  >
                    <FontAwesomeIcon icon={faTrash} />
                  </button>
                  {selectedTodoId === todo.id ? (
                    // Date and Time Picker
                    <div className="flex items-center space-x-2">
                      <DatePicker
                        selected={scheduledDate}
                        onChange={(date) => setScheduledDate(date)}
                        showTimeSelect
                        timeFormat="HH:mm"
                        timeIntervals={1}
                        timeCaption="Time"
                        dateFormat="MMMM d, yyyy h:mm aa"
                        className="w-full px-2 py-1 border rounded-md"
                      />
                      <button
                        onClick={handleScheduleSubmit}
                        className="px-2 py-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                      >
                        Submit
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleScheduleClick(todo.id)}
                      className="px-2 py-1 bg-yellow-500 text-white rounded-md hover:bg-yellow-600"
                    >
                     <FontAwesomeIcon icon={faBell} />
                    </button>
                  )}
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