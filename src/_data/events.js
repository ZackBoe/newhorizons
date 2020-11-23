const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
const {chromium} = require('playwright-chromium');
dayjs.extend(customParseFormat)

const selector = '.notion-gallery-view [data-block-id="7df84d49-a694-4e7b-8eb2-a9957a746575"] .notion-collection-item'

module.exports = async function() {

  // return [{emoji: '🌎',name: 'Earth Day?',date: '📣 Starts in 6 days 📅 Apr 22',outcome: '🤷‍♂️ No known recipes or rewards',link: 'https://www.notion.so/Earth-Day-51292eb73a364390a3bc0053aac27c01'},{emoji: '🎍',name: 'Young Spring Bamboo',date: '⏳ 45 days left 📅 Mar 01 → May 31',outcome: '🧾 9/10 Recipes 🛠 3 Crafted',link: 'https://www.notion.so/Young-Spring-Bamboo-a6f1fb1a244a4825afb2173e18168e88'}]

  console.info('Launching headless browser from ', process.env.CHROME_PATH)
  let browser = null

  try {
    browser = await chromium.launch({
      headless: true,
      // executablePath: process.env.CHROME_PATH
    });
    // const context = await browser._defaultContext;
    const page = await browser.newPage()
    await page.goto('https://www.notion.so/7df84d49a6944e7b8eb2a9957a746575')
    await page.waitForSelector(selector)
    await page.waitForTimeout(1000);
    let events = await page.$$eval(selector, elements => [...elements].map((event) => {
      return {
        emoji: event.querySelector('.notion-emoji').alt,
        text: event.innerText,
        href: event.firstChild.href
      }
    }))
    await browser.close();

    if(typeof events === 'object' && events.length > 0) {
      events = events.map(event => {
        text = event.text.split(/\n/)
        text.shift()
        return {
          emoji: event.emoji,
          name: text[0],
          date: text[1].split(`, ${dayjs().format('YYYY')}`).join(''),
          outcome: text[2],
          link: event.href
        }
      })
      console.log(events)
      return events
    } else {
      console.error('Scrape Error', events)
      return null
    }

  } catch(e) {
    console.error('Browser Error', e)
    browser.close()
  }

}