# Simple Temperature Monitoring App

<img src="https://raw.githubusercontent.com/geerlingguy/temperature-monitor/master/dashboard/screenshot.png" alt="Temperature Monitoring Dashboard" />

I've created this project to power a network of temperature and environmental monitors in my home.

The architecture uses one 'master' Pi to aggregate and display log data, and many 'remotes' place around a house to send log data back to the 'master'.

The master Pi should be a model 2 B or a B+, but you can use any Pi for the remotes. I use the A+ or Zero for remotes since they're cheap and use less power when running headless.

Each Pi should already have:

  - Raspbian running on the microSD card, with `raspi-config` already completed.
  - Networking configured (either wired LAN or WiFi via USB).

You can set up the Raspberry Pis while connected to a monitor, or you can set them up over your network via SSH; I'm assuming you're using the command line in either case.

This is a living project, so a lot of things will change while I experiment with making my monitoring more robust, more fully-featured, and eventually, more integrated with my smart thermostat and other environmental controls.


## Vagrant quickstart for hacking

Set up the virtual machine:

  1. Install Vagrant, VirtualBox and Ansible.
  2. `cd` into each of the directories inside `playbooks` and run `ansible-galaxy install -r requirements.txt`.
  3. `cd` back into this directory and run `vagrant up`.

Start the Express app for Temperature display:

  1. `cd` into `/vagrant/dashboard`.
  2. Run the command `DEBUG=node:* ./bin/www`.
  3. You can now visit the dashboard at `http://192.168.33.2:3000/`.


## Installation & Setup - Raspberry Pi Master (Data Logger & Dashboard App)

An Ansible playbook will build the master logger and dashboard Pi, installing all the requirements for the Node.js-based data logger and dashboard app for viewing temperature data.

  1. Install Ansible on the Raspberry Pi.
  2. Install required Ansible roles by running `ansible-galaxy install -r requirements.txt` inside the `playbooks/master` directory.
  3. Run the Ansible playbook to configure the master Pi: `playbooks/master/main.yml`


## Installation & Setup - Raspberry Pi Remotes (Temperature Monitors)

An Ansible playbook will build the remote temperature monitoring Pi(s), installing all the requirements for the Python-based temperature data collection scripts. It will also start the script and begin sending data to the logging endpoint on the Master Pi.

  1. Install Ansible on the Raspberry Pi.
  2. Install required Ansible roles by running `ansible-galaxy install -r requirements.txt` inside the `playbooks/remote-monitor` directory.
  3. Run the Ansible playbook to configure the master Pi: `playbooks/remote-monitor/main.yml`

### `scripts` - Python Scripts for Logging Data

The `scripts` directory contains a variety of temperature logging scripts, written in Python, to assist with logging temperatures from DS18B20 1-Wire temperature sensors (connected via Raspberry Pi GPIO ports), external weather APIs, and even the Nest learning thermostat.

### Connecting the Raspberry Pi to the DS18B20

**Connect the DS18B20 to your Pi**

You can use a breadboard, a shield, a GPIO ribbon cable, or whatever, but you basically need to connect the following (this is using the waterproof sensor—follow diagrams found elsewhere for the small transistor-sized chip):

  - 3V3 - Red wire
  - Ground - Black wire
  - GPIO 4 - Yellow wire (with 4.7K pull-up resistor between this and 3V3).

