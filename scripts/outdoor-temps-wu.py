# Outdoor temperature logging script - Weather Underground.
# @author Jeff Geerling, 2015.

import os
import json
from datetime import datetime
import calendar
import requests
from temp_api import postTempData

# Sensor ID for 'outdoor' sensor.
sensor_id = 2

# URI for temps callback on host running the dashboard app.
dashboard_uri = 'http://geerpi:3000/temps'

# Read Weather Underground API key from the environment.
try:
    wu_api_key = os.environ['WU_API_KEY']
    wu_location = os.environ['WU_LOCATION']
except KeyError:
    print "WU_API_KEY and WU_LOCATION env vars must be set."
    exit(1)

# Current time (UNIX timestamp).
date = datetime.utcnow()
time = calendar.timegm(date.utctimetuple())

# Current temperature.
uri = 'http://api.wunderground.com/api/' + wu_api_key + '/conditions/q/' + wu_location + '.json'
req = requests.get(uri)

if req.status_code != requests.codes.ok:
    print "Could not retrieve current weather data."
    exit(1)

# Get JSON as an object.
data = req.json()

# Log the data if it was returned successfully.
if ('current_observation' in data.keys()) and ('temp_f' in data['current_observation'].keys()):
    temp_f = data['current_observation']['temp_f']
    temp = "{0:.2f}".format(temp_f)

    # Send data to temperature logger.
    postTempData(sensor_id, temp, time, exit_on_error=True)

else:
    print "Could not retrieve data from Weather Underground API."
    exit(1)

# Log the successfully-posted data.
print "{0}, {1}".format(date, temp.rstrip())
