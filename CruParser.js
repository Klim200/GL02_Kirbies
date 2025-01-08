var Time_Slot = require("./Objet.js");

var CruParser = function (sTokenize, sDebug) {
    this.ParsedCourse = [];
    this.symb = ["+", "//"];
    this.showTokenize = sTokenize;
    this.showDebug = sDebug;
    this.errorCount = 0;
}

//---------------------------------Parser procedure------------------------------------//

// tokenize : transform the data input into a list
CruParser.prototype.tokenize = function (data) {
    var separator = /(\r\n|,|\/\/|\+|\=|\s|-)/; // Séparateur : retour à la ligne, virgule, double barre oblique, plus, égal, espace, tiret
    data = data.split(separator);
    data = data.filter((val, idx) => !val.match(/,|\=/)); // Supprime les séparateurs eux-mêmes
    data = data.filter((val, idx) => val.trim() !== ""); // Filtrer les lignes vides ou composées uniquement d'espaces
    data = data.map((val) => val.trim()); // Normalisation des tokens : enlève les espaces autour de chaque élément
    return data;
};

// parse : analyze data by calling the first non terminal rule of the grammar
CruParser.prototype.parse = function (data) {
    var tData = this.tokenize(data);
    if (this.showTokenize) {
        console.log(tData);
    }
    this.course_def(tData);
};

//-------------------Parser operand------------//

CruParser.prototype.errMsg = function (msg, input) {
    this.errorCount++;
    console.log("Parsing Error ! on " + input + " -- msg : " + msg);
    console.log("Error count : " + this.errorCount);
};

// Read and return a symbol from input
CruParser.prototype.next = function (input) {
    var curS = input.shift();
    if (this.showParsedSymbols) {
        console.log("curS ",curS);
    }
    return curS;
};

// accept : verify if the arg s is part of the language symbols.
CruParser.prototype.accept = function (s) {
    var idx = this.symb.indexOf(s);
    if (idx === -1) {
        this.errMsg("symbol " + s + " unknown", [" "]);
        return false;
    }

    return idx;
};
// checkCourse : check whether the arg elt is on the head of the list only for a new course definition
CruParser.prototype.checkCourse = function (s, input) {
    // Si `s` est un symbole fixe (exemple : "+" ou "//")
    if (this.symb.includes(s)) {
        return this.acceptCourse(input[0]) === this.acceptCourse(s);
    }
};
// acceptCourse : verify if the arg s is part of the language symbols for a new course definition.
CruParser.prototype.acceptCourse = function (s) {
    var idx = this.symb.indexOf(s);
    return idx;
};
// check : check whether the arg elt is on the head of the list
CruParser.prototype.check = function (s, input) {
    // Si `s` est un symbole fixe (exemple : "+" ou "//")
    if (this.symb.includes(s)) {
        if (s === "+" && this.inTimeSlot) {
            return false; // Ignore "+" si on est dan sun time_slot
        }
        return this.accept(input[0]) === this.accept(s);
    }
};

// expect : expect the next symbol to be s.
CruParser.prototype.expect = function (s, input) {
    if (s == this.next(input)) {
        if (this.showDebug) {
            console.log("Reckognized! " + s);
        }
        return true;
    } else {
        this.errMsg("symbol " + s + " doesn't match", input);
    }
    return false;
};

//-----------------------------------Parser rules--------------------------------------//
// <course-def> = "+" <course-code> CRLF *<time-slot>
CruParser.prototype.course_def = function (input) {
    if (this.check("+", input)) {
        this.expect("+", input);
        let courseCode = this.course_code(input); // Analyse le code du cours
        let timeSlots = []; // Tableau pour stocker les time_slots
        while (input.length > 0 && !this.checkCourse("+", input)) {
            let args = this.time_slot(input); // Analyse un time_slot

            let ts = new Time_Slot(
                args.id,
                args.type,
                args.capacite,
                args.horaire,
                args.groupe,
                args.salle
            );
            timeSlots.push(ts); // Ajoute le time_slot au tableau
            this.expect("//", input); // Vérifie la fin du time_slot
        }      
        // Stocke le cours et ses time_slots
        this.ParsedCourse.push({ courseCode, timeSlots });
        // Passe au prochain course_def, s'il en reste
        if (input.length > 0) {
            this.course_def(input);
        }
        return true;
    } else {
        return false;
    }
};

