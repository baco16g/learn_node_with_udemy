require('./config/config')

const express = require('express')
const bodyParser = require('body-parser')
const { ObjectId } = require('mongodb')
const _ = require('lodash')

const { mongoose } = require('./db/mongoose')
const { Todo } = require('./models/todo')
const { User } = require('./models/user')

const { authenticate } = require('./middleware/authenticate')

const app = express()
const port = process.env.PORT

app.use(bodyParser.json())

app.post('/todos', (req, res) => {
  const todo = new Todo({
    text: req.body.text
  })
  todo.save().then(
    doc => res.send(doc),
    e => res.status(400).send(e)
  )
})

app.get('/todos', (req, res) => {
  Todo.find().then(
    todos => res.send({ todos }),
    e => res.status(404).send(e)
  )
})

app.get('/todos/:id', (req, res) => {
  const { id } = req.params
  if (!ObjectId.isValid(id)) {
    return res.status(404).send()
  }
  Todo.findById(id)
    .then(todo =>  todo ? res.send({ todo }) : res.status(404).send())
    .catch(e => res.status(400).send())
})

app.delete('/todos/:id', (req, res) => {
  const { id } = req.params
  if (!ObjectId.isValid(id)) {
    return res.status(404).send()
  }
  Todo.findByIdAndDelete(id)
    .then(todo => todo ? res.send({ todo }) : res.status(404).send())
    .catch(e => res.status(400).send())
})

app.patch('/todos/:id', (req, res) => {
  const { id } = req.params
  const _body = _.pick(req.body, ['text', 'completed'])
  if (!ObjectId.isValid(id)) {
    return res.status(404).send()
  }
  const body = _.isBoolean(_body.completed) && _body.completed ? (
    {
      ..._body,
      completedAt: new Date().getTime()
    }
   ) : (
    {
      ..._body,
      completed: false,
      completedAt: null
    }
  )
  Todo.findByIdAndUpdate(
    id,
    {
      $set: body,
    },
    {
      new: true
    }
  )
    .then(todo => todo ? res.send({ todo }) : res.status(404).send())
    .catch(e => res.status(404).send())
})

// POST /users

app.post('/users', (req, res) => {
  const body = _.pick(req.body, ['email', 'password'])
  const user = new User(body)
  user.save()
    .then(() => user.generateAuthToken())
    .then(token => res.header('x-auth', token).send(user))
    .catch(e => res.status(400).send(e))
})

app.get('/users/me', authenticate, (req, res) => {
  res.send(req.user)
})

// POST /users/login

app.post('/users/login', (req, res) => {
  const { email, password } = _.pick(req.body, ['email', 'password'])
  User.findByCredentials(email, password)
    .then(user => user.generateAuthToken()
      .then(token => res.header('x-auth', token).send(user)))
    .catch(e => res.status(400).send(e))
})

app.delete('/users/me/token', authenticate, (req, res) => {
  const { user, token } = req
  user.removeToken(token)
    .then(() => res.status(200).send())
    .catch(() => res.status(400).send())
})

app.listen(port, () => {
  console.log(`Started on port ${port}`)
})

module.exports = {
  app
}