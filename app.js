const express =  require("express")
const app = express()
const mongoose = require("mongoose")
const cors = require("cors");
require('dotenv').config();
const axios = require("axios")
const { spawn } = require('child_process');
const schedule = require('node-schedule');
app.use(express.json())
app.use(cors());


const pendingEmails = [];
const mongoUrl = "mongodb+srv://kumarsaarthak916:sarthaktodo@cluster0.ykvtpvu.mongodb.net/?retryWrites=true&w=majority"

mongoose.connect(mongoUrl,{
    useNewUrlParser:true,
}).then(()=>{
    console.log("Connected to database")

}).catch((e)=>console.log(e))



app.listen(4000,()=>{
    console.log('Server started')
})


app.post("/post",async(req,res)=>{
    console.log(req.body)
    const {data} = req.body

    try{
        if(data=="adarsh"){
            res.send({status:"ok ji"})
        }else{
            res.send({status:"nikal "})
        }
    }catch(error){
        res.send({status:"Something went wrong"})
    }
   
})


require("./userSchema")

const User = mongoose.model("UserInfo")

app.post("/register", async (req, res) => {
    try {
      const { name, email, password } = req.body;
  
      // Check if the user already exists
      const existingUser = await User.findOne({ email });
  
      if (existingUser) {
        return res.status(400).json({ status: "User already exists" });
      }
  
      // Create a new user
      const newUser = new User({
        name,
        email,
        password,
      });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(201).json({ status: "User registered successfully" });
    } catch (error) {
      res.status(500).json({ status: "Something went wrong" });
    }
  });
  
  app.post("/login", async (req, res) => {
    try {
      const { email, password } = req.body;
  
      // Find the user by email
      const user = await User.findOne({ email });
  
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }
  
      // Check if the password is correct
      if (user.password !== password) {
        return res.status(401).json({ status: "Incorrect password" });
      }
  
      res.json({ status: "Login successful" , user });
    } catch (error) {
      res.status(500).json({ status: "Something went wrong" });
    }
  });
  

  app.post("/addtodo", async (req, res) => {
    try {
      const { userId, todoItem } = req.body;
  
      // Find the user by userId
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }
  
      // Add the new to-do item to the user's todos array
      user.todos.push(todoItem);
  
      // Save the updated user document
      await user.save();
  
      res.status(201).json({ status: "To-do item added successfully" });
    } catch (error) {
      res.status(500).json({ status: "Something went wrong" });
    }
  });
  

  app.post("/edittodo", async (req, res) => {
    try {
      const { userId, todoIndex, updatedTodo } = req.body;
  
      // Find the user by userId
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }
  
      // Check if the specified index is within bounds
      if (todoIndex < 0 || todoIndex >= user.todos.length) {
        return res.status(400).json({ status: "Invalid to-do index" });
      }
  
      // Update the to-do item at the specified index
      user.todos[todoIndex] = updatedTodo;
  
      // Save the updated user document
      await user.save();
  
      res.json({ status: "To-do item updated successfully" });
    } catch (error) {
      res.status(500).json({ status: "Something went wrong" });
    }
  });
  
  app.post("/deletetodo", async (req, res) => {
    try {
      const { userId, todoIndex } = req.body;
  
      // Find the user by userId
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }
  
      // Check if the specified index is within bounds
      if (todoIndex < 0 || todoIndex >= user.todos.length) {
        return res.status(400).json({ status: "Invalid to-do index" });
      }
  
      // Remove the to-do item at the specified index
      user.todos.splice(todoIndex, 1);
  
      // Save the updated user document
      await user.save();
  
      res.json({ status: "To-do item deleted successfully" });
    } catch (error) {
      res.status(500).json({ status: "Something went wrong" });
    }
  });
  

  app.get("/user/:userId", async (req, res) => {
    try {
      const userId = req.params.userId;
  
      // Find the user by userId
      const user = await User.findOne({ _id: userId });
  
      if (!user) {
        return res.status(404).json({ status: "User not found" });
      }
  
      // Send the user data in the response
      res.json({ user });
    } catch (error) {
      res.status(500).json({ status: "Something went wrong" });
    }
  });
  
  function sendEmailNotification(toEmail, subject, message) {
    const pythonProcess = spawn('python', ['email-notifier.py', toEmail, subject, message]);
  
    pythonProcess.stdout.on('data', (data) => {
      console.log(`Python Script Output: ${data}`);
    });
  
    pythonProcess.stderr.on('data', (data) => {
      console.error(`Python Script Error: ${data}`);
    });
  
    pythonProcess.on('close', (code) => {
      console.log(`Python Script exited with code ${code}`);
    });
  }
 

const checkPendingEmails = schedule.scheduleJob('*/1 * * * *', async () => {
  try {
    // Check the database (or an in-memory array) for pending email tasks
    const currentTime = new Date();

    for (const emailTask of pendingEmails) {
      // Check if the scheduled time has passed
      if (emailTask.scheduledDate <= currentTime) {
        // Send the email from the user associated with the task
        const user = await User.findOne({ _id: emailTask.userId });

        if (user) {
          const message = emailTask.message;
          sendEmailNotification(user.email, "To-do Notification", message);

          // Remove the task from the data source
          const index = pendingEmails.indexOf(emailTask);
          if (index !== -1) {
            pendingEmails.splice(index, 1);
          }
        }
      }
    }
  } catch (error) {
    console.error(error);
  }
});

// ... Rest of your code ...

// API endpoint to schedule email notifications
app.post("/schedule-email", async (req, res) => {
  try {
    const { userId, todoIndex, scheduledDate } = req.body;

    // Parse the scheduledDate string into a Date object
    const parsedScheduledDate = new Date(scheduledDate);

    // Ensure the scheduled time is in the future
    if (parsedScheduledDate <= new Date()) {
      return res.status(400).json({ status: "Scheduled time must be in the future" });
    }

    // Find the user by userId (assuming you have a User model)
    const user = await User.findOne({ _id: userId });

    if (!user) {
      return res.status(404).json({ status: "User not found" });
    }

    // Get the todo item at the specified index
    const todoItem = user.todos[todoIndex];

    // Calculate the minute and hour from the scheduledDate
    const scheduleTime = new Date(parsedScheduledDate);
    const minute = scheduleTime.getUTCMinutes();
    const hour = scheduleTime.getUTCHours();

    // Construct the scheduleExpression
    const scheduleExpression = `${minute} ${hour} * * *`;

    // Schedule the email to be sent at the specified time
    schedule.scheduleJob(scheduleExpression, async () => {
      const message = todoItem;
      sendEmailNotification(user.email, "To-do Notification", message);
    });

    res.status(200).json({ status: "Email scheduled successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "Something went wrong" });
  }
});
  