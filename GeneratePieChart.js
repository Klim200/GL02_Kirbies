const fs = require('fs');
const QuickChart = require('quickchart-js');

// Fonction pour générer la visualisation du taux d'occupation
const generateChart = (room, occupiedCount, totalSlots) => {
    const percentage = ((occupiedCount / totalSlots) * 100).toFixed(2);
    const chart = new QuickChart();
    chart.setConfig({
        type: 'pie',
        data: {
            labels: ['Occupied', 'Free'],
            datasets: [{
                label: 'Room Occupancy',
                data: [percentage, 100 - percentage],
                backgroundColor: ['#FF5733', '#33FF57'],
            }]
        },
        options: {
                title: {
                    display: true, // Assure que le titre est activé
                    text: `Occupancy of Room ${room}`, // Texte du titre
                },
                legend: {
                    display: true, // Affiche la légende si besoin
                    position: 'bottom', // Position de la légende

                },
                tooltip: {
                    callbacks: {
                        label: (context) => `${context.label}: ${context.raw.toFixed(2)}%`
                    }
                }

        }
    });
    chart.setWidth(300).setHeight(300);

    return chart.getUrl(); // Retourne l'URL du graphique
};

module.exports = {generateChart};
