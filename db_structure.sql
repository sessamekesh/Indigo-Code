-- phpMyAdmin SQL Dump
-- version 4.2.6deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 17, 2015 at 10:56 PM
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

-- --------------------------------------------------------

--
-- Table structure for table `ComparisonPrograms`
--

CREATE TABLE IF NOT EXISTS `ComparisonPrograms` (
`id` int(11) NOT NULL,
  `name` varchar(55) NOT NULL,
  `description` varchar(2000) NOT NULL,
  `file_path` varchar(127) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Competition`
--

CREATE TABLE IF NOT EXISTS `Competition` (
`id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `htmlfrag_data` varchar(3000) NOT NULL,
  `is_private` bit(1) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

-- --------------------------------------------------------

--
-- Table structure for table `ContentType`
--

CREATE TABLE IF NOT EXISTS `ContentType` (
`id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type` varchar(55) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Hint`
--

CREATE TABLE IF NOT EXISTS `Hint` (
`hint_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `test_case_id` int(11) DEFAULT NULL,
  `hint_text` varchar(800) NOT NULL,
  `is_active` bit(1) NOT NULL DEFAULT b'0',
  `minimum_attempts` int(11) NOT NULL DEFAULT '1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Language`
--

CREATE TABLE IF NOT EXISTS `Language` (
`id` int(11) NOT NULL,
  `name` varchar(28) NOT NULL,
  `subsys_name` varchar(28) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Problem`
--

CREATE TABLE IF NOT EXISTS `Problem` (
`id` int(11) NOT NULL,
  `name` varchar(55) NOT NULL,
  `competition_id` int(11) NOT NULL,
  `description_file_path` varchar(127) NOT NULL,
  `description_file_type` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=2 ;

-- --------------------------------------------------------

--
-- Table structure for table `Score`
--

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
-- Table structure for table `TestCase`
--

CREATE TABLE IF NOT EXISTS `TestCase` (
`id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `input_file_path` varchar(127) NOT NULL,
  `expected_output_file_path` varchar(127) NOT NULL,
  `comparison_program_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `User`
--

CREATE TABLE IF NOT EXISTS `User` (
`id` int(11) NOT NULL,
  `user_name` varchar(25) NOT NULL,
  `name` varchar(55) NOT NULL,
  `is_admin` bit(1) NOT NULL DEFAULT b'0',
  `pass_hash` varchar(80) NOT NULL,
  `tagline` varchar(125) NOT NULL DEFAULT 'Too cool for a tagline'
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=10 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `ComparisonPrograms`
--
ALTER TABLE `ComparisonPrograms`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Competition`
--
ALTER TABLE `Competition`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ContentType`
--
ALTER TABLE `ContentType`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Hint`
--
ALTER TABLE `Hint`
 ADD PRIMARY KEY (`hint_id`), ADD KEY `problem_id` (`problem_id`), ADD KEY `test_case_id` (`test_case_id`);

--
-- Indexes for table `Language`
--
ALTER TABLE `Language`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Problem`
--
ALTER TABLE `Problem`
 ADD PRIMARY KEY (`id`), ADD KEY `competition_id` (`competition_id`), ADD KEY `description_file_type` (`description_file_type`);

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
-- Indexes for table `TestCase`
--
ALTER TABLE `TestCase`
 ADD PRIMARY KEY (`id`), ADD KEY `problem_id` (`problem_id`), ADD KEY `comparison_program_id` (`comparison_program_id`);

--
-- Indexes for table `User`
--
ALTER TABLE `User`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `user_name` (`user_name`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `ComparisonPrograms`
--
ALTER TABLE `ComparisonPrograms`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Competition`
--
ALTER TABLE `Competition`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `ContentType`
--
ALTER TABLE `ContentType`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Hint`
--
ALTER TABLE `Hint`
MODIFY `hint_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Language`
--
ALTER TABLE `Language`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Problem`
--
ALTER TABLE `Problem`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=2;
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
-- AUTO_INCREMENT for table `TestCase`
--
ALTER TABLE `TestCase`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `User`
--
ALTER TABLE `User`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=10;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `Hint`
--
ALTER TABLE `Hint`
ADD CONSTRAINT `Hint_ibfk_1` FOREIGN KEY (`test_case_id`) REFERENCES `TestCase` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Problem`
--
ALTER TABLE `Problem`
ADD CONSTRAINT `Problem_ibfk_2` FOREIGN KEY (`description_file_type`) REFERENCES `ContentType` (`id`),
ADD CONSTRAINT `Problem_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `Competition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Score`
--
ALTER TABLE `Score`
ADD CONSTRAINT `Score_ibfk_1` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `Score_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `Problem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Submission`
--
ALTER TABLE `Submission`
ADD CONSTRAINT `Submission_ibfk_1` FOREIGN KEY (`lang_id`) REFERENCES `Language` (`id`),
ADD CONSTRAINT `Submission_ibfk_2` FOREIGN KEY (`problem_id`) REFERENCES `Problem` (`id`),
ADD CONSTRAINT `Submission_ibfk_3` FOREIGN KEY (`user_id`) REFERENCES `User` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `TestCase`
--
ALTER TABLE `TestCase`
ADD CONSTRAINT `TestCase_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `Problem` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `TestCase_ibfk_2` FOREIGN KEY (`comparison_program_id`) REFERENCES `ComparisonPrograms` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
