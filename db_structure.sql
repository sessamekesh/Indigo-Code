-- phpMyAdmin SQL Dump
-- version 4.2.6deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 19, 2015 at 04:07 PM
-- Server version: 5.5.41-0ubuntu0.14.10.1
-- PHP Version: 5.5.12-2ubuntu4.2

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

--
-- Dumping data for table `Competition`
--

INSERT INTO `Competition` (`id`, `name`, `htmlfrag_data`, `is_private`, `start_date`, `end_date`) VALUES
(1, 'Test Upcoming Competition', '<b>This is a test upcoming competition</b>\r\n<p>There isn''t actually any data I''d like to share, and I plan on dropping this anyways.</p>\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce non malesuada eros. Cras sit amet nunc placerat, gravida nulla eget, tincidunt mauris. Proin in pharetra ligula. Maecenas odio dolor, hendrerit at lectus ut, pharetra aliquam ipsum. Proin nisi sapien, pulvinar vel mattis a, dictum vitae nisl. Donec laoreet tincidunt tincidunt. Maecenas consequat tempus egestas. Proin vel imperdiet nisi, ut ornare nibh. Donec tellus tellus, egestas vel ligula eu, placerat aliquet erat. Pellentesque aliquet vulputate augue ac varius. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sagittis eros purus, vel cursus erat bibendum non. Integer convallis gravida metus quis cursus. Vestibulum sollicitudin vestibulum orci, at fringilla metus auctor quis. Etiam condimentum risus nec ornare ullamcorper.\r\n\r\nNam dignissim, eros ac vehicula pharetra, diam mi varius nibh, vel facilisis neque diam a augue. Ut eu accumsan justo, imperdiet sagittis tellus. Duis sodales quam vitae augue scelerisque molestie. Sed luctus maximus enim eu semper. Nullam pellentesque turpis sit amet ante suscipit, sit amet ultrices velit convallis. Nunc sed nulla ut ex laoreet ornare sit amet eu mauris. Vivamus et ex id leo accumsan tristique eu sed urna. Ut posuere non erat vitae gravida. Phasellus mollis tincidunt sem, vel pellentesque felis molestie vitae. Sed accumsan cursus erat. Donec in mollis nunc. Integer sed turpis ut dui varius eleifend. Donec tempus quam vitae iaculis dignissim.</p>', b'0', '2015-03-02 00:00:00', '2015-03-02 15:00:00'),
(2, 'Test Ongoing Competition', '<b><i>This is a test ongoing competition></i></b>\r\n<p>There isn''t actually any data I''d like to share, and I plan on dropping this anyways.</p>\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce non malesuada eros. Cras sit amet nunc placerat, gravida nulla eget, tincidunt mauris. Proin in pharetra ligula. Maecenas odio dolor, hendrerit at lectus ut, pharetra aliquam ipsum. Proin nisi sapien, pulvinar vel mattis a, dictum vitae nisl. Donec laoreet tincidunt tincidunt. Maecenas consequat tempus egestas. Proin vel imperdiet nisi, ut ornare nibh. Donec tellus tellus, egestas vel ligula eu, placerat aliquet erat. Pellentesque aliquet vulputate augue ac varius. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sagittis eros purus, vel cursus erat bibendum non. Integer convallis gravida metus quis cursus. Vestibulum sollicitudin vestibulum orci, at fringilla metus auctor quis. Etiam condimentum risus nec ornare ullamcorper.\r\n\r\nNam dignissim, eros ac vehicula pharetra, diam mi varius nibh, vel facilisis neque diam a augue. Ut eu accumsan justo, imperdiet sagittis tellus. Duis sodales quam vitae augue scelerisque molestie. Sed luctus maximus enim eu semper. Nullam pellentesque turpis sit amet ante suscipit, sit amet ultrices velit convallis. Nunc sed nulla ut ex laoreet ornare sit amet eu mauris. Vivamus et ex id leo accumsan tristique eu sed urna. Ut posuere non erat vitae gravida. Phasellus mollis tincidunt sem, vel pellentesque felis molestie vitae. Sed accumsan cursus erat. Donec in mollis nunc. Integer sed turpis ut dui varius eleifend. Donec tempus quam vitae iaculis dignissim.</p>', b'0', '2015-02-13 00:00:00', '2015-03-01 08:18:10'),
(3, 'Test Just About To Start', '<h1>JUST ABOUT TO START</h1>\r\n<p>There isn''t actually any data I''d like to share, and I plan on dropping this anyways.</p>\r\n<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Fusce non malesuada eros. Cras sit amet nunc placerat, gravida nulla eget, tincidunt mauris. Proin in pharetra ligula. Maecenas odio dolor, hendrerit at lectus ut, pharetra aliquam ipsum. Proin nisi sapien, pulvinar vel mattis a, dictum vitae nisl. Donec laoreet tincidunt tincidunt. Maecenas consequat tempus egestas. Proin vel imperdiet nisi, ut ornare nibh. Donec tellus tellus, egestas vel ligula eu, placerat aliquet erat. Pellentesque aliquet vulputate augue ac varius. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nunc sagittis eros purus, vel cursus erat bibendum non. Integer convallis gravida metus quis cursus. Vestibulum sollicitudin vestibulum orci, at fringilla metus auctor quis. Etiam condimentum risus nec ornare ullamcorper.\r\n\r\nNam dignissim, eros ac vehicula pharetra, diam mi varius nibh, vel facilisis neque diam a augue. Ut eu accumsan justo, imperdiet sagittis tellus. Duis sodales quam vitae augue scelerisque molestie. Sed luctus maximus enim eu semper. Nullam pellentesque turpis sit amet ante suscipit, sit amet ultrices velit convallis. Nunc sed nulla ut ex laoreet ornare sit amet eu mauris. Vivamus et ex id leo accumsan tristique eu sed urna. Ut posuere non erat vitae gravida. Phasellus mollis tincidunt sem, vel pellentesque felis molestie vitae. Sed accumsan cursus erat. Donec in mollis nunc. Integer sed turpis ut dui varius eleifend. Donec tempus quam vitae iaculis dignissim.</p>', b'0', '2015-02-13 16:48:00', '2015-02-13 18:00:00');

