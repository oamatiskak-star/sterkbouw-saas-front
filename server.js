import next from 'next'
import http from 'http'

const port = process.env.PORT || 3000
const dev = false

const app = next({ dev })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  http.createServer((req, res) => {
    handle(req, res)
  }).listen(port, () => {
    console.log(`> Server running on http://localhost:${port}`)
  })
})
