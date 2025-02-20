require("dotenv").config(); // it attaches the .env key values in the process variable that we cn now use anywhere as we require
require("./config/dbConfig.js"); // (when ever you require the file, it runs that file.) it will connect the mongoose to our MONGO DB Atlas Database and then we can use the mongoose from here on to do DB stuff
const PORT = process.env.PORT || 1814; // we are attaching a fallback PORT incase if port is not mentioned in the .env file
const express = require("express"); // we will be using express framework for our backend app
const morgan = require("morgan"); // we import a third party library for better logs on console
const cors = require("cors"); // this allow the browser to enable frontend to connect to backend by giving such permissions
const User = require("./models/userModel.js");
const { generateOTP } = require("./utils/otpHelpers.js");
const { sendOtpEmail, sendReminderMail } = require("./utils/emailHelpers.js");
const OTP = require("./models/otpModel.js");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const Task = require("./models/taskModel.js");

const cron = require("node-cron");

cron.schedule("* * * * *", () => {
    console.log("---- ---- ---- running a task every minute");
    //whatever code you write here will run every minute
    // search for all the tasks that have deadline in current time +- 1 minute
    // send mail to them

    // function with dummy data
    // sendReminderMail("likhilesh@programmingpathshala.com", "Task 1");
});

// --------------------------------------------------------------
const app = express(); // we are creating a server using express
// --------------------------------------------------------------

app.use(morgan("dev")); // this is a third-party middleware (written by someone else) which logs the request to console in better way

// app.use(cors()); // this code actually allows all origins / domains to talk with backend
app.use(
    cors({
        credentials: true,
        origin: process.env.FRONTEND_URL,
    })
); // this code allows only the frontend with origin "http://localhost:5173" to talk with backend and
// also allows him to send and receive the cookies

app.use(express.json()); // this will read the request body stream and serializes it into javascript object and attach it on the req object :: req.body

app.use((req, res, next) => {
    console.log("=> Request received -->", req.url);
    next();
}); // this is a very basic middleware which logs the request to console

// health check, or basically to check if server is working fine
app.get("/", (req, res) => {
    res.send("<h1>Server is working fine ...</h1>");
});

// document.addEventListener("click", (ev)=>{ev.target.styles.backgroundColor = 'red'})
// request handler for the endpoint with particular http verb or method
app.get("/users", (req, res) => {
    try {
        // we will complete it after sometime
    } catch (err) {
        console.log("Error in GET /users");
        console.log(err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "Internal Server Error " + err.message,
        });
    }
});



app.post("/users/register", async (req, res) => {
    try {
        const { email, password, otp, fullName } = req.body; 
        const otpDoc = await OTP.findOne({
            email: email,
        }).sort("-createdAt"); 

        // check if the otp was sent to email or not
        if (!otpDoc) {
            res.status(400);
            res.json({
                status: "fail",
                message: "Either OTP is not sent to the given email or it is expired! Please try again!",
            });
            return;
        }

        const { otp: hashedOtp } = otpDoc; // renaming otp to hashedOtp to avoid conflict in variable names

        // verify if the otp is correct
        const isOtpCorrect = await bcrypt.compare(otp.toString(), hashedOtp);
        if (!isOtpCorrect) {
            res.status(401);
            res.json({
                status: "fail",
                message: "Invalid OTP !",
            });
            return;
        }

        // store the password securely
        const hashedPassword = await bcrypt.hash(password, 14);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            fullName,
        }); // put user data in database

        res.status(201);
        res.json({
            status: "success",
            data: {
                user: {
                    email: newUser.email,
                    fullName: newUser.fullName,
                },
            },
        });
    } catch (err) {
        console.log("--- Error in /POST users ---");
        console.log(err.name, err.code);
        console.log(err.message);
        if (err.name === "ValidationError") {
            // mistake of client that he has not sent the valid data
            res.status(400);
            res.json({
                status: "fail",
                message: "Data validation failed: " + err.message,
            });
        } else if (err.code === 11000) {
            // mistake of client that he is using the email which already registered
            res.status(400);
            res.json({
                status: "fail",
                message: "Email already exists!",
            });
        } else {
            // generic mistake by server
            res.status(500);
            res.json({
                status: "fail",
                message: "Internal Server Error",
            });
        }
    }
});


