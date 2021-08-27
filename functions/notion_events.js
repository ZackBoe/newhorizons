const { builder } = require("@netlify/functions")
const { Client } = require("@notionhq/client")

const notion = new Client({
  auth: process.env.NOTION_TOKEN
})

// Yay Notion Functions/AWS Lambda only support node 14 and I can't use string.replaceAll() yaayy
let yearRegex = new RegExp(`, ${(new Date).getFullYear()}`, 'gmi')

async function getEvents(event, context) {
  
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
      emoji: event?.icon?.emoji,
      name: event.properties["Name"].title[0].plain_text,
      date: event.properties["Event Dates"].formula.string.replace(yearRegex, ''),
      outcome: event.properties["Rewards, Recipes & Crafted"].formula.string,
      link: event.url
    })
  })
  
  
  console.log(events)
  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json"},
    body: JSON.stringify(events)
  }
  
}

exports.handler = builder(getEvents)