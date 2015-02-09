# Raspberry Pi temperature logging script.
# @author Jeff Geerling, 2015.

import os
import glob
import time
from datetime import datetime
import calendar
import requests

# Import configuration from 'pi-temps.conf' file.
config = {}
config_dir = os.path.dirname(os.path.abspath(__file__))
execfile(config_dir + "/pi-temps.conf", config)

# Read the temperature from a connected DS18B20 temperature sensor.
def read_temp():
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
    temp = "{0:.2f}".format(temp_f)
    return temp

# Send temperature data to the data logger.
def post_temp_to_dashboard(temp, timestamp):
    payload = {
        'sensor': config["sensor_id"],
        'temp': temp,
        'time': timestamp
    }
    post = requests.post(config["dashboard_uri"], data=payload)

    # Print error, but don't exit, if data couldn't be written.
    if post.status_code != requests.codes.ok:
        print "Could not post data to dashboard app: " + post.json()['error']

    # Log data to command line.
    print "{0}, {1}".format(date, temp.rstrip())

while True:
    # Get current temperature and timestamp.
    temp = read_temp()
    date = datetime.utcnow()
    timestamp = calendar.timegm(date.utctimetuple())

    # Post the data to the dashboard app.
    post_temp_to_dashboard(temp, timestamp)

    # Wait 30s.
    time.sleep(30)