The 3V3 and Ground wire can be connected to any 3.3V or Ground pin, respectively (follow [this great Raspberry Pi pinout diagram](http://pi.gadgetoid.com/pinout) for your model of Pi), but by default, the 1-Wire library uses GPIO pin 4, which is the 7th physical pin on a B+/A+/B rev 2.

Next, you need to do a couple things to make sure the Pi can see the temperature sensor on the GPIO port:

  1. Edit `/etc/modules` and add the following lines:
      ```
      w1-gpio
      w1-therm
      ```
  2. *If you're using the Jan 30, 2015 image of Raspbian*: Edit `/boot/config.txt` and add the configuration line `dtoverlay=w1-gpio`. See [this forum topic](http://www.raspberrypi.org/forums/viewtopic.php?f=37&t=98407) and [this FAQ](http://www.raspberrypi.org/forums/viewtopic.php?f=28&t=97314) for more info.
  3. Reboot your Raspberry Pi.

To test whether the DS18B20 is working, you can `cd` into `/sys/bus/w1/devices`. `ls` the contents, and you should see a directory like `28-xxxxxxx`, one directory per connected sensor. `cd` into that directory, then `cat w1_slave`, and you should see some output, with a value like `t=23750` at the end. This is the temperature value. Divide by 1,000 and you have the value in °C.

**Log temperatures with `pi-temps.py`**

(All commands run from project root directory).

  1. Install Python logger script dependencies:
    1. `sudo apt-get install python-pip python-dev`
    2. `sudo pip install -r scripts/requirements.txt`
  2. Copy `pi-temps.example.conf` to `pi-temps.conf` and modify to suit your needs.
  3. Start the Python script: `nohup python scripts/pi-temps.py > /dev/null 2>&1 &`

### Outdoor temperature logging via Weather APIs

There are multiple scripts for reading current local temperatures via online weather APIs:

  - [Open Weather Map API](http://openweathermap.org/api), using `scripts/outdoor-temps-owm.py`. (No signup required, rate limit not specified, but temperature data is only updated about every 15-30 minutes).
  - [Weather Underground API](http://www.wunderground.com/weather/api/d/pricing.html), using `scripts/outdoor-temps-wu.py`. This API requires a 'paid' account, but the free plan allows for 500 calls per day, up to 10/min. This would allow you to call the API via cron every 3 minutes, maximum. The data is more real-time, but you have to sign up for access and can't poll the service as often as OWM. You must set two environment variables, `WU_API_KEY` and `WU_LOCATION` (e.g. `MO/Saint_Louis`, to use this script.

It's customary to configure one of these outdoor temperature script via cron, so you can have it run once every minute, every 5 minutes, or on some more limited schedule than your other sensors, to ensure API limits aren't reached. (Plus, that's a lot of HTTP traffic for the poor Raspberry Pi!).

You can add a cron job to call this script and update the outdoor temperature by logging into your pi and editing the crontab (`crontab -e`). Add a line like the following:

    * * * * * python /home/pi/temperature-monitor/scripts/outdoor-temps-[type].py > /dev/null 2>&1

(`[type]` should be changed to whichever particular API you want to use.)

Notes:

  - Prior to logging outdoor temperatures, you should add a sensor and update the ID in `outdoor-temps.py` with this ID. See `dashboard`'s API documentation for more info.
  - If you are need to set WU API settings in your environment, you can create a file that exports the required variables in `~/.wu_api` (with your `PATH` set as well—see example in Nest API section below), then add `. /home/pi/.wu_api;` before the `python` call in the cron job.
  - If you need to diagnose cron issues, install `postfix` using `sudo apt-get install -y postfix`, and remove the ` > /dev/null 2>&1` from the end of the line in the cron job.

### Nest temperature logging via Nest API

There is another script, `nest-temps.py`, which requires you to have a Nest Developer account for API access. More information inside that script for now, but basically, once you're configured, get an access token then find your nest thermostat ID. Add the following to the file `~/.nest_api`:

    export PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin:$PATH
    export NEST_ACCESS_TOKEN=YOUR_TOKEN_HERE
    export NEST_THERMOSTAT_ID=YOUR_THERMOSTAT_ID

Then add a cron job like:

    */5 * * * * . /home/pi/.nest_api; python /home/pi/temperature-monitor/scripts/nest-temps.py > /dev/null 2>&1

Notes:

  - Nest's API documentation suggests "To avoid errors, we recommend you limit requests to one call per minute, maximum.", and since every call requires the Nest to wake up to return data to Nest's API servers, it's best to be more conservative with this cron job.
  - The cron job above first pulls in the configuration in `~/.nest_api`. It's simplest to just create a file like that in your home folder with the two required environment variables exported and a `PATH` so the `python` executable works.
  - If you need to diagnose cron issues, install `postfix` using `sudo apt-get install -y postfix`, and remove the ` > /dev/null 2>&1` from the end of the line in the cron job.

---

**TODO** - The rest of this guide will be updated once all the Express app's configuration has been moved into the ansible playbook for the Master Pi.

---

### `dashboard` - Express App/API for Displaying and Adding Data

  1. Install Node.js and NPM ([guide](http://weworkweplay.com/play/raspberry-pi-nodejs/)):
    1. `wget http://node-arm.herokuapp.com/node_latest_armhf.deb`
    2. `sudo dpkg -i node_latest_armhf.deb`
    3. (You may need to log out and log back in for Node.js to work correctly; confirm with `node -v`.)
  2. `cd` into `dashboard` directory.
  3. Install required dependencies with `npm install`.
  4. Run the app: `nohup ./bin/www > /dev/null 2>&1 &`
    1. To run in debug mode, with output on the command line: `DEBUG=node:* ./bin/www`

You can then view a dashboard at `http://[raspberry-pi-ip]:3000/` (where `[raspberry-pi-ip]` is the IP address or domain name of your Raspberry Pi).

#### `dashboard` API

The `dashboard` app has a simple REST API that allows you to add sensors to your dashboard, send temperature data directly to the dashboard from other devices, and retrieve sensor and temperature information.

More documentation may be added, but here's a list of the relevant API endpoints and example usage:

  - `/sensors`
    - `GET`: Returns a listing of all sensor data.
    - `POST`: Send a POST request with a `location` (maximum 255 characters) and `group` (maximum 32 characters) parameter, and it will respond with a new sensor ID.
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
