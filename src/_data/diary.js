const fs = require('fs')
const glob = require('fast-glob')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

module.exports = async function() {
  let diary = []

  const images = await glob(['**/images_diary/*-02CB906EA538A35643C1E1484C4B947D.jpg'])

  images.forEach(image => {
    let date = dayjs(/images_diary\/(\d*)-/.exec(image)[1], 'YYYYMMDDHHmmssSS')
    fs.copyFile(image, `src/assets/images/diary/${dayjs(date).format('YYYY-MM-DD')}.jpg`, (err) =>{
      if (err) throw err;
    })

    diary.push({
      date: {
        full: dayjs(date).format('YYYY-MM-DD'),
        year: dayjs(date).format('YYYY'),
        month: dayjs(date).format('MM'),
        day: dayjs(date).format('DD')
      },
      image: `/assets/images/diary/${dayjs(date).format('YYYY-MM-DD')}.jpg`
    })

  })

  return diary
}