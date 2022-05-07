import KoaRouter from 'koa-router'
import KoaStatic from 'koa-static'
import Koa from 'koa'
import path from 'path'
import { createReadStream, statSync } from 'fs'

const run = async () => {
  const app = new Koa()
  const router = new KoaRouter()

  router.get('/video', async ctx => {
    const range = ctx.request.headers.range

    if (!range) {
      ctx.status = 416
      ctx.body = { message: 'Range not supported' }
      return
    }

    const videoPath = path.join(__dirname, '../assets/video.mp4')
    const { size } = statSync(videoPath)

    const chunkSize = 1 * 1e+6

    const start = Number(range.replace(/\D/g, ''))
    const end = Math.min(start + chunkSize, size - 1)
    const contentLength = end - start + 1

    ctx.set({
      'Content-Length': contentLength.toString(),
      'Content-Range': `bytes ${start}-${end}/${size}`,
      'Accept-Ranges': 'bytes',
      'Content-Type': 'video/mp4'
    })
    console.log(`${start}-${end}/${size}`)

    ctx.status = 206

    const stream = createReadStream(videoPath, { start, end })

    ctx.body = stream
  })

  app.use(router.routes())
  app.use(router.allowedMethods())
  app.use(KoaStatic(path.join(__dirname, '../assets'), { extensions: ['.html'] }))

  app.listen(3000, () => {
    console.log('Server running on port http://localhost:3000')
  })
}

run()
