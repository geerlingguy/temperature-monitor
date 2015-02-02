CREATE DATABASE IF NOT EXISTS `temperature_log`;
USE `temperature_log`;
CREATE TABLE IF NOT EXISTS `sensors` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `location` VARCHAR(128),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB;
CREATE TABLE IF NOT EXISTS `temps` (
  `id` int UNSIGNED NOT NULL AUTO_INCREMENT,
  `sensor` int UNSIGNED NOT NULL,
  `temp` DECIMAL(5,2) NOT NULL,
  time int UNSIGNED NOT NULL,
  PRIMARY KEY (`id`),
  INDEX (`sensor`)
) ENGINE=InnoDB;
