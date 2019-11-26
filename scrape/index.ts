import * as argv from 'argv'
import * as fs from 'fs-extra'
import fetch from 'node-fetch'
import * as puppeteer from 'puppeteer'
import * as colors from 'colors/safe'
import * as uuidv5 from 'uuid/v5'

const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15'

type Output = {
  title: string
  url: string
  link: string
  thumbnails: string[]
}

async function listPlaylistLinks(path: string): Promise<string[]> {
  const buffer = await fs.readFile(path)
  const json = JSON.parse(buffer.toString())
  return json.links
}

async function getOutputPlaylist(path: string): Promise<Output[]> {
  const buffer = await fs.readFile(path)
  return JSON.parse(buffer.toString())
}

async function scrape(url: string): Promise<Output> {
  console.log(colors.cyan(`start scraping ${url}`))

  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  await page.setUserAgent(ua)
  await page.setViewport({ width: 1200, height: 800 })
  await page.setJavaScriptEnabled(true)
  await page.goto(url, { waitUntil: 'domcontentloaded' })

  await page.waitForSelector('.playlistInfo .des .title .txt')
  await page.waitForSelector('.playlistInfo .thumb img')
  await page.waitFor(5000)

  const title = await page.$eval('.playlistInfo .des .title .txt', (it: any) => {
    return it.textContent
  })
  let thumbnails = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.playlistInfo .thumb img').values())
      .map(it => it.getAttribute('src'))
  })
  await browser.close()

  console.log(colors.cyan('finish scraping'))

  console.log(colors.cyan('start download thumbnail'))

  const id: string = url.replace('https://music.line.me/playlist/', '')

  await fs.ensureDir(`${options.output}/assets/images/playlists/${id}`)

  thumbnails = await Promise.all(thumbnails.map(async (it: string) => {
    const response = await fetch(it)
    const contentType = response.headers.get('content-type')
    const buffer = response.buffer()
    let path = `${options.output}/assets/images/playlists/${id}/${uuidv5(it, uuidv5.URL)}`
    switch (contentType) {
      case 'image/jpeg':
        path = `${path}.jpg`
        break
      case 'image/png':
        path = `${path}.png`
        break
    }
    await fs.writeFile(path, buffer)
    return path.replace(options.output, '')
  }))

  console.log(colors.cyan('finish download thumbnail'))

  return {
    title: title,
    url: url,
    link: `https://music.line.me/launch?cc=JP&target=playlist&item=${id}`,
    thumbnails: thumbnails
  }
}

async function writeOutput(path: string, output: Output[]): Promise<void> {
  await fs.writeFile(path, JSON.stringify(output, null, 2))
}

argv.option({
  name: 'output',
  short: 'o',
  type: 'string',
  description: 'output directory'
})
argv.option({
  name: 'input',
  short: 'i',
  type: 'string',
  description: 'playlist json file path'
})

const options = argv.run().options

const outputJsonFilePath = `${options.output}/assets/json/playlist.json`

Promise.all([
  listPlaylistLinks(options.input),
  getOutputPlaylist(outputJsonFilePath)
]).then(async (result: any) => {
  const links: string[] = result[0]
  let output: Output[] = result[1]
  output = await Promise.all(
    links.map(async (link: string) => {
      const o = output.find((it: Output) => it.url === link)
      if (o) {
        return o
      }
      return await scrape(link)
    })
  )
  return output
}).then(async (result: Output[]) => {
  return await writeOutput(outputJsonFilePath, result)
}).then(_ => {
  console.log(colors.green('success'))
}).catch((e: Error) => {
  console.log(colors.red(e.message))
})
