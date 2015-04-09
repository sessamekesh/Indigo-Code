-- phpMyAdmin SQL Dump
-- version 4.2.6deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Apr 08, 2015 at 07:20 PM
-- Server version: 5.5.41-0ubuntu0.14.10.1
-- PHP Version: 5.5.12-2ubuntu4.3

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `zora`
--
CREATE DATABASE IF NOT EXISTS `zora` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `zora`;

-- --------------------------------------------------------

--
-- Table structure for table `ComparisonProgram`
--

DROP TABLE IF EXISTS `ComparisonProgram`;
CREATE TABLE IF NOT EXISTS `ComparisonProgram` (
`id` int(11) NOT NULL,
  `name` varchar(127) NOT NULL,
  `description` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Competition`
--

DROP TABLE IF EXISTS `Competition`;
CREATE TABLE IF NOT EXISTS `Competition` (
`id` int(11) NOT NULL,
  `name` varchar(127) NOT NULL,
  `start_date` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `end_date` timestamp NOT NULL DEFAULT '0000-00-00 00:00:00',
  `time_penalty` int(11) NOT NULL,
  `max_team_size` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `Language`
--

DROP TABLE IF EXISTS `Language`;
CREATE TABLE IF NOT EXISTS `Language` (
`id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `subsys_name` varchar(50) NOT NULL,
  `documentation_url` varchar(350) NOT NULL,
  `notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Problem`
--

DROP TABLE IF EXISTS `Problem`;
CREATE TABLE IF NOT EXISTS `Problem` (
`id` int(11) NOT NULL,
  `comp_id` int(11) NOT NULL,
  `time_limit` int(11) NOT NULL,
  `name` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Sponsor`
--

DROP TABLE IF EXISTS `Sponsor`;
CREATE TABLE IF NOT EXISTS `Sponsor` (
`id` int(11) NOT NULL,
  `comp_id` int(11) NOT NULL,
  `sponsor_name` varchar(127) NOT NULL,
  `sponsor_notes` varchar(555) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Submission`
--

DROP TABLE IF EXISTS `Submission`;
CREATE TABLE IF NOT EXISTS `Submission` (
`id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `prob_id` int(11) NOT NULL,
  `lang_id` int(11) NOT NULL,
  `res_id` int(11) NOT NULL,
  `time` datetime NOT NULL,
  `notes` varchar(255) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `SubmissionResult`
--

DROP TABLE IF EXISTS `SubmissionResult`;
CREATE TABLE IF NOT EXISTS `SubmissionResult` (
`id` int(11) NOT NULL,
  `name` varchar(5) NOT NULL,
  `penalize` bit(1) NOT NULL,
  `description` varchar(127) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Team`
--

DROP TABLE IF EXISTS `Team`;
CREATE TABLE IF NOT EXISTS `Team` (
`id` int(11) NOT NULL,
  `comp_id` int(11) NOT NULL,
  `team_name` varchar(127) NOT NULL,
  `tagline` varchar(255) NOT NULL,
  `notes` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `TestCase`
--

DROP TABLE IF EXISTS `TestCase`;
CREATE TABLE IF NOT EXISTS `TestCase` (
`id` int(11) NOT NULL,
  `prob_id` int(11) NOT NULL,
  `comp_prog_id` int(11) NOT NULL,
  `hint` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `TimeLimit`
--

DROP TABLE IF EXISTS `TimeLimit`;
CREATE TABLE IF NOT EXISTS `TimeLimit` (
`id` int(11) NOT NULL,
  `prob_id` int(11) NOT NULL,
  `lang_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

DROP TABLE IF EXISTS `User`;
CREATE TABLE IF NOT EXISTS `User` (
`id` int(11) NOT NULL,
  `name` varchar(60) NOT NULL,
  `user_name` varchar(60) NOT NULL,
  `email_address` varchar(127) NOT NULL,
  `is_admin` bit(1) NOT NULL,
  `pass_hash` varchar(125) NOT NULL,
  `user_type` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- Table structure for table `UserTeam`
--

DROP TABLE IF EXISTS `UserTeam`;
CREATE TABLE IF NOT EXISTS `UserTeam` (
  `id` int(11) NOT NULL,
  `team_id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Table structure for table `UserType`
--

DROP TABLE IF EXISTS `UserType`;
CREATE TABLE IF NOT EXISTS `UserType` (
`id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=5 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ComparisonProgram`
--
ALTER TABLE `ComparisonProgram`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `Competition`
--
ALTER TABLE `Competition`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `Language`
--
ALTER TABLE `Language`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Problem`
--
ALTER TABLE `Problem`
 ADD PRIMARY KEY (`id`), ADD KEY `comp_id` (`comp_id`);

--
-- Indexes for table `Sponsor`
--
ALTER TABLE `Sponsor`
 ADD PRIMARY KEY (`id`), ADD KEY `comp_id` (`comp_id`);

--
-- Indexes for table `Submission`
--
ALTER TABLE `Submission`
 ADD PRIMARY KEY (`id`), ADD KEY `team_id` (`team_id`), ADD KEY `prob_id` (`prob_id`), ADD KEY `lang_id` (`lang_id`), ADD KEY `res_id` (`res_id`);

--
-- Indexes for table `SubmissionResult`
--
ALTER TABLE `SubmissionResult`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Team`
--
ALTER TABLE `Team`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `team_name` (`team_name`), ADD KEY `comp_id` (`comp_id`);

--
-- Indexes for table `TestCase`
--
ALTER TABLE `TestCase`
 ADD PRIMARY KEY (`id`), ADD KEY `prob_id` (`prob_id`), ADD KEY `comp_prog_id` (`comp_prog_id`);

--
-- Indexes for table `TimeLimit`
--
ALTER TABLE `TimeLimit`
 ADD PRIMARY KEY (`id`), ADD KEY `prob_id` (`prob_id`), ADD KEY `lang_id` (`lang_id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `user_name` (`user_name`), ADD KEY `user_type` (`user_type`);

--
-- Indexes for table `UserTeam`
--
ALTER TABLE `UserTeam`
 ADD PRIMARY KEY (`id`), ADD KEY `user_id` (`user_id`), ADD KEY `team_id` (`team_id`);

--
-- Indexes for table `UserType`
--
ALTER TABLE `UserType`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `name` (`name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ComparisonProgram`
--
ALTER TABLE `ComparisonProgram`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Competition`
--
ALTER TABLE `Competition`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
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
-- AUTO_INCREMENT for table `Sponsor`
--
ALTER TABLE `Sponsor`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Submission`
--
ALTER TABLE `Submission`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `SubmissionResult`
--
ALTER TABLE `SubmissionResult`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Team`
--
ALTER TABLE `Team`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `TestCase`
--
ALTER TABLE `TestCase`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `TimeLimit`
--
ALTER TABLE `TimeLimit`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
--
-- AUTO_INCREMENT for table `UserType`
--
ALTER TABLE `UserType`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=5;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Problem`
--
ALTER TABLE `Problem`
ADD CONSTRAINT `Problem_ibfk_1` FOREIGN KEY (`comp_id`) REFERENCES `Competition` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `Sponsor`
--
ALTER TABLE `Sponsor`
ADD CONSTRAINT `Sponsor_ibfk_1` FOREIGN KEY (`comp_id`) REFERENCES `Competition` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `Submission`
--
ALTER TABLE `Submission`
ADD CONSTRAINT `Submission_ibfk_1` FOREIGN KEY (`team_id`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `Submission_ibfk_2` FOREIGN KEY (`prob_id`) REFERENCES `Problem` (`id`) ON UPDATE CASCADE,
ADD CONSTRAINT `Submission_ibfk_3` FOREIGN KEY (`lang_id`) REFERENCES `Language` (`id`) ON UPDATE CASCADE,
ADD CONSTRAINT `Submission_ibfk_4` FOREIGN KEY (`res_id`) REFERENCES `SubmissionResult` (`id`) ON UPDATE CASCADE;

--
-- Constraints for table `Team`
--
ALTER TABLE `Team`
ADD CONSTRAINT `Team_ibfk_1` FOREIGN KEY (`comp_id`) REFERENCES `Competition` (`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

--
-- Constraints for table `TestCase`
--
ALTER TABLE `TestCase`
ADD CONSTRAINT `TestCase_ibfk_1` FOREIGN KEY (`prob_id`) REFERENCES `Problem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `TestCase_ibfk_2` FOREIGN KEY (`comp_prog_id`) REFERENCES `ComparisonProgram` (`id`);

--
-- Constraints for table `TimeLimit`
--
ALTER TABLE `TimeLimit`
ADD CONSTRAINT `TimeLimit_ibfk_1` FOREIGN KEY (`prob_id`) REFERENCES `Problem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `TimeLimit_ibfk_2` FOREIGN KEY (`lang_id`) REFERENCES `Language` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `User`
--
ALTER TABLE `User`
ADD CONSTRAINT `User_ibfk_1` FOREIGN KEY (`user_type`) REFERENCES `UserType` (`id`);

--
-- Constraints for table `UserTeam`
--
ALTER TABLE `UserTeam`
ADD CONSTRAINT `UserTeam_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `UserTeam_ibfk_2` FOREIGN KEY (`team_id`) REFERENCES `Team` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
