# -*- coding: utf-8 -*-
import serial
import datetime
import time
import sys
import json
import os
import sqlite3
from sqlite3 import Error
import config

def clean(x):
    temp=x[2:]
    return temp[:-5]

def create_connection(db_file):
    """ create a database connection to a SQLite database """
    try:
        conn = sqlite3.connect(db_file)
        return conn
    except Error as e:
        print(e)
    
    return None

def insert_temp(database, temp):
    """
    Create a new temp
    :param database:
    :param temp:
    :return:
    """
 
    sql = ''' INSERT INTO Term(Date,H,Temp,Temp2,Co)
              VALUES(?,?,?,?,?) '''
    conn = create_connection(database)
    
    with conn:
        cur = conn.cursor()
        cur.execute(sql, temp)
    
class Payload(object):
        def __init__(self, j):
            self.__dict__ = json.loads(j)

def main():
    database = config.databasePath
 
    """Opening of the serial port"""
    try:
        arduino = serial.Serial("COM3",timeout=3)
    except:
        print('Please check the port')
 
    while True:
        # H T Ti Ppm
        data=str(arduino.readline())
        cleandata=clean(data)
        print(cleandata)
        if cleandata:
            try:
                p = Payload(cleandata)
                temp = (datetime.datetime.now(), p.H, p.T, p.Hic, p.Ppm)
                print(temp)
                insert_temp(database, temp)
            except:
                print("Unexpected error:", sys.exc_info()[0])
        # time.sleep(20)

if __name__ == '__main__':
    main()