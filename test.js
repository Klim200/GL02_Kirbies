const {generateChart} = require('./GeneratePieChart.js');

const chartUrl = generateChart('Room A101', 15, 20);
console.log(chartUrl);