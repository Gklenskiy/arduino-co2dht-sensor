#include "DHT.h"
#include <SoftwareSerial.h>
#include <LiquidCrystal.h>

#define DHTPIN 2     // what digital pin we're connected to
#define DHTTYPE DHT22 
DHT dht(DHTPIN, DHTTYPE);
/*int prevCO2Val = LOW;
long th, tl, h, l, ppm;*/
SoftwareSerial co2SensorSerial(A0, A1); // A0 - к TX сенсора, A1 - к RX
LiquidCrystal lcd(13, 12, 11, 10, 9, 8);
int led = 7;
bool ledIsOn = false;
byte co2cmd[9] = {0xFF,0x01,0x86,0x00,0x00,0x00,0x00,0x00,0x79}; 
unsigned char response[9];
float H = 0;
float T = 0;
float Hic = 0;
unsigned int Ppm = 0;

void setup() {
  // put your setup code here, to run once:
  co2SensorSerial.begin(9600);
  Serial.begin(9600);

  dht.begin();
  lcd.begin(16, 2);
  lcd.print("FogSoft LLC");
  pinMode(led, OUTPUT);
}

void loop() {
  // put your main code here, to run repeatedly:
  delay(2000);
  readCO2();  
  readHumidityAndTemp();
  Serial.println(String(H)+","+String(T)+","+String(Hic)+","+String(Ppm));  
}

void readCO2(){
  co2SensorSerial.write(co2cmd, 9);
  memset(response, 0, 9);
  co2SensorSerial.readBytes(response, 9);
  int i;
  byte crc = 0;
  for (i = 1; i < 8; i++) crc+=response[i];
  crc = 255 - crc;
  crc++;
  lcd.setCursor(0,0);
  if ( !(response[0] == 0xFF && response[1] == 0x86 && response[8] == crc) ) {
    lcd.print("CRC error: " + String(crc) + " / "+ String(response[8]));
    Serial.println("CRC error: " + String(crc) + " / "+ String(response[8]));
  } else {
    unsigned int responseHigh = (unsigned int) response[2];
    unsigned int responseLow = (unsigned int) response[3];
    Ppm = (256*responseHigh) + responseLow;
    lcd.print("PPM=" + String(Ppm));

    if (Ppm <= 1200 && Ppm >= 800)
      analogWrite(led, 254); 
    else if (Ppm > 1200){
      if (ledIsOn) {
        analogWrite(led, 0);
        ledIsOn = false;
      }
      else {
        analogWrite(led, 254); 
        ledIsOn = true;
      }
    }
    else analogWrite(led, 0);
  }
}

void readHumidityAndTemp()
{
  H = dht.readHumidity();
  // Read temperature as Celsius (the default)
  T = dht.readTemperature();

  // Check if any reads failed and exit early (to try again).
  if (isnan(H) || isnan(T)) {
    lcd.print("Failed read DHT!");
    Serial.println("Failed read DHT!");
    return;
  }

  // Compute heat index in Celsius (isFahreheit = false)
  Hic = dht.computeHeatIndex(T, H, false);
    
  lcd.print(" H=" + String(H) + "%");
  lcd.setCursor(0, 1);
  lcd.print("T=" + String(T));
  lcd.print(" Ti=" + String(Hic));
}
