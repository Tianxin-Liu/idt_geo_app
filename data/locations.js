const axios = require("axios");
const mongoCollections = require("../config/mongoCollections");
const locations = mongoCollections.locations;
const ObjectId = require('mongodb').ObjectID;

module.exports = {
    async getLocationByIp(ip) {
        const response = await axios.post("http://ip-api.com/json/" + ip);
        let location = response.data;
        if (location.status == 'fail') {
            return location;
        }
        const locationsCollection = await locations();
        let newLocation = {
            country: location.country,
            countryCode: location.countryCode,
            region: location.region,
            regionName: location.regionName,
            city: location.city,
            lat: location.lat,
            lon: location.lon,
            query: location.query
        };
        const insertInfo = await locationsCollection.insertOne(newLocation);
        if (insertInfo.insertedCount === 0) {
            throw "Could not add location";
        }
        const newId = insertInfo.insertedId;
        const l = await this.get(newId);
        return l;
    },
    async getLocationsByIp(ip) {
        const all = await this.getAllLocations();
        let matchedLocations = [];
        for (let i in all) {
            let Curr_ip = all[i].query;
            if (Curr_ip == ip) {
                matchedLocations.push(all[i]);
            }
        }
        return matchedLocations;
    },
    async getLastestLocations(n) {
        let all = await this.getAllLocations();
        if(all.length <= n)
            return all;
        let re = all.reverse();
        return re.slice(0, n);
    },
    async get(id) {
        if (!id) {
            throw "You must provide an id to search for";
        }
        if (!/^[a-fA-F0-9]{24}$/.test(id)) throw "Not ObjectId";
        id = ObjectId(id);
        const locationsCollection = await locations();
        const locationget = await locationsCollection.findOne({ "_id": id });
        if (locationget === null) {
            throw "No location with that id";
        }
        return locationget;
    },
    async getAllLocations() {
        const locationsCollection = await locations();

        const AllLocations = await locationsCollection.find({}).toArray();

        return AllLocations;
    }
};