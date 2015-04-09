/**
 * Created by kamaron on 4/1/15.
 */

var express = require('express'),
    user_api = require('./api_modules/user_api'),
    comp_api = require('./api_modules/competition_api'),
    team_api = require('./api_modules/team_api');

var router = express.Router();

router.get('/competition/past', comp_api.get_past);
router.get('/competition/present', comp_api.get_present);
router.get('/competition/future', comp_api.get_future);
router.get('/competition', comp_api.get_comp_data);

router.get('/user/login', user_api.get_user_data);
router.post('/user/login', user_api.login);
router.post('/user/logout', user_api.logout);
router.post('/user/register', user_api.register);
router.get('/user/types', user_api.get_user_types);

router.post('/team/register', team_api.register_team);

module.exports = router;