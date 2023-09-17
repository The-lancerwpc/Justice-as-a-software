const express = require("express")
const router = express.Router()
const {google} = require("googleapis")
const dayjs = require("dayjs")
require("dotenv").config()

const calendar = google.calendar({
    version : "v3",
    auth : process.env.API_KEY
})


const oauth2Client = new google.auth.OAuth2(
    process.env.Client_ID,
    process.env.Client_Secret,
    process.env.Client_URL,
)

const scopes = [
    'https://www.googleapis.com/auth/calendar',
    'https://www.googleapis.com/auth/calendar.events.owned',
]

router.get("/",(req,res)=>{
    const url = oauth2Client.generateAuthUrl({
        access_type: 'offline',
        scope: scopes
    });
    res.redirect(url);
})

router.get("/redirect", async (req,res)=>{
    const {code} = req.query;
    const {tokens} = await oauth2Client.getToken(code)
    oauth2Client.setCredentials(tokens)
    res.redirect("/google/ScheduleEvent")
})

router.get("/ScheduleEvent",async(req,res)=>{
    await calendar.events.insert({
        calendarId : "primary",
        auth : oauth2Client,
        requestBody : {
            summary : "This is a test event",
            description : "Some imp event",
            start : {
                dateTime : dayjs(new Date()).add(1,"day").toISOString(),
                timeZone : "Asia/Kolkata"
            },
            end : {
                dateTime : dayjs(new Date()).add(1,"day").add(2,"hour").toISOString(),
                timeZone: "Asia/Kolkata"
            },
        }
    })
    res.send("working_2!!")
})

router.get("/EventDetails",async(req,res)=>{
    const lists = await calendar.events.list({
        calendarId : "primary",
        auth : oauth2Client,
        timeMin : dayjs().add(0,"day").toISOString(),
        timeMax : dayjs().add(5,"day").toISOString()
    })
    console.log(lists.data.items);
    res.send("check lists")
})

module.exports = router