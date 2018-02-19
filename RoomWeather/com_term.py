# -*- coding: utf-8 -*-
import serial
import datetime
import time
import sys

"""Opening of the serial port"""
try:
    arduino = serial.Serial("COM3",timeout=3)
except:
    print('Please check the port')

"""Receiving data and storing it in a list"""
def writeln(x):
    try:
        with open('data.csv', 'a') as the_file:
            the_file.write(x+'\n')
    except IOError as e:
        print "I/O error({0}): {1}".format(e.errno, e.strerror)
    except:
        print "Unexpected error:", sys.exc_info()[0]

def clean(x):
    temp=x[2:]
    return temp[:-5]

while True:
    # H T Ti Ppm
    data=str(arduino.readline())
    cleandata=clean(data)
    print(cleandata)
    if cleandata:
        reading = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S") + ',' + cleandata
        writeln(reading)
    # time.sleep(60)