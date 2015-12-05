# Temperature Dashboard API integration.
# @author Jeff Geerling, 2015.

import os
import glob
import requests

# Import configuration from 'temps.conf' file.
config = {}
config_dir = os.path.dirname(os.path.abspath(__file__))
execfile(config_dir + "/temps.conf", config)

# The URI of the dashboard app.
dashboard_uri = config["dashboard_uri"] + "/temps"

# Post temperature sensor data to dashboard app.
def postTempData(sensor_id, temp, time, exit_on_error=False):
    payload = {
        'sensor': sensor_id,
        'temp': temp,
        'time': time
    }

    try:
        post = requests.post(dashboard_uri, data=payload)

        # Print error, but don't exit, if data couldn't be written.
        if post.status_code != requests.codes.ok:
            print "Could not post data to dashboard app: " + post.json()['error']
            if exit_on_error:
                exit(1)

    except requests.exceptions.ConnectionError as e:
        # TODO: Print the message in the ConnectionError.
        print "A connection could not be established with the dashboard API."
        if exit_on_error:
            exit(1)
