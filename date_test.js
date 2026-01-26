const { format, startOfDay, endOfDay, eachDayOfInterval } = require('date-fns');

const startStr = '2023-10-25';
const endStr = '2023-10-30';

console.log(`Input Start: ${startStr}`);
console.log(`Input End: ${endStr}`);

const d1 = new Date(startStr);
console.log(`new Date('${startStr}') -> ${d1.toString()} (ISO string: ${d1.toISOString()})`);

const start = startOfDay(d1);
console.log(`startOfDay -> ${start.toString()}`);

const d2 = new Date(endStr);
console.log(`new Date('${endStr}') -> ${d2.toString()}`);

const end = endOfDay(d2);
console.log(`endOfDay -> ${end.toString()}`);

const interval = eachDayOfInterval({ start, end });
console.log('Interval days:');
interval.forEach(d => console.log(format(d, 'yyyy-MM-dd')));

const d1Local = new Date(startStr + 'T00:00:00');
console.log(`\nnew Date('${startStr}T00:00:00') -> ${d1Local.toString()}`);
const startLocal = startOfDay(d1Local);
console.log(`startOfDay (Local) -> ${startLocal.toString()}`);
