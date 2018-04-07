const sqlite3 = require('sqlite3').verbose();

function ChatsManager(pathToDb) {
	this.pathToDb = pathToDb;
	this._chats = []
}

ChatsManager.prototype.fillCache = function () {
	this._chats = this.getAll(() => { console.log('cache filled') });
}

ChatsManager.prototype.addChat = function (chatId, callbackEr, callbackSuc) {
	let db = new sqlite3.Database(this.pathToDb, (err) => {
		if (err) {
			console.error(err.message);
			callbackEr(err);
		}
	});
	let chatsManager = this;
	let sqlExists = `select * from chats where chatId = ?`;
	db.get(sqlExists, [chatId], (err, row) => {
		if (err) {
			console.error(err.message);
		}

		if (!!row) {
			callbackEr();
		} else {
			let sql = `insert into chats(chatId) values (?)`;

			db.run(sql, [chatId], function (err) {
				if (err) {
					console.error(err.message);
				}
				chatsManager._chats.push(chatId);
				console.log(`Rows inserted ${this.changes}`);
				callbackSuc();
			})
		}
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
			callbackEr(err);
		}
	});
}

ChatsManager.prototype.removeChat = function (chatId, callbackEr, callbackSuc) {
	let db = new sqlite3.Database(this.pathToDb, (err) => {
		if (err) {
			console.error(err.message);
			callbackEr(err);
		}
	});

	let sqlExists = `select * from chats where chatId=?`;
	db.get(sqlExists, [chatId], (err, row) => {
		if (err) {
			console.error(err.message);
			callbackEr(err);
		}

		if (!!row) {
			let sql = 'delete from chats where chatId=?';
			db.run(sql, [chatId], function (err) {
				if (err) {
					console.error(err.message);
					callbackEr(err);
				}

				console.log(`Rows deleted ${this.changes}`);
				callbackSuc();
			})
		}
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
			callbackEr(err);
		}
	});

	var index = this._chats.indexOf(chatId);
	if (index !== -1)
		this._chats.splice(index, 1);
}

ChatsManager.prototype.getAll = function (callback) {
	if (this._chats.length) {
		callback(this._chats)
		return;
	}

	let db = new sqlite3.Database(this.pathToDb, sqlite3.OPEN_READONLY, (err) => {
		if (err) {
			return console.error(err.message);
		}
	});

	let chatsManager = this;
	let sql = 'select chatId from chats';
	db.all(sql, (err, rows) => {
		if (err) {
			console.error(err.message);
		}

		chatsManager._chats = rows.map((item) => { return item.chatId }) || [];
		callback(chatsManager._chats);
	});

	db.close((err) => {
		if (err) {
			console.error(err.message);
			callback(null, err);
		}
	});
}

module.exports = ChatsManager;