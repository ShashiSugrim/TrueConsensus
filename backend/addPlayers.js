const fs = require('fs');
const axios = require('axios');

const FILE_PATH = './players.txt'; // Path to your text file
const VOTING_ID = 1; // Replace this with your voting ID
const URL = 'https://tcbackend.backendboosterbeast.com/voting-elements';

async function voteForPlayers() {
    try {
        const data = fs.readFileSync(FILE_PATH, 'utf8');
        const players = data.split(',').map(name => name.trim());

        for (const player of players) {
            if (player) {
                const payload = {
                    voting_id: VOTING_ID,
                    item: player
                };

                try {
                    const response = await axios.post(URL, payload);
                    console.log(`Voted for: ${player} - Status: ${response.status}`);
                } catch (error) {
                    console.error(`Failed to vote for: ${player} - Error: ${error.message}`);
                }
            }
        }

        console.log('All votes submitted.');
    } catch (error) {
        console.error(`Error reading file: ${error.message}`);
    }
}

voteForPlayers();
