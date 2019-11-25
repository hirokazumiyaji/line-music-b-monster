import * as argv from 'argv'
import * as fs from 'fs-extra'
import * as puppeteer from 'puppeteer'

async function listPlaylistLinks(path: string) {
  try {
    const buffer = await fs.readFile(path)
    const json = JSON.parse(buffer.toString())
    return json.links
  } catch (e) {
    console.error(e)
    throw e
  }
}

async function scrape(url: string) {
  const browser = await puppeteer.launch()
  const page = await browser.newPage()
  page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0.1 Safari/605.1.15')
  await page.goto(url)
  await page.screenshot()
  await browser.close()
}

argv.option({
  name: 'output',
  short: 'o',
  type: 'string',
  description: 'output file path'
})
argv.option({
  name: 'playlist',
  short: 'p',
  type: 'string',
  description: 'playlist json file path'
})

const options = argv.run().options

listPlaylistLinks(options.playlist).then((links: string[]) => console.info(links))
