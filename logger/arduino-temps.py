# Arduino Uno temperature logging script.
# @author Jeff Geerling, 2015.

import os
import serial
from datetime import datetime
import calendar
from temp_api import postTempData

# Import configuration from 'arduino-temps.conf' file.
config = {}
config_dir = os.path.dirname(os.path.abspath(__file__))
execfile(config_dir + "/arduino-temps.conf", config)

# Function to read line, write it to the dashboard, and print it to the screen.
def read(serial):
    temp = serial.readline()
    date = datetime.utcnow()
    time = calendar.timegm(date.utctimetuple())

    # Send data to temperature logger.
    postTempData(config["sensor_id"], temp, time)

    # Log data to command line.
    print "{0}, {1}".format(date, temp.rstrip())

# Connect to the Arduino's serial port.
ser = serial.Serial(config["modem"], baudrate=9600, bytesize=8, parity='N', stopbits=1)

# Read each line as it's output.
while True:
    read(ser)
