-- phpMyAdmin SQL Dump
-- version 4.2.6deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 03, 2015 at 03:00 PM
-- Server version: 5.5.41-0ubuntu0.14.10.1
-- PHP Version: 5.5.12-2ubuntu4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `goron`
--
CREATE DATABASE IF NOT EXISTS `goron` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `goron`;

-- --------------------------------------------------------

--
-- Table structure for table `Competition`
--

DROP TABLE IF EXISTS `Competition`;
CREATE TABLE IF NOT EXISTS `Competition` (
`id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `is_private` bit(1) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Language`
--

DROP TABLE IF EXISTS `Language`;
CREATE TABLE IF NOT EXISTS `Language` (
`id` int(11) NOT NULL,
  `name` varchar(28) NOT NULL,
  `subsys_name` varchar(28) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Problem`
--

DROP TABLE IF EXISTS `Problem`;
CREATE TABLE IF NOT EXISTS `Problem` (
`id` int(11) NOT NULL,
  `name` varchar(55) NOT NULL,
  `competition_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Score`
--

DROP TABLE IF EXISTS `Score`;
CREATE TABLE IF NOT EXISTS `Score` (
`id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `score` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Submission`
--

DROP TABLE IF EXISTS `Submission`;
CREATE TABLE IF NOT EXISTS `Submission` (
`id` int(11) NOT NULL,
  `lang_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `result` varchar(3) NOT NULL,
  `source_code` varchar(30000) NOT NULL,
  `submission_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `notes` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
CREATE TABLE IF NOT EXISTS `User` (
`id` int(11) NOT NULL,
  `user_name` varchar(25) NOT NULL,
  `name` varchar(55) NOT NULL,
  `is_admin` bit(1) NOT NULL DEFAULT b'0',
  `pass_hash` varchar(80) NOT NULL,
  `tagline` varchar(125) NOT NULL DEFAULT 'Too cool for a tagline'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Competition`
--
ALTER TABLE `Competition`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Language`
--
ALTER TABLE `Language`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Problem`
--
ALTER TABLE `Problem`
 ADD PRIMARY KEY (`id`), ADD KEY `competition_id` (`competition_id`);

--
-- Indexes for table `Score`
--
ALTER TABLE `Score`
 ADD PRIMARY KEY (`id`), ADD KEY `problem_id` (`problem_id`), ADD KEY `user_id` (`user_id`);

--
-- Indexes for table `Submission`
--
ALTER TABLE `Submission`
 ADD PRIMARY KEY (`id`), ADD KEY `problem_id` (`problem_id`), ADD KEY `user_id` (`user_id`), ADD KEY `lang_id` (`lang_id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `user_name` (`user_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Competition`
--
ALTER TABLE `Competition`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Language`
--
ALTER TABLE `Language`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Problem`
--
ALTER TABLE `Problem`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Score`
--
ALTER TABLE `Score`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Submission`
--
ALTER TABLE `Submission`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Problem`
--
ALTER TABLE `Problem`
ADD CONSTRAINT `Problem_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `Competition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Score`
--
ALTER TABLE `Score`
ADD CONSTRAINT `Score_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `Problem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `Score_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Submission`
--
ALTER TABLE `Submission`
ADD CONSTRAINT `Submission_ibfk_1` FOREIGN KEY (`lang_id`) REFERENCES `Language` (`id`),
ADD CONSTRAINT `Submission_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `Problem` (`id`),
ADD CONSTRAINT `Submission_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