// <course-code> = 2ALPHA 2DIGIT
CruParser.prototype.course_code = function (input) {
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Course Code", curS);
    }
    if ((matched = curS.match(/^[A-Z]{2,3}\d{1,2}[A-Z]?\d?$/i))) {
        if (this.showDebug) {
            console.log("course_code validé", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg("Invalid course code \n Expected format : 'XX00' (e.g., 'CS01')", input);
    }
};

// <time-slot> = <slot-id> "," <type> "," <capacity> "," <time> "," <group-id> "," <room> "//" CRLF
CruParser.prototype.time_slot = function (input) {
    let id = this.slot_id(input);

    let type = this.type(input);

    let capacity = this.capacity(input);

    let schedule = this.schedule(input);

    let group = this.group_id(input);

    let room = this.room(input);

    return {
        id: id,
        type: type,
        capacite: capacity,
        horaire: schedule,
        groupe: group,
        salle: room,
    };
};

// <slot-id> = DIGIT
CruParser.prototype.slot_id = function (input) {
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Slot ID", curS);
    }
    if ((matched = curS.match(/^\d$/i))) {
        if (this.showDebug) {
            console.log("slot_id validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg("Invalid slot ID \n Expected a number", curS);
    }
};

// <type> = ALPHA DIGIT
CruParser.prototype.type = function (input) {
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Type", curS);
    }
    if ((matched = curS.match(/^[A-Z]\d$/i))) {
        if (this.showDebug) {
            console.log("type validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg("Invalid Type \n Expected format : 'X0'|'X00' ", curS);
    }
};

//<capacity> "P="" 1-3DIGIT
CruParser.prototype.capacity = function (input) {
    this.expect("P", input);
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Capacity", curS);
    }
    if ((matched = curS.match(/^\d{1,3}$/i))) {
        if (this.showDebug) {
            console.log("capacity validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg("Invalid capacity \n  Expected format: '0'|'00'|'000'", curS);
    }
};

// <time> = "H=" <day> WSP <time-range>
CruParser.prototype.schedule = function (input) {
    this.expect("H", input);
    let day = this.day(input);
    let timeRange = this.time_range(input);

    return `${day} ${timeRange}`;
};

//<day> = 1-2ALPHA
CruParser.prototype.day = function (input) {
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Day", curS);
    }
    if ((matched = curS.match(/^(L|MA|ME|J|V|S)$/i))) {
        if (this.showDebug) {
            console.log("day validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg("Invalid day \n Expected 'L|MA|ME|J|V|S' ", curS);
    }
};

//<time-range> = <time-start> "-" <time-end>
CruParser.prototype.time_range = function (input) {
    let startTime = this.time_start(input);
    this.expect("-", input);
    let endTime = this.time_end(input);
    return `${startTime}-${endTime}`;
};

//<time-start> = 1-2DIGIT ":" 2DIGIT
CruParser.prototype.time_start = function (input) {
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Time Start", curS);
    }
    if ((matched = curS.match(/^([8-9]|1[0-9]|20):[0-5][0-9]$/i))) {
        if (this.showDebug) {
            console.log("time_start validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg("Invalid start time. Expected format: 'HH:MM' ('08:30' to '20:59' max) ", curS);
    }
};

//<time-end> = 1-2DIGIT ":" 2DIGIT
CruParser.prototype.time_end = function (input) {
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Time End", curS);
    }
    if (matched = curS.match(/^([8-9]|1[0-9]|2[0-2]):[0-5][0-9]$/i)) {
        if (this.showDebug) {
            console.log("time_end validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg(
            "Invalid end time \n Expected format : 'HH:MM' ('09:00' to '22:59' max) ",
            curS
        );
    }
};

//<groupe-id> = "F" DIGIT
CruParser.prototype.group_id = function (input) {
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Group ID", curS);
    }
    if ((matched = curS.match(/^F[0-9]$/i))) {
        if (this.showDebug) {
            console.log("group_id validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg("Invalid group ID \n Expected format : 'F' followed by a digit ", curS);
    }
};

// <room> = "S=" <room-code>
// <room-code> = (1ALPHA 3DIGIT) / (3ALPHA 1DIGIT)
CruParser.prototype.room = function (input) {
    this.expect("S", input);
    var curS = this.next(input);
    if (this.showDebug) {
        console.log("curS Room", curS);
    }
    if ((matched = curS.match(/^(([A-Z]\d{3})|([A-Z]{3}\d))$/i))) {
        if (this.showDebug) {
            console.log("room validated", matched[0]);
        }
        return matched[0];
    } else {
        this.errMsg(
            "Invalid room code \n Expected format : 'X000' or '000X' (e.g., 'C001' or 'EXT1')",
            curS
        );
    }
};

module.exports = CruParser;
