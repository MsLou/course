/*
Navicat MySQL Data Transfer

Source Server         : localhost_3306
Source Server Version : 50640
Source Host           : localhost:3306
Source Database       : test

Target Server Type    : MYSQL
Target Server Version : 50640
File Encoding         : 65001

Date: 2019-01-20 16:56:13
*/

SET FOREIGN_KEY_CHECKS=0;

-- ----------------------------
-- Table structure for banner
-- ----------------------------
DROP TABLE IF EXISTS `banner`;
CREATE TABLE `banner` (
  `url` varchar(255) DEFAULT NULL,
  `sort` int(11) DEFAULT NULL,
  `text` varchar(1000) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;


INSERT INTO banner VALUES ('', '0', '1');
INSERT INTO banner VALUES ('', '1', '2');
INSERT INTO banner VALUES ('', '2', '3');
INSERT INTO banner VALUES ('', '3', '4');
INSERT INTO banner VALUES ('', '4', '5');
INSERT INTO banner VALUES ('', '5', '6');