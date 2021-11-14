var express = require("express");
var router = express.Router();
var data = require("../data/index");
//production redis url
let redis_url = "redis://:p93166e436ee9118df2f692cc320a187e79c6507224de17c17ac5f6e68a39afbd@ec2-52-49-169-28.eu-west-1.compute.amazonaws.com:19129";
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
