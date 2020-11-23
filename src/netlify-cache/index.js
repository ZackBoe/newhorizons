// https://github.com/netlify/build/tree/master/packages/cache-utils

const path = './src/assets/images/diary/'

module.exports = {

  // Restore file/directory cached in previous builds.
  // Does not do anything if:
  //  - the file/directory already exists locally
  //  - the file/directory has not been cached yet
  async onPreBuild({ utils }) {

    if (!(await utils.cache.has(path))) {
      console.log(`Directory ${path} not cached`)
      return
    }

    console.log(`Restoring cached directory ${path}...`)
    if (await utils.cache.restore(path)) {
      cachedItems = await utils.cache.list({depth: 4})
      // cachedItems includes all parent directory paths, we just want to list files
      console.log(`Restored cached directory ${path}, has ${cachedItems.length-4} files`)
    }
  },

  // Cache file/directory for future builds.
  // Does not do anything if:
  //  - the file/directory does not exist locally
  async onPostBuild({ utils }) {
    if (await utils.cache.save(path)) {
      cachedItems = await utils.cache.list({depth: 4})
      // cachedItems includes all parent directory paths, we just want to list files
      console.log(`Cached directory ${path}, has ${cachedItems.length-4} files`)
    }
  },
}