const dayjs = require("dayjs")
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

module.exports = function(config) {

  config.addPassthroughCopy('src/assets');
  config.setUseGitIgnore(false);

  config.addFilter('lastImage', (entries) => {
    entries.sort((a, b) => (dayjs(a.date.full).isAfter(dayjs(b.date.full)) ? 1 : -1))
    return entries[entries.length-1].image
  })

  config.addFilter('sortDates', (days) => {
    return days.sort((a, b) => (dayjs(a.date.full).isAfter(dayjs(b.date.full)) ? 1 : -1))
  })

  config.addFilter('calendarDates', (entries, days = []) => {
    entries.map(entry => {
      days.push(dayjs(entry.date.full).format('DD/MM/YYYY')) // 20/03/2020
    })
    return days

  })

  config.addFilter('log', console.log)
  config.addFilter('keys', Object.keys)

  config.addCollection('entriesByMonth', (collection, format = 'YYYY/MM') => {
    entriesByMonth = Array.from(generateDateSet(collection, format)).reduce((a,b) => (a[b]=[],a),{})
    collection.getAll().forEach(item => {
      if (item.data.tag === 'diary') entriesByMonth[dayjs(item.data.entry.date.full).format(format)].push(item)
    })
    return entriesByMonth
  })

  config.addCollection('entriesByYear', (collection, format = 'YYYY') => {
    entriesByYear = Array.from(generateDateSet(collection, 'YYYY')).reduce((a,b) => (a[b]={},a),{})
    Object.keys(entriesByYear).forEach(year => {
      getMonthsForYear(collection, year).forEach(month => {
        entriesByYear[year][month] = []
        collection.getAll().forEach(item => {
          if (item.data.tag === 'diary' && item.data.entry.date.year === year && item.data.entry.date.month === month) {
            entriesByYear[year][month].push(item)
          }
        })
      })
    })
    return entriesByYear
  })

  return {
    dir: {
      input: 'src',
      output: 'dist'
    },
    htmlTemplateEngine: "njk",
  }

}

function getMonthsForYear(collection, year) {
  entries = collection.getAll().filter(item => {
    if (item.data.tag === 'diary' && item.data.entry.date.year === year) return item
  })
  return [...new Set(entries.map(entry => entry.data.entry.date.month))]
}

function generateDateSet (collection, format) {
  let dateSet = new Set()
  entries = collection.getAll().filter(item => {
    if (item.data.tag === 'diary') return item
  })
  entries.sort((a, b) => (dayjs(a.data.entry.date.full).isAfter(dayjs(b.data.entry.date.full)) ? 1 : -1))
  entries.forEach(entry => dateSet.add(dayjs(entry.data.entry.date.full).format(format)))
  return dateSet
}