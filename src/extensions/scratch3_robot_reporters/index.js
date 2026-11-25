const BlockType = require('../../extension-support/block-type');

class RobotReportsBlocks {

    static get EXTENSION_ID () {
        return 'Reporter';
    }

    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: RobotReportsBlocks.EXTENSION_ID,
            name: 'Reporter',
            blocks: [
                {
                    opcode: 'get_distance_to_obstacle',
                    blockType: BlockType.REPORTER,
                    text: 'Get distance to obstacle'
                },
                {
                    opcode: 'get_pitch',
                    blockType: BlockType.REPORTER,
                    text: 'Get pitch reporter'
                },
                {
                    opcode: 'get_roll',
                    blockType: BlockType.REPORTER,
                    text: 'Get roll reporter'
                },
                {
                    opcode: 'get_yaw',
                    blockType: BlockType.REPORTER,
                    text: 'Get yaw reporter'
                },
                {
                    opcode: 'get_random_number',
                    blockType: BlockType.REPORTER,
                    text: 'Get random namber'
                }
            ]
        };
    }

    get_distance_to_obstacle (args) {
        return new Promise(resolve => {
            this.runtime.once('GET_DISTANCE', val => {
                resolve(val);
            });

            this.runtime.emit('GET_DISTANCE_TO_OBSTACLE', args.CHOICE);
        });
    }

    get_pitch () {
        return new Promise(resolve => {
            this.runtime.once('GET_PITCH', val => {
                resolve(val === true);
            });

            this.runtime.emit('GET_PITCH_DEVIATION');
        });
    }

    get_roll () {
        return new Promise(resolve => {
            this.runtime.once('GET_ROLL', val => {
                resolve(val === true);
            });

            this.runtime.emit('GET_ROLL_DEVIATION');
        });
    }

    get_yaw () {
        return new Promise(resolve => {
            this.runtime.once('GET_YAW', val => {
                resolve(val === true);
            });

            this.runtime.emit('GET_YAW_DEVIATION');
        });
    }

    get_random_number (args) {
        const rangeNumbers = JSON.parse(args.RANGE_SETTINGS);

        let max = Number(rangeNumbers[0]);
        let min = Number(rangeNumbers[1]);

        if (rangeNumbers[0] > rangeNumbers[1]) {
            max = Number(rangeNumbers[0]);
            min = Number(rangeNumbers[1]);
        } else {
            max = Number(rangeNumbers[1]);
            min = Number(rangeNumbers[0]);
        }

        const randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;

        return new Promise(resolve => {
            resolve(randomNumber);
        });
    }
}

module.exports = RobotReportsBlocks;