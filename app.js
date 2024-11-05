import express from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
import session from "express-session";
import flash from "connect-flash";
import passport from "./passportConfig.js";
import { isAuthenticated, isAdmin } from "./middlewares/auth.js";
import User from "./models/User.js";
import routes from "./routes/routes.js";
import fileUpload from "express-fileupload";
import path from "path";
import { fileURLToPath } from "url";
import Cart from "./models/Cart.js";

// Convert import.meta.url to __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Connect to MongoDB
mongoose
  .connect(
    "mongodb+srv://okundashedrack:kJdiCGrehR1w6FpN@cluster0.jpkke.mongodb.net/storedb?retryWrites=true&w=majority&appName=Cluster0",
    // "mongodb://localhost:27017/storedb",
    {
      // useNewUrlParser: true,
      // useUnifiedTopology: true,
    },
  )
  .then(() => console.log("Connected to db"));

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: "your_secret_key",
    resave: false,
    saveUninitialized: false,
  }),
);
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

app.use(express.json());

// Middleware to handle file uploads
app.use(fileUpload());

app.use("/", routes);

app.get("/", (req, res) => {
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  res.render("login", { message: req.flash("error") });
});

app.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/dashboard",
    failureRedirect: "/login",
    failureFlash: true,
  }),
);

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  const { username, password, email } = req.body;
  const newUser = new User({ username, password, role: "user", email });
  await newUser.save();
  res.redirect("/login");
});

app.get("/dashboard", isAuthenticated, (req, res) => {
  res.render("dashboard", { user: req.user });
});

app.get("/users", isAdmin, (req, res) => {
  res.render("users", { user: req.user });
  console.log(req.user);
});

app.get("/editUzer/:userId", isAdmin, (req, res) => {
  res.render("editUzer", { user: req.user });
});

app.get("/createProd", isAdmin, (req, res) => {
  res.render("createProd", { user: req.user });
});

app.get("/products", isAdmin, (req, res) => {
  res.render("products", { user: req.user });
});

app.get("/admin", isAdmin, (req, res) => {
  res.render("admin", { user: req.user });
});

app.get("/myCart", isAuthenticated, (req, res) => {
  res.render("myCart", { user: req.user });
});

app.get("/checkout/:totalPrice?", isAuthenticated, async (req, res) => {
  try {
    const userId = req.user._id;

    // fetch cart items for the current user
    const cartItems = await Cart.find({ userId, isOrdered: true });

    // format the cart items into a single string for qr code
    const receiptItems = cartItems
      .map((item) => `${item.title}: Kshs. ${item.price}`)
      .join("\n");
    const totalPrice = cartItems.reduce((sum, item) => sum + item.price, 0);

    // get current date and time
    const date = new Date();
    const dateString = date.toLocaleDateString();
    const timeString = date.toLocaleTimeString();

    const fullReceiptText = `Receipt\nDate: ${dateString}\nTime: ${timeString}\n\n${receiptItems}\n\nTotal: Kshs. ${totalPrice}`;

    // render the page with qr code data
    res.render("checkout", { user: req.user });
  } catch (error) {
    console.error("Error generating receipt:", error);
    res.status(500).send("Failed to generate receipt");
  }
});

app.get("/not-authorized", (req, res) => {
  res.render("not-authorized");
});

app.get("/logout", (req, res) => {
  res.redirect("/login");
});

// route to render forgot password page
app.get("/forgotPass", (req, res) => {
  res.render("forgotPass", { message: req.flash("info") });
});

//route to handle forgot password form submission
app.post("/forgotPass", async (req, res) => {
  const { username, newPassword, confirmPassword } = req.body;

  // check if username exists
  const user = await User.findOne({ username });
  if (!user) {
    req.flash("info", "Username not found");
    return res.redirect("/forgotPass");
  }

  // check if the password match
  if (newPassword !== confirmPassword) {
    req.flash("info", "Passwords do not match.");
    return res.redirect("/forgotPass");
  }

  // update the user's password in the db
  user.password = newPassword;
  await user.save();

  req.flash(
    "info",
    "Password successfully updated! Please log in with your new password",
  );
  res.redirect("/login");
});

app.listen(3000, () => {
  console.log("Server started on http://localhost:3000");
});
