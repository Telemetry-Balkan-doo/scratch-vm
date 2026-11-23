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
        if (!hasExecutableBlock(cSlot.block, blocks)) return;
        
        util.startBranch(1, true);
        util.yieldTick();        
        this.runtime.emit('FOREVER_LOOP', {})
    }

    while (args, util) {
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;
        
        args.CONDITION = String(args.CONDITION);

        if (!cSlot || !cSlot.block) return;
        if (!hasExecutableBlock(cSlot.block, blocks)) return;

        if (args.CONDITION.trim() === "") return

        if (args.CONDITION === false || args.CONDITION === "false" || args.CONDITION === "0") return
        if (args.CONDITION === true || (typeof(args.CONDITION) === "string" && args.CONDITION !== "false") ) {
            util.startBranch(1, true);
            util.yieldTick();
        }
    };

    count (args, util) {     
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;

        if (!cSlot || !cSlot.block) return;
        if (!hasExecutableBlock(cSlot.block, blocks)) return;

        util.stackFrame.i ??= 0;
                
        if (util.stackFrame.i <  Number(args.TIMES)) {
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
