const { AuthenticationError, ApolloError, UserInputError } = require('apollo-server')

const Post = require('../../models/Post')
const checkAuth = require('../../utils/check-auth')

module.exports = {
  Query: {
    getPosts: async () => {
      try {
        const posts = await Post.find().sort({ createdAt: -1 })
        if (posts) return posts
        else throw new Error('Posts not found')
      } catch (e) {
        throw new Error(e)
      }
    },
    getPost: async (_, { postId }) => {
      try {
        const post = await Post.findById(postId)
        if (post) return post
        else throw new Error('Post not found')
      } catch (e) {
        throw new Error(e)
      }
    }
  },

  Mutation: {
    createPost: async (_, { body }, context) => {
      const user = checkAuth(context)

      const newPost = new Post({
        user: user.id,
        body,
        username: user.username,
        createdAt: new Date().toISOString()
      })

      return newPost.save()
    },
    deletePost: async (_, { postId }, context) => {
      const user = checkAuth(context)

      try {
        const post = await Post.findById(postId)
        if (user.username === post.username) {
          await post.delete()
          return 'Post deleted successfully'
        } else {
          throw new AuthenticationError('Action not allowed')
        }
      } catch (e) {
        throw new Error(e)
      }
    },
    likePost: async (_, { postId }, context) => {
      const { username } = checkAuth(context)
      const post = await Post.findById(postId)

      if (post) {
        const userLikePost = post.likes.find(like => like.username === username)
        if (userLikedPost) {
          // if there is a user liked post, unlike it.
          post.likes = post.likes.filter(like => like.username !== username)
        } else {
          const newLike = {
            username,
            createdAt: new Date().toISOString()
          }
          post.likes.push(newLike)
        }

        return post.save()
      } else throw UserInputError('Post not found')
    }
  }
}