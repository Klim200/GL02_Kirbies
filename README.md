# README - Les Kirbies - GL02

## I. Description 
The Central University of the Republic of Sealand (SRU) aims to enhance classroom resource management with a new tool. This tool will help administrators, teachers, and students efficiently organize classroom use. Users can check room occupancy, find free rooms, and generate iCalendar files (RFC 5545) for integrating schedules into personal calendars.

## II. Installation
Récupérez le projet, lancez depuis un terminal la commande :
<npm install> (installe toutes les dépendances nécessaires)

Les dépendances du projet sont :
* "jasmine": "^3.6.3"
* "@caporal/core": "^2.0.7"
* "colors": "^1.4.0"
* "ics": "^3.8.1"
* "punycode": "^2.3.1"
* "quickchart-js": "^3.1.3"

Pour vérifier que le projet est correctement installé, une page d’aide sur le logiciel devrait apparaître avec la commande :
<node CaporalCli.js --help>

La commande expliquera succinctement les commandes possibles suivantes :
* check
* findCourseRooms
* findRoomCapacity
* freeSlotsForRoom
* findAvailableRooms
* generateCalendar
* verifySchedule
* utilizedRoom

Les commandes existantes sont affichées dans le node CaporalCli.js help : <node CaporalCli.js help <nom-commande>>

## III. Utilisation :

### Options globales :

**-h or --help 	   :**	  Display the program help
**-V, --version    :**    Display version.
**--no-color       :**    Disable use of colors in output.
**-v, --verbose    :**    Verbose mode: will also output debug messages.        
**--quiet          :**    Quiet mode - only displays warn and error messages.   
**--silent         :**    Silent mode: does not output anything, giving no indication of success or failure other than the exit code.

<node caporalCli.js <command> fileToParse [args] [-options]>

### Commandes : 
**<command> : check**

Options :
* **-t or --showTokenize :**	Display the tokenization result 
* **-d or --showDebug    :** 	Display each step of the analysis

**<command> : findCourseRooms**

Arguments :
* **file		:**  The Cru file where you want to search (e.g. "edt.cru")
* **course	:**  The course for which you want to know the associated rooms (e.g. "CM02")

Options :
* **-c or --capacity :** Display the capacity of the rooms associated with the given course

**<command> : findRomCapacity**

Arguments :
* **file		:**   The Cru file where you want to search (e.g. "edt.cru")
* **room		:**   The room for which you want to know the capacity (e.g. "A105")

**<command> : freeSlotsForRoom**

Arguments :
* **file    :**   The Cru file where you want to search (e.g. "edt.cru")
* **room	 	:**   The room for which you want to know the capacity (e.g. "A105")

Options :
* **-o or --occupied   :**   Shows the occupied slots of the room { default : false }
* **-p or --percentage :**   Shows the percentage of occupancy of the room boolean


**<command> : findAvailableRooms**

Arguments :
* **file		  :**   The Cru file where you want to search (e.g. "edt.cru")
* **day		    :**   The day when for which you want the available room. Please only give the first lette of the day, in French ("L", "MA", "ME", "J", "V", or "S") 
* **timeSlot	:**   The time slot for which you want the available rooms. Please write it with the format HH:MM-HH:MM (e.g. "10:00-12:00)

**<command> : generateCalendar**

Arguments : 
* **selectedCourses :**   Comma-separated list of course codes (e.g.,"CL02,CL07")
* **startDate       :**   The start date in YYYY-MM-DD format
* **endDate         :**   The end date in YYYY-MM-DD format

Options : 
* **-o or --output <file>   :**   The output file where you want to save the calendar { default : "calendar.ics" }

**<command> : verifySchedule**

Arguments :
* **file		:**   The Cru file where you want to search (e.g. "edt.cru")


**<command> : utilizedRoom**

Arguments :
* **file  :**   The Cru file where you want to search (e.g. "edt.cru")

Options :
* **-p or --pieChart   :**   Shows a graphic representation of the occupancy of the room { default : false }


## IV. Version : 

**0.10**
* Ajout de la SPEC 7 via la commande de la SPEC 3 qui permet d'afficher le taux d'occupation d'une salle
* Update des authentifications sur les SPEC concernées

**0.09**
* Ajout des SPECs 8 et 9 qui permmetent des connaître le pourcentage d'occupation des salles dans la semaine

**0.08**
* Ajout de la SPEC 3 qui vérifie quand est ce qu'une salle est libre

**0.07**
* Ajout d'un système d'authentification pour les commandes qui ont des restrictions sur les utilisateurs qui les utilisent

**0.06**
* Ajout des SPEC 1, 2 et 4 permettant de trouver des salles selon différents critères (cours, disponibilité selon date et heure)
* Ajout de la SPEC 6 qui permet de vérifier qu'aucun cours n'a lieu au même moment dans la même salle
* Ajout de commentaires expliquant le fonctionnement des différentes commandes

**0.05**
* Implémentation du test unitaire pour le parser
* Erreurs du parser réglé, ne renvoie pas d'erreurs si le fichier est bon 

**0.04**
* Ajout de la spec 5 permettant la génération d'un iCalender entre 2 dates pour les matières voulu
* Création d'un fichier externe permettant le regroupemment des fonctions longues en dehors du CaporalCli.js

**0.03**
* Ajout des options showDebug et showTokenize pour suivre les actions du parser et/ou le tableau de tokens

**0.02**
* Commande <check> pour vérifier l'état d'un fichier selon le parser fonctionelle
* Parse entièrement les fichiers du jeu de test (mais termine avec plusieurs erreur)
* Prise en compte des sauts de lignes ou espaces en trop dans le jeu de données

**0.01**
* Première version du parser non fonctionnelle

## V. Licence
**MIT License**
Copyright (c) 2024-2025 PlanForYou

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.

## VI. Auteurs
**PlanForYou :** 
* Camille Guth (camille.guth@utt.fr)
* Xinyu Hu (xinyu.hu@utt.fr)
* Klimentiy Mirek (klimentiy.mirek@utt.fr)

**Kirbies :**
* Paul Fernandez (paul.fernandez@utt.fr)
* Juliette Siebering (juliette.siebering@utt.fr)
* Iris Gagniere (iris.gagniere@utt.fr)
