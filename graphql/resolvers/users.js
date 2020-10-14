const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../../models/User')
const { SECRET_KEY } = require('../../config')
const { UserInputError } = require('apollo-server')
const { validateRegisterInput } = require('../../utils/validators')

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
      const token = jwt.sign(
        {
          id: res.id,
          email: res.email,
          username: res.username
        },
        SECRET_KEY,
        { expiresIn: '1h' }
      )

      return { ...res._doc, id: res._id, token }
    }
  }
}