const TelegramBot = require("node-telegram-bot-api");
const { DateTime } = require('luxon');

const Settings = require('./settings.js');
const ChatsManager = require('./chatsManager.js');
const TempManager = require('./tempManager.js');

// init
let maxAverageCo = 870;
let ifHumanExistCo = 650;
let maxAverageTemp = 27;
let checkAverageTimeoutMinutes = 15;
let checkAverageLastMinutes = 5;
let chatsConnString = Settings.chatsConnString;
let tempConnString = Settings.tempConnString;

let checkTimeBeginHour = 8;
let checkTimeBeginMinutes = 30;
let checkTimeEndHour = 22;
let checkTimeEndMinutes = 0;

var bot = new TelegramBot(Settings.botToken, { polling: true });
var chatsManager = new ChatsManager(chatsConnString);
var tempManager = new TempManager(tempConnString);

chatsManager.fillCache();

bot.onText(/\/t/, (msg, match) => {
	const chatId = msg.chat.id;

	tempManager.GetLast((err, r) => {
		if (err) {
			return console.error(err.message);
		}

		bot.sendMessage(chatId, 'Влажность: ' + r.H + ' %\n' +
			'Температура: ' + r.Temp + ' °C\n' +
			'Ощущается: ' + r.Temp2 + ' °C\n' +
			'Co2: ' + r.Co + ' ppm\n');
	})
});

bot.onText(/\/watch/, (msg) => {
	const chatId = msg.chat.id;
	chatsManager.addChat(chatId,
		(err) => {
			if (!err) {
				bot.sendMessage(chatId, 'Вы уже подписаны');
			}
		},
		() => {
			bot.sendMessage(chatId, 'Вы подписаны');
		})
})

bot.onText(/\/stop/, (msg) => {
	const chatId = msg.chat.id;
	chatsManager.removeChat(chatId,
		(err) => {

		},
		() => {
			bot.sendMessage(chatId, 'Вы больше не узнаете, когда пора проветрить =(');
		});
});

let timerId = setTimeout(function checkDb() {
	let checkDtFrom = DateTime.local().set({ hour: checkTimeBeginHour }).set({ minutes: checkTimeBeginMinutes });
	let checkDtTo = DateTime.local().set({ hour: checkTimeEndHour }).set({ minutes: checkTimeEndMinutes });
	let now = DateTime.local();

	console.log("check sleep");
	console.log(checkDtFrom.toFormat("yyyy-MM-dd HH:mm:ss"));
	console.log(checkDtTo.toFormat("yyyy-MM-dd HH:mm:ss"));
	console.log(now.toFormat("yyyy-MM-dd HH:mm:ss"));
	if (now >= checkDtFrom && now <= checkDtTo && now.weekday != 6 && now.weekday != 7) {

		var dt = now.minus({ minutes: checkAverageLastMinutes }).toFormat("yyyy-MM-dd HH:mm:ss");
		console.log(dt + " Check average");

		tempManager.GetFromDate(dt, (err, rows) => {
			if (err) {
				return console.error(err.message);
			}

			var sumTempCo = rows.reduce(function (prevVal, current, i, arr) {

				prevVal.Temp += current.Temp;
				prevVal.Co += current.Co;
				prevVal.Count += 1;

				return prevVal;
			}, { Temp: 0, Co: 0, Count: 0 });

			console.log(sumTempCo);
			var average = {
				Temp: sumTempCo.Temp / sumTempCo.Count,
				Co: sumTempCo.Co / sumTempCo.Count
			}

			console.log(average);
			if (average.Co > ifHumanExistCo) {
				if (average.Co >= maxAverageCo || average.Temp >= maxAverageTemp) {
					sendAirToAll(average.Co, average.Temp);
				}
			}
		})
	}

	timerId = setTimeout(checkDb, checkAverageTimeoutMinutes * 60 * 1000)
}, 0);

function sendAirToAll(co, temp) {
	chatsManager.getAll((chats, err) => {
		if (err) {
			return console.error(err.message);
		}

		chats.forEach((chatId) => {
			bot.sendMessage(chatId, "Пора проветрить. \nСредние показатели за последние 5 минут: \n" +
				'Температура: ' + temp.toFixed(1) + ' °C\n' +
				'CO2: ' + co.toFixed(1) + ' ppm\n');
		})
	})
}