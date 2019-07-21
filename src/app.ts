import express = require("express");
import { get } from "request";
import { json } from "body-parser";
import { ESRCH } from "constants";
var createError = require('http-errors');

var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

var indexRouter = require('./routes/index');

const {
    telegram,
    vesselApi
} = require("../env.json");

const telegramApi = telegram.apiUrl + telegram.apiKey + "/"
var app = express();

// view engine setup
app.set('views', path.join(__dirname, '../views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
// app.use('/users', usersRouter);

let offset: number = null;
let commandQuery: any = {}

subscribe()
function vesselInfo(chat_id: number, href: string) {
    get({
        url: vesselApi + "view/?vesselHref=" + href,
    }, function (error, httpResponse, body) {
        let output = "";

        let object = JSON.parse(body)
        for (const key in object) {
            output += `${key}: ${object[key]}\n`
        }
        get({
            url: telegramApi + "sendMessage",
            qs: {
                chat_id,
                text: output
            }
        }, function (error, httpResponse, body) {
            sendLocation(chat_id, object["Coordinates"])
        })
    })
}
function sendLocation(chat_id: number, coordinates: any) {
    if (coordinates && !coordinates.latitude && !coordinates.longitude) {
        console.log("coordinates not available")
        return;
    }
    get({
        url: telegramApi + "sendLocation",
        qs: {
            chat_id,
            latitude: coordinates.latitude,
            longitude: coordinates.longitude
        }
    }, function (error, httpResponse, body) {
        console.log(body)
    })
}
function vesselLocation(chat_id: number, text: string) {
    get({
        url: vesselApi + "search/" + text,
    }, function (error, httpResponse, body) {
        let object = JSON.parse(body)
        sendLocation(chat_id, object)
    })
}


function se(chat_id: number, text: string) {
    console.log(text)
    get({
        url: vesselApi + "search/" + text,
    }, function (error, httpResponse, body) {
        if (error || httpResponse.statusCode != 200) {
            console.log(`error ${error}`)
            console.log(httpResponse.statusCode)
            sendMessageText(chat_id, "Oops error happend, please try later")
            return;
        }
        let output = "";

        if (/\d{7}|\d{9}/.test(text)) {
            let object = JSON.parse(body)
            for (const key in object) {
                output += `${key}: ${object[key]}\n`
            }
        } else {
            let array = JSON.parse(body)
            array.forEach((element: any, i: number) => {
                output += `${i}) ${element.name}(${element.country})\n`
            });
        }
        get({
            url: telegramApi + "sendMessage",
            qs: {
                chat_id,
                text: output
            }
        }, function (error, httpResponse, body1) {
            if (/\d{7}|\d{9}/.test(text)) {
                let object = JSON.parse(body)
                sendLocation(chat_id, object["Coordinates"])
            } else
                sendMessage(chat_id, JSON.parse(body))
        })
        // console.log(body)
    })
}
function addQuery(res: any) {
    if (commandQuery[res.result.chat.id]) {
        commandQuery[res.result.chat.id].push("search result")
    } else {
        commandQuery[res.result.chat.id] = []
    }
}
function subscribe() {
    get({
        url: telegramApi + "getupdates",
        qs: {
            offset: offset,
            timeout: 100
        }
    }, function (error, httpResponse, body) {
        if (error) {
            error && console.error(error)
        } else {
            try {
                let data = JSON.parse(body)
                // console.log(data.result)
                offset = data.result.length ? data.result[data.result.length - 1].update_id + 1 : null
                data.result.forEach((element: any) => {
                    // let userId = element.message.from.id
                    console.log(!!element.callback_query)
                    console.log(element)
                    // sendMessageText(element.message.from.id)
                    // if (element.message && commandQuery[element.message.from.id] && commandQuery[element.message.from.id].length

                    // ){

                    // }
                    // if(element.message.includes('/')){}
                    if (element.message && element.message.text === "vasia") {
                        sendMessageText(element.message.from.id, "bomj")
                        // sendMessage(element.from.id)
                    } else if (element.callback_query) {
                        vesselInfo(element.callback_query.from.id, element.callback_query.data)
                    } else if (element.message && element.message.text) {
                        // } else if (element.message && element.message.text && /\d{7}|\d{9}/.test(element.message.text)) {
                        // vesselLocation(element.message.from.id, element.message.text)
                        se(element.message.from.id, element.message.text)
                    }
                });
                subscribe()
            } catch (error) {

            }
        }
    })
}
function sendMessageText(chat_id: number, text: string = null) {
    // console.log(chat_id)
    // console.log(text)
    get({
        url: telegramApi + "sendMessage",
        qs: {
            chat_id,
            text: text
        }
    }, function (error, httpResponse, body) {
        console.log(body)
    })
}
function sendMessage(chat_id: number, cbData: any) {
    // let rp = JSON.stringify({
    //     keyboard: [["Yes", "No"]]
    // })
    let ar: any = []
    cbData.forEach((element: any, i: number) => {
        i < 9 && ar.push([{ text: i, callback_data: element.href }])
    });
    let rp = JSON.stringify({
        // force_reply: true,
        inline_keyboard: ar
        // inline_keyboard: [[
        //     { text: "Show location", callback_data: JSON.stringify(ar) },
        //     { text: "No", callback_data: JSON.stringify(ar) },
        // ]]
    })
    get({
        url: telegramApi + "sendMessage",
        qs: {
            chat_id,
            text: "Select 1 2 ...",
            // text: "Select from the following options",
            // reply_markup: 
            reply_markup: rp
        }
    }, function (error, httpResponse, body) {
        // console.log(body)
    })
}
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err: any, req: any, res: any, next: any) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;