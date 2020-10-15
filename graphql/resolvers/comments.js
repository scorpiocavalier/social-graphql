const { UserInputError, AuthenticationError } = require('apollo-server')
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
    deleteComment: async (_, { postId, commentId }, context) => {
      const { username } = checkAuth(context)

      const post = await Post.findById(postId)
      const { comments } = post

      if (post) {
        const commentIndex =
          comments.findIndex(c => c.id === commentId)

        const comment = comments[ commentIndex ]

        if (comment.username === username) {
          comments.splice(commentIndex, 1)
          return post.save()
        } else throw new AuthenticationError('Action not allowed')
      } else throw new UserInputError('Post not found')
    },
    likePost: async (_, { postId }, context) => {
      const { username } = checkAuth(context)

      const post = await Post.findById(postId)

      if (post) {
        if (post.likes.find(like => like.username === username)) {
          post.likes = post.likes.filter(like => like.username !== username)
        } else {
          post.likes.push({
            createdAt: new Date().toISOString(),
            username
          })
        }

        return post.save()
      } else throw new UserInputError('Post not found')
    }
  }
}