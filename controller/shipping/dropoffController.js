const { Dropoff } = require("../../model/dropoff/dropoffModel");

exports.createDropoff = async (req, res) => {
    const { name, branch, address1, address2, address3, country, province, district, subdistrict, zipcode } = req.body;
    const dropoff = new Dropoff({ name, branch, address1, address2, address3, country, province, district, subdistrict, zipcode });
    await dropoff.save();
    return res.status(200).json({ data: dropoff });
}

exports.updateDropoff = async (req, res) => {
    const { name, branch, address1, address2, address3, country, province, district, subdistrict, zipcode } = req.body;
    const { dropoff_id } = req.params;
    let dropoff = await Dropoff.findById(dropoff_id);
    if (!dropoff) {
        return res.status(404).json({ message: "Dropoff not found" });
    }
    dropoff.name = name;
    dropoff.branch = branch;
    dropoff.address1 = address1;
    dropoff.address2 = address2;
    dropoff.address3 = address3;
    dropoff.country = country;
    dropoff.province = province;
    dropoff.district = district;
    dropoff.subdistrict = subdistrict;
    dropoff.zipcode = zipcode;
    await dropoff.save();
    return res.status(200).json({ data: dropoff });
}

exports.getDropoffs = async (req, res) => {
    const dropoffs = await Dropoff.find();
    return res.status(200).json({ data: dropoffs });
}

exports.getDropoff = async (req, res) => {
    const { dropoff_id } = req.params;
    const dropoff = await Dropoff.findById(dropoff_id);
    if (!dropoff) {
        return res.status(404).json({ message: "Dropoff not found" });
    }
    return res.status(200).json({ data: dropoff });
}