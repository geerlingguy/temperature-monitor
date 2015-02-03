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
logfile = "./temps.log"

# Open the logfile for appending (create if necessary), flush immediately.
log = open(logfile, "a+", 0)

# Function to read a line, write it to the file, and print it to the screen.
def read(serial):
    temp = serial.readline()
    date = datetime.utcnow()
    time = calendar.timegm(d.utctimetuple())

    # Log data to file.
    line = "{0}, {1}\n".format(date, temp.rstrip())
    log.write(line)

    # Log data to database.
    try:
        cursor.execute("""INSERT INTO temps VALUES (NULL,1,%s,%s)""", (temp,time))
        db.commit()
    except:
        db.rollback()
    print line,

# Connect to the Arduino's serial port.
ser = serial.Serial(modem, 9600)

# Read each line as it's output.
while True:
    read(ser)

# Close resource handles when we're finished logging data.
log.close();
db.close();
