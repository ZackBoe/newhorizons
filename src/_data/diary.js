const util = require('util')
const fs = require('fs')
const streamPipeline = util.promisify(require('stream').pipeline)
const fetch = require('node-fetch');
const path = require('path')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

module.exports = async function() {

  // return [{"date":{"full":"2020-04-25","year":"2020","month":"04","day":"25"},"image":"/assets/images/diary/2020-03-20.jpg"},{"date":{"full":"2021-01-21","year":"2021","month":"01","day":"21"},"image":"/assets/images/diary/2020-03-21.jpg"},{"date":{"full":"2020-03-22","year":"2020","month":"03","day":"22"},"image":"/assets/images/diary/2020-03-22.jpg"},{"date":{"full":"2020-03-23","year":"2020","month":"03","day":"23"},"image":"/assets/images/diary/2020-03-23.jpg"},{"date":{"full":"2020-03-24","year":"2020","month":"03","day":"24"},"image":"/assets/images/diary/2020-03-24.jpg"}] 

  try {

    let response = await fetch('https://www.notion.so/api/v3/queryCollection', {
      'headers': {
          'User-Agent': '@zackboehm · notion pls give api',
          'Content-Type': 'application/json',
      },
      'body': '{\"collectionId\":\"8d8c4d5d-a0ed-425e-8925-6e143f016855\",\"collectionViewId\":\"0f53dc1d-a0f4-4809-bab4-e206d0b1fb2f\",\"query\":{\"sort\":[{\"property\":\"X|;w\",\"direction\":\"ascending\"}],\"aggregations\":[{\"aggregator\":\"count\"}]},\"loader\":{\"type\":\"table\",\"limit\":70,\"searchQuery\":\"\",\"userTimeZone\":\"America/New_York\",\"userLocale\":\"en\",\"loadContentCover\":true}}',
      'method': 'POST',
    })
    .then((data) => data.json())
    .then(async (data) => {

      entries = await Promise.all(data.result.blockIds.map(async (block) => {
        let content = data.recordMap.block[block].value.content[0]
        let date = data.recordMap.block[block].value.properties['X|;w'][0][1][0][1].start_date
        let image = await downloadImage(`https://www.notion.so/image/${encodeURIComponent(data.recordMap.block[content].value.format.display_source)}`, date)
        
        return {
          date: {
            full: date,
            year: dayjs(date).format('YYYY'),
            month: dayjs(date).format('MM'),
            day: dayjs(date).format('DD')
          },
          image: image
        }
      }))
      console.log(entries)
      return entries
    })
    .catch((err) => {
      console.error(err)
      return { error: err }
    })
    return response;

  } catch(err) {
    throw new Error(err.message)
  }
}

async function downloadImage(url, date) {
  const response = await fetch(url)
  const filepath = `/assets/images/diary/${date}.jpg`
  if (!response.ok) throw new Error(`unexpected response ${response.statusText}`)
  await streamPipeline(response.body, fs.createWriteStream(path.join(__dirname, `..${filepath}`)))
  console.log(`Downloaded ${url} to ${filepath}`)
  return filepath
}