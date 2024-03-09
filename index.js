const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

const rootRouter = require('./routes/index.js');

app.use("/api/v1",rootRouter);
 
app.listen(3000, (req, res) => {
  console.log("server running on 3000");
});
