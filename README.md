# Simple Temperature Monitoring App

I've had an Arduino and Raspberry Pi sitting unused in a box for a couple years now. I decided to start playing around with temperature monitoring, to see if I could get some interesting data out of a bunch of cheap temperature sensors I bought.

I'll be experimenting with wired temperature probes, wireless (RF) probes, and maybe some other stuff while I'm at it.

For now, this project contains the following:

  - An Arduino sketch, `DS18x20_Temperature_Output.ino`, which contains the Sketch telling my Arduino to read the temperature on a probe on pin 2 every 30s and output the temperature as a float (e.g. `72.25`) in fahrenheit.
  - A python script, `temps.py`, which reads the Arduino's serial output and prints a datestamp + temperature to `temps.log` and to the command line whenever the Arduino sends output.

## Installation & Setup

### Arduino/Raspberry Pi

First of all, you'll need an Arduino, breadboard, DS18x20 temperature probe (with three wires), a breadboard, a resistor, some jumper wires (or a board to solder everything together, if you desire the permanence), and a USB cable to hook up the Arduino to a Raspberry Pi or some other computer.

For now, I'd recommend reading through the following guides for a step-by-step guide:

  - [How to measure temperature with your Arduino and a DS18B20](http://www.tweaking4all.com/hardware/arduino/arduino-ds18b20-temperature-sensor/)
  - [The Raspberry Pi and Wireless RF (XRF) Temperature Loggers](http://www.seanlandsman.com/2013/02/the-raspberry-pi-and-wireless-rf-xrf.html)

To run the Python script in the background, e.g. on a Raspberry Pi:

    nohup python temps.py > /dev/null 2>&1 &

### Express App for Displaying Data

  1. Install Node.js and NPM.
  2. `cd` into `node` directory.
  3. Install required dependencies with `npm install`.
  4. Run app in debug mode: `DEBUG=node:* ./bin/www`.

You can then view a dashboard at `http://localhost:3000/`.

This app is a work in progress for now...

## License

MIT

## Author

This project was created in 2015 by [Jeff Geerling](http://jeffgeerling.com/).