app.post("/otps", async (req, res) => {
    // const { email } = req.query; // http://localhost:1814/otps?email=lik@abc.com
    const { email } = req.body; // send it in body n json format
    // validate if the user is sending email
    //TODO: check if the email is in required format using regex or length or ...
    if (!email) {
        res.status(400).json({
            status: "fail",
            message: 'Missing required parameter: "email"',
        });
        return;
    }

    //TODO: Homework:
    // check if the otp is already sent to that email within last X Minutes
    // OTP.find().where("createdAt").gte(...) current time - X minutes

    // create a 4 digit OTP
    const otp = generateOTP();

    // send the OTP to email
    const isEmailSent = await sendOtpEmail(email, otp);

    // isEmailSent can be true or false
    if (!isEmailSent) {
        // this is the case when isEmailSent is false
        res.status(500).json({
            status: "fail",
            message: "Email could not be sent! Please try again after 30 seconds!",
        });
        return;
    }

    // store the OTP in database
    // store it in secured way
    // we will use pt.5 in readme
    // algo: bcrypt
    const newSalt = await bcrypt.genSalt(14); // rounds-x == iterations pow(2,x)
    const hashedOtp = await bcrypt.hash(otp.toString(), newSalt);

    await OTP.create({
        email,
        otp: hashedOtp,
    });

    // send the success response
    res.status(201);
    res.json({
        status: "success",
        message: `OTP sent to ${email}`,
    });
});

app.post("/users/login", async (req, res) => {
    try {
        const { email, password } = req.body; // user will send plain password

        if (!email || !password) {
            res.status(400);
            res.json({
                status: "fail",
                message: "Email and password is required!",
            });
        }

        // check if the email is of a registered user
        const currUser = await User.findOne({ email: email });

        if (!currUser) {
            res.status(400);
            res.json({
                status: "fail",
                message: "User is not registered!",
            });
            return;
        }

        // match the password if email ...
        const { password: hashedPassword, fullName, _id } = currUser; // currUser --> DB document
        const isPasswordCorrect = await bcrypt.compare(password, hashedPassword);

        // if password is incorrect
        if (!isPasswordCorrect) {
            res.status(401);
            res.json({
                status: "fail",
                message: "Invalid email or password!",
            });
            return;
        }

        // issue a jwt token for the validating the user requests in future
        const token = jwt.sign(
            {
                email,
                _id,
                fullName,
            }, // payload
            process.env.JWT_SECRET_KEY, // secret key
            {
                expiresIn: "1d", // https://github.com/vercel/ms
            } // extra options if you want to specify
        );

        // res.cookie method adds a cookie to frontend in the format :: name, value
        // frontend should allow the backend to perform cookie operations
        // in the request use --> credentials: "include" (when you use fetch API)
        // in the cors options on backend mention --> credentials: true
        res.cookie("authorization", token, {
            httpOnly: true, // it cannot be accessed by JS code on client machine
            secure: true, // it will be only sent on https connections
            sameSite: "None", // currently our backend is on separate domain and frontend is on separate domain
            // in production, when you host BE and FE on same domain, make it "Strict"
        });

        res.status(200);
        res.json({
            status: "success",
            message: "User logged in",
            data: {
                user: {
                    email,
                    fullName,
                },
            },
        });

        // send success
    } catch (err) {
        console.log("Error in login", err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "Internal Server Error",
        });
    }
});


app.use(cookieParser()); 

app.use((req, res, next) => {
    try {

        const { authorization } = req.cookies;
        if (!authorization) {
            res.status(401);
            res.json({
                status: "fail",
                message: "Authorization failed!",
            });
            return;
        }
        jwt.verify(authorization, process.env.JWT_SECRET_KEY, (error, data) => {
            if (error) {
                res.status(401);
                res.json({
                    status: "fail",
                    message: "Authorization failed!",
                });
            } else {
                req.currUser = data;
                next();
            }
        });
    } catch (err) {
        console.log("Error in validation middleware", err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "Internal Server Error",
        });
    }
});

