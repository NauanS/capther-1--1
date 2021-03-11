const express = require('express');
const cors = require('cors');

const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers
  const user = users.find(user => user.username === username)
  if (!user) {
    return response.status(404).json({error: 'User not found!'})
  }
  request.user = user
  return next()
}

app.post('/users', (request, response) => {
  const { name, username } = request.body
  const finuser = users.find(user => user.username === username)
  if (finuser) {
    return response.status(400).json({error: 'User alredy exists!!'})
  }
  const user = {
    id: uuidv4(),
    name,
    username,
    todos: []
  }
  users.push(user)
  return response.status(201).json(user)
});

app.get('/users', (request, response) => {
  return response.status(200).json(users)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  if (!user) {
    return response.status(404).json({error: 'To-do not found!'})
  }
  return response.status(200).json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { title, deadline } = request.body
  const todo = { 
    id: uuidv4(),
    title,
    done: false, 
    deadline: new Date(deadline), 
    created_at: new Date(),
  }
  user.todos.push(todo)
  return response.status(201).json(todo)
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const { title, deadline } = request.body
  const index = user.todos.findIndex(todo => todo.id === id)
  if (index < 0) {
    return response.status(404).json({error: 'To-do not found!'})
  }
  user.todos[index].title = title
  user.todos[index].deadline = deadline
  return response.status(200).json(user.todos[index])
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const index = user.todos.findIndex(todo => todo.id === id)
  if (index < 0) {
    return response.status(404).json({error: 'To-do not found!'})
  }
  user.todos[index].done = true
  return response.status(200).json(user.todos[index])
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { user } = request
  const { id } = request.params
  const todo = user.todos.find(todo => todo.id === id)
  if (!todo) {
    return response.status(404).json({error: 'To-do not found!'})
  }
  user.todos.splice(todo, 1)
  return response.status(204).json({error: `To-do ${todo.id} removed!`})
});

module.exports = app;