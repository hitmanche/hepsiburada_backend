var express = require("express");
var router = express.Router();
var data = require("../data/index");
//production redis url
let redis_url = process.env.REDIS_URL;
if (process.env.ENVIRONMENT === "development") {
  redis_url = "redis://localhost";
}
//redis setup
let client = require("redis").createClient(redis_url);

/* GET users listing. */
router.get("/", function (req, res, next) {
  client.get("products", (err, resp) => {
    if (err) {
      res.send(err);
      return;
    }
    if (!resp) {
      client.set("products", JSON.stringify(data));
    }
    res.send(resp);
  });
});

module.exports = router;
