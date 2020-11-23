const fs = require('fs')
const glob = require('globby')
const imagemin = require('imagemin')
const imageminMozjpeg = require('imagemin-mozjpeg')
const dayjs = require('dayjs')
const customParseFormat = require('dayjs/plugin/customParseFormat')
dayjs.extend(customParseFormat)

let diary = []

module.exports = async function() {

  console.log('🔍 Reading diary image directories...')

  // return [{"date":{"full":"2020-03-20","year":"2020","month":"03","day":"20"},"image":"/assets/images/diary/2020-03-20.jpg"},{"date":{"full":"2020-03-21","year":"2020","month":"03","day":"21"},"image":"/assets/images/diary/2020-03-21.jpg"},{"date":{"full":"2020-03-22","year":"2020","month":"03","day":"22"},"image":"/assets/images/diary/2020-03-22.jpg"},{"date":{"full":"2020-03-23","year":"2020","month":"03","day":"23"},"image":"/assets/images/diary/2020-03-23.jpg"},{"date":{"full":"2020-03-24","year":"2020","month":"03","day":"24"},"image":"/assets/images/diary/2020-03-24.jpg"},{"date":{"full":"2020-03-25","year":"2020","month":"03","day":"25"},"image":"/assets/images/diary/2020-03-25.jpg"},{"date":{"full":"2020-03-26","year":"2020","month":"03","day":"26"},"image":"/assets/images/diary/2020-03-26.jpg"},{"date":{"full":"2020-03-27","year":"2020","month":"03","day":"27"},"image":"/assets/images/diary/2020-03-27.jpg"},{"date":{"full":"2020-03-28","year":"2020","month":"03","day":"28"},"image":"/assets/images/diary/2020-03-28.jpg"},{"date":{"full":"2020-03-29","year":"2020","month":"03","day":"29"},"image":"/assets/images/diary/2020-03-29.jpg"},{"date":{"full":"2020-03-30","year":"2020","month":"03","day":"30"},"image":"/assets/images/diary/2020-03-30.jpg"},{"date":{"full":"2020-03-31","year":"2020","month":"03","day":"31"},"image":"/assets/images/diary/2020-03-31.jpg"},{"date":{"full":"2020-04-01","year":"2020","month":"04","day":"01"},"image":"/assets/images/diary/2020-04-01.jpg"},{"date":{"full":"2020-04-02","year":"2020","month":"04","day":"02"},"image":"/assets/images/diary/2020-04-02.jpg"},{"date":{"full":"2020-04-03","year":"2020","month":"04","day":"03"},"image":"/assets/images/diary/2020-04-03.jpg"},{"date":{"full":"2020-04-04","year":"2020","month":"04","day":"04"},"image":"/assets/images/diary/2020-04-04.jpg"},{"date":{"full":"2020-04-05","year":"2020","month":"04","day":"05"},"image":"/assets/images/diary/2020-04-05.jpg"},{"date":{"full":"2020-04-06","year":"2020","month":"04","day":"06"},"image":"/assets/images/diary/2020-04-06.jpg"},{"date":{"full":"2020-04-07","year":"2020","month":"04","day":"07"},"image":"/assets/images/diary/2020-04-07.jpg"},{"date":{"full":"2020-04-08","year":"2020","month":"04","day":"08"},"image":"/assets/images/diary/2020-04-08.jpg"},{"date":{"full":"2020-04-09","year":"2020","month":"04","day":"09"},"image":"/assets/images/diary/2020-04-09.jpg"},{"date":{"full":"2020-04-10","year":"2020","month":"04","day":"10"},"image":"/assets/images/diary/2020-04-10.jpg"},{"date":{"full":"2020-04-11","year":"2020","month":"04","day":"11"},"image":"/assets/images/diary/2020-04-11.jpg"},{"date":{"full":"2020-04-12","year":"2020","month":"04","day":"12"},"image":"/assets/images/diary/2020-04-12.jpg"},{"date":{"full":"2020-04-13","year":"2020","month":"04","day":"13"},"image":"/assets/images/diary/2020-04-13.jpg"},{"date":{"full":"2020-04-14","year":"2020","month":"04","day":"14"},"image":"/assets/images/diary/2020-04-14.jpg"}] 

  let cached = await glob('src/assets/images/diary/*.jpg')
  let images = await glob('images_diary/*-02CB906EA538A35643C1E1484C4B947D.jpg')
  let newImgs = []

  images.forEach(img => {
    let date = dayjs(/images_diary\/(\d*)-/.exec(img)[1], 'YYYYMMDDHHmmssSS')
    let filename = `${dayjs(date).format('YYYY-MM-DD')}.jpg`

    if(!cached.includes(`src/assets/images/diary/${filename}`)) {
      newImgs.push(img)
    }
  })

  console.log(`🧮 Total: ${cached.length + newImgs.length}, Cached: ${cached.length}, New: ${newImgs.length}`)

  if(newImgs.length > 0) {
    console.log(`🗜️  Compressing ${newImgs.length} images...`)
    const compressed = await imagemin(newImgs, { plugins: [imageminMozjpeg({ quality: 80 })] })

    compressed.forEach(image => {
      let date = dayjs(/images_diary\/(\d*)-/.exec(image.sourcePath)[1], 'YYYYMMDDHHmmssSS')
      fs.writeFile(`src/assets/images/diary/${dayjs(date).format('YYYY-MM-DD')}.jpg`, image.data, (err) =>{
        if (err) throw err;
        pushImage(date)
      })
    })
  } else console.log('🚨 No new images!')

  if(cached.length > 0) {
    cached.forEach(image => {
      let date = dayjs(/src\/assets\/images\/diary\/(\d{4}-\d{2}-\d{2}).jpg/.exec(image)[1], 'YYYY-MM-DD')
      pushImage(date)
    })
  }

  return diary
}

function pushImage(date) {
  diary.push({
    date: {
      full: dayjs(date).format('YYYY-MM-DD'),
      year: dayjs(date).format('YYYY'),
      month: dayjs(date).format('MM'),
      day: dayjs(date).format('DD')
    },
    image: `/assets/images/diary/${dayjs(date).format('YYYY-MM-DD')}.jpg`
  })
}