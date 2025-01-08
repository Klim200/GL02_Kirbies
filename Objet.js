// Constructeur de time-slot
// Slot = (C, T, P, H, G, S)
var Time_Slot = function (I, T, P, H, G, S) {
    // C : Course code
    this.id = I;
    // T : Type
    this.type = T;
    // P : Capacity (max number of students)
    this.capacite = P;
    // H : Schedule
    this.horaire = H;
    // G : Subgroup
    this.groupe = G;
    // S : Associated room
    this.salle = S;
}
Time_Slot.prototype.toString = function () {
    return `ID: ${this.id}, Type: ${this.type}, Capacité: ${this.capacite}, Horaire: ${this.horaire}, Groupe: ${this.groupe}, Salle: ${this.salle}`;
};

module.exports = Time_Slot;