import { GAME_WIDTH, GAME_HEIGHT, changeToScene, DIALOG_SPACE, LABEL_SPACE, centerTextInLabel } from "../utilities.js";
import { Button } from "../ui/button.js";
import { WorldScene } from "../world-scene.js";
import { Interface } from "../ui/interface.js";



// --------------------------------------------------------------------------------------------------------------------
// MainMenu
// --------------------------------------------------------------------------------------------------------------------

export class MainMenu extends Phaser.Scene {
    constructor() {
        super( "MainMenu" );
    }

    preload() {
        this.load.image( "squareButton", "assets/tilesets/squareButton.png" );
    }

    create() {

        this.add
            .text( 80, 16, "MAIN MENU", {
                font: "30px monospace",
                fill: "#005555",
                padding: { x: 20, y: 10 },
            } )
            .setScrollFactor( 0 )
            .setDepth( 30 )
            .setPosition( this.cameras.main.width / 2, 50 )
            .setOrigin( 0.5, 0.5 );

        this.startButton = new Button( this, "Start", this.cameras.main.width / 2, 100 );

        this.startButton.onClick = () => {
            changeToScene( this, StartingArea );

            this.scene.launch( "Hud" );
            this.scene.bringToTop( this.scene.get( "Hud" ) );

            this.scene.launch( "InGameMenu" );
            //this.scene.bringToTop( this.scene.get( "InGameMenu" ) );

        }
        //this.cameras.main.startFollow( Interface.controlledMob );
        //this.cameras.main.setBounds( 0, 0, 800, 600 );
        //this.cameras.main.setPosition( 0, 0 );
    }
}

// --------------------------------------------------------------------------------------------------------------------
// Hud
// --------------------------------------------------------------------------------------------------------------------

export class Hud extends Phaser.Scene {
    constructor() {
        super( "Hud" );
    }

    create() {
        this.menuButton = new Button( this, "Menu", this.cameras.main.width - 60, this.cameras.main.height - 30 );

        this.menuButton.onClick = () => {
            if( this.scene.isVisible( "InGameMenu" ) ) {
                this.scene.setVisible( false, "InGameMenu" );
                this.scene.setActive( false, "InGameMenu" );
            } else {
                this.scene.setVisible( true, "InGameMenu" );
                this.scene.setActive( true, "InGameMenu" );
            }
        }
    }

}

// --------------------------------------------------------------------------------------------------------------------
// InGameMenu
// --------------------------------------------------------------------------------------------------------------------

export class InGameMenu extends Phaser.Scene {
    constructor() {
        super( "InGameMenu" );
    }

    init() {
        this.scene.setVisible( false, "InGameMenu" );
        this.scene.setActive( false, "InGameMenu" );
    }

    create() {

        this.menu = this.UIPlugin.add.dialog( {

            background: this.UIPlugin.add.roundRectangle( 0, 0, 100, 100, 20, 0x3e2723 ),

            title: this.UIPlugin.add.label( {
                background: this.UIPlugin.add.roundRectangle( 0, 0, 100, 40, 20, 0x1b0000 ),
                text: this.add.text( 0, 0, "Menu", {
                    fontSize: "24px"
                } ),
                space: LABEL_SPACE
            } ),

            /*
            content: this.add.text( 0, 0, "1 + 1 + 1 + 1 + 1 = ", {
                fontSize: "24px"
            } ),
            */

            choices: [
                createButton( this, "Save" ),
                createButton( this, "Load" ),
                createButton( this, "Exit" )
            ],
            /*
            align: {
                title: 'center',
                content: 'center',
                description: 'center',
                choices: 'center',
                actions: 'center',
            },
            */
            space: DIALOG_SPACE
        } )

        // NOTE: These are required to workaround bugs involving the hitbox of the menu not 
        //       being where it should be
        this.menu
            .setDisplayOrigin( 0, 0 )
            .layout()
            .setPosition( this.cameras.main.centerX - this.menu.width / 2, this.cameras.main.centerY - this.menu.height / 2 );

        this.menu
            .on( "button.over", function ( button ) {
                button.getElement( "background" ).setStrokeStyle( 1, 0xffffff );
            } )
            .on( "button.out", function ( button ) {
                button.getElement( "background" ).setStrokeStyle();
            } )
            .on( "button.click", function ( button ) {
                if( button.name == "Save" ) {
                    console.log( "Saving..." );
                } else if( button.name == "Load" ) {
                    console.log( "Loading..." );
                } else if( button.name == "Exit" ) {
                    console.log( "Exiting..." );
                }
            } );


        for( let button of this.menu.childrenMap.choices ) {
            centerTextInLabel( button );
        }

        centerTextInLabel( this.menu.childrenMap.title );
    }

}

function createButton( scene, text, space = LABEL_SPACE ) {
    return scene.UIPlugin.add.label( {
        background: scene.UIPlugin.add.roundRectangle( 0, 0, 100, 40, 20, 0x6a4f4b ),
        name: text,
        text: scene.add.text( 0, 0, text, {
            fontSize: "24px"
        } ),

        space: space
    } );
}


// --------------------------------------------------------------------------------------------------------------------
// StartingArea
// --------------------------------------------------------------------------------------------------------------------

export class StartingArea extends WorldScene {
    constructor() {
        super( "tuxmon-sample-32px-extruded" );
    }

    create() {
        super.create();

        if( Interface.controlledMob )
            this.cameras.main.startFollow( Interface.controlledMob );
        this.cameras.main.setBounds( 0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels );
        this.cameras.main.setSize( GAME_WIDTH, GAME_HEIGHT );

        Interface.initializeSceneUi( this );
    }
}

// --------------------------------------------------------------------------------------------------------------------
// MagicForest
// --------------------------------------------------------------------------------------------------------------------

export class MagicForest extends WorldScene {
    constructor() {
        super( "tuxmon-sample-32px-extruded" );
    }

    create() {
        super.create();

        if( Interface.controlledMob )
            this.cameras.main.startFollow( Interface.controlledMob );
        this.cameras.main.setBounds( 0, 0, this.tilemap.widthInPixels, this.tilemap.heightInPixels );
        this.cameras.main.setSize( GAME_WIDTH, GAME_HEIGHT );

        Interface.initializeSceneUi( this );
    }
}

