// Split the time slots in 30min slots
const splitInto30MinuteSlots = (day, timeRange) => {
    const [start, end] = timeRange.split('-'); // Start and end time of the slot
    const slots = [];
    let [startHour, startMinute] = start.split(':').map(num => parseInt(num)); 
    const [endHour, endMinute] = end.split(':').map(num => parseInt(num));

    // Split the slot into 30min slots
    while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
        const nextMinute = (startMinute + 30) % 60;
        const nextHour = startHour + Math.floor((startMinute + 30) / 60);
        slots.push(`${day} ${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}-${nextHour.toString().padStart(2, '0')}:${nextMinute.toString().padStart(2, '0')}`);
        startHour = nextHour;
        startMinute = nextMinute;
    }

    return slots;
};

const generateFilteredSlots = (startDay, startTime, endDay, endTime) => {
    const days = ["L", "MA", "ME", "J", "V", "S"];
    const allSlots = [];
    let withinRange = false;

    days.forEach(day => {
        if (day === startDay) {
            withinRange = true; // On commence à ajouter les slots
        }

        if (withinRange) {
            // Détermine les heures d'ouverture pour le jour en cours
            const openingHour = day === "S" ? 8 : 8;
            const closingHour = day === "S" ? 12 : 22;

            // Détermine les heures de début et de fin pour ce jour
            const dayStartTime = day === startDay ? startTime : `${openingHour}:00`;
            const dayEndTime = day === endDay ? endTime : `${closingHour}:00`;

            const [startHour, startMinute] = dayStartTime.split(":").map(Number);
            const [endHour, endMinute] = dayEndTime.split(":").map(Number);

            // Génère les slots pour le jour
            for (let hour = startHour; hour < endHour || (hour === endHour && startMinute < endMinute); hour++) {
                for (let minute = 0; minute < 60; minute += 30) {
                    const currentSlotStart = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                    const nextSlotMinute = (minute + 30) % 60;
                    const nextSlotHour = hour + Math.floor((minute + 30) / 60);
                    const currentSlotEnd = `${nextSlotHour.toString().padStart(2, "0")}:${nextSlotMinute.toString().padStart(2, "0")}`;

                    // Ajoute le slot uniquement s'il est dans la plage
                    if (
                        (hour > startHour || (hour === startHour && minute >= startMinute)) &&
                        (hour < endHour || (hour === endHour && nextSlotMinute <= endMinute))
                    ) {
                        allSlots.push(`${day} ${currentSlotStart}-${currentSlotEnd}`);
                    }
                }
            }
        }

        if (day === endDay) {
            withinRange = false; // On arrête d'ajouter les slots
        }
    });

    return allSlots;
};

// Create all the possible slots
const generateAllSlots = () => {
    const days = ["L", "MA", "ME", "J", "V", "S"];
    const allSlots = [];
    days.forEach(day => {
        // Opening hours are different on Saturday
        const openingHour = day === "S" ? 8 : 8;
        const closingHour = day === "S" ? 12 : 22;
        // Split the day into 30min slots
        for (let hour = openingHour; hour < closingHour; hour++) {
            for (let minute = 0; minute < 60; minute += 30) {
                const start = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`;
                const endMinute = (minute + 30) % 60;
                const endHour = hour + Math.floor((minute + 30) / 60);
                const end = `${endHour.toString().padStart(2, "0")}:${endMinute.toString().padStart(2, "0")}`;
                allSlots.push(`${day} ${start}-${end}`);
            }
        }
    });
    return allSlots;
};

// Find the occupied slots
const getOccupiedSlots = (parsedCourse, room) => {
    const occupiedSlots = [];
    parsedCourse.forEach(course => {
        // Check if the room is occupied
        course.timeSlots.forEach(slot => {
            if (slot.salle === room) {
                occupiedSlots.push(...splitInto30MinuteSlots(slot.horaire.split(' ')[0], slot.horaire.split(' ')[1]));
            }
        });
    });
    return occupiedSlots;
};

// Define the days of the week
const dayOfTheWeek = {
    L: "Lundi",
    MA: "Mardi",
    ME: "Mercredi",
    J: "Jeudi",
    V: "Vendredi",
    S: "Samedi",
};


module.exports = {
    dayOfTheWeek,
    generateAllSlots,
    getOccupiedSlots,
};