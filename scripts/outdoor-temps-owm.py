# Outdoor temperature logging script - Open Weather Map.
# @author Jeff Geerling, 2015.

import os
import glob
import json
from datetime import datetime
import calendar
import requests
from temp_api import postTempData

# Import configuration from 'temps.conf' file.
config = {}
config_dir = os.path.dirname(os.path.abspath(__file__))
execfile(config_dir + "/temps.conf", config)

# Current time (UNIX timestamp).
date = datetime.utcnow()
time = calendar.timegm(date.utctimetuple())

# Current temperature.
uri = 'http://api.openweathermap.org/data/2.5/weather?id=' + config['owm_city_id']
req = requests.get(uri)

if req.status_code != requests.codes.ok:
    print "Could not retrieve current weather data."
    exit(1)

# Get JSON as an object.
data = req.json()

# Log the data if it was returned successfully.
if ('main' in data.keys()) and ('temp' in data['main'].keys()):
    temp_k = data['main']['temp']
    temp_f = (temp_k * 9 / 5.0) - 459.67
    temp = "{0:.2f}".format(temp_f)

    # Send data to temperature logger.
    postTempData(config["owm_sensor_id"], temp, time, exit_on_error=True)

else:
    print "Could not retrieve data from Open Weather Map API."
    exit(1)

# Log the successfully-posted data.
print "{0}, {1}".format(time, temp.rstrip())
