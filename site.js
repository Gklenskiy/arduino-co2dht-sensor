const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const { DateTime } = require('luxon');

const Settings = require('./settings.js');
const TempManager = require("./tempManager.js");

const port = Settings.sitePort;
const groupByPeriod = 5;
const tempByLastHours = 12;

let app = express();
var tempManager = new TempManager(Settings.tempConnString);

app.use(express.static(__dirname + "/public"));

app.get("/api/temp", (req, res) => {
	let now = DateTime.local();
	let nowFormatted = now.toFormat("yyyy-MM-dd HH:mm:ss");
	var fromDate = now.minus({ hours: tempByLastHours }).toFormat("yyyy-MM-dd HH:mm:ss");

	console.log("Get temps from " + fromDate + " to " + nowFormatted);

	tempManager.GetByDates(fromDate, nowFormatted, groupByPeriod, (err, r) => {
		if (err) {
			console.log(err.message);
			res.status(404).send(err.message);
		}

		let temps = r || [];
		let responseMsg = temps.map((item) => {
			return {
				time: item.Date,
				t: item.Temp,
				ti: item.Temp2,
				h: item.H,
				ppm: item.Co
			}
		})
		res.send(responseMsg)
	})
})

app.get("/api/temp/now", (req, res) => {
	tempManager.GetLast((err, r) => {
		if (err) {
			console.log(err.message);
			res.status(404).send(err.message);
		}

		res.send({
			t: r.Temp,
			ti: r.Temp2,
			h: r.H,
			ppm: r.Co
		})
	})
})

app.listen(port, function () {
	console.log("List on " + port);
});