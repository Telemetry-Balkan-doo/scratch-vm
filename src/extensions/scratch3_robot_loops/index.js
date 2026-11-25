const { number } = require('format-message');
const ArgumentType = require('../../extension-support/argument-type');
const BlockType = require('../../extension-support/block-type');

/**
 * Checks whether a block or its nested blocks contain executable code.
 * @param {string} blockId The block ID.
 * @param {object} blocks The blocks container.
 * @returns {boolean} Whether an executable block exists.
 */
const hasExecutableBlock = function (blockId, blocks) {
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
};

class RobotConditionsBlocks {

    static get EXTENSION_ID () {
        return 'Loop';
    }

    constructor (runtime) {
        this.runtime = runtime;
    }

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
                        }
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
                        }
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
                        }
                    }
                }
            ]
        };
    }

    forever (args, util) {
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;

        if (!cSlot || !cSlot.block) return;
        if (!hasExecutableBlock(cSlot.block, blocks)) return;

        util.startBranch(1, true);
        util.yieldTick();
        this.runtime.emit('FOREVER_LOOP', {});
    }

    while (args, util) {
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;

        const condition = String(args.CONDITION);

        if (!cSlot || !cSlot.block) return;
        if (!hasExecutableBlock(cSlot.block, blocks)) return;

        if (condition.trim() === '') return;
        if (condition === 'false' || condition === '0') return;

        if (condition !== 'false') {
            util.startBranch(1, true);
            util.yieldTick();
        }
    }

    count (args, util) {
        const blocks = util.target.blocks;
        const currentBlock = blocks.getBlock(util.thread.peekStack());
        const cSlot = currentBlock.inputs.SUBSTACK;

        if (!cSlot || !cSlot.block) return;
        if (!hasExecutableBlock(cSlot.block, blocks)) return;

        util.stackFrame.i ??= 0;

        if (util.stackFrame.i < Number(args.TIMES)) {
            util.stackFrame.i++;

            util.startBranch(1, true);
            util.yieldTick();
        }
    }
}

module.exports = RobotConditionsBlocks;
