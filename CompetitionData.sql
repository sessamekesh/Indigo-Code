-- phpMyAdmin SQL Dump
-- version 4.2.6deb1
-- http://www.phpmyadmin.net
--
-- Host: localhost
-- Generation Time: Mar 04, 2015 at 03:26 PM
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

--
-- Dumping data for table `ComparisonPrograms`
--

INSERT INTO `ComparisonPrograms` (`id`, `name`, `description`) VALUES
(1, 'Simple Test', 'Compares two files, to see if the lines in the two files are completely identical.');

--
-- Dumping data for table `Competition`
--

INSERT INTO `Competition` (`id`, `name`, `htmlfrag_data`, `is_private`, `start_date`, `end_date`, `max_team_size`, `incorrect_submission_time_penalty`) VALUES
(2, 'Test Competition', '<h1>Test Competition</h1><p>Use this competition to get used to the USU ACM competition framework. You can submit solutions to these problems, and make sure that you are handling input and output properly.</p><p>All input is via standard input (std::cin, raw_input, fmt.Scan, etc.) and all output is via standard output (std::cout, print, echo, etc.)</p><p>First, try to solve "Answer" - it''s a trivial program that is only there to test your input/output handling. For example, in C++ the program might be:</p><code><div>#include &lt;iostream&gt;</div><div>using namespace std;</div><div><br></div><div>int main() {</div><div>&nbsp; &nbsp;int n;</div><div>&nbsp; &nbsp;cin &gt;&gt; n;</div><div>&nbsp; &nbsp;for (int i = 0; i &lt; n; i++) {</div><div>&nbsp; &nbsp; &nbsp; cout &lt;&lt; 42 &lt;&lt; endl;</div><div>&nbsp; &nbsp;}</div><div>&nbsp; &nbsp;return 0;</div><div>}</div></code><p>Sample solutions for ''Answer'' can be found here:<br /><a href="/sample_solutions/answer.py">Python</a><br /><a href="/sample_solutions/answer_cpp98.cpp">C++ (98 standard)</a><br /><a href="/sample_solutions/answer_cpp11.cpp">C++ (11 standard)</a><br /><a href="/sample_solutions/answer.js">JavaScript (Node.js)</a><br /><a href="/sample_solutions/answer.go">Go</a><br /><a href="/sample_solutions/answer.c">C</a><br /><a href="/sample_solutions/answer.vg">Vigil</a><br /><a href="/sample_solutions/answer.java">Java (7 or 8)</a></p><p>Try to solve Fibonacci also - it''s a more difficult problem that demonstrates the joy that is TLE (Time Limit Exceeded). Solve it with the recursive method, and you''ll find the program runs too slow. Solve it with the iterative method instead, and your program will finish on time. But, if you''re using a language like C++ or Java, watch the constraints - 32 bit integers won''t cut it. Use long (Java) or long long (C++) instead.</p><p>These are the kinds of things you will have to think about during coding competitions, so keep them on your mind! Watch the constraints, make sure you aren''t using N^2 when N could be in the thousands, or using <code>int</code>s to hold numbers that could be bigger than 2^30.<p>Happy hacking!</p>', b'0', '2015-02-25 12:30:00', '2015-02-25 16:00:00', 3, 20),
(4, 'CS5890 Test (Feb 26)', '<h1>Rapid Problem Solving - Feb. 26</h1><p>Thank you for helping the USU ACM test the coding competition framework. In the upper right hand corner (in the blue header), you''ll see your username, tagline, and a timer - the timer indicates how much time you have left in the competition. You will not be able to submit any problems for <i>scoring</i> after the time has expired. The competition will still be available, and submissions will still be judged, but they will not be scored.</p><p>Problem descriptions can be accessed by clicking on the problem name in the sidebar. Submissions can be uploaded by pressing the link (submit) by the problem name.</p><p>Finally, you can view your standings and the scoreboard by clicking <b>scoreboard</b> in the left navigation menu</p><hr /><p>This is a new system, and still fairly buggy. At this point, I am hoping that all of the regular user bugs are sorted out, but please let me know of any additional bugs. Poke around a little, try to crash the site if you can.<p><p>Finally, if you want to hear updates about the USU ACM coding competition and events, email me at <code>kamaron.peterson@aggiemail.usu.edu</code>.<p>', b'0', '2015-02-26 10:30:00', '2015-02-26 11:45:00', 3, 20),
(5, 'CS 5890 March 3', '<h1>Rapid Problem Solving - March 3rd</h1><p>Thank you for helping the USU ACM test the coding competition framework. In the upper right hand corner (in the blue header), you''ll see your username, tagline, and a timer - the timer indicates how much time you have left in the competition. You will not be able to submit any problems for <i>scoring</i> after the time has expired. The competition will still be available, and submissions will still be judged, but they will not be scored.</p><p>Problem descriptions can be accessed by clicking on the problem name in the sidebar. Submissions can be uploaded by pressing the link (submit) by the problem name.</p><p>Finally, you can view your standings and the scoreboard by clicking <b>scoreboard</b> in the left navigation menu</p><hr /><p>This is a new system, and still fairly buggy. At this point, I am hoping that all of the regular user bugs are sorted out, but please let me know of any additional bugs. Poke around a little, try to crash the site if you can.<p><p>Finally, if you want to hear updates about the USU ACM coding competition and events, email me at <code>kamaron.peterson@aggiemail.usu.edu</code>.', b'0', '2015-03-03 10:30:00', '2015-03-03 11:45:00', 3, 10);

