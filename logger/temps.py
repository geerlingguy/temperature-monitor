# Temperature logging script.
# @author Jeff Geerling, 2015.

import serial
import MySQLdb
from datetime import datetime
import calendar

# Connect to the MySQL database.
db = MySQLdb.connect(host="localhost", user="root", passwd="root", db="temperature_log")
cursor = db.cursor()

# Variables.
modem = "/dev/ttyACM0" # Default for a Arduino Uno on Raspberry Pi USB.

# Function to read a line, write it to database, and print it to the screen.
def read(serial):
    temp = serial.readline()
    date = datetime.utcnow()
    time = calendar.timegm(date.utctimetuple())

    # Log data to database.
    try:
        cursor.execute("""INSERT INTO temps VALUES (NULL,1,%s,%s)""", (temp,time))
        db.commit()
    except:
        db.rollback()

    # Log data to command line.
    print "{0}, {1}".format(date, temp.rstrip())

# Connect to the Arduino's serial port.
ser = serial.Serial(modem, baudrate=9600, bytesize=8, parity='N', stopbits=1)

# Read each line as it's output.
while True:
    read(ser)

# Close resource handles when we're finished logging data.
db.close();
