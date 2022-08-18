const dayjs = require("dayjs");
const { findApptsForId, compareDates, openDb } = require("../util");

const getApptsOnDateWID = async (req, res) => {
	const {
		params: { doctorId, dateParam },
	} = req;

	const date = dayjs(dateParam, "MM-DD-YYYY");
	if (Number.isNaN(date.date())) {
		res.json({ error: "Invalid date format. Expecting MM-DD-YYYY" });
		return;
	}

	const doctorAppts = await findApptsForId(doctorId);

	if (!doctorAppts.length || !doctorAppts) {
		res.json({ data: [] });
		return;
	}

	const data = doctorAppts
		.map((appt) => {
			const apptDate = dayjs(appt.time);

			if (compareDates(apptDate, date)) {
				return appt;
			}
		})
		.filter(Boolean);

	res.json({ data });
};

const createAppointment = async (req, res) => {
	const { body } = req;

	if (!body.doctorId || !body.time || !body.patientName) {
		res.json({ error: "Missing either doctorId, time, or pateientName." });
		return;
	}

	if (
		!typeof body.doctorId === "number" ||
		!typeof body.time === "string" ||
		!typeof body.patientName === "string"
	) {
		res.json({
			error:
				"Invalid input type, doctorId is number, time is string, and patientName is string.",
		});
		return;
	}

	// Using dayjs to validate date formats and times
	const time = dayjs(body.time, "MM/DD/YYYY hh:mm A");

	if (Number.isNaN(time.hour())) {
		res.json({
			error:
				"Date format must be MM/DD/YYYY hh:mm A, example: 08/18/2022 06:15 PM",
		});
		return;
	}

	if (time.minute() % 15 !== 0) {
		res.json({ error: "Appointments must be in 15 minute intervals." });
		return;
	}

	let existingAppts = await findApptsForId(body.doctorId);

	const timeConflicts = existingAppts
		.map((appt) => {
			if (appt.time === body.time) {
				return appt;
			}
		})
		.filter(Boolean);

	if (timeConflicts.length >= 3) {
		res.json({
			error: "Doctors cannot have more than 3 appointments at one time",
		});
		return;
	}

	const db = await openDb();

	await db.run(
		`INSERT INTO appointments (patientName, time, doctorId) VALUES (?, ?, ?)`,
		body.patientName,
		body.time,
		body.doctorId
	);

	res.json({ data: "Appointment added successfully." });
};

const deleteAppointment = async (req, res) => {
	const db = await openDb();
	const {
		body: { appointmentId },
	} = req;

	if (!appointmentId || typeof appointmentId !== "number") {
		res.json({ error: "appointmentId (number) required." });
		return;
	}

	const results = await db.run(
		"DELETE FROM appointments WHERE appointmentId = ?",
		appointmentId
	);

	if (!results.changes) {
		res.json({ data: "Nothing to delete." });
		return;
	}

	res.json({ data: `Appointment id: ${appointmentId} deleted successfully.` });
};

module.exports = {
	getApptsOnDateWID,
	createAppointment,
	deleteAppointment,
};
