const { writeFileSync } = require("fs");
const { createEvents } = require("ics");

function getStudentSchedule(parsedCourses, selectedCourses, startDate, endDate) {
   const events = [];

   // Convertir la liste des cours sélectionnés en un tableau
   const selectedCourseCodes = selectedCourses.split(",").map((code) => code.trim());

   parsedCourses.forEach((course) => {
      if (selectedCourseCodes.includes(course.courseCode)) {
         course.timeSlots.forEach((slot) => {
            // Convertir le jour en indice numérique
            const dayMapping = {
               L: 1,
               MA: 2,
               ME: 3,
               J: 4,
               V: 5,
               S: 6,
            };
            const dayOfWeek = dayMapping[slot.horaire.split(" ")[0]]; // Récupère le jour
            const timeRange = slot.horaire.split(" ")[1]; // Récupère "08:00-10:00"
            const [startTime, endTime] = timeRange.split("-");

            // Convertir le type en chaine de caractères
            const typeMapping = {
               C: "Cours",
               D: "TD",
               T: "TP",
            };
            const typeDescription = typeMapping[slot.type[0]] || "Unknown";

            // Génère les événements dans l'intervalle donné
            let currentDate = new Date(startDate);
            while (currentDate <= endDate) {
               if (currentDate.getDay() === dayOfWeek) {
                  events.push({
                     title: course.courseCode,
                     start: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        currentDate.getDate(),
                        ...startTime.split(":").map(Number)
                     ),
                     end: new Date(
                        currentDate.getFullYear(),
                        currentDate.getMonth(),
                        currentDate.getDate(),
                        ...endTime.split(":").map(Number)
                     ),
                     location: slot.salle,
                     description: `Type: ${typeDescription}`,
                  });
               }
               currentDate.setDate(currentDate.getDate() + 1);
            }
         });
      }
   });

   return events;
}

function generateICSFile(events, outputPath) {
   const icsEvents = events.map((event) => ({
      start: [
         event.start.getFullYear(),
         event.start.getMonth() + 1,
         event.start.getDate(),
         event.start.getHours(),
         event.start.getMinutes(),
      ],
      end: [
         event.end.getFullYear(),
         event.end.getMonth() + 1,
         event.end.getDate(),
         event.end.getHours(),
         event.end.getMinutes(),
      ],
      title: event.title,
      description: event.description,
      location: event.location,
   }));

   const { error, value } = createEvents(icsEvents);

   if (error) {
      console.error(error);
      return;
   }
   writeFileSync(outputPath, value);
   console.log(`ICS file saved to ${outputPath}`);
}
module.exports = {
   getStudentSchedule,
   generateICSFile,
};
