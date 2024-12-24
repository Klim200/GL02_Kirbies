### README - Les Kirbies - GL02

Description :  The caporalCLI is a command-line tool that allows managing courses and time slots. It enables defining courses with unique codes, specifying time slots with detailed information such as type, capacity, time, day, group ID, and room code. The files are in cru format and should respect the following grammar.

Course Definition :
<course-def> = "+" <course-code> CRLF *(<time-slot>)

<course-code> = 2ALPHA 2DIGIT
## Changed to this to fit existing datas -->
<course-code>  = <letters> <digits> [letters digit]
<letters>      = 2*3ALPHA
<digits>       = 1*2DIGIT
##

Each course begins with a ‘+’ followed by a unique ‘course-code’. The course code consists
of two letters and two digits.

Time Slot :
<time-slot> = <slot-id> "," <type> "," <capacity> "," <time> "," <group-id> "," <room> "//" CRLF
<slot-id> = DIGIT
<type> = ALPHA 1-2DIGIT ## Changed to this --> <type> = ALPHA DIGIT ##
<capacity> = "P=" 1-3DIGIT
<time> = "H=" day WSP <time-range>
<day> = 1-2ALPHA
<time-range> = <time-start> "-" <time-end>
<time-start> = 1-2DIGIT ":" 2DIGIT
<time-end> = 1-2DIGIT ":"2DIGIT
<groupe-id> = "F" 1(DIGIT / ALPHA) ## Changed to this --> <groupe-id> = "F" DIGIT ##
<room> = "S=" <room-code>
<room-code> = (1ALPHA 3DIGIT) / (3ALPHA 1DIGIT)

Each time slot is represented by a unique ‘slot-id’, followed by information such as type, participant capacity, time, day, group ID, and room code.

### Installation

$ npm install

### Utilisation :

# Options globales :

-h or --help 	 :	  Display the program help
-V, --version    :    Display version.
--no-color       :    Disable use of colors in output.
-v, --verbose    :    Verbose mode: will also output debug messages.        
--quiet          :    Quiet mode - only displays warn and error messages.   
--silent         :    Silent mode: does not output anything, giving no indication of success or failure other than the exit code.

$ node caporalCli.js <command> fileToParse [args] [-options]


<command> : check


-t or --showTokenize :	Display the tokenization result 
-d or --showDebug    : 	Display each step of the analysis


<command> : findCourseRooms


file		:   The Cru file where you want to search (e.g. "edt.cru")
course		:   The course for which you want to know the associated rooms (e.g. "CM02")

-c or --capacity : Display the capacity of the rooms associated with the given course


<command> : findRomCapacity


file		:   The Cru file where you want to search (e.g. "edt.cru")
room		:   The room for which you want to know the capacity (e.g. "A105")

<command> : freeSlotsForRoom


file        :   The Cru file where you want to search (e.g. "edt.cru")
room		:   The room for which you want to know the capacity (e.g. "A105")

-o or --occupied   :   Shows the occupied slots of the room { default : false }
-p or --percentage :   Shows the percentage of occupancy of the room boolean


<command> : findAvailableRooms


file		:   The Cru file where you want to search (e.g. "edt.cru")
day		    :   The day when for which you want the available room. Please only give the first lette of the day, in French ("L", "MA", "ME", "J", "V", or "S") 
timeSlot	:   The time slot for which you want the available rooms. Please write it with the format HH:MM-HH:MM (e.g. "10:00-12:00)


<command> : generateCalendar

selectedCourses :   Comma-separated list of course codes (e.g.,"CL02,CL07")
startDate       :   The start date in YYYY-MM-DD format
endDate         :   The end date in YYYY-MM-DD format

-o or --output <file>   :   The output file where you want to save the calendar { default : "calendar.ics" }


<command> : verifySchedule


file		:   The Cru file where you want to search (e.g. "edt.cru")


<command> : utilizedRoom


file        :   The Cru file where you want to search (e.g. "edt.cru")

-p or --pieChart   :   Shows a graphic representation of the occupancy of the room { default : false }


### Version : 

# 0.10
- Ajout de la SPEC 7 via la commande de la SPEC 3 qui permet d'afficher le taux d'occupation d'une salle
- Update des authentifications sur les SPEC concernées

# 0.09
- Ajout des SPECs 8 et 9 qui permmetent des connaître le pourcentage d'occupation des salles dans la semaine

# 0.08
- Ajout de la SPEC 3 qui vérifie quand est ce qu'une salle est libre

# 0.07
- Ajout d'un système d'authentification pour les commandes qui ont des restrictions sur les utilisateurs qui les utilisent

# 0.06
- Ajout des SPEC 1, 2 et 4 permettant de trouver des salles selon différents critères (cours, disponibilité selon date et heure)
- Ajout de la SPEC 6 qui permet de vérifier qu'aucun cours n'a lieu au même moment dans la même salle
- Ajout de commentaires expliquant le fonctionnement des différentes commandes

# 0.05

- Implémentation du test unitaire pour le parser
- Erreurs du parser réglé, ne renvoie pas d'erreurs si le fichier est bon 

# 0.04

- Ajout de la spec 5 permettant la génération d'un iCalender entre 2 dates pour les matières voulu
- Création d'un fichier externe permettant le regroupemment des fonctions longues en dehors du CaporalCli.js

# 0.03

- Ajout des options showDebug et showTokenize pour suivre les actions du parser et/ou le tableau de tokens

# 0.02

- Commande <check> pour vérifier l'état d'un fichier selon le parser fonctionelle
- Parse entièrement les fichiers du jeu de test (mais termine avec plusieurs erreur)
- Prise en compte des sauts de lignes ou espaces en trop dans le jeu de données

# 0.01

- Première version du parser non fonctionnelle
