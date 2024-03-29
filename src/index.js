const express = require("express");
const cors = require("cors");
const { v4: uuidv4 } = require("uuid");

// const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(404).json({ error: "User does not exist" });
  }

  request.user = user;

  return next();
}

app.post("/users", (request, response) => {
  const { name, username } = request.body;

  const usernameAlreadyExists = users.some(
    (user) => user.username === username
  );

  if (usernameAlreadyExists) {
    return response.status(400).json({ error: "Username already exists" });
  }

  const user = {
    id: uuidv4(),
    name,
    username,
    pro: false,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
  // Complete aqui
  const { user } = request;
  const { title, deadline } = request.body;

  const task = {
    id: uuidv4(), // precisa ser um uuid
    title: title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(task);

  return response.status(201).json(task);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;
  const { title, deadline } = request.body;

  const task = user.todos.find((task) => (task.id = request.params.id));

  if (!task) {
    return response.status(404).json({ error: "This task does not exist" });
  } else {
    task.title = title;
    task.deadline = deadline;
    return response.status(201).json(task);
  }
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const task = user.todos.find((task) => (task.id = request.params.id));

  if (!task) {
    return response.status(404).json({ error: "This task does not exist" });
  } else {
    task.done = true;
    return response.status(201).json(task);
  }
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
  const { user } = request;

  const task = user.todos.find((task) => (task.id = request.params.id));

  const todoIndex = user.todos.indexOf(task);

  if (!task) {
    return response.status(404).json({ error: "This task does not exist" });
  } else {
    user.todos.splice(todoIndex, 1);
    return response.status(204).send();
  }
});

module.exports = app;
