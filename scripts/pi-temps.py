# Raspberry Pi temperature logging script.
# @author Jeff Geerling, 2015.

import os
import glob
import time
from datetime import datetime
import calendar
import requests
from temp_api import postTempData

# Import configuration from 'pi-temps.conf' file.
config = {}
config_dir = os.path.dirname(os.path.abspath(__file__))
execfile(config_dir + "/pi-temps.conf", config)

# Read the temperature from a connected DS18B20 temperature sensor.
def readTempFromGPIO():
    base_dir = '/sys/bus/w1/devices/'
    device_folder = glob.glob(base_dir + '28*')[0]
    device_file_path = device_folder + '/w1_slave'
    device_file = open(device_file_path, "r")
    text = device_file.read()
    device_file.close()

    # Grab the second line, parse it, and find the temperature value.
    temp_line = text.split("\n")[1]
    temp_data = temp_line.split(" ")[9]
    temp_c = float(temp_data[2:]) / 1000
    temp_f = temp_c * 9.0 / 5.0 + 32.0
    # Adjust the temperature according to the configured offset.
    temp_f_adjusted = temp_f + config["temp_offset"]
    temp = "{0:.2f}".format(temp_f_adjusted)
    return temp

while True:
    # Get current temperature and timestamp.
    temp = readTempFromGPIO()
    date = datetime.utcnow()
    timestamp = calendar.timegm(date.utctimetuple())

    # Send data to temperature logger.
    postTempData(config["sensor_id"], temp, timestamp)

    # Log data to command line.
    print "{0}, {1}".format(date, temp.rstrip())

    # Wait [delay] seconds.
    time.sleep(config["delay"])
