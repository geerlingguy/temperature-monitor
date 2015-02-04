# Simple Temperature Monitoring App

<img src="https://raw.githubusercontent.com/geerlingguy/temperature-monitor/master/dashboard/screenshot.jpg" alt="Temperature Monitoring Dashboard" />

I've had an Arduino and Raspberry Pi sitting unused in a box for a couple years now. I decided to start playing around with temperature monitoring, to see if I could get some interesting data out of a bunch of cheap temperature sensors I bought.

I'll be experimenting with wired temperature probes, wireless (RF) probes, and maybe some other stuff while I'm at it.

For now, this project contains the following:

  - An Arduino sketch, `DS18x20_Temperature_Output.ino`, which contains the Sketch telling my Arduino to read the temperature on a probe on pin 2 every 30s and output the temperature as a float (e.g. `72.25`) in fahrenheit.
  - A python script, `temps.py`, which reads the Arduino's serial output and prints a datestamp + temperature to `temps.log` and to the command line whenever the Arduino sends output.

## Installation & Setup

### Vagrant quickstart for testing/hacking

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

You need to have MySQL server installed and available (future versions of this project will configure everything for you... but for now, just get it going and either use the root account (not recommended) or set up a new user with access to the database defined by `schema.sql`).

### Python App for Logging Data

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
  5. Start the Python script: `nohup python logger/temps.py > /dev/null 2>&1 &`

### Express App for Displaying Data

  1. Install Node.js and NPM.
  2. `cd` into `dashboard` directory.
  3. Install required dependencies with `npm install`.
  4. Run the app:
    - Debug mode: `DEBUG=node:* ./bin/www`
    - Production: `./bin/www`

You can then view a dashboard at `http://localhost:3000/`.

This app is a work in progress for now...

## License

MIT

## Author

This project was created in 2015 by [Jeff Geerling](http://jeffgeerling.com/).
