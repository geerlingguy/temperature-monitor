# Outdoor temperature logging script.
# @author Jeff Geerling, 2015.

import json
import urllib2
from datetime import datetime
import calendar

# Open Weather Map city ID.
city_id = '4407084'

# Get the current time (UNIX timestamp).
date = datetime.utcnow()
time = calendar.timegm(date.utctimetuple())

# Get the current temperature.
uri = 'http://api.openweathermap.org/data/2.5/weather?id=' + city_id
data = json.load(urllib2.urlopen(uri))

# TODO - Error handling; what if server is down, URL is incorrect, etc.?

# Log the data if it was returned successfully.
if ('main' in data.keys()) and ('temp' in data['main'].keys()):
    temp_k = data['main']['temp']
    temp_f = (temp_k * 9 / 5.0) - 459.67
    temp = "{0:.2f}".format(temp_f)

    # Send data to our temperature logger.
    # TODO

    # Log data to command line.
    print "{0}, {1}".format(time, temp.rstrip())
else:
    print "Could not retrieve data from Open Weather Map API."