-- --------------------------------------------------------

--
-- Table structure for table `ContentType`
--

CREATE TABLE IF NOT EXISTS `ContentType` (
`id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type` varchar(55) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `ContentType`
--

INSERT INTO `ContentType` (`id`, `name`, `content_type`) VALUES
(1, 'HTML', 'text/html'),
(2, 'Plain Text', 'text/plain'),
(3, 'Source Code', 'text/plain'),
(4, 'PDF File', 'application/pdf'),
(5, 'PNG', 'image/png');

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `Language`
--

INSERT INTO `Language` (`id`, `name`, `subsys_name`) VALUES
(1, 'C++98 (g++)', 'cpp98'),
(2, 'Python 2.8', 'python');

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `Problem`
--

INSERT INTO `Problem` (`id`, `name`, `competition_id`, `description_file_path`, `description_file_type`) VALUES
(2, 'Answer', 1, 'Answer.pdf', 4),
(3, 'Fibonacci', 2, 'Fibonacci.pdf', 4);

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
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=11 ;

--
-- Dumping data for table `User`
--

INSERT INTO `User` (`id`, `user_name`, `name`, `is_admin`, `pass_hash`, `tagline`) VALUES
(8, 'sessamekesh', 'Kamaron Peterson', b'1', '$2a$14$LrecjSJbTQaMc0dKnlS.U.1utB02xZ4ti0q0gJoVMiVwpWMdmJcly', 'F!R5T P05T!!'),
(9, 'bluefood2010', 'KAMARON J PETERSON', b'0', '$2a$10$4rO3yldH8jfHaXWsdfia/u3q5j51X4EcMADjBldQL9CnpQPdWazei', 'I''m not an admin... :('),
(10, 'sam', 'sam', b'0', '$2a$10$xnWk7XsG6JpHkaJXcGJocOIKpmSOUSw.K3quZGOXLaB919LRrwYUK', 'samtest');

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
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `Hint`
--
ALTER TABLE `Hint`
MODIFY `hint_id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Language`
--
ALTER TABLE `Language`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `Problem`
--
ALTER TABLE `Problem`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
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
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=11;
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
ADD CONSTRAINT `Problem_ibfk_1` FOREIGN KEY (`competition_id`) REFERENCES `Competition` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `Problem_ibfk_2` FOREIGN KEY (`description_file_type`) REFERENCES `ContentType` (`id`);

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
