const { ApolloServer } = require('apollo-server')
const gql = require('graphql-tag')
const mongoose = require('mongoose')
const { MONGODB } = require('./config')

const Post = require('./models/Post')

const typeDefs = gql`
  type Post {
    id: ID!
    body: String!
    username: String!
    createdAt: String!
  }

  type Query {
    getPosts: [Post]
  }
`

const resolvers = {
  Query: {
    getPosts: async () => {
      try {
        const posts = await Post.find()
        return posts
      } catch (e) {
        throw new Error(e)
      }
    }
  }
}

const server = new ApolloServer({ typeDefs, resolvers })

mongoose.connect(MONGODB, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('MongoDB Connected')
    return server.listen({ port: 5000 })
  })
  .then(({ url }) => console.log(`Server running at ${ url }`))
