const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const User = require('../../models/User')
const { SECRET_KEY } = require('../../config')

module.exports = {
  Mutation: {
    register: async (parent, args, context, info) => {
      // Retrieve the arguments
      let {
        registerInput: { username, email, password }
      } = args

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