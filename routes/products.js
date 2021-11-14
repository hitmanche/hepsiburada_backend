var express = require("express");
var router = express.Router();
var dataJson = require("../data/index");
//production redis url
let redis_url =
  "redis://:p93166e436ee9118df2f692cc320a187e79c6507224de17c17ac5f6e68a39afbd@ec2-52-49-169-28.eu-west-1.compute.amazonaws.com:19129";
if (process.env.ENVIRONMENT === "development") {
  redis_url = "redis://localhost";
}
//redis setup
let client = require("redis").createClient(redis_url, {
  connect_timeout: 10000,
});

router.get("/", function (req, res, next) {
  client.get("products", (err, resp) => {
    if (err) {
      res.send(err);
      return;
    }
    if (!resp || (Array.isArray(resp) && resp.length !== dataJson.length)) {
      client.set("products", JSON.stringify(dataJson));
    }
    let data = JSON.parse(resp);

    // FILTER DATA *********************
    let filters = {
      brand: [],
      color: [],
      arrangement: [
        { id: "dPrice", value: "En Düşük Fiyat" },
        { id: "iPrice", value: "En Yüksek Fiyat" },
        { id: "aDate", value: "En Yeniler (A>Z)" },
        { id: "zDate", value: "En Yeniler (Z>A)" },
      ],
    };
    if (Array.isArray(data)) {
      data.forEach((product) => {
        if (filters.brand.filter((x) => x.id === product.brand).length < 1) {
          filters.brand.push({
            id: product.brand,
            value: product.brand,
            count: 1,
          });
        } else {
          filters.brand.find((x) => x.id === product.brand).count++;
        }
        if (filters.color.filter((x) => x.id === product.color).length < 1) {
          filters.color.push({
            id: product.color,
            value: product.color,
            count: 1,
          });
        } else {
          filters.color.find((x) => x.id === product.color).count++;
        }
      });
    }
    // FILTER DATA *********************

    if (Array.isArray(data)) {
      if (req.query.text) {
        data = data.filter((x) =>
          x.title.toLowerCase().includes(req.query.text.toLowerCase())
        );
      }
      if (req.query.color) {
        data = data.filter((x) => x.color === req.query.color);
      }
      if (req.query.brand) {
        data = data.filter((x) => x.brand === req.query.brand);
      }
      if (req.query.arrangement) {
        switch (req.query.arrangement) {
          case "dPrice":
            data.sort(
              (x, y) =>
                x.price -
                x.price * (x.percent / 100) -
                (y.price - y.price * (y.percent / 100))
            );
            break;
          case "iPrice":
            data.sort(
              (x, y) =>
                y.price -
                y.price * (y.percent / 100) -
                (x.price - x.price * (x.percent / 100))
            );
            break;
          case "aDate":
            data.sort((x, y) => x.title.localeCompare(y.title));
            break;
          case "zDate":
            data.sort((x, y) => y.title.localeCompare(x.title));
            break;
        }
      }

      data = data.slice((req.query.pageNumber - 1) * req.query.pageNumber, 12 * req.query.pageNumber);
    }

    res.send({ data, filters });
  });
});

module.exports = router;
