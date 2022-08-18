const express = require("express");
const { openDb } = require("./util");
const {
	getApptsOnDateWID,
	createAppointment,
	deleteAppointment,
} = require("./controllers/appointments");
const { getDoctorsList, addDoctor } = require("./controllers/doctors");

const PORT = 8080;

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// "Migrations" as the built in migration feature was acting up and
// I didn't want to spend the time debugging
(async () => {
	const db = await openDb();

	await db.run(`
	CREATE TABLE IF NOT EXISTS doctors
	(doctorId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	name TEXT(255) NOT NULL
	);`);

	await db.run(`
	CREATE TABLE IF NOT EXISTS appointments
	(appointmentId INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
	patientName TEXT(255) NOT NULL,
	time TEXT(255) NOT NULL,
	doctorId INTEGER NOT NULL,
	FOREIGN KEY(doctorId) REFERENCES doctors(doctorId)
	);`);
})();

app.get("/api/doctors", getDoctorsList);

app.post("/api/doctors", addDoctor);

app.get("/api/appointment/:doctorId/:dateParam", getApptsOnDateWID);

app.post("/api/appointment", createAppointment);

app.delete("/api/appointment", deleteAppointment);

app.listen(PORT, () => {
	console.log(`app listening at ${PORT}`);
});
