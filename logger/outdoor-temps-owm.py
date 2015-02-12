# Outdoor temperature logging script - Open Weather Map.
# @author Jeff Geerling, 2015.

import json
from datetime import datetime
import calendar
import requests

# Sensor ID for 'outdoor' sensor.
sensor_id = 2

# URI for temps callback on host running the dashboard app.
dashboard_uri = 'http://geerpi:3000/temps'

# Open Weather Map city ID.
city_id = '4407084'

# Current time (UNIX timestamp).
date = datetime.utcnow()
time = calendar.timegm(date.utctimetuple())

# Current temperature.
uri = 'http://api.openweathermap.org/data/2.5/weather?id=' + city_id
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
    postTempData(sensor_id, temp, time, exit_on_error=True)

else:
    print "Could not retrieve data from Open Weather Map API."
    exit(1)

# Log the successfully-posted data.
print "{0}, {1}".format(time, temp.rstrip())