// CREATEs a task
app.post("/tasks", async (req, res) => {
    try {
        const taskInfo = req.body;
        const { email } = req.currUser;

        const newTask = await Task.create({
            ...taskInfo,
            assignor: email,
        });

        res.status(201);
        res.json({
            status: "success",
            data: {
                task: newTask,
            },
        });
    } catch (err) {
        console.log("Error in POST /tasks", err.message);
        if (err.name === "ValidationError") {
            res.status(400).json({ status: "fail", message: err.message });
        } else if (err.code === 11000) {
            res.status(400).json({ status: "fail", message: err.message });
        } else {
            res.status(500).json({ status: "fail", message: "Internal Server Error" });
        }
    }
});

app.get("/users/me", (req, res) => {
    try {
        const { email, fullName } = req.currUser;
        res.status(200);
        res.json({
            status: "success",
            data: {
                user: {
                    email,
                    fullName,
                },
            },
        });
    } catch (err) {
        console.log("error is GET /users/me", err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "INTERNAL SERVER ERROR",
        });
    }
});

app.get("/users/logout", (req, res) => {
    res.clearCookie("authorization");
    res.json({
        status: "success",
        message: "User is logged out!",
    });
});

app.get("/tasks", async (req, res) => {
    try {
        const taskList = await Task.find().or([{ assignor: req.currUser.email }, { assignee: req.currUser.email }]);
        res.status(200);
        res.json({
            status: "success",
            data: {
                tasks: taskList,
            },
        });
    } catch (err) {
        console.log("error is GET /users/me", err.message);
        res.status(500);
        res.json({
            status: "fail",
            message: "INTERNAL SERVER ERROR",
        });
    }
});


app.patch("/tasks/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;
        const { workTitle, assignee, priority, status } = req.body;

        const updatedTask = await Task.findByIdAndUpdate(
            taskId,
            {
                workTitle,
                assignee,
                priority,
                status,
            },
            {
                returnDocument: "after", 
                runValidators: true,
            }
        );
        if (updatedTask === null) {
            res.status(400).json({
                status: "fail",
                message: "Task ID does not exists!",
            });
        }

        res.status(200).json({
            status: "success",
            data: {
                task: updatedTask,
            },
        });
    } catch (err) {
        console.log("Error in PATCH /tasks", err.message);
        if (err.name === "CastError") {
            res.status(400).json({
                status: "fail",
                message: "Invalid parameter",
            });
        }
        else if (err.name === "ValidationError") {
            res.status(400).json({ status: "fail", message: err.message });
        }

        else {
            res.status(500).json({ status: "fail", message: "Internal Server Error" });
        }
    }
});

// DELETE
app.delete("/tasks/:taskId", async (req, res) => {
    try {
        const { taskId } = req.params;
        const result = await Task.findByIdAndDelete(taskId);
        if (result === null) {
            res.status(400).json({
                status: "fail",
                message: "Task ID does not exists!",
            });
        } else {
            res.status(204).json({
                status: "success",
                data: {
                    result,
                },
            });
        }
    } catch (err) {
        console.log(err.message);
        if (err.name == "CastError") {
            res.status(400).json({
                status: "fail",
                message: "Invalid parameter",
            });
        } else {
            res.status(500).json({
                status: "fail",
                message: "Internal Server Error",
            });
        }
    }
});

app.patch("/tasks/:id/done", async (req, res) => {
    try {
        const { id } = req.params;
        console.log("🔍 Received Task ID:", id);

        const task = await Task.findByIdAndUpdate(id, { status: "done" }, { new: true });

        if (!task) {
            return res.status(404).json({ message: "Task not found" });
        }

        res.status(200).json({ message: "Task marked as done", task });
    } catch (error) {
        console.error("❌ Error:", error.message);
        res.status(500).json({ message: "Server error" });
    }
});



// --------------------------------------------------------------
app.listen(PORT, () => {
    console.log(`--------- Server Started on PORT: ${PORT} ---------`);
});