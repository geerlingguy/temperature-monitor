# Temperature Dashboard API integration.
# @author Jeff Geerling, 2015.

import requests

# The URI of the dashboard app.
dashboard_uri = "http://geerpi:3000/temps"

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
