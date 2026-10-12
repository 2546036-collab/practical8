const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();

app.use(cors());
app.use(express.json());

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected Successfully");
  })
  .catch((error) => {
    console.error("MongoDB Connection Error:", error.message);
  });

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "MERN Backend is Running Successfully",
  });
});

app.get("/api/students", async (req, res, next) => {
  try {
    const students = await Student.find();

    res.status(200).json({
      success: true,
      data: students,
    });
  } catch (error) {
    next(error);
  }
});

app.post("/api/students", async (req, res, next) => {
  try {
    const { name, email, age, course } = req.body;

    if (!name || !email || !age || !course) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    const existingStudent = await Student.findOne({
      email: email.toLowerCase(),
    });

    if (existingStudent) {
      return res.status(409).json({
        success: false,
        message: "Email already exists",
      });
    }

    const student = await Student.create({
      name,
      email,
      age,
      course,
    });

    res.status(201).json({
      success: true,
      message: "Student added successfully",
      data: student,
    });
  } catch (error) {
    next(error);
  }
});

app.get("/api/students/:id", async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id);

    if (!student) {
      return res.status(404).json({
        success: false,
        message: "Student not found",
      });
    }

    res.status(200).json({
      success: true,
      data: student,
    });
  } catch (error) {
    next(error);
  }
});

app.use((err, req, res, next) => {
  console.error(err);

  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map(
      (error) => error.message
    );

    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: messages,
    });
  }

  if (err.name === "CastError") {
    return res.status(400).json({
      success: false,
      message: "Invalid student ID",
    });
  }

  if (err.code === 11000) {
    return res.status(409).json({
      success: false,
      message: "Duplicate value already exists",
    });
  }

  res.status(500).json({
    success: false,
    message: "Internal Server Error",
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
