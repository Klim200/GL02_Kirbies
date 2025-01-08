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
            plugins: {
                title: {
                    display: true, // Assure que le titre est activé
                    text: `Occupancy for Room: `, // Texte du titre
                    font: {
                        size: 18, // Taille du titre
                        weight: 'bold', // Met le texte en gras
                        family: 'Arial', // Police de caractères (optionnelle)
                    },
                    padding: {
                        top: 10,
                        bottom: 10,
                    },
                    color: '#333333', // Couleur du texte
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
        }
    });
    chart.setWidth(400).setHeight(400);
    return chart.getUrl(); // Retourne l'URL du graphique
};

module.exports = {generateChart};