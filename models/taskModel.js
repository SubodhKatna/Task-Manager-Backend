const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema(
    {
        workTitle: {
            type: String,
            trim: true,
        }, // one way to add a property in schema
        deadline: Date, // one way to add a property in schema
        taskTitle: {
            // another way to add a property in schema :: this helps you to add validations
            type: String,
            required: true,
            trim: true,
            // unique: true, //TODO: between different users, I want the task title to get repeated but not repeated for same user
        },
        assignee: {
            type: String,
            required: true,
            trim: true,
        },
        assignor: {
            type: String,
            required: true,
            trim: true,
        },
        priority: {
            type: String,
            default: "normal", // Normal, urgent, Urgent, Quick, Instant, Important, low, not urgent, high, high priority
            enum: ["normal", "low", "high", "urgent"], // select in the frontend (ONLY available options)
        },
        status: {
            type: String,
            default: "todo", // Normal, urgent, Urgent, Quick, Instant, Important, low, not urgent, high, high priority
            enum: ["done", "inprogress", "todo", "abandoned"], // select in the frontend (ONLY available options)
        },
    },
    {
        timestamps: true, // database will automatically add time stamps to the entries
    }
);

const Task = mongoose.model("tasks", taskSchema); // collectionName (keep it plural), schema

module.exports = Task;