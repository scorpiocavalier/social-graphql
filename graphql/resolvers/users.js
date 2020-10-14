const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../../models/User')
const { SECRET_KEY } = require('../../config')
const { UserInputError } = require('apollo-server')
const { validateRegisterInput, validateLoginInput } = require('../../utils/validators')

const generateToken = user => (
  jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username
    },
    SECRET_KEY,
    { expiresIn: '1h' }
  )
)

module.exports = {
  Mutation: {
    register: async (parent, args, context, info) => {
      // Retrieve the arguments
      let {
        registerInput: { username, email, password, confirmPassword }
      } = args

      // Validate user data
      const { valid, errors } = validateRegisterInput(
        username, email, password, confirmPassword
      )

      if (!valid) {
        throw new UserInputError('Errors', { errors })
      }

      // Check for existing user
      const user = await User.findOne({ username })
      if (user) {
        throw new UserInputError('Username is taken', {
          errors: {
            username: 'This username is taken'
          }
        })
      }

      // encrypt the password
      password = await bcrypt.hash(password, 12)

      // create a new user w/ encrypted password
      const newUser = new User({
        username,
        email,
        password,
        createdAt: new Date().toISOString()
      })
      const res = await newUser.save()

      // create an auth token
      const token = generateToken(res)

      return { ...res._doc, id: res._id, token }
    },

    login: async (parent, args, context, info) => {
      const { username, password } = args
      const { errors, valid } = validateLoginInput(username, password)

      if (!valid) {
        throw new UserInputError('Errors', { errors })
      }

      const user = await User.findOne({ username })

      if (!user) {
        errors.general = 'User not found'
        throw new UserInputError('User not found', { errors })
      }

      const match = await bcrypt.compare(password, user.password)

      if (!match) {
        errors.general = 'Wrong credentials'
        throw new UserInputError('Wrong credentials', { errors })
      }

      const token = generateToken(user)

      return { ...user._doc, id: user._id, token }
    }
  }
}