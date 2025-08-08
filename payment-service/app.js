// Initializing the libraries
const express = require("express");
let multer = require("multer");
let upload = multer();
const mongoose = require("mongoose");
const cors = require("cors");
const passport = require("passport");
const cookieSession = require("cookie-session");
// Use 'Express' methods
const app = express();

app.use(express.json({ extended: true, limit: "50mb" }));
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
);
app.use(bodyParser.json());
// app.use(upload.array());
app.use(express.static("public"));
require("dotenv").config();

app.use(cors());
app.use((req, res, next) => {
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Credentials", true);
  next();
});
// Folders to serve
app.use("/accounts", express.static("accounts"));
app.use("/uploads", express.static("uploads"));
app.use("/invoices-pdf", express.static("invoices-pdf"));
app.use("/assets", express.static("assets"));
app.use("/BankStatement", express.static("BankStatement"));
app.use("/last3invoices", express.static("last3invoices"));
app.use("/template", express.static("template"));
app.get("/", async (req, res) => {
  return res.send("PLEASE LEAVE! You are NOT AUTHORIZED to access this link.");
});

// Connecting to the database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useCreateIndex: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
    });
  } catch (error) {
    console.error("UNABLE TO CONNECT TO DATABASE \n", error);
    process.exit(1);
  }
};

// Creating the Google auth

app.use(
  cookieSession({
    name: "seesion-auth",
    keys: ["key1", "key2"],
  })
);

// const isLoggedIn = (req, res, next) => {
//   if (req.user) {
//     next();
//   } else {
//     res.sendStatus(401);
//   }
// };
// Initializes passport and passport sessions
app.use(passport.initialize());
app.use(passport.session());

app.get("/failed", (req, res) => res.send("You Failed to log in!"));

// In this route you can see that if the user is logged in u can acess his info in: req.user
// app.get("/login", isLoggedIn, (req, res) => {
//   //res.send(`Welcome mr ${req.user.token}!`)
//   res.send(req.user);
// });

// app.get(
//   "/google",
//   passport.authenticate("google", { scope: ["profile", "email"] })
// );

// app.get(
//   "/google/callback",
//   passport.authenticate("google", { failureRedirect: "/failed" }),
//   function (req, res) {
//     // Successful authentication, redirect home.
//     res.cookie("token", req.user.token, { expire: new Date() + 9999 });
//     res.cookie("user", req.user.user, { expire: new Date() + 9999 });

//     res.redirect(`${process.env.UI}/login`);
//   }
// );

// app.get("/logout", (req, res) => {
//   req.session = null;
//   req.logout();
//   res.status(200).json("logout done ");
// });

// Getting the server Live!
const port = process.env.PORT;
connectDB().then(() => {
  app
    .listen(port, () => {
      console.log(new Date(Date.now()).toJSON());
      console.log(
        `MongoDB connected & Server listening on http://localhost:${port}`
      );
    })
    .on("error", function (err) {
      process.once("SIGUSR2", function () {
        process.kill(process.pid, "SIGUSR2");
      });
      process.on("SIGINT", function () {
        // this is only called on ctrl+c, not restart
        process.kill(process.pid, "SIGINT");
      });
    });
});
