# arduino uno CO2, temperature and humidity sensor
## Scheme
![Scheme](/images/scheme.png)

## Components
* Display: MT-16S2H (16x2 pixels) 
* Temperature & humidity: DHT22
* CO2: MH-Z19
* Resistor 10k Ohm

## Features
Based on CO2 concentration there is LCD backlight control. When PPM >= 800 and PPM <= 1200 is starts to illuminate. When it's greater than 1200, LED starts to 	
periodically blind.

## Install
### 1. Create Sqlite database

For create term db file
```bash
sqlite3 db/term.db
```
For create Term database
```bash
sqlite3 .read ./sql/init/createTerm.sql
```

For create chats db file
```bash
sqlite3 db/chats.db
```
For create Chats database
```bash
sqlite3 .read ./sql/init/createChats.sql
```

### 2. Rename **config.tmpl.py** and **settings.tmpl.js** to **config.py** and **settings.js**
### 3. Set your parameters to config files
### 4. For Arduino develop you need install **Adafruit_Sensor** and **DHT_sensor** libraries. For more information visit [http://www.arduino.cc/en/Guide/Libraries](http://www.arduino.cc/en/Guide/Libraries)
## Usage
Start read data from Arduino
```bash
python dataReader.py
```

Start telegram bot
```bash
node bot.js
```

Start site
```bash
node site.js
```