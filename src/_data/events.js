const { Client } = require("@notionhq/client")

const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

// How can I reuse this or the Netlify function instead of duplicating this code?

// Yay Notion Functions/AWS Lambda only support node 14 and I can't use string.replaceAll() yaayy
let yearRegex = new RegExp(`, ${(new Date).getFullYear()}`, 'gmi')

module.exports = async function() {
  
  // return [{emoji: '🌎',name: 'Earth Day?',date: '📣 Starts in 6 days 📅 Apr 22',outcome: '🤷‍♂️ No known recipes or rewards',link: 'https://www.notion.so/Earth-Day-51292eb73a364390a3bc0053aac27c01'},{emoji: '🎍',name: 'Young Spring Bamboo',date: '⏳ 45 days left 📅 Mar 01 → May 31',outcome: '🧾 9/10 Recipes 🛠 3 Crafted',link: 'https://www.notion.so/Young-Spring-Bamboo-a6f1fb1a244a4825afb2173e18168e88'}]
  
  const response = await notion.databases.query({
    database_id: process.env.NOTION_DATABASEID,
    filter: {
      and: [
        {
          property: "End Date",
          date: { on_or_after: new Date((new Date).setDate((new Date).getDate() - 7)).toISOString() }
        },
        {
          property: "Event",
          date: { on_or_before: new Date((new Date).setMonth((new Date).getMonth() + 1)).toISOString() }
        }
      ]
    },
    sorts: [{ property: "End Date", direction: "ascending" }]
  })
  
  let events = []
  
  response.results.forEach(event => {
    events.push({
      emoji: event?.icon?.emoji || '❓',
      name: event.properties["Name"].title[0].plain_text,
      date: event.properties["Event Dates"].formula.string.replace(yearRegex, ''),
      outcome: event.properties["Rewards, Recipes & Crafted"].formula.string,
      link: event.url
    })
  })
  
  console.log(`📅 Got ${events.length} events from Notion:`)
  console.log(events.map(event => `${event.emoji} ${event.name} - ${event.date}`))
  return events
  
}