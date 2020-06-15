'use strict';

/* Load .env file for global configurations */
require('dotenv').config();
const compression = require('compression');
const express = require('express');
const app = express();
const routes = require('api/config/routes.json').routes;


// get all todos
app.get('/api/v1/todos', (req, res) => {
  res.status(200).send({
    success: 'true',
    message: 'todos retrieved successfully',
    todos: db
  })
});
const PORT = 5000;

app.listen(PORT, () => {
  console.log(`server running on port ${PORT}`)
});
