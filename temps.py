# Temperature logging script.
# @author Jeff Geerling, 2015.

import serial
from time import strftime

# Variables.
modem = "/dev/ttyACM0" # Default for a Arduino Uno on Raspberry Pi USB.
logfile = "./temps.log"

# Open the logfile for appending (create if necessary), flush immediately.
log = open(logfile, "a+", 0)

# Function to read a line, write it to the file, and print it to the screen.
def read(serial):
    temp = serial.readline()
    date = strftime("%m-%d-%y %H:%M:%S")
    line = "{0}, {1}\n".format(date, temp.rstrip())
    log.write(line)
    print line,

# Connect to the Arduino's serial port.
ser = serial.Serial(modem, 9600)

# Read each line as it's output.
while True:
    read(ser)

# Close the file when we're finished writing.
log.close();
