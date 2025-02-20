### STEP 1. 
    npm init -y
### STEP 2.
    npm i express mongodb mongoose nodemon dotenv cors bcrypt cookie-parser morgan jsonwebtoken nodemailer

### STEP 3.
    Make folders "config", "models"

### STEP 4.
    make a .gitignore --> 
    `node_modules 
    .env
    `

### STEP 5.
    make a .env file -->
    `
    `

(if you don't have mognodb account --> create the account --> select FREE when you get the deployment option and "create deployment")
(wait for 5 minutes for cluster to get created)
go to "network access" in left panel --> add ip address --> allow access from any where --> done

go to "database access" in left panel --> edit --> edit password --> type new password --> update user 
(this is your MONGO_DB_PASSWORD value)

go to "clusters" in left panel --> "connect" --> select drivers --> copy link in 3rd step 
(this is your MONGO_DB_URL)

MONGO_DB_DATABASE_NAME=write any name according to you but no space or hyphen 

for example,
MONGO_DB_URL=mongodb+srv://likhileshbalpande:<db_password>@cluster0.abcdx.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
MONGO_DB_PASSWORD=mypasshardword
MONGO_DB_DATABASE_NAME=LPU_TASK_MANAGEMENT_MERN_ONLINE

### STEP 6.
    Inside config --> dbConfig.js -->

    `const mongoose = require("mongoose");

    const URL = process.env.MONGO_DB_URL;
    const URL_WITH_PASSWORD = URL.replace("<db_password>", process.env.MONGO_DB_PASSWORD);
    const URL_WITH_PASSWORD_AND_DB_NAME = URL_WITH_PASSWORD.replace("/?", `/${process.env.MONGO_DB_DATABASE_NAME}?`);

    const connectToDb = async () => {
        try {
            await mongoose.connect(URL_WITH_PASSWORD_AND_DB_NAME);
            console.log("--------- MONGO_DB CONNECTED ---------");
        } catch (err) {
            console.log("------ MONGO_DB NOT CONNECTED --------");
            console.log(err.message);
        }
    };

    connectToDb(); 
    `

### STEP 7.
    Make app.js file --> 
    `
    `

### STEP 8.
    run the application to check if it is working-->
    npx nodemon app.js

## HTTP STATUS CODES
(https://static.semrush.com/blog/uploads/media/3a/79/3a7950050980a0e2de37bc1a632cc321/wmkPPztB7KlAC7fPzO0-85NG8t0B9IEh4JEbt_ELP1pvJMhof9vt2pDSwrBZeXodoqaoV_Es1Rur-AWoeoOdV-RIde2vjqyMQuxrqch62uXZ1bsI0yaaMWx-f4cg4BlmOQrI2kFJ6CPXECCd69KeopE.png)
    
    1XX --> nothing imp for you
    
    3XX --> nothing imp for you

    2XX --> success -->
        200 --> OK (In general)
        201 --> created (CREATE / POST)
        204 --> No content (DELETE)
    
    4XX --> mistake of client
        400 --> bad request (validation error, or something is missing which was required, ...)
        401 --> unauthorized (the user does not have permission)
        404 --> NOT FOUND (this you will mostly get in express app when the endpoint or route you are using is not attached on the app)
                you may send it when the user asked for something which is not present

    5XX --> mistake of server
        500 --> Internal Server Error (Something went wrong on server that code was not prepared for )
            (connection issue, ram outage, processor outage, or ...)
    

### STEP 9.
    Make a userModel.js file -->
    // 1. make a schema
    // 2. make a model --> attached to a collection and schema
    // then use this model anywhere to work on the collection like find documents, add document, delete document, update document
    
### STEP 10.
    Make a BASIC post api to create a BASIC user

### STEP 11.
    IMPORTANT STEP: to do in app.js: 
    add these middlewares to your code -->
    `
        ...
        const cors = require("cors"); // this allow the browser to enable frontend to connect to backend by giving such permissions
        ...
        ...
        app.use(cors()); // this code actually allows all origins / domains to talk with backend
        app.use(express.json()); // this will read the request body stream and serializes it into javascript object and attach it on the req object 
        ...
    `

## HTTP METHODS or VERBS : 
* GET : Read / Search / Find
* POST : Create / make new entry in DB
* PATCH : Edit a part of data
* PUT : Edit the data but at a level where it equivalent to replace
* DELETE :  Delete something from database

* (https://medium.com/@hhphu/understanding-http-verb-tampering-in-web-security-e2a167a9917e)

## how view database ?  collections ? documents
--> go to "clusters" in left panel --> click on "browse collections" --> select your database --> select your collection --> now you will see all your documents


## Validation Keywords
* type: mentions the data type for the value (it is mandatory in every property in schema)
`   age: {
        type: Number,
    },
`
`    
    age: Number,
`
in the second part, the limitation is you cannot add more validators
if you want to add more validators other than type, then use "{" "}"

* required: it mentions that the key should always be present in every entry that is made to the database
* trim: removes the whitespaces, tabs, new lines at start & end (if any)
* unique: it enforces that the value in this field should be unique in the given collection
* enum: allowed options as value (you can only choose from these options (case-sensitive))
* default: it gives the default value to the key when it is not present 
(age: null) - then age will not get default value because null is also a value
(anything that is undefined is considered as absent) 
(age: undefined)
* min
* max
* minLength
* maxLength
* match
( Article to refer: https://mongoosejs.com/docs/validation.html )

### middlewares : 
are the logic blocks that get executed for the given request if it satisfies the condition
for example:
    * app.use(...) --> this middleware works for all request that pass through it! *
    * app.get / post / ... --> only work for requests who match the http method and route
    * every middleware has access to req and res object.
    * the middlewares except get/post/put/patch/delete have also access to next method

### What is the general signup / register procedure for you?

* user tells the email - 1
* user verifies the email (otp) - 2 (we have to send otp to his email)
* user tells the password - 2
* user is registered - 3 (we have to verify if the otp entered by him is correct or not?)
// after login, he can go to profile and give name

* user tells the full name - **

### what APIs will be the involved in this procedure?

* to sends request to send otp --> POST /otps query for email. Ex. POST /otps?email=likhilesh@ppa.com
* to sends request to verify otp and set password  --> POST /register BODY:RAW:JSON 
{
    "email": "likhilesh@ppa.com",
    "otp": "1234",
    "password": "password123"
}

* URL is visible to everyone over the network, so if we have sensitive data, then we send it in cookies, headers or body (if the connection is HTTPs then Man-in-middle cannot read this encrypted data)

### How should we tackle the problem of sending OTPs? POST /otps?email=

* I need to create the otp when user ask me to send the otp to his email (it is send in the query)
* Then I need to save that otp somewhere so that in future, when user tries to verify, I can verify.
* success response


### How to generate OTP?
`
    // const randomNumber = Math.random(); // --> (0, 1)

    // input --> (0, 1)
    // f(x) --> ?
    // output --> (1000, 9999)

    // 1. f(x) = x*10000
    // f(0.7) = 7000
    // f(0.6234234) = 6234.234
    // f(0.000001) = 0.01 (this is not allowed)
    // f(0.9999999) = 9999.99999

    // 2. f(x) = x*10000 + 1000
    // f(0.7) = 8000
    // f(0.6234234) = 7234.234
    // f(0.000001) = 1000.01 
    // f(0.9999999) = 10999.99999 (this is not allowed)

    // 2. f(x) = x*9000 + 1000
    // f(0.7) = 7300
    // f(0.6234234) = 6610.8106
    // f(0.000001) = 1000.009 
    // f(0.9999999) = 9999.9991 

    // --> Ans:  F(x) = Math.floor(g(x))
    //    Where g(x) = x*9000 + 1000


    function generateOTP (){
        const x = Math.random();
        const fourDigitDecimalNumber = x*9000 + 1000;
        const fourDigitNumber = Math.floor(fourDigitDecimalNumber);
        
        return fourDigitNumber;
    }
`

### How to send the email?
* https://www.npmjs.com/package/nodemailer

* Example Code: https://nodemailer.com/#example

* And we will use gmail for sending the OTP
* * The gmail account should have 2-step-verification ON (manage your google account: security tab ion left panel) and you need to create an APP Password


----------------------------------------------------
encryption - decryption basic example

`
    const encryptKey = 10;

    const encryptPassword = (plainPassword) => {
        let encryptedPassword = "";
        for(let i=0; i<plainPassword.length; i++){
            const asciiValue = plainPassword.charCodeAt(i);
            const newAsciiValue = asciiValue + encryptKey;
            const newChar = String.fromCharCode(newAsciiValue);
            encryptedPassword += newChar;
        }
        console.log(plainPassword, encryptedPassword);
    }

    const decryptPassword = (encryptedPassword) => {
        let plainPassword = "";
        for(let i=0; i<encryptedPassword.length; i++){
            const asciiValue = encryptedPassword.charCodeAt(i);
            const newAsciiValue = asciiValue - encryptKey;
            const newChar = String.fromCharCode(newAsciiValue);
            plainPassword += newChar;
        }
        console.log(plainPassword, encryptedPassword);
    }

    // encryptPassword("abc");
    decryptPassword("klm");
`

-------------------------------------------------

TRY SHA-1 HASH:
https://sha1.gromweb.com/?string=md1#:~:text=Convert%20a%20string%20to%20a%20SHA%2D1%20hash

For example: The SHA-1 hash of password1 is e38ad214943daad1d64c102faec29de4afe9da3d


--------------------------------------------------
# HOW to store passwords securely?
--------------------------------------------------
1. plain text --> no security
2. encryption --> reverse engineering is highly possible
3. hashing -----> rainbow tables
4. hashing + salting --> secure but if DB is leaked, then use of specialized hardwares like GPUs can help new age hackers to crack things down in few hours or a day.
5. hashing + salting (slow hashing) --> we get enough time to recover and take some measures
** Your own Application will also slow down the more complex and slow algorithm you use. 
** You need to stop at an optimized that the application also does not slow down drastically and 
    you also keep things safer.

--------------------------------------------------
6. **use well established providers to take care of security. For example: Google sign-in 
    (you have to pay the providers)


// --------------------- --------------------- 
    ### Testing BCRYPT
    `
    const testing = async () => {
        console.time("salt1");
        const newSalt = await bcrypt.genSalt(10); // rounds-x == iterations pow(2,x)
        console.timeEnd("salt1");
        console.log(newSalt);
    };

    testing();
`


// -------------------------------------------------

# how to rename during destructuring 
`
    const city = "Mumbai";
    
    const obj= {
        city: "Delhi",
        country: "India"
    }
    
    // console.log(obj.city)
    const { city: newCity } = obj;

    console.log(city, newCity);
`

// -------------------------------------------------