--
-- Dumping data for table `ContentType`
--

INSERT INTO `ContentType` (`id`, `name`, `content_type`) VALUES
(1, 'HTML', 'text/html'),
(2, 'Plain Text', 'text/plain'),
(3, 'Source Code', 'text/plain'),
(4, 'PDF File', 'application/pdf'),
(5, 'PNG', 'image/png');

--
-- Dumping data for table `Language`
--

INSERT INTO `Language` (`id`, `name`, `subsys_name`, `num_uses`) VALUES
(1, 'C', 'c', 21),
(2, 'C++98 (g++)', 'cpp98', 7),
(3, 'C++11 (g++)', 'cpp11', 10),
(4, 'Python 2.7', 'python', 22),
(5, 'Java 7', 'java1_7', 16),
(6, 'Java 8', 'java1_8', 32),
(7, 'Node.js', 'nodejs', 7),
(8, 'Go (1.4)', 'golang', 4),
(9, 'Vigil', 'vigil', 0),
(10, 'C++14 (g++)', 'cpp14', 0);

--
-- Dumping data for table `Problem`
--

INSERT INTO `Problem` (`id`, `name`, `competition_id`, `description_file_path`, `description_file_type`, `default_time_limit`) VALUES
(2, 'Answer', 2, 'Answer.pdf', 4, 2500),
(3, 'Fibonacci', 2, 'Fibonacci.pdf', 4, 2500),
(4, 'RMRC2012P\0\0\0\0\0\0\0\0\0', 4, 'RMRC2012P.pdf', 4, 2000),
(5, 'Lazy Sort', 4, 'lazy_sort.txt', 2, 6000),
(6, 'Magic Trick', 4, 'MagicTrick.txt', 2, 6000),
(7, 'CBRK', 5, 'cbrk.txt', 2, 2500),
(8, 'CCUT', 5, 'ccut.txt', 2, 2500),
(9, 'CFST', 5, 'cfst.txt', 2, 2500);

--
-- Dumping data for table `TestCase`
--

INSERT INTO `TestCase` (`id`, `problem_id`, `comparison_program_id`) VALUES
(1, 3, 1),
(2, 3, 1),
(3, 3, 1),
(4, 4, 1),
(5, 4, 1),
(6, 4, 1),
(7, 5, 1),
(8, 5, 1),
(9, 5, 1),
(10, 6, 1),
(11, 6, 1),
(12, 2, 1),
(13, 2, 1),
(14, 7, 1),
(15, 8, 1),
(16, 9, 1),
(17, 9, 1);

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
