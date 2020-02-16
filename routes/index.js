const express = require("express");
const router = express.Router();
const data = require("../data");
const locationsData = data.locations;
var bodyParser = require('body-parser');
const AWS = require('aws-sdk');

function validateIP(ip) {
    var reg = /^(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])\.(\d{1,2}|1\d\d|2[0-4]\d|25[0-5])$/
    if (reg.test(ip) === false)
        return false;
    return true;
}

router.get("/", (req, res) => {
    try {
        res.render("geo/location");
    }
    catch (e) {
        res.sendStatus(500);
    }
});

router.get("/locations", (req, res) => {
    try {
        res.render("geo/location");
    }
    catch (e) {
        res.sendStatus(500);
    }
});

router.post("/locations", async (req, res) => {
    if (!req.body.ip) {
        res.render("geo/location");
        return;
    }
    try {
        let error;
        let ip = req.body.ip;
        if (validateIP(ip) === false)
            error = ip + " is NOT an IP address, please input ip address as xxx.xxx.xxx.xxx";
        if (error) {
            res.status(401).render("geo/location",
                {
                    error: error,
                    hasErrors: true
                });
            return;
        }
        let location = await locationsData.getLocationByIp(ip);
        if (location.status == 'fail') {
            res.status(401).render("geo/location",
                {
                    error: "Can not find this ip's location",
                    hasErrors: true
                });
            return;
        }
        res.status(401).render("geo/location", { location });
        return;
    }
    catch (e) {
        res.sendStatus(500);
    }
    res.render("geo/location", {});
});

router.get("/query", async (req, res) => {
    try {
        let locations = await locationsData.getAllLocations();
        if (!locations) {
            res.render("geo/query", {
                hasQuery: false
            });
        }
        locations.splice(20);
        let i = 0;
        res.status(401).render("geo/query",
            {
                hasQuery: true,
                locations: locations.map((l) => {
                    i++;
                    return { i: i, ip: l.query, country: l.country, region: l.regionName, city: l.city, id: l._id };
                })
            });
        return;
    }
    catch (e) {
        res.sendStatus(500);
    }
});

router.post("/query", async (req, res) => {
    if (!req.body.query) {
        res.render("geo/query", {
            hasQuery: false
        });
        return;
    }
    try {
        let error;
        let ip = req.body.query;
        if (validateIP(ip) === false)
            error = ip + " is NOT an IP address, please input ip address as xxx.xxx.xxx.xxx";
        if (error) {
            res.status(401).render("geo/query",
                {
                    error: error,
                    hasErrors: true
                });
            return;
        }
        let locations = await locationsData.getLocationsByIp(ip);
        if (!locations) {
            res.render("geo/query", {
                IPQuery: true,
                IPResult: false,
                IP: ip,
                hasQuery: false
            });
        }
        locations.splice(20);
        let i = 0;
        res.status(401).render("geo/query",
            {
                IPQuery: true,
                IP: ip,
                hasQuery: true,
                locations: locations.map((l) => {
                    i++;
                    return { i: i, ip: l.query, country: l.country, region: l.regionName, city: l.city, id: l._id };
                })
            });
        return;
    }
    catch (e) {
        res.sendStatus(500);
    }
    res.render("geo/location", {});
});

router.post("/queryNo", async (req, res) => {
    if (!req.body.queryNo) {
        res.render("geo/query", {
            hasQuery: false
        });
        return;
    }
    try {
        let error;
        let n = req.body.queryNo;
        if (isNaN(n))
            error = n + " is NOT a number, please input a number";
        if (error) {
            res.status(401).render("geo/query",
                {
                    error: error,
                    hasErrors: true
                });
            return;
        }
        let locations = await locationsData.getLastestLocations(n);
        if (!locations) {
            res.render("geo/query", {
                hasQuery: false
            });
        }
        let i = 0;
        res.status(401).render("geo/query",
            {
                NoQuery: true,
                No: n,
                hasQuery: true,
                locations: locations.map((l) => {
                    i++;
                    return { i: i, ip: l.query, country: l.country, region: l.regionName, city: l.city, id: l._id };
                })
            });
        return;
    }
    catch (e) {
        res.sendStatus(500);
    }
    res.render("geo/location", {});
});

router.get("/map/:id", async (req, res) => {
    let loc = await locationsData.get(req.params.id);
    res.render("geo/map", { loc: loc });
});

router.post("/sendmessage", (req, res) => {
    let number = req.body.phone;

    AWS.config.update({
        accessKeyId: "AKIAITGQPWCO72EFJFMQ",
        secretAccessKey: "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",
        region: 'us-east-1'
    });

    const sns = new AWS.SNS();
    const params = {
        Message: "country: " + req.body.country
            + "\nregion: " + req.body.region
            + "\ncity: " + req.body.city
            + "\nIP: " + req.body.ip,
        PhoneNumber: '1' + number
    }
    sns.publish(params, function (err, data) {
        if (err) {
            console.log(err, err.stack);
        } else {
            console.log("send!");
        }
    })
});

const constructorMethod = app => {
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));

    app.use("/", router);

    app.use("*", (req, res) => {
        res.status(404);
    });
};

module.exports = constructorMethod;