CREATE DATABASE temperature_log;
USE temperature_log;
CREATE TABLE `sensors` (
  `id` int NOT NULL,
  `location` VARCHAR(128),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
CREATE TABLE `temps` (
  `id` int NOT NULL,
  `sensor` int NOT NULL,
  `temp` DECIMAL(5,2),
  time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX (`sensor`)
) ENGINE=InnoDB;
