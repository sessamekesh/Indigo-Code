-- phpMyAdmin SQL Dump
-- version 4.2.6deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Feb 01, 2015 at 03:30 PM
-- Server version: 5.5.41-0ubuntu0.14.10.1
-- PHP Version: 5.5.12-2ubuntu4.1

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `kokiri`
--

-- --------------------------------------------------------

--
-- Table structure for table `Competitions`
--

CREATE TABLE IF NOT EXISTS `Competitions` (
`id` int(11) NOT NULL,
  `name` varchar(127) NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `is_private` bit(1) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `Competitions`
--

INSERT INTO `Competitions` (`id`, `name`, `start_date`, `end_date`, `is_private`) VALUES
(1, 'Public Ongoing Competition', '2015-01-28 00:00:00', '2015-05-22 00:00:00', b'0'),
(2, 'Public Upcoming Competition', '2015-03-13 00:00:00', '2015-06-19 00:00:00', b'0');

-- --------------------------------------------------------

--
-- Table structure for table `Languages`
--

CREATE TABLE IF NOT EXISTS `Languages` (
`id` int(11) NOT NULL,
  `lang_name` varchar(55) NOT NULL,
  `lang_command` varchar(127) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=3 ;

--
-- Dumping data for table `Languages`
--

INSERT INTO `Languages` (`id`, `lang_name`, `lang_command`) VALUES
(1, 'C++11 (g++)', 'g++ -std=c++11 "$SRC" -o "$OUT"\r\ncat "$INFILE" | ./"$OUT" > "$OUTFILE"'),
(2, 'Python 2.8', 'python "$SRC" < "$INFILE" > "$OUTFILE"');

-- --------------------------------------------------------

--
-- Table structure for table `ProblemLanguages`
--

CREATE TABLE IF NOT EXISTS `ProblemLanguages` (
`id` int(11) NOT NULL,
  `language_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=6 ;

--
-- Dumping data for table `ProblemLanguages`
--

INSERT INTO `ProblemLanguages` (`id`, `language_id`, `problem_id`) VALUES
(1, 1, 1),
(3, 1, 3),
(4, 2, 3),
(5, 2, 1);

-- --------------------------------------------------------

--
-- Table structure for table `Problems`
--

CREATE TABLE IF NOT EXISTS `Problems` (
`id` int(11) NOT NULL,
  `name` varchar(127) NOT NULL,
  `description_link` varchar(127) NOT NULL,
  `competition_id` int(11) NOT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=4 ;

--
-- Dumping data for table `Problems`
--

INSERT INTO `Problems` (`id`, `name`, `description_link`, `competition_id`) VALUES
(1, 'Answer', '', 1),
(3, 'Fibonacci', '', 1);

-- --------------------------------------------------------

--
-- Table structure for table `ProblemSubmissions`
--

CREATE TABLE IF NOT EXISTS `ProblemSubmissions` (
`id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `result` varchar(20) NOT NULL,
  `notes` varchar(255) DEFAULT NULL,
  `user_id` int(11) NOT NULL,
  `lang_id` int(11) NOT NULL,
  `source_code` varchar(7500) NOT NULL,
  `submission_time` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=18 ;

--
-- Dumping data for table `ProblemSubmissions`
--

INSERT INTO `ProblemSubmissions` (`id`, `problem_id`, `result`, `notes`, `user_id`, `lang_id`, `source_code`, `submission_time`) VALUES
(12, 1, 'RE', 'Command failed: /bin/sh -c cat "./competitions/c1/p1/0.in" | ./"./competitions/submissions//0_main" > "./competitions/c1/p1/0.test"\n', 1, 1, '#include <iostream>\n#include <vector>\n#include <chrono>\n#include <string>\n#include <sstream>\n#include <unistd.h>\n#include <iomanip>\n#include <ostream>\n#include <sstream>\n#include <sys/wait.h>\n#include <fstream>\n#include <stdexcept>\n\n// I''m assuming global constants are okay, because why shouldn''t they be?\n\n// If they''re not, change this to false\n#define GLOBAL_CONSTANTS_OKAY true\n\n#if (GLOBAL_CONSTANTS_OKAY == true)\nconst int PIPE_COUNT = 2;\nconst int PIPE_READ_END = 0;\nconst int PIPE_WRITE_END = 1;\n\nconst int STDIN = 0;\nconst int STDOUT = 1;\n#else\n#define PIPE_COUNT 2\n#define PIPE_READ_END 0\n#define PIPE_WRITE_END 1\n\n#define STDIN 0\n#define STDOUT 1\n#endif\n\n// I promise I''m not this sarcastic for the rest of the assignment.\n// Carry on grading. Thanks.\n\n// -----FUNCTION PROTOTYPES------\nstd::string trim(const std::string& inString);\nvoid execPipedCommand(std::string& command, std::vector<std::string>& history,\n#if defined(_M_X64) || defined(__amd64__)\n	std::chrono::duration<long int, std::ratio<1l, 1000000000l>>& totalTimeElapsed);\n#else\n	std::chrono::duration<long long int, std::ratio<1l, 1000000000l>>& totalTimeElapsed);\n#endif\nvoid execExternalCommand(std::string& cmdString, std::chrono::time_point<std::chrono::system_clock>& o_tp);\n\n// http://www.toptip.ca/2010/03/trim-leading-or-trailing-white-spaces.html\nstd::string trim(const std::string& inString)\n{\n	std::string toReturn(inString);\n	auto p = toReturn.find_first_not_of(" \\t");\n	toReturn.erase(0, p);\n	p = toReturn.find_last_not_of(" \\t");\n	if(std::string::npos != p)\n	{\n		toReturn.erase(p + 1);\n	}\n	return toReturn;\n}\n\n// Returns: the time at which it finished the command\nvoid execExternalCommand(std::string& cmdString, std::chrono::time_point<std::chrono::system_clock>& o_tp)\n{\n	// Fork into child and parent processes....\n	auto childId = fork();\n\n	// Handle errors in forking...\n	if(childId < 0)\n	{\n		std::cout << "An error occurred in forking the process - terminating!" << std::endl;\n		std::cin.ignore();\n	}\n\n	// On the parent process, wait for children to finish, and then re-prompt for next input.\n	else if(childId > 0)\n	{\n		// Might do something here. Maybe.\n	}\n\n	// On child process...\n	else\n	{\n		std::stringstream appName;\n		std::vector<std::string> params(0);\n		std::stringstream nextParam;\n		\n		// Parse the app name and parameters from the command given to the shell\n		bool isAppName = true;\n		for(unsigned int i = 0u; i < cmdString.size(); ++i)\n		{\n			if(isAppName)\n			{\n				if(cmdString[i] == '' '')\n				{\n					isAppName = false;\n					params.push_back(nextParam.str());\n					nextParam.str("");\n					continue;\n				}\n				nextParam << cmdString[i];\n				appName << cmdString[i];\n			}\n			else\n			{\n				if(cmdString[i] == '' '')\n				{\n					params.push_back(nextParam.str());\n					nextParam.str("");\n					continue;\n				}\n				nextParam << cmdString[i];\n			}\n		}\n		params.push_back(nextParam.str());\n\n		// Parse parameters passed to program into char** type\n		char** cmds = new char*[params.size() + 1];\n		for(unsigned int i = 0u; i < params.size(); ++i)\n		{\n			cmds[i] = new char[params[i].size() + 1];\n			for(unsigned int j = 0u; j < params[i].size(); ++j)\n			{\n				cmds[i][j] = params[i][j];\n			}\n			cmds[i][params[i].size()] = ''\\0'';\n		}\n		cmds[params.size()] = 0;\n\n		// Execute the desired application\n		execvp(appName.str().c_str(), cmds);\n\n		// In case of errors...\n		// TODO: Remove the last history entry here, because it didn''t run?\n		std::cout << cmdString << " was a bad command - not executed!" << std::endl;\n		exit(0);\n	}\n}\n\nvoid execCommand(std::string& command, std::vector<std::string>& history,\n#if defined(_M_X64) || defined(__amd64__)\n	std::chrono::duration<long int, std::ratio<1l, 1000000000l>>& totalTimeElapsed)\n#else\n	std::chrono::duration<long long int, std::ratio<1l, 1000000000l>>& totalTimeElapsed)\n#endif\n{\n	// Get the total time elapsed on things...\n	if(command == "ptime")\n	{\n		// Output in seconds (accurate to milliseconds) how much time was elapsed...\n		std::cout << "Time elapsed: "\n			<< (int)std::chrono::duration_cast<std::chrono::seconds>(totalTimeElapsed).count() << " seconds "\n			<< (int)std::chrono::duration_cast<std::chrono::milliseconds>(totalTimeElapsed).count() % 1000 << " milliseconds and "\n			<< (int)std::chrono::duration_cast<std::chrono::microseconds>(totalTimeElapsed).count() % 1000 << " microseconds." << std::endl;\n	}\n\n	// Grab a history of commands...\n	else if(command == "history")\n	{\n		std::cout << "History of Commands Executed:" << std::endl;\n		for(unsigned int i = 0u; i < history.size(); ++i)\n		{\n			std::cout << i + 1u << ": " << history[i] << std::endl;\n		}\n	}\n\n	// Execute an item from the history...\n	else if(command[0] == ''^'')\n	{\n		std::stringstream number("");\n		unsigned int i;\n		for(i = 0u; command[i] != '' '' && i < command.size(); ++i);\n		for(; i < command.size(); ++i)\n		{\n			number << command[i];\n		}\n		try\n		{\n			int i = std::stoi(number.str()) - 1;\n			if(i < 0 || i >= (int)history.size())\n			{\n				throw std::invalid_argument(std::string("number"));\n			}\n			command = history[i];\n			std::cout << command << std::endl;\n			if(command.find(''|'') != std::string::npos)\n			{\n				execPipedCommand(command, history, totalTimeElapsed);\n			}\n			else\n			{\n				execCommand(command, history, totalTimeElapsed);\n			}\n			return;\n		}\n		catch(std::invalid_argument&)\n		{\n			std::cout << "ERROR - requested history item using a non-number or invalid number " << number.str() << std::endl;\n		}\n	}\n\n	// Not a shell command, pass it on under the hood!\n	else\n	{\n		auto startTime = std::chrono::system_clock::now();\n		auto endTime = std::chrono::system_clock::now();\n\n		execExternalCommand(command, endTime);\n		wait(NULL);\n		endTime = std::chrono::system_clock::now();\n\n		totalTimeElapsed += (endTime - startTime);\n	}\n}\n\nvoid execPipedCommand(std::string& command, std::vector<std::string>& history,\n#if defined(_M_X64) || defined(__amd64__)\n	std::chrono::duration<long int, std::ratio<1l, 1000000000l>>& totalTimeElapsed)\n#else\n	std::chrono::duration<long long int, std::ratio<1l, 1000000000l>>& totalTimeElapsed)\n#endif\n{\n	// Split command up into that before and after the pipe.\n	std::string beforeCmd = trim(command.substr(0, command.find(''|'')));\n	std::string afterCmd = trim(command.substr(command.find(''|'') + 1u));\n\n	// Set up piping things...\n	int pipe_ids[PIPE_COUNT];\n	pipe(pipe_ids);\n\n	int savedStdOut = dup(STDOUT);\n	int savedStdIn = dup(STDIN);\n\n	// Prime our loop: Execute the left side, writing to the pipe.\n	auto pidLeft = fork();\n	if(pidLeft == 0)\n	{\n		// Setup writing to the pipe, then execute our command.\n		dup2(pipe_ids[PIPE_WRITE_END], STDOUT);\n		execCommand(beforeCmd, history, totalTimeElapsed);\n		exit(0);\n	}\n\n	// Finish: Execute the right side, after closing down the write pipe.\n	auto pidRight = fork();\n	if(pidRight == 0)\n	{\n		// Read from the pipe, but do not write to it.\n		dup2(pipe_ids[PIPE_READ_END], STDIN);\n		close(pipe_ids[PIPE_WRITE_END]);\n		if(afterCmd.find(''|'') != std::string::npos)\n		{\n			execPipedCommand(afterCmd, history, totalTimeElapsed);\n		}\n		else\n		{\n			execCommand(afterCmd, history, totalTimeElapsed);\n		}\n		exit(0);\n	}\n\n	// Clean up: Wait for children to finish, up until the end.\n	int status;\n	waitpid(pidLeft, &status, 0);\n\n	// Fully close down the pipe.\n	close(pipe_ids[PIPE_WRITE_END]);\n	close(pipe_ids[PIPE_READ_END]);\n	\n	// Wait for the right most child...\n	waitpid(pidRight, &status, 0);\n\n	// Restore standard in and out.\n	dup2(savedStdOut, STDOUT);\n	dup2(savedStdIn, STDIN);\n}\n\nint main()\n{\n	std::s', '2015-02-01 22:15:35'),
(13, 1, 'AC', '', 1, 1, '#include <iostream>\nusing namespace std;\n\nint main()\n{\n	int n;\n	cin >> n;\n\n	for(int i = 0; i < n; i++)\n	{\n		cout << 42 << endl;\n	}\n\n	return 0;\n}\n', '2015-02-01 22:16:36'),
(14, 1, 'RE', 'Command failed: /bin/sh -c python "$SRC" < "./competitions/c1/p1/0.in" > "./competitions/submissions//0_AnswerFILE"\n/usr/bin/python: can''t find ''__main__'' module in ''''\n', 1, 2, '#include <iostream>\nusing namespace std;\n\nint main()\n{\n	int n;\n	cin >> n;\n\n	for(int i = 0; i < n; i++)\n	{\n		cout << 42 << endl;\n	}\n\n	return 0;\n}\n', '2015-02-01 22:25:51'),
(15, 1, 'RE', 'Command failed: /bin/sh -c python "$SRC" < "./competitions/c1/p1/0.in" > "./competitions/submissions//0_AnswerFILE"\n/usr/bin/python: can''t find ''__main__'' module in ''''\n', 1, 2, 'x = str(raw_input())\n\nfor i in range(0, x):\n	print "42"', '2015-02-01 22:27:03'),
(16, 1, 'RE', 'Command failed: /bin/sh -c python "./competitions/submissions/0_Answer.py" < "./competitions/c1/p1/0.in" > "./competitions/submissions//0_AnswerFILE"\nTraceback (most recent call last):\n  File "./competitions/submissions/0_Answer.py", line 3, in <module>\n ', 1, 2, 'x = str(raw_input())\n\nfor i in range(0, x):\n	print "42"', '2015-02-01 22:28:57'),
(17, 1, 'AC', '', 1, 2, 'x = int(raw_input())\n\nfor i in range(0, x):\n	print "42"', '2015-02-01 22:29:30');

-- --------------------------------------------------------

--
-- Table structure for table `TestCases`
--

CREATE TABLE IF NOT EXISTS `TestCases` (
`id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `input` varchar(50000) NOT NULL,
  `output` varchar(1500) NOT NULL,
  `sample` bit(1) NOT NULL DEFAULT b'0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

-- --------------------------------------------------------

--
-- Table structure for table `Users`
--

CREATE TABLE IF NOT EXISTS `Users` (
`id` int(11) NOT NULL,
  `username` varchar(25) NOT NULL,
  `pass` varchar(50) NOT NULL,
  `name` varchar(50) DEFAULT NULL,
  `tagline` varchar(255) DEFAULT NULL,
  `is_admin` bit(1) NOT NULL DEFAULT b'0',
  `highest_complete` varchar(25) DEFAULT NULL
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=7 ;

--
-- Dumping data for table `Users`
--

INSERT INTO `Users` (`id`, `username`, `pass`, `name`, `tagline`, `is_admin`, `highest_complete`) VALUES
(1, 'sessamekesh', 'sess', 'Kamaron Peterson', 'GO FTW', b'1', 'CS3100+'),
(2, 'bluefood2010', 'pass', 'Kamaron2', 'What is this?', b'0', 'CS3'),
(3, 'bobbytables', 'helloworld', 'Bobby Tables', 'YOLO!!', b'0', 'cs4'),
(6, 'undefined123', 'UNDEFINED', 'uNDEFIned', 'nULL POINTER eXEPCTION THROWN', b'0', 'cs6');

-- --------------------------------------------------------

--
-- Table structure for table `UserScores`
--

CREATE TABLE IF NOT EXISTS `UserScores` (
`id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `problem_id` int(11) NOT NULL,
  `score` int(20) NOT NULL,
  `notes` varchar(500) DEFAULT NULL,
  `penalty` int(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `Competitions`
--
ALTER TABLE `Competitions`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `Languages`
--
ALTER TABLE `Languages`
 ADD PRIMARY KEY (`id`);

--
-- Indexes for table `ProblemLanguages`
--
ALTER TABLE `ProblemLanguages`
 ADD PRIMARY KEY (`id`), ADD KEY `ui_language_problem` (`language_id`), ADD KEY `ui_problem` (`problem_id`);

--
-- Indexes for table `Problems`
--
ALTER TABLE `Problems`
 ADD PRIMARY KEY (`id`), ADD KEY `fk_competition` (`competition_id`);

--
-- Indexes for table `ProblemSubmissions`
--
ALTER TABLE `ProblemSubmissions`
 ADD PRIMARY KEY (`id`), ADD KEY `problem_id` (`problem_id`), ADD KEY `user_id` (`user_id`), ADD KEY `lang_id` (`lang_id`);

--
-- Indexes for table `TestCases`
--
ALTER TABLE `TestCases`
 ADD PRIMARY KEY (`id`), ADD KEY `problem_id` (`problem_id`);

--
-- Indexes for table `Users`
--
ALTER TABLE `Users`
 ADD PRIMARY KEY (`id`), ADD UNIQUE KEY `username` (`username`);

--
-- Indexes for table `UserScores`
--
ALTER TABLE `UserScores`
 ADD PRIMARY KEY (`id`), ADD KEY `user_id` (`user_id`,`problem_id`), ADD KEY `problem_id` (`problem_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `Competitions`
--
ALTER TABLE `Competitions`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `Languages`
--
ALTER TABLE `Languages`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=3;
--
-- AUTO_INCREMENT for table `ProblemLanguages`
--
ALTER TABLE `ProblemLanguages`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=6;
--
-- AUTO_INCREMENT for table `Problems`
--
ALTER TABLE `Problems`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=4;
--
-- AUTO_INCREMENT for table `ProblemSubmissions`
--
ALTER TABLE `ProblemSubmissions`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=18;
--
-- AUTO_INCREMENT for table `TestCases`
--
ALTER TABLE `TestCases`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- AUTO_INCREMENT for table `Users`
--
ALTER TABLE `Users`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT,AUTO_INCREMENT=7;
--
-- AUTO_INCREMENT for table `UserScores`
--
ALTER TABLE `UserScores`
MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;
--
-- Constraints for dumped tables
--

--
-- Constraints for table `ProblemLanguages`
--
ALTER TABLE `ProblemLanguages`
ADD CONSTRAINT `fk_language` FOREIGN KEY (`language_id`) REFERENCES `Languages` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_problem` FOREIGN KEY (`problem_id`) REFERENCES `Problems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `Problems`
--
ALTER TABLE `Problems`
ADD CONSTRAINT `fk_competition` FOREIGN KEY (`competition_id`) REFERENCES `Competitions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `ProblemSubmissions`
--
ALTER TABLE `ProblemSubmissions`
ADD CONSTRAINT `ProblemSubmissions_ibfk_1` FOREIGN KEY (`problem_id`) REFERENCES `Problems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `ProblemSubmissions_ibfk_2` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `ProblemSubmissions_ibfk_3` FOREIGN KEY (`lang_id`) REFERENCES `Languages` (`id`);

--
-- Constraints for table `TestCases`
--
ALTER TABLE `TestCases`
ADD CONSTRAINT `fk_pr_id` FOREIGN KEY (`problem_id`) REFERENCES `Problems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `UserScores`
--
ALTER TABLE `UserScores`
ADD CONSTRAINT `fk_problem_id` FOREIGN KEY (`problem_id`) REFERENCES `Problems` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
ADD CONSTRAINT `fk_user_id` FOREIGN KEY (`user_id`) REFERENCES `Users` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
