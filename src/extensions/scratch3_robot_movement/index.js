const { name } = require('file-loader');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');


class RobotMovementBlocks {

    static get EXTENSION_ID () {
        return 'Move';
    };

    constructor (runtime) {
        this.runtime = runtime;
    };

    getInfo () {
        return {
            id: RobotMovementBlocks.EXTENSION_ID,
            name: 'Move',
            blocks: [
                {
                    opcode: 'forward',
                    blockType:  BlockType.COMMAND,
                    text: 'Robot_block [METERS]',
                    arguments: {
                        METERS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'backward',
                    blockType:  BlockType.COMMAND,
                    text: 'Robot_block [METERS]',
                    arguments: {
                        METERS: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'degrees_left_90',
                    blockType:  BlockType.COMMAND,
                    text: 'Robot_block [ANGLE]',
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'Rotate left 90 degrees!'
                        }
                    }
                },
                {
                    opcode: 'degrees_right_90',
                    blockType:  BlockType.COMMAND,
                    text: 'Robot_block [ANGLE]',
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 'Rotate right 90 degrees!'
                        }
                    }
                },
                {
                    opcode: 'given_angle',
                    blockType:  BlockType.COMMAND,
                    text: 'Robot_block [ANGLE]',
                    arguments: {
                        ANGLE: {
                            type: ArgumentType.NUMBER,
                            defaultValue: 0
                        }
                    }
                },
                {
                    opcode: 'goal_pose',
                    blockType:  BlockType.COMMAND,
                    text: 'Robot_block [LABEL]',
                    arguments: {
                        LABEL: {
                            type: ArgumentType.STRING,
                            defaultValue: ''
                        }
                    }
                }
            ]
        };
    };

    forward (args) {
        const movement = typeof args.METERS === 'string' ? JSON.parse(args.METERS) : args.METERS;
        if (!Array.isArray(movement) || movement.length < 2 ||
            typeof movement[0] === 'boolean' || typeof movement[1] === 'boolean')
            return;

        const meters = Number(movement[0]);
        const speed = Number(movement[1]);
        if (!Number.isFinite(meters) || !Number.isFinite(speed))
            return;
        
        return new Promise((resolve) => {
            this.runtime.emit('ROBOT_FORWARD', {
                msg: `Result: ${meters}`,
                meters,
                speed,
                time: Date.now(),
                done: resolve
            });
        });
    };

    backward (args) {
        const movement = typeof args.METERS === 'string' ? JSON.parse(args.METERS) : args.METERS;
        if (!Array.isArray(movement) || movement.length < 2 ||
            typeof movement[0] === 'boolean' || typeof movement[1] === 'boolean')
            return;

        const meters = Number(movement[0]);
        const speed = Number(movement[1]);
        if (!Number.isFinite(meters) || !Number.isFinite(speed))
            return;

        return new Promise((resolve) => {
            this.runtime.emit('ROBOT_BACKWARD', {
                msg: `Result: ${meters}`,
                meters,
                speed,
                time: Date.now(),
                done: resolve
            });
        });
    };

    degrees_left_90 (args) {
        return new Promise((resolve) => {
            this.runtime.emit('ROBOT_ROTATE_LEFT_90', {
                msg: `Result: ${args.TEXT}`,
                time: Date.now(),
                done: resolve
            });
        });
    };

    degrees_right_90 (args) {
        return new Promise((resolve) => {
            this.runtime.emit('ROBOT_ROTATE_RIGHT_90', {
                msg: `Result: ${args.TEXT}`,
                time: Date.now(),
                done: resolve
            });
        });
    };

    given_angle (args) {
        if (typeof args.ANGLE === 'boolean')
            return;
        if (isNaN(Number(args.ANGLE)))
            return;

        return new Promise((resolve) => {
            this.runtime.emit('ROBOT_ROTATE_GIVEN_ANGLE', {
                msg: `Result: ${args.ANGLE}`,
                angle: args.ANGLE,
                time: Date.now(),
                done: resolve
            });
        });
    };

    goal_pose (args) {
        return new Promise((resolve) => {
            this.runtime.emit('ROBOT_GOAL_POSE', {
                msg: `Result: ${args.LABEL}`,
                label: args.LABEL,
                time: Date.now(),
                done: resolve
            });
        });
    };
};

module.exports = RobotMovementBlocks;
