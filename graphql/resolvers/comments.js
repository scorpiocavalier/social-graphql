const { UserInputError } = require('apollo-server')
const Post = require('../../models/Post')
const checkAuth = require('../../utils/check-auth')

module.exports = {
  Query: {

  },
  Mutation: {
    createComment: async (_, { postId, body }, context) => {
      const { username } = checkAuth(context)

      if (body.trim() === '') {
        throw UserInputError('Empty comment', {
          errors: {
            body: 'Comment body must not be empty'
          }
        })
      }

      const post = await Post.findById(postId)

      if (post) {
        post.comments.unshift({
          body,
          username,
          createdAt: new Date().toISOString()
        })

        return post.save()
      } else throw new UserInputError('Post not found')
    },
  }
}