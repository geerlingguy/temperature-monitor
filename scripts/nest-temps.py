# Nest thermostat temperature logging script.
# @author Jeff Geerling, 2015.
#
# To get an authorization code / 'access_token':
# 1. Visit https://developer.nest.com/clients
# 2. Grab the Authorization URL, visit it, log in, and grab the Pincode.
# 3. Make a POST request to:
#   - uri: https://api.home.nest.com/oauth2/access_token
#   - parameters:
#     - code: [Pincode]
#     - client_id: [from clients page]
#     - client_secret: [from clients page]
#     - grant_type: authorization_code
# 4. Copy out the access_token in the response (really long string).
#
# By default, the access_token will be valid for a period of ten years, so doing
# this process manually saves a bit of OAuth code here :)
#
# See:
#   - https://developer.nest.com/documentation/cloud/rest-quick-guide
#   - https://developer.nest.com/documentation/cloud/authorization-reference/
#   - https://developer.nest.com/clients

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

# Read Nest information from the environment.
try:
    nest_access_token = os.environ['NEST_ACCESS_TOKEN']
    nest_thermostat_id = os.environ['NEST_THERMOSTAT_ID']
except KeyError:
    print "NEST_ACCESS_TOKEN and NEST_THERMOSTAT_ID env vars must be set."
    exit(1)

# Current time (UNIX timestamp).
date = datetime.utcnow()
time = calendar.timegm(date.utctimetuple())

# Log into Nest API.
uri = 'https://developer-api.nest.com/devices/thermostats/' + nest_thermostat_id
payload = { 'auth': nest_access_token }
headers = { 'Accept': 'application/json' }
req = requests.get(uri, params=payload, headers=headers)

if req.status_code != requests.codes.ok:
    print "Could not retrieve thermostat information from Nest API."
    exit(1)

data = req.json()
if ('ambient_temperature_f' in data.keys()):
    temp = "{0:.2f}".format(data['ambient_temperature_f'])

    # Send data to temperature logger.
    postTempData(config["nest_sensor_id"], temp, time, exit_on_error=True)

else:
    print "Could not retrieve temperature data from Nest API."
    exit(1)

# # Log the successfully-posted data.
print "{0}, {1}".format(time, temp.rstrip())
