const { name } = require('file-loader');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');


class RobotConditionsBlocks {

    static get EXTENSION_ID () {
        return 'Loop';
    };

    constructor (runtime) {
        this.runtime = runtime;
    };

    getInfo () {
        return {
            id: RobotConditionsBlocks.EXTENSION_ID,
            name: 'Loop',
            blocks: [
                {
                    opcode: 'forever',
                    blockType: BlockType.LOOP,
                    branchCount: 1,
                    text: 'forever loop',
                    arguments: {
                        LOOP: {
                            type: ArgumentType.STRING
                        },
                    }
                },
                {
                    opcode: 'while',
                    blockType: BlockType.LOOP,
                    branchCount: 1,
                    text: 'check then do: [CONDITION]',
                    arguments: {
                        CONDITION: {
                            type: ArgumentType.BOOLEAN
                        },
                    }
                },
                {
                    opcode: 'count',
                    blockType: BlockType.LOOP,
                    branchCount: 1,
                    text: 'number of iteration: [COUNT]',
                    arguments: {
                        COUNT: {
                            type: ArgumentType.NUMBER
                        },
                    }
                }
            ]
        };
    };

    forever (args, util) {
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;

        if (!cSlot || !cSlot.block) return; 
        
        util.startBranch(1, true);
        util.yieldTick();        
        this.runtime.emit('FOREVER_LOOP', {
        })
    }

    while (args, util) {
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;
        const inputSlot = currentBlock.inputs.CONDITION;
        const child = inputSlot && blocks.getBlock(inputSlot.block);

        if (!cSlot || !cSlot.block) return;

        if (child.opcode === 'Reporter_get_random_number') {
            if (util.stackFrame.randCount === undefined) {
                util.stackFrame.randCount = Number(args.CONDITION);
            }
            if (util.stackFrame.randCount-- > 0) {
                util.startBranch(1, true);
                util.yieldTick();
            }
            return;
        }

        if (!isNaN(Number(args.CONDITION))) {
            if (util.stackFrame.last !== args.CONDITION) {
                util.stackFrame.last = args.CONDITION;
                util.stackFrame.i = Number(args.CONDITION);
            }
            
            if (util.stackFrame.i-- > 0) {
                util.startBranch(1, true);
                util.yieldTick();
            }
        };
        if (args.CONDITION === true || args.CONDITION === "true") {
            util.startBranch(1, true);
            util.yieldTick();
        };
    };

    count (args, util) {     
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;

        util.stackFrame.latestTime ??= Number(args.TIMES);
        util.stackFrame.i ??= 0;

        if (Number(args.TIMES) < util.stackFrame.latestTime) {
            util.stackFrame.i = 0;
        }
        util.stackFrame.latestTime = Number(args.TIMES);
        
        if (util.stackFrame.i !== Number(args.TIMES)) {
            
            if (!cSlot || !cSlot.block) return;
            if (!hasExecutableBlock(cSlot.block, blocks)) return;

            util.stackFrame.i++;
            
            util.startBranch(1, true);
            util.yieldTick();
        }
    };
};

module.exports = RobotConditionsBlocks;


function hasExecutableBlock (blockId, blocks) {
    while (blockId) {
        const block = blocks.getBlock(blockId);
        if (!block) return false;
        if (['Loop_forever', 'Loop_while', 'Loop_count'].includes(block.opcode)) {
            const substack = block.inputs.SUBSTACK;
            if (substack?.block && hasExecutableBlock(substack.block, blocks)) {
                return true;
            }
        } else {
            return true;
        }

        blockId = block.next;
    }
    return false;
}
