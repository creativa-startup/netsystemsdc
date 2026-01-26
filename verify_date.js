const { format, startOfDay, endOfDay, eachDayOfInterval } = require('date-fns');

// Simulating the change made in the component
function checkDateParsing(dateStr) {
    const originalMethod = new Date(dateStr);
    const newMethod = new Date(dateStr + 'T00:00:00');

    console.log(`Input: ${dateStr}`);
    console.log(`Original (new Date(str)): ${originalMethod.toString()}`);
    console.log(`New (new Date(str + 'T00:00:00')): ${newMethod.toString()}`);

    // Simulate chart interval logic
    const start = startOfDay(newMethod);
    console.log(`startOfDay(newMethod): ${start.toString()}`);

    return start.getDate() === new Date(dateStr + 'T00:00:00').getDate();
}

console.log('--- Verification Test ---');
const dateToTest = '2023-10-25';
const isCorrect = checkDateParsing(dateToTest);
console.log(`\nIs date correct (local day matches input day)? ${isCorrect}`);
