SELECT
	Problems.name AS problem,
    Users.username AS user,
    (COUNT(*) - 1) AS penalty
FROM ProblemSubmissions
	LEFT JOIN Users ON ProblemSubmissions.user_id = Users.id
    LEFT JOIN Problems ON ProblemSubmissions.problem_id = Problems.id
WHERE (SELECT COUNT(*) FROM ProblemSubmissions WHERE user_id = Users.id AND problem_id = Problems.id AND result = 'AC') > 0
AND submission_time <= (SELECT submission_time FROM ProblemSubmissions WHERE result = 'AC' AND problem_id = Problems.id AND user_id = Users.id LIMIT 1)
GROUP BY username, problem;
-- SELECT DISTINCT
-- 	Users.username
-- 	, Problems.name AS problem_name
-- 	, (SELECT
-- 		COUNT(*)
-- 		FROM ProblemSubmissions
-- 		WHERE user_id = Users.id
-- 			AND submission_time <= IFNULL((
-- 				SELECT submission_time
-- 				FROM ProblemSubmissions
-- 				WHERE user_id = Users.id
-- 					AND result = 'AC'
-- 				ORDER BY submission_time
-- 				LIMIT 1),
-- 			NOW()))
-- 		AS submission_count
-- 	FROM Users
-- 	LEFT JOIN ProblemSubmissions AS ps ON ps.user_id = Users.id
-- 	LEFT JOIN Problems ON ps.problem_id = Problems.id
-- 	WHERE (
-- 		SELECT COUNT(*)
-- 		FROM ProblemSubmissions
-- 		WHERE user_id = Users.id
-- 			AND problem_id = Problems.id
-- 			AND result = 'AC'
-- 	) > 0;