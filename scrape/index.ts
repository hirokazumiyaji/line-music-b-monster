import * as argv from 'argv'
import * as fs from 'fs-extra'
import axios from 'axios'
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

async function scrape(playlistID: string, url: string): Promise<Output> {
  console.log(colors.cyan(`start scraping ${url}`))

  const browser = await puppeteer.launch()

  try {
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

    console.log(colors.cyan(`finish scraping ${url}`))

    return {
      title: title,
      url: url,
      link: `https://music.line.me/launch?cc=JP&target=playlist&item=${playlistID}`,
      thumbnails: thumbnails
    }
  } catch (e) {
    console.log(colors.red(`scraping error ${e.message}`))
    throw e
  } finally {
    await browser.close()
  }
}

async function downloadImage(url: string, dir: string): Promise<string> {
  let fileName = uuidv5(url, uuidv5.URL)

  const response = await axios.get(url, {
    responseType: 'stream',
    headers: {
      'user-agent': ua
    }
  })
  const contentType = response.headers['content-type'] || ''
  switch (contentType) {
    case 'image/jpeg':
      fileName = `${fileName}.jpg`
      break
    case 'image/png':
      fileName = `${fileName}.png`
      break
  }

  const path = `${dir}/${fileName}`
  const writer = fs.createWriteStream(path)
  response.data.pipe(writer)

  return new Promise((resolve, reject) => {
    writer.on('finish', () => resolve(path.replace(options.output, '/assets')))
    writer.on('error', reject)
  })
}

async function downloadImages(urls: string[], dir: string): Promise<string[]> {
  return await Promise.all(urls.map(async (it: string) => {
    console.log(colors.cyan(`start download thumbnail ${it}`))
    try {
      const path = await downloadImage(it, dir)
      console.log(colors.cyan(`finish download thumbnail ${it}`))
      return path
    } catch (e) {
      console.log(colors.red(`download thumbnail ${e.message}`))
      throw e
    }
  }))
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

const outputJsonFilePath = `${options.output}/json/playlists.json`

Promise.all([
  listPlaylistLinks(options.input),
  getOutputPlaylist(outputJsonFilePath)
]).then(async (result: any) => {
  const links: string[] = result[0]
  let output: Output[] = result[1]
  output = await Promise.all(
    links.map(async (link: string) => {
      let o = output.find((it: Output) => it.url === link)
      if (o) {
        return o
      }

      const playlistID: string = link.replace('https://music.line.me/playlist/', '')
      const dir = `${options.output}/images/playlists/${playlistID}`
      await fs.ensureDir(dir)

      o = await scrape(playlistID, link)
      o.thumbnails = await downloadImages(o.thumbnails, dir)
      return o
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
