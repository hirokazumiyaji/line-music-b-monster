import * as argv from 'argv'
import * as fs from 'fs-extra'
import * as puppeteer from 'puppeteer'
import * as colors from 'colors/safe'

const ua = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15'

type Output = {
  title: string
  url: string
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
  console.log(colors.green(`start scraping ${url}`))

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
  const thumbnails = await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.playlistInfo .thumb img').values())
      .map(it => it.getAttribute('src'))
  })
  await browser.close()

  console.log(colors.green('finish scraping'))

  const id: string = url.replace('https://music.line.me/playlist/', '')

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
  description: 'output file path'
})
argv.option({
  name: 'input',
  short: 'i',
  type: 'string',
  description: 'playlist json file path'
})

const options = argv.run().options

Promise.all([
  listPlaylistLinks(options.input),
  getOutputPlaylist(options.output)
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
  return await writeOutput(options.output, result)
}).then(_ => {
  console.log(colors.green('success'))
}).catch((e: Error) => {
  console.log(colors.red(e.message))
})
