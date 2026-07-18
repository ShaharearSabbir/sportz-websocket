import 'dotenv/config'
import express from 'express'
import { PrismaClient } from './generated/prisma/client.js'
import { PrismaPg } from '@prisma/adapter-pg'

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
})

const app = express()
const port = 8000

app.use(express.json())

app.get('/', (req, res) => {
  res.send('Hello from sportz!')
})

app.get('/users', async (req, res) => {
  const users = await prisma.user.findMany()
  res.json(users)
})

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
