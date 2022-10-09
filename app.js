const fs = require("fs");

const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const session = require("express-session");

const foodRoutes = require("./routes/food-routes");
const userRoutes = require("./routes/users-routes");
const HttpError = require("./models/http-error");

const app = express();
const port = process.env.PORT || 1337;

app.use(bodyParser.json());

// app.use(cors({ credentials: true, origin: "http://localhost:3000" }));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use(
  session({
    secret: "supersecret_dont_share",
  })
);

const corsOptions = {
  origin: "http://localhost:3000",
  credentials: true,
  optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

app.use((req, res, next) => {
  if (
    req.session.user ||
    req.path.includes("/login") ||
    req.path.includes("/register") ||
    req.path.endsWith("/user")
  ) {
    next();
  } else {
    res.status(401).send();
  }
});

app.use("/v1", [userRoutes, foodRoutes]);
// app.use("/api/food", foodRoutes);
// app.use("/api/user", userRoutes);

app.use((req, res, next) => {
  const error = new HttpError("Could not find this route.", 404);
  throw error;
});

app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

mongoose
  .connect(
    `mongodb+srv://noam1234:1234@cluster0.jkfltoq.mongodb.net/?retryWrites=true&w=majority`,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    app.listen(port);
    console.log(`[server]: Server is running at https://localhost:${port}`);
  })
  .catch((err) => {
    console.log(err);
  });
