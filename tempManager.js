const sqlite3 = require('sqlite3').verbose();

function TempManager(pathToDb) {
	this.pathToDb = pathToDb;
}

TempManager.prototype.GetLast = function (callback) {
	let db = new sqlite3.Database(this.pathToDb, sqlite3.OPEN_READONLY, (err) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
	})

	let sql = `SELECT H, Temp, Temp2, Co FROM Term order by Date desc`;

	db.get(sql, (err, row) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
		callback(null, row);
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
	});
}

// date in format yyyy-MM-dd HH:mm:ss
TempManager.prototype.GetFromDate = function (date, callback) {
	let db = new sqlite3.Database(this.pathToDb, sqlite3.OPEN_READONLY, (err) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
	});

	let sql = `SELECT Temp, Co FROM Term where Date > ? order by Date desc`;
	db.all(sql, [date], (err, rows) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
		callback(null, rows);
	})

	db.close((err) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
	});
}

TempManager.prototype.GetByDates = function (fromDate, toDate, groupByMinutes, callback) {
	let db = new sqlite3.Database(this.pathToDb, sqlite3.OPEN_READONLY, (err) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
	});

	let sql = `Select Date, printf("%.2f", avg(H)) as H, printf("%.2f",avg(Temp)) as Temp, printf("%.2f",avg(Temp2)) as Temp2, printf("%.0f",avg(Co)) as Co 
				from Term
				where  Date > ? and Date < ?
				group by  60 / ? * strftime('%H', Date) + strftime('%M', Date) / ?
				order by Date`;
	db.all(sql, [fromDate, toDate, groupByMinutes, groupByMinutes], (err, rows) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
		callback(null, rows);
	})

	db.close((err) => {
		if (err) {
			console.error(err.message);
			callback(err);
		}
	});
}

module.exports = TempManager;