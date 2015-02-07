# Simple Temperature Monitoring App

<img src="https://raw.githubusercontent.com/geerlingguy/temperature-monitor/master/dashboard/screenshot.png" alt="Temperature Monitoring Dashboard" />

I've had an Arduino and Raspberry Pi sitting unused in a box for a couple years now. I decided to start playing around with temperature monitoring, to see if I could get some interesting data out of a bunch of cheap temperature sensors I bought, and experiment with ways to heat and cool the house more efficiently (someday incorporating zones and schedules that are more advanced than what my Nest can handle).

I'll be experimenting with wired temperature probes, wireless (RF) probes, Nest API integration, and maybe some other stuff while I'm at it.

## Installation & Setup

### Vagrant quickstart for hacking

Set up the virtual machine:

  1. Install Vagrant, VirtualBox and Ansible.
  2. `cd` into `setup` directory and run `ansible-galaxy install -r requirements.txt`.
  3. `cd` back into this directory and run `vagrant up`.

Start the Express app for Temperature display:

  1. `cd` into `/vagrant/dashboard`.
  2. Run the command `DEBUG=node:* ./bin/www`.
  3. You can now visit the dashboard at `http://192.168.33.2:3000/`.

### Arduino/Raspberry Pi

First of all, you'll need an Arduino, breadboard, DS18x20 temperature probe (with three wires), a breadboard, a resistor, some jumper wires (or a board to solder everything together, if you desire the permanence), and a USB cable to hook up the Arduino to a Raspberry Pi or some other computer.

