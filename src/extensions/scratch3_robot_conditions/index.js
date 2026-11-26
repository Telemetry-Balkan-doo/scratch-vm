const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

class RobotConditionsBlocks {

    static get EXTENSION_ID () {
        return 'Conditions';
    }

    constructor (runtime) {
        this.runtime = runtime;
    }

    getInfo () {
        return {
            id: RobotConditionsBlocks.EXTENSION_ID,
            name: 'Conditions',
            blocks: [
                {
                    opcode: 'fulfillment_wait',
                    blockType: BlockType.CONDITIONAL,
                    branchCount: 1,
                    text: 'check then do: [CONDITION]',
                    arguments: {
                        CONDITION: {
                            type: ArgumentType.BOOLEAN
                        }
                    }
                }
            ]
        };
    }

    fulfillment_wait (args, util) {
        // as a condition
        if (args.CONDITION === true || String(args.CONDITION).trim() === 'true' 
            || Number.isNaN(Number(args.CONDITION)) || Number(args.CONDITION) < 0) return
        if (args.CONDITION === false || String(args.CONDITION).trim() === 'false' 
            || String(args.CONDITION).trim() === '') {
            
            util.yieldTick();
            return
        }

        // as a timer
        if (Number(args.CONDITION) === 0) return;
        if (util.stackFrame.start === undefined) {
            util.stackFrame.start = Date.now();
            util.yield();

        } else if (Date.now() - util.stackFrame.start < 1000 * Number(args.CONDITION)) {
            util.yield();
        }
    }
}

module.exports = RobotConditionsBlocks;
