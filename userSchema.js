const mongoose = require("mongoose")

const UserSchema = new mongoose.Schema(
    {
        name:String,
        email:String,
        password:String,
        todos: {
            type: [String], 
            default: [], 
          },
    },{
        collection:"UserInfo"
    }
)

mongoose.model("UserInfo",UserSchema)