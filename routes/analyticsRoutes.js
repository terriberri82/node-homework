const express = require("express");
const router = express.Router();
const {getUserAnalytics, getUsersWithStats, searchTasks} = require("../controllers/analyticsController");
const jwtMiddleware = require("../middleware/jwtMiddleware");

router.use(jwtMiddleware);
router.route("/tasks/search").get(searchTasks);
router.route("/users").get(getUsersWithStats);
router.route("/users/:id").get(getUserAnalytics);


module.exports = router