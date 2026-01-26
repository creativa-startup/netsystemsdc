const https = require('https');

const API_KEY = "AIzaSyDJOKrsT4c7XZSa3qzkh_XAq8S3eo7B-do";
const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', index => { data += index; });
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            const fs = require('fs');
            if (json.models) {
                const output = json.models.map(m => m.name).join('\n');
                fs.writeFileSync('scripts/models_list.txt', output);
                console.log("Models written to scripts/models_list.txt");
            } else {
                console.log("ERROR RESPONSE:", data);
            }
        } catch (e) {
            console.log("RAW DATA:", data);
        }
    });
}).on('error', (e) => {
    console.error(e);
});
