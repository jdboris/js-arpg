import { DIRECTION } from "../utilities.js";
import { Button } from "../ui/button.js";

export const Interface = {
    controlledMob: null,
    cursors: null,

    initializeSceneUi: function ( scene ) {

        // Help text that has a "fixed" position on the screen
        scene.add
            .text( 16, 16, 'WASD keys to move\nPress "Esc" to show hitboxes', {
                font: "18px monospace",
                fill: "#000000",
                padding: { x: 20, y: 10 },
                backgroundColor: "#ffffff"
            } )
            .setScrollFactor( 0 )
            .setDepth( 30 );

        // Debug graphics
        scene.input.keyboard.once( "keydown_ESC", event => {
            console.log( "DEBUG MODE ON" );
            // Turn on physics debugging to show player's hitbox
            scene.physics.world.createDebugGraphic();

            // Create worldLayer collision graphic above the player, but below the help text
            const graphics = scene.add
                .graphics()
                .setAlpha( 0.75 )
                .setDepth( 20 );
            scene.worldLayer.renderDebug( graphics, {
                tileColor: null, // Color of non-colliding tiles
                collidingTileColor: new Phaser.Display.Color( 243, 134, 48, 255 ), // Color of colliding tiles
                faceColor: new Phaser.Display.Color( 40, 39, 37, 255 ) // Color of colliding face edges
            } );
        } );


        scene.input.keyboard.on( "keydown_SPACE", event => {
            if( Interface.controlledMob )
                Interface.controlledMob.abilities[0].cast();
        } );

        scene.input.on( "pointerdown", ( pointer ) => {

            if( Interface.controlledMob )
                Interface.controlledMob.abilities[0].cast();
        } );

        let menu = scene.scene.get( "InGameMenu" );
        menu.input.setGlobalTopOnly( true );

        menu.input.on( "pointerdown", ( pointer ) => {

            for( let gameObject of menu.children.list ) {
                if( Phaser.Geom.Rectangle.Contains( gameObject, pointer.x, pointer.y ) ) {
                    menu.input.stopPropagation();
                }
            }
        } );

        /*
        eastButton = createDPadButton( scene, 90, scene.cameras.main.height - 60, DIRECTION.EAST );
        southButton = createDPadButton( scene, 60, scene.cameras.main.height - 30, DIRECTION.SOUTH );
        westButton = createDPadButton( scene, 30, scene.cameras.main.height - 60, DIRECTION.WEST );
        northButton = createDPadButton( scene, 60, scene.cameras.main.height - 100, DIRECTION.NORTH );
        */

    },

    handleInput: function ( scene, time, delta ) {

        //const prevVelocity = player.body.velocity.clone();
        let newMoveDirection = -1;

        // Horizontal movement
        if( this.cursors.left.isDown ) {
            newMoveDirection = DIRECTION.WEST;
        } else if( this.cursors.right.isDown ) {
            newMoveDirection = DIRECTION.EAST;
        }

        // Vertical movement
        if( this.cursors.up.isDown ) {
            if( newMoveDirection != -1 )
                if( newMoveDirection >= 90 )
                    newMoveDirection = ( DIRECTION.NORTH + newMoveDirection ) / 2;
                else
                    newMoveDirection = ( DIRECTION.NORTH + newMoveDirection + 360 ) / 2;
            else
                newMoveDirection = DIRECTION.NORTH;
        } else if( this.cursors.down.isDown ) {
            if( newMoveDirection != -1 )
                newMoveDirection = ( DIRECTION.SOUTH + newMoveDirection ) / 2;
            else
                newMoveDirection = DIRECTION.SOUTH;
        }

        if( Interface.controlledMob )
            this.controlledMob.moveDirection = newMoveDirection;

        if( newMoveDirection != -1 ) {
            if( Interface.controlledMob )
                this.controlledMob.faceDirection = newMoveDirection;
        }
    },

    createButton: function ( scene, x, y, text, callback ) {
        let button = scene.add.image( x, y, 'squareButton' ).setScale( 0.3 ).setScrollFactor( 0 ).setDepth( 40 );
        button.setInteractive();
        button.pointerDown = false;

        button.on( "pointerdown", () => {
            this.pointerDown = true;
        } );

        button.on( "pointerup", () => {
            if( this.pointerDown ) {
                callback();
            }
        } );

        scene.input.on( "pointerup", () => {
            this.pointerDown = false;
        } );

        return button;
    },

    createAbilityButton: function ( scene, x, y, abilityIndex ) {
        let button = scene.add.image( x, y, 'squareButton' ).setScale( 0.3 ).setScrollFactor( 0 ).setDepth( 40 );
        button.setInteractive();
        button.pointerDown = false;

        button.on( "pointerdown", () => {
            this.pointerDown = true;
        } );

        button.on( "pointerup", () => {
            if( this.pointerDown ) {
                console.log( "hello" );
            }
        } );

        scene.input.on( "pointerup", () => {
            this.pointerDown = false;
        } );

        return button;
    }
};