For now, I'd recommend reading through the following guides for a step-by-step guide:

  - [How to measure temperature with your Arduino and a DS18B20](http://www.tweaking4all.com/hardware/arduino/arduino-ds18b20-temperature-sensor/)
  - [The Raspberry Pi and Wireless RF (XRF) Temperature Loggers](http://www.seanlandsman.com/2013/02/the-raspberry-pi-and-wireless-rf-xrf.html)

This project contains an Arduino Uno sketch, `DS18x20_Temperature_Output.ino`, which tells a USB-connected Arduino Uno to read the temperature on a probe on pin 2 every 30s and output the temperature as a float (e.g. `72.25`) in fahrenheit.

You need to have MySQL server installed and available (future versions of this project will configure everything for you, but for now, just get it going and either use the root account (not recommended) or set up a new user with access to the database defined by `schema.sql`).

### `logger` - Python Scripts for Logging Data

(All commands run from project root directory).

  1. Install MySQL: `sudo apt-get install mysql-client mysql-server`
  2. Start MySQL and make sure it's enabled on boot:
    a. `sudo service mysql start`
    b. `sudo update-rc.d mysql defaults`
  3. Create the MySQL database for logging temperatures:
    a. `mysql -u [user] -p[password] < setup/database/schema.sql`
  4. Install Python logger app dependencies:
    a. `sudo apt-get install python-pip python-dev libmysqlclient-dev`
    b. `sudo pip install -r logger/requirements.txt`
  5. Copy `arduino-temps.example.conf` to `arduino-temps.conf` and modify to suit your needs.
  6. Start the Python script: `nohup python logger/arduino-temps.py > /dev/null 2>&1 &`

#### Outdoor temperature logging

There is also a small script for reading the current local temperature, courtesy of the [Open Weather Map API](http://openweathermap.org/api), `logger/outdoor-temps.py`. This script will read the current temperature for a given city, and send a request with the temperature data to the `dashboard` app.

It's customary to configure this outdoor temperature script via cron, so you can have it run once every minute, every 5 minutes, or on some more limited schedule than your other sensors, to ensure API limits aren't reached. (Plus, that's a lot of HTTP traffic for the poor Raspberry Pi!).

You can add a cron job to call this script and update the outdoor temperature by logging into your pi and editing the crontab (`crontab -e`). Add a line like the following:

    * * * * * python /path/to/temperature-monitor/logger/outdoor-temps.py > /dev/null 2>&1

Notes:

  - Prior to logging outdoor temperatures, you should add a sensor and update the ID in `outdoor-temps.py` with this ID. See `dashboard`'s API documentation for more info.
  - Piping the output to `/dev/null` means you won't see if there are any errors (like unreachable hosts, etc.). That's okay; if you're having trouble, just manually run `python outdoor-temps.py` and see what errors might be happening.
  - If you need to diagnose cron issues, install `postfix` using `sudo apt-get install -y postfix`, and remove the ` > /dev/null 2>&1` from the end of the line in the cron job.

#### Nest temperature logging

There is another script, `nest-temps.py`, which requires you to have a Nest Developer account for API access. More information inside that script for now, but basically, once you're configured, get an access token then find your nest thermostat ID. Add those as the environment variables:

  - `NEST_ACCESS_TOKEN`
  - `NEST_THERMOSTAT_ID`

Then add a cron job like:

    */5 * * * * . $HOME/.nest_api; python /path/to/temperature-monitor/logger/nest-temps.py > /dev/null 2>&1

Notes:

  - Nest's API documentation suggests "To avoid errors, we recommend you limit requests to one call per minute, maximum.", and since every call requires the Nest to wake up to return data to Nest's API servers, it's best to be more conservative with this cron job.
  - The cron job above first pulls in the configuration in `~/.nest_api`. It's simplest to just create a file like that in your home folder with the two required environment variables exported and a `PATH` so the `python` executable works. There are other ways, but I like simple, and my Pi is on an internal network, and the account running the dashboard is pretty secure anyways.
  - If you need to diagnose cron issues, install `postfix` using `sudo apt-get install -y postfix`, and remove the ` > /dev/null 2>&1` from the end of the line in the cron job.

### `dashboard` - Express App/API for Displaying and Adding Data

  1. Install Node.js and NPM ([guide](http://weworkweplay.com/play/raspberry-pi-nodejs/)):
    a. `wget http://node-arm.herokuapp.com/node_latest_armhf.deb`
    b. `sudo dpkg -i node_latest_armhf.deb`
    c. (You may need to log out and log back in for Node.js to work correctly; confirm with `node -v`.)
  2. `cd` into `dashboard` directory.
  3. Install required dependencies with `npm install`.
  4. Run the app: `nohup ./bin/www > /dev/null 2>&1 &`
    a. To run in debug mode, with output on the command line: `DEBUG=node:* ./bin/www`

You can then view a dashboard at `http://[raspberry-pi-ip]:3000/` (where `[raspberry-pi-ip]` is the IP address or domain name of your Raspberry Pi).

#### `dashboard` API

The `dashboard` app has a simple REST API that allows you to add sensors to your dashboard, send temperature data directly to the dashboard from other devices, and retrieve sensor and temperature information.

More documentation may be added, but here's a list of the relevant API endpoints and example usage:

  - `/sensors`
    - `GET`: Returns a listing of all sensor data.
    - `POST`: Send a POST request with a `location` parameter, and it will respond with a new sensor ID.
    - `DELETE`: Not yet implemented.
  - `/temps`
    - `POST`: Send a POST request with a `sensor`, `temp`, and `time` parameter, and it will respond with a new temperature record ID.
    - `GET` `/temps/:id`: Get temperature data for a given sensor ID from the past 24h (by default). Add parameter `startTime` to set a starting time.
    - `GET` `/temps/all`: Get temperature data from all sensors the past 24h (by default). Add parameter `startTime` to set a starting time.

The API returns the following HTTP Status Codes:

  - `200` on success
  - `400` if you are missing some data or have an otherwise-invalid request
  - `501` if the method you're using is not yet implemented

An error message will also be returned in the body of the response.

## License

MIT

## Author

This project was created in 2015 by [Jeff Geerling](http://jeffgeerling.com/).
