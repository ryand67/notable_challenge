const sqlite3 = require("sqlite3");
const { open } = require("sqlite");

async function openDb() {
	return open({
		filename: "./database.db",
		driver: sqlite3.Database,
	});
}

const findApptsForId = async (id) => {
	const db = await openDb();

	const result = await db.all(
		`SELECT * FROM appointments INNER JOIN doctors ON appointments.doctorId = doctors.doctorId AND doctors.doctorId = ${id}`
	);

	return result;
};

const compareDates = (a, b) => {
	return (
		a.date() === b.date() && a.month() === b.month() && a.year() === b.year()
	);
};

module.exports = {
	openDb,
	findApptsForId,
	compareDates,
};
