const { ObjectId } = require('mongodb')
const jwt = require('jsonwebtoken')

const { Todo } = require('../../models/todo')
const { User } = require('../../models/user')

const userOneId = new ObjectId()
const userTwoId = new ObjectId()
const users = [{
  _id: userOneId,
  email: 'abc@example.com',
  password: 'userOnePass',
  tokens: [
    {
      access: 'auth',
      token: jwt.sign({ _id: userOneId, access: 'auth' }, process.env.JWT_SECRET).toString()
    }
  ]
}, {
  _id: userTwoId,
  email: 'def@example.com',
  password: 'userTwoPass',
  tokens: [
    {
      access: 'auth',
      token: jwt.sign({ _id: userTwoId, access: 'auth' }, process.env.JWT_SECRET).toString()
    }
  ]
}]

const todos = [
  {
    _id: new ObjectId(),
    text: 'First test todo',
    _creator: userOneId
  },
  {
    _id: new ObjectId(),
    text: 'Second test todo',
    completed: true,
    completedAt: 333,
    _creator: userTwoId
  }
]

const populateTodos = done => {
  Todo.deleteMany()
    .then(() => Todo.insertMany(todos))
    .then(() => done())
}

const populateUsers = done => {
  User.deleteMany()
    .then(() => Promise.all(
      users.reduce(
        (acc, user) => [...acc, new User(user).save()],
        []
      )
    ))
    .then(() => done())
}

module.exports = {
  todos,
  populateTodos,
  users,
  populateUsers
}