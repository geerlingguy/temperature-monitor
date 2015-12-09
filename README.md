# Simple Temperature Monitoring App

<img src="https://raw.githubusercontent.com/geerlingguy/temperature-monitor/master/dashboard/screenshot.png" alt="Temperature Monitoring Dashboard" />

I've created this project to power a network of temperature and environmental monitors in my home.

The architecture uses one 'master' Pi to aggregate and display log data, and many 'remotes' place around a house to send log data back to the 'master'.

I recommend a Pi model 2 B for the master (since it's running a heavier-weight Node.js-based application, but you can use any Pi for the remotes. I use the A+ or Zero for remotes since they're cheap and use minimal power when running headless.

Each Pi should already have:

  - Raspbian running on the microSD card, with `raspi-config` setup already completed.
  - Networking configured (either wired LAN or WiFi via USB).

This is a living project, so a lot of things will change while I experiment with making my monitoring more robust, more fully-featured, and eventually, more integrated with my smart thermostat and other environmental controls.


## Vagrant quickstart for hacking

Set up the virtual machine:

  1. Install Vagrant, VirtualBox and Ansible.
  2. `cd` into each of the directories inside `playbooks` and run `ansible-galaxy install -r requirements.txt`.
  3. `cd` back into this directory and run `vagrant up`.


## Overall Setup

Before anything else, you need to install Ansible, then do the following:

  1. Copy `example.config.yml` to `config.yml`, and `inventory-example` to `inventory`, and update the values inside to match your desired environment and Pi IP addresses.
  2. Run `ansible-galaxy install -r requirements.txt` inside the `playbooks` directory to install the required Ansible roles.


## Raspberry Pi Master Setup (Data Logger & Dashboard App)

An Ansible playbook builds the master logger and dashboard Pi, installing all the requirements for the Node.js-based data logger and dashboard app for viewing temperature data.

Run the Ansible playbook to configure the master Pi and start the dashboard app: `ansible-playbook -i config/inventory playbooks/master/main.yml`


## Raspberry Pi Remote(s) Setup (Temperature Monitors)

An Ansible playbook builds the remote temperature monitoring Pi(s), installing all the requirements for the Python-based temperature data collection scripts. It also starts the script and begins sending temperature data to the Master Pi.

Before running the Ansible playbook to configure the remote(s), add a file named after the hostname or IP address of each remote Raspberry Pi inside `config/host_vars` (e.g. if the Pi's IP is 10.0.1.34, then add a host_vars file named `10.0.1.34` and put overrides inside, like the `local_sensor_id` for that Pi).

Run the Ansible playbook to configure the remote Pi(s): `ansible-playbook -i config/inventory playbooks/remote-monitor/main.yml`


## `scripts` - Python Scripts for Logging Data

The `scripts` directory contains a variety of temperature logging scripts, written in Python, to assist with logging temperatures from DS18B20 1-Wire temperature sensors (connected via Raspberry Pi GPIO ports), external weather APIs, and even the Nest learning thermostat.

### Connecting the Raspberry Pi to the DS18B20

**Connect the DS18B20 to your Pi**

You can use a breadboard, a shield, a GPIO ribbon cable, or whatever, but you basically need to connect the following (this is using the waterproof sensor—follow diagrams found elsewhere for the small transistor-sized chip):

  - 3V3 - Red wire
  - Ground - Black wire
  - GPIO 4 - Yellow wire (with 4.7K pull-up resistor between this and 3V3).

The 3V3 and Ground wire can be connected to any 3.3V or Ground pin, respectively (follow [this great Raspberry Pi pinout diagram](http://pi.gadgetoid.com/pinout) for your model of Pi), but by default, the 1-Wire library uses GPIO pin 4, which is the 7th physical pin on a B+/A+/B rev 2.

Edit `/boot/config.txt` and add the configuration line `dtoverlay=w1-gpio`, then reboot the Raspberry Pi (note that this configuration is done for you when you run the `remote-monitor` playbook).

To test whether the DS18B20 is working, you can `cd` into `/sys/bus/w1/devices`. `ls` the contents, and you should see a directory like `28-xxxxxxx`, one directory per connected sensor. `cd` into that directory, then `cat w1_slave`, and you should see some output, with a value like `t=23750` at the end. This is the temperature value. Divide by 1,000 and you have the value in °C.

### Outdoor temperature logging via Weather APIs

There are multiple scripts for reading current local temperatures via online weather APIs:

  - [Open Weather Map API](http://openweathermap.org/api), using `scripts/outdoor-temps-owm.py`. (No signup required, rate limit not specified, but temperature data is only updated about every 15-30 minutes).
  - [Weather Underground API](http://www.wunderground.com/weather/api/d/pricing.html), using `scripts/outdoor-temps-wu.py`. This API requires a 'paid' account, but the free plan allows for 500 calls per day, up to 10/min. This would allow you to call the API via cron every 3 minutes, maximum. The data is more real-time, but you have to sign up for access and can't poll the service as often as OWM. You must set two environment variables, `WU_API_KEY` and `WU_LOCATION` (e.g. `MO/Saint_Louis`, to use this script.

The Ansible playbook for the `master` Pi will automatically configure a cron job to get data from the Weather Underground API every minute if you have an API key configured in `config/config.yml`.

Notes:

  - Prior to logging outdoor temperatures, you should add a sensor within the Dashboard app and set the id inside `config/config.yml`. See `dashboard`'s API documentation for more info.
  - If you need to diagnose cron issues, install `postfix` using `sudo apt-get install -y postfix`, and remove the ` > /dev/null 2>&1` from the end of the line in the cron job.

### Nest temperature logging via Nest API

There is another script, `nest-temps.py`, which requires you to have a Nest Developer account for API access. More information inside that script for now, but basically, once you're configured, get an access token then find your Nest thermostat ID.

The Ansible playbook for the `master` Pi will automatically configure a cron job to get data from the Nest Developer API every 5 minutes if you have an API key configured in `config/config.yml`.

Notes:

  - Nest's API documentation suggests "To avoid errors, we recommend you limit requests to one call per minute, maximum.", and since every call requires the Nest to wake up to return data to Nest's API servers, the default setting calls the API only once every 5 minutes.
  - If you need to diagnose cron issues, install `postfix` using `sudo apt-get install -y postfix`, and remove the ` > /dev/null 2>&1` from the end of the line in the cron job.


## `dashboard` - Express App/API for Displaying and Adding Data

Once the master Pi is set up, you can view the dashboard app at `http://[raspberry-pi-ip]:3000/` (where `[raspberry-pi-ip]` is the IP address or domain name of your Raspberry Pi).

### `dashboard` API

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
