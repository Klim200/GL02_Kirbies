// Description : This file is the main file of the CLI. It contains the commands and the logic to run them

// Import neccessary modules
const fs = require("fs");
const CruParser = require("./CruParser.js");
const color = require("colors");
const cli = require("@caporal/core").default;

// Import the functions to generate the ICS file
const { getStudentSchedule, generateICSFile } = require("./GenerateICS");

// Import the function to generate the pie chart
const { generateChart } = require("./GeneratePieChart.js");

// Import the functions to manage users and permissions
const { roles, users, checkPermission, promptUserForName } = require("./userManager.js");

// Import the functions to manage the free slots for a room
const { dayOfTheWeek, getOccupiedSlots, generateAllSlots } = require("./slotManager.js");

// Create the CLI wich will be used to run the commands
cli.version("cru-parser-cli")
    .version("0.10")
    /**
     * Command to check if a file is a valid Cru file.
     *
     * @command check
     * @argument {string} file - The file to check with Cru parser.
     * @option {boolean} -t, --showTokenize - Log the tokenization results.
     * @option {boolean} -d, --showDebug - Log the debug information.
     * @example
     * $ node caporalCli.js check SujetA_data/CD/edt.cru -t -d
     */
    .command("check", "Check if <file> is a valid Cru file")
    .argument("<file>", "The file to check with Cru parser")
    .option("-t, --showTokenize", "log the tokenization results", { validator: cli.BOOLEAN, default: false })
    .option("-d, --showDebug", "log the debug information", { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {
        fs.readFile(args.file, "utf8", function (err, data) {
            if (err) {
                return logger.warn(err);
            }
            // Create a new instance of CruParser and analyze the file
            const analyzer = new CruParser(options.showTokenize, options.showDebug);
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                logger.info("The .cru file is a valid cru file".green);
                console.log("No errors found");
            } else {
                logger.info("The .cru file contains error".red);
                // Display how many errors there are
                logger.info("Error count : %d", analyzer.errorCount);
            }
            // Display the parsed courses
            analyzer.ParsedCourse.forEach((course) => {
                console.log(`Course Code: ${course.courseCode}`);
                course.timeSlots.forEach((ts, index) => {
                    console.log(`- Time Slot ${index + 1}: ${ts.toString()}`);
                });
            });
            // Display the debug information if requested
            logger.debug(analyzer.parsedCourse);
        });
    })

    /**
     * Command to display the README.txt file.
     *
     * @command readme
     * @example
     * $ node caporalCli.js readme
     */
    .command("readme", "Display the README.txt file")
    .action(({ logger }) => {
        fs.readFile("./README.txt", "utf8", function (err, data) {
            if (err) {
                return logger.warn(err);
            }
            logger.info(data);
        });
    })
    /**
     * SPEC 1 ( and 2 ) : search rooms with a given course, and give the capacity if wanted
     *
     * @command findCourseRooms
     * @argument {string} file - The Cru file to search.
     * @argument {string} course - The course to search.
     * @option {boolean} -c, --capacity - Show the capacity of the room(s).
     * @example
     * $ node caporalCli.js findCourseRooms SujetA_data/CD/edt.cru CL02 -c
     */
    .command("findCourseRooms", "Looks for the rooms associated with a course")
    .argument("<file>", "The Cru file to search")
    .argument("<course>", "The course you want to search")
    .option("-c, --capacity", "Shows capacity of the room(s)", { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {
        fs.readFile(args.file, "utf8", function (err, data) {
            if (err) {
                return logger.warn(err);
            }
            // Create a new instance of CruParser and analyze the file
            const analyzer = new CruParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                // Find the given course in the file
                let courseToSearch = analyzer.ParsedCourse.find((course) => course.courseCode === args.course);

                // If the course is found
                if (courseToSearch) {
                    console.log(`Rooms that welcome the course ${courseToSearch.courseCode}:`);

                    courseToSearch.timeSlots.forEach((ts) => {
                        console.log(`- ${ts.salle}`);
                        // If the user wants to know the capacity of the room
                        if (options.capacity) {
                            let capacity = parseInt(ts.capacite);
                            let capacityMax = 0;
                            if (capacity > capacityMax)
                                capacityMax = capacity
                            console.log(`  Capacity: ${capacityMax}`);
                            
                        }
                    });
                } else {
                    logger.warn("No rooms found for the given course.");
                }
            } else {
                logger.error("The .cru file contains parsing errors.");
            }
        });
    })

    /**
     * SPEC 2 : search capacity of a given room
     *
     * @command findRoomCapacity
     * @argument {string} file - The Cru file to search.
     * @argument {string} room - The room to search.
     * @example
     * $ node caporalCli.js findRoomCapacity SujetA_data/CD/edt.cru S204
     */
    .command("findRoomCapacity", "Looks for the capacity of a given room")
    .argument("<file>", "The Cru file to search")
    .argument("<room>", "The room you want to search")
    .action(({ args, logger }) => {
        fs.readFile(args.file, "utf8", function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new CruParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                let found = false;
                let capacity = 0;
                let capacityMax = 0;
                // Search for the room in the file
                analyzer.ParsedCourse.forEach((course) => {
                    course.timeSlots.forEach((ts) => {
                        // If the room was found
                        if (ts.salle === args.room) {
                            found = true;
                            capacity = parseInt(ts.capacite);
                            if (capacity > capacityMax)
                                capacityMax = capacity
                        }
                    });
                });
                if (found === true) {
                    console.log(`Capacity of the room ${args.room} : ${capacityMax}`);
                } else {
                    console.error(`The room ${args.room} was not found in the given file.`);
                }
            } else {
                logger.error("The .cru file contains parsing errors.");
            }
        });
    })

    /**
     * SPEC 3/7 : check free slots for a given room and show the occupied slots if wanted
     * @argument {string} file - The Cru file to analyze.
     * @argument {string} room - The room to check for free and occupied slots.
     * @option {boolean} -o, --occupied - Shows the occupied slots of the room.
     * @option {boolean} -p, --percentage - Shows the percentage of occupancy of the room.
     * @example
     * $ node caporalCli.js freeSlotsForRoom SujetA_data/CD/edt.cru S204 -o -p
     */
    .command("freeSlotsForRoom", "Check when a certain room is free during the week")
    .argument("<file>", "The Cru file to analyze")
    .argument("<room>", "The room to check for free and occupied slots")
    .option("-o, --occupied", "Shows the occupied slots of the room)", { validator: cli.BOOLEAN, default: false })
    .option("-p, --percentage", "Shows the percentage of occupancy of the room)", {
        validator: cli.BOOLEAN,
        default: false,
    })
    .action(async ({ args, options, logger }) => {
        fs.readFile(args.file, "utf8", async function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new CruParser();
            analyzer.parse(data);

            // Get all the slots and the occupied slots
            const occupiedSlots = getOccupiedSlots(analyzer.ParsedCourse, args.room);

            // Check if the room exists in the data
            if (occupiedSlots.length === 0) {
                logger.error(`The room "${args.room}" does not exist in the file.`);
                return;
            }

            const allSlots = generateAllSlots();
            // Calculate the free slots
            const freeSlots = allSlots.filter((slot) => !occupiedSlots.includes(slot));

            // Display the results
            logger.info(`Slots for room ${args.room}:`);
            
            if (freeSlots.length > 0) {
                logger.info("Free time slots:");
                freeSlots.forEach((slot) => console.log(`- ${slot}`));
            } else {
                logger.info("No free time slots found.");
            }

            if (occupiedSlots.length > 0 && options.occupied) {
                logger.info("Occupied time slots:");
                occupiedSlots.forEach((slot) => console.log(`- ${slot}`));
            }
            // Display percentage of occupancy of the room if wanted
            if (options.percentage) {
                // Check if the user has the permission to run this command
                const username = await promptUserForName();
                const hasPermission = checkPermission(username, users, roles.admin);

                if (!hasPermission) {
                    logger.error("Access denied. This command is restricted to admins.");
                    return;
                }

                logger.info("Access granted. Here are the parsed courses:");
                const percentageOccupancy = (occupiedSlots.length / allSlots.length) * 100;
                logger.info(`Occupancy rate: ${percentageOccupancy.toFixed(2)}%`);
            }
        });
    })

    /**
     * SPEC 4 : search available rooms with a given time slot
     * @argument {string} file - The Cru file to search.
     * @argument {string} day - The day you want to know the available rooms (L, MA, ME, J, V, or S).
     * @argument {string} timeSlot - The time slot you want to search (e.g., 08:00-10:00).
     * @option {boolean} -o, --showOccupiedRooms - Show the occupied rooms.
     * @example
     * $ node caporalCli.js findAvailableRooms SujetA_data/CD/edt.cru L 08:00-10:00 -o
     */
    .command("findAvailableRooms", "Looks for the rooms available at a given time slot")
    .argument("<file>", "The Cru file to search")
    .argument("<day>", "The day you want to know the available rooms (L, MA, ME, J, V, or S)")
    .argument("<timeSlot>", "The time slot you want to search (e.g., 08:00-10:00)")
    .option("-o, --showOccupiedRooms", "Show the occupied rooms", { validator: cli.BOOLEAN, default: false })
    .action(({ args, options, logger }) => {
        // Check if the day is valid
        if (!Object.keys(dayOfTheWeek).includes(args.day)) {
            logger.error("Invalid day. Please use L, MA, ME, J, V, or S");
            return;
        }

        // Validate the timeSlot format
        const timeSlotRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]-([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (!timeSlotRegex.test(args.timeSlot)) {
            logger.error(
                "Invalid time slot format. Please use the format HH:MM-HH:MM (e.g., 08:00-10:00)."
            );
            return;
        }

        // We just want the start and end hours, we're not interested in the minutes.
        let beginningTimeSlot = args.timeSlot.split("-")[0]; // We divide the argument "timeSlot" and only take the part before the "-", which is the beginning of the time slot
        let beginningToCompare = parseInt(beginningTimeSlot.split(":")[0]); // We only take what comes before the ":", which is the hour
        let endTimeSlot = args.timeSlot.split("-")[1]; // We divide the argument "timeSlot" and only take the part after the "-", which is the end of the time slot
        let endToCompare = parseInt(endTimeSlot.split(":")[0]); // We only take what comes before the ":", which is the hour

        fs.readFile(args.file, "utf8", function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new CruParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                // Find all the different rooms
                function extractRooms(data) {
                    const roomPattern = /S=([A-Za-z0-9]+)/g;
                    const rooms = [];
                    let match;

                    while ((match = roomPattern.exec(data)) !== null) {
                        rooms.push(match[1]);
                    }
                    return rooms.filter((value, index, self) => self.indexOf(value) === index); // Delete duplicated entries
                }

                const allRooms = extractRooms(data);

                // Find all the occupied rooms
                let occupiedRooms = [];
                analyzer.ParsedCourse.forEach((course) => {
                    course.timeSlots.forEach((slot) => {
                        // Extract only the hour, not the minutes of the time slots of the file, like we did for the argument "timeSlot"
                        let hours = slot.horaire.split(" ")[1];
                        let beginningSlotTime = hours.split("-")[0];
                        let beginningSlotHour = parseInt(beginningSlotTime.split(":")[0]);
                        let endSlotTime = hours.split("-")[1];
                        let endSlotHour = parseInt(endSlotTime.split(":")[0]);

                        // Extract only the day of the time slots of the file
                        let slotDay = slot.horaire.split(" ")[0];

                        let isOverlapping =
                            (beginningSlotHour >= beginningToCompare && beginningSlotHour < endToCompare) || // Is the beginning of the time slot in the interval
                            (endSlotHour > beginningToCompare && endSlotHour <= endToCompare) || // Is the end of the time slot in the interval
                            (beginningSlotHour <= beginningToCompare && endSlotHour >= endToCompare); // Does the time slot covers the entire interval

                        if (slotDay === args.day && isOverlapping) {
                            //If we want to know wich rooms are unavailable :
                            if (options.showOccupiedRooms) {
                                console.log(`Room ocupied : ${slot.salle} (${slot.horaire})`);
                            }
                            occupiedRooms.push(slot.salle);
                        }
                    });
                });

                // Calculate the available rooms
                let availableRooms = allRooms.filter((room) => !occupiedRooms.includes(room));

                // Display the result
                if (availableRooms.length > 0) {
                    logger.info(`Rooms available on ${dayOfTheWeek[args.day]} during the time slot ${args.timeSlot} :`);
                    availableRooms.forEach((room) => console.log(`- ${room}`));
                } else {
                    logger.warn(
                        `No rooms available on ${dayOfTheWeek[args.day]} during the time slot ${args.timeSlot}.`
                    );
                }
            } else {
                logger.error("The .cru file contains errors.".red);
            }
        });
    })

    /**
     * SPEC 5 : Generate an .ics calendar for a student
     * @argument {string} file - The Cru file to use.
     * @argument {string} selectedCourses - Comma-separated list of course codes (e.g., "CL02,CL07").
     * @argument {string} startDate - The start date in YYYY-MM-DD format.
     * @argument {string} endDate - The end date in YYYY-MM-DD format.
     * @option {string} -o, --output - The output file.
     * @example
     * $ node caporalCli.js generateCalendar SujetA_data/CD/edt.cru CL02,CL07 2022-01-01 2022-01-31 -o calendar.ics
     */
    // SPEC 5 : Generate an .ics calendar for a student
    .command("generateCalendar", "Generate an .ics calendar for a student")
    .argument("<file>", "The Cru file to use")
    .argument("<selectedCourses>", 'Comma-separated list of course codes (e.g., "CL02,CL07")')
    .argument("<startDate>", "The start date in YYYY-MM-DD format")
    .argument("<endDate>", "The end date in YYYY-MM-DD format")
    .option("-o, --output <file>", "The output file", { default: "calendar.ics" })
    .action(async({ args, options, logger }) => {

        // Check if the user has the permission to run this command
        const username = await promptUserForName();
        const hasPermission = checkPermission(username, users, roles.student) || checkPermission(username, users, roles.teacher);
        
        if (!hasPermission) {
            logger.error("Access denied. This command is restricted to teacher or student.");
            return;
        }
        
        logger.info("Access granted. Here are the parsed courses:");

        fs.readFile(args.file, "utf8", function (err, data) {
            var analyzer = new CruParser();
            analyzer.parse(data);

            const { selectedCourses, startDate, endDate } = args;
            const outputFile = options.output; // Récupère le nom du fichier
            // Assurez-vous que ParsedCourse est défini et contient les cours analysés
            const parsedCourses = analyzer.ParsedCourse; // Remplacez par votre instance réelle

            const start = new Date(startDate);
            const end = new Date(endDate);

            if (isNaN(start) || isNaN(end)) {
                logger.error("Invalid date format. Please use YYYY-MM-DD.");
                return;
            }

            const events = getStudentSchedule(parsedCourses, selectedCourses, start, end);
            if (events.length === 0) {
                logger.info("No events found for the given courses and date range.");
                return;
            }

            generateICSFile(events, outputFile); // Utilise le nom de fichier passé ou celui par défaut
            logger.info(`Calendar generated successfully: ${outputFile}`);
        });
    })

    /**
     * SPEC 6 : Verify if there are any overlapping courses in the schedule
     * @argument {string} file - The Cru file to check.
     * @example
     * $ node caporalCli.js verifySchedule SujetA_data/CD/edt.cru
     */
    .command("verifySchedule", "Verify if there are any overlapping courses in the schedule")
    .argument("<file>", "The Cru file to check")
    .action(async ({ args, logger }) => {
        // Check if the user has the permission to run this command
        const username = await promptUserForName();
        const hasPermission = checkPermission(username, users, roles.admin);

        if (!hasPermission) {
            logger.error("Access denied. This command is restricted to admins.");
            return;
        }

        logger.info("Access granted. Here are the parsed courses:");

        // Read the file and parse the courses
        fs.readFile(args.file, "utf8", function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new CruParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                let overlaps = []; // Liste pour stocker les cours qui se chevauchent

                // Regrouper les créneaux horaires par salle
                let roomSchedules = {};

                analyzer.ParsedCourse.forEach((course) => {
                    course.timeSlots.forEach((slot) => {
                        if (!roomSchedules[slot.salle]) {
                            // Si la salle n'est pas encore dans la liste
                            roomSchedules[slot.salle] = []; // On crée une liste pour cette salle
                        }
                        roomSchedules[slot.salle].push({
                            // Ajouter les informations du cours, créneau horaire et jour
                            course: course.courseCode,
                            start: parseTime(slot.horaire.split(" ")[1].split("-")[0]), // Convertir en nombre
                            end: parseTime(slot.horaire.split(" ")[1].split("-")[1]), // Convertir en nombre
                            day: slot.horaire.split(" ")[0],
                        });
                    });
                });

                // Fonction pour convertir l'heure en nombre (ex. "14:00" -> 14.00)
                function parseTime(timeStr) {
                    const [hours, minutes] = timeStr.split(":");
                    return parseFloat(`${hours}.${minutes}`);
                }

                // Vérifier les chevauchements pour chaque salle
                for (let room in roomSchedules) {
                    let schedule = roomSchedules[room];

                    // Trier les créneaux horaires par jour et heure de début
                    schedule.sort((a, b) => {
                        if (a.day !== b.day) {
                            return a.day.localeCompare(b.day); // Trier par jour
                        }
                        return a.start - b.start; // Trier par heure de début
                    });

                    // Comparer les créneaux horaires pour détecter les chevauchements
                    for (let i = 0; i < schedule.length - 1; i++) {
                        let current = schedule[i];
                        let next = schedule[i + 1];

                        // Vérifier si les créneaux horaires se chevauchent le même jour
                        if (current.day === next.day && current.end > next.start) {
                            overlaps.push({
                                room,
                                courses: [current.course, next.course],
                                day: current.day,
                                times: [`${current.start}-${current.end}`, `${next.start}-${next.end}`],
                            });
                        }
                    }
                }

                // Afficher les résultats
                if (overlaps.length > 0) {
                    logger.warn("Overlapping courses detected:");
                    overlaps.forEach((overlap) => {
                        logger.info(`Room: ${overlap.room}`);
                        console.log(`Day: ${dayOfTheWeek[overlap.day]}`);
                        console.log(`Courses: ${overlap.courses.join(", ")}`);
                        console.log(`Times: ${overlap.times.join(" and ")}`);
                    });
                }else {
                    logger.info("No overlapping courses detected. The schedule is valid.");
                }

            } else {
                logger.error("The .cru file contains errors. Unable to verify schedule.");
            }
        });
    })

    /**
     * SPEC 8/9 : Identify which rooms are under-utilized or over-utilized and/or generate a pie chart of room occupancy based on the .cru file
     * @argument {string} file - The Cru file to analyze.
     * @option {boolean} -p, --pieChart - The capacity to generate a synthetic visualization of room occupancy rates and rank by seating capacity.
     * @example
     * $ node caporalCli.js utilizedRoom SujetA_data/CD/edt.cru -p
     */
    .command("utilizedRoom", "Show the utilized purcentage")
    .argument("<file>", "The Cru file to search")
    .option("-p, --pieChart", "Shows a graphic representation of the occupancy of the room", {
        validator: cli.BOOLEAN,
        default: false,
    }) // Option pour afficher la représentation graphique
    .action(async ({ args, options, logger }) => {
        // Check if the user has the permission to run this command
        const username = await promptUserForName();
        const hasPermission = checkPermission(username, users, roles.admin);

        if (!hasPermission) {
            logger.error("Access denied. This command is restricted to admins.");
            return;
        }

        logger.info("Access granted. Here are the parsed courses:");
        fs.readFile(args.file, "utf8", function (err, data) {
            if (err) {
                return logger.warn(err);
            }

            const analyzer = new CruParser();
            analyzer.parse(data);

            if (analyzer.errorCount === 0) {
                // First step : Retrieve occupied slots for each room
                const roomOccupancyData = [];
                analyzer.ParsedCourse.forEach((course) => {
                    course.timeSlots.forEach((slot) => {
                        const room = slot.salle;
                        const occupiedSlots = getOccupiedSlots(analyzer.ParsedCourse, room);
                        const totalSlots = 28 * 6 - 20; // Example: 28 30-minute slots per week (8am to 10pm)
                        let occupiedCount = occupiedSlots.length;
                        if (!roomOccupancyData.some((roomData) => roomData.room === room)) {
                            roomOccupancyData.push({
                                room,
                                occupiedCount,
                                totalSlots,
                                capacity: slot.capacite, // If available in .cru file
                            });
                        }
                    });
                });

                // Iteration on 'rooms' object keys
                roomOccupancyData.forEach((data) => {
                    // Retrieve room occupancy percentage in 'rooms
                    const occupencyPercentage = ((data.occupiedCount / data.totalSlots) * 100).toFixed(2);

                    // Retrieve room capacity in 'capacity'.
                    const roomCapacity = data.capacity;

                    // Display the occupancy percentage and capacity of each room
                    console.log(`Room: ${data.room}`);
                    console.log(`  Occupancy Percentage: ${occupencyPercentage}%`);
                    console.log(`  Capacity: ${roomCapacity}`);
                    if (occupencyPercentage <= 50) {
                        logger.warn(`This room is under-utilized`);
                    } else if (occupencyPercentage < 80 && occupencyPercentage > 50) {
                        logger.info(`This room is normal utilized`);
                    } else {
                        logger.warn(`This room is over-utilized`);
                    }

                    if (options.pieChart) {
                        const chartUrl = generateChart(data.room, data.occupiedCount, data.totalSlots);
                        logger.info(`Chart URL: ${chartUrl}`);
                    }

                    console.log("----------------------------");
                });
            } else {
                logger.warn("The .cru file contains parsing errors.");
            }
        });
    });

cli.run(process.argv.slice(2));
