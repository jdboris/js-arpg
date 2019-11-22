import { GAME_WIDTH, GAME_HEIGHT } from "./utilities.js";
import { MainMenu, Hud, InGameMenu } from "./scenes/scenes.js";

// This module doesn't export anything, but creates the global variable 'rexuiplugin'
// See: https://phaser.discourse.group/t/phaser-3-rexui-plugins/384/29
import * as DO_NOT_DELETE from "./plugins/rexuiplugin.min.js";

const config = {
    type: Phaser.AUTO,
    width: GAME_WIDTH,
    height: GAME_HEIGHT,
    parent: "game-container",
    pixelArt: true,
    physics: {
        default: "arcade",
        arcade: {
            gravity: { y: 0 },
            // NOTE: Required to tweak/fix collision overlaps not separating
            overlapBias: 20,
            tileBias: 30
        }
    },
    plugins: {
        scene: [{
            key: "UIPlugin",
            plugin: rexuiplugin,
            mapping: "UIPlugin"
        }]
    },
    scene: [MainMenu, Hud, InGameMenu]
};

const game = new Phaser.Game( config );
