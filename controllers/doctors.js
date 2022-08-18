const { openDb } = require("../util");

const getDoctorsList = async (_, res) => {
	const db = await openDb();
	const data = await db.all("SELECT * FROM doctors");

	res.json({ data });
};

const addDoctor = async (req, res) => {
	const {
		body: { name },
	} = req;
	const db = await openDb();

	const result = await db.run(
		"INSERT INTO doctors (doctorName) VALUES (?)",
		name
	);
	if (!result.changes) {
		res.json({ data: "Error adding doctor." });
		return;
	}

	res.json({ data: "Doctor successfully added" });
};

module.exports = {
	getDoctorsList,
	addDoctor,
};
