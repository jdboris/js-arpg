import * as Mob from "./entities/mob-types.js";
import * as PortalEntrance from "./entities/portal-entrance.js";
import * as PortalExit from "./entities/portal-exit.js";
import { Interface } from "./ui/interface.js";

export const EntityTypes = {
    Mob: Mob,
    PortalEntrance: PortalEntrance,
    PortalExit: PortalExit
}

export const DEBUG = true;

export let cursors = null;
export let showDebug = true;

export const GAME_WIDTH = 1024;
export const GAME_HEIGHT = 600;

export const DIRECTION = {
    EAST: 0,
    SOUTH: 90,
    WEST: 180,
    NORTH: 270
};

export const States = {
    currentValue: 1,
    stateValue: function () {
        let value = this.currentValue;
        this.currentValue = this.currentValue << 1;
        return value;
    }
}

export const MOB_TEAM = {
    FRIENDLY: 1,
    NEUTRAL: 1 << 1,
    HOSTILE: 1 << 2
};

// States are for atributes that are hard to determine in update()
export const MOB_STATE = {
    DEAD: States.stateValue(), // Opposite: ALIVE
    IN_WATER: States.stateValue(),
    IN_AIR: States.stateValue()
}

export function valueByName( tiledData, name ) {
    if( tiledData.properties ) {
        let property = tiledData.properties.find( property => {
            return property.name == name;
        } );
        if( property )
            return property.value;
    }

    return null;
}

function startScene( currentScene, sceneClass, callback = () => { } ) {

    let found = false;
    let newScene = null;

    currentScene.scene.manager.scenes.forEach( ( scene ) => {
        if( scene.constructor.name == sceneClass.name ) {
            newScene = scene;
            found = true;
        }
    } );

    if( found == false )
        newScene = currentScene.scene.manager.add( sceneClass.name, sceneClass, false );

    currentScene.scene.start( sceneClass.name, { callback: callback } );

    return newScene;
}

export function changeToScene( currentScene, sceneClass, callback = () => { } ) {
    let found = false;
    let newScene = null;

    currentScene.scene.manager.scenes.forEach( ( scene ) => {
        if( scene.constructor.name == sceneClass.name ) {
            newScene = scene;
            found = true;
        }
    } );

    if( found == false ) {
        currentScene.scene.manager.add( sceneClass.name, sceneClass, false );

        currentScene.scene.launch( sceneClass.name, {
            callback: function () {
                this.onCreate = function () {
                    Interface.cursors = this.cursors;
                    callback.bind( this )();
                }
            }
        } );
    } else {
        newScene.events.on( "wake", callback.bind( newScene ) );
        newScene.scene.wake();
        if( newScene.cursors ) {
            // NOTE: Reset the keyboard keys so they won't be in the pressed state when you come back to this Scene
            newScene.cursors.up.reset();
            newScene.cursors.down.reset();
            newScene.cursors.left.reset();
            newScene.cursors.right.reset();
        }
        Interface.cursors = newScene.cursors;
    }

    currentScene.scene.sleep();

    return newScene;
}

// TODO: Change ANIMATION_DATA and the required folder structure to allow nesting
//       animation folders within other "state" folders to combine states, or fall back
//       on the animation that is closest in terms of number of state bit flags set.
// Example:
// ANIMATION_DATA["SILVER_KNIGHT"]["MOVING"]["IN_WATER"]["STUNNED"]["SOUTH"]
// OR fall back to...
// ANIMATION_DATA["SILVER_KNIGHT"]["MOVING"]["STUNNED"]["SOUTH"]
// rather than...
// ANIMATION_DATA["SILVER_KNIGHT"]["STILL"]["STUNNED"]["SOUTH"]


// Animation data, for example...
// ANIMATION_DATA["SILVER_KNIGHT"]["MOVING"]["SOUTH"].key
// ANIMATION_DATA["SILVER_KNIGHT"]["MOVING"]["SOUTH"].frameCount
export let ANIMATION_DATA = {};


export function loadAnimationsFromAtlas( scene, atlasName ) {
    let data = {};
    let rawData = scene.textures.get( atlasName ).frames;

    for( let key in rawData ) {
        // NOTE: This code to create the ANIMATION_DATA object relies on the following folder/filename structure
        // "SILVER_KNIGHT/WALKING/SOUTH/0.png":
        let keyParts = key.split( "/" );
        if( keyParts.length == 4 ) {
            let animationBase = keyParts[0];
            let action = keyParts[1];
            let direction = keyParts[2];

            if( !data.hasOwnProperty( animationBase ) )
                data[animationBase] = {};
            if( !data[animationBase].hasOwnProperty( action ) )
                data[animationBase][action] = {};

            if( !data[animationBase][action].hasOwnProperty( direction ) ) {
                let animationKey = animationBase + "/" + action + "/" + direction + "/";
                data[animationBase][action][direction] = {
                    key: animationKey,
                    frameCount: 1,
                    flipX: false,
                    flipY: false,
                    repeat: -1,
                    isCopy: false
                };

                // NOTE: Prevent the animations that shouldn't be repeating from repeating
                if( action == "DEATH" ) data[animationBase][action][direction].repeat = 0;
            } else {
                data[animationBase][action][direction].frameCount++;
            }

        }
    }

    for( let animationBase in data ) {
        for( let action in data[animationBase] ) {

            let object = data[animationBase][action];
            if( object.hasOwnProperty( "ALL_DIRECTIONS" ) ) {
                let animation = object.ALL_DIRECTIONS;
                object.EAST = {};
                Object.assign( object.EAST, object.ALL_DIRECTIONS ).isCopy = true;
                object.SOUTH = {};
                Object.assign( object.SOUTH, object.ALL_DIRECTIONS ).isCopy = true;
                object.WEST = {};
                Object.assign( object.WEST, object.ALL_DIRECTIONS ).isCopy = true;
                object.NORTH = {};
                Object.assign( object.NORTH, object.ALL_DIRECTIONS ).isCopy = true;
                createAnimation( scene, atlasName, animation );
            } else {

                if( !object.hasOwnProperty( "SOUTH" ) ) {
                    object.SOUTH = {};
                    if( object.hasOwnProperty( "NORTH" ) )
                        Object.assign( object.SOUTH, object.NORTH ).isCopy = true;
                    else if( object.hasOwnProperty( "EAST" ) )
                        Object.assign( object.SOUTH, object.EAST ).isCopy = true;
                    else if( object.hasOwnProperty( "WEST" ) )
                        Object.assign( object.SOUTH, object.WEST ).isCopy = true;
                    else
                        throw "Error in loadAnimationsFromAtlas( ): Animation " + animationBase + "/" + action + "/... has no directions";
                }

                if( !object.hasOwnProperty( "WEST" ) && object.hasOwnProperty( "EAST" ) ) {
                    object.WEST = {};
                    Object.assign( object.WEST, object.EAST ).isCopy = true;
                    object.WEST.flipX = true;
                } else if( object.hasOwnProperty( "WEST" ) && !object.hasOwnProperty( "EAST" ) ) {
                    object.EAST = {};
                    Object.assign( object.EAST, object.WEST ).isCopy = true;
                    object.EAST.flipX = true;
                } else if( !object.hasOwnProperty( "WEST" ) && !object.hasOwnProperty( "EAST" ) ) {
                    object.WEST = {};
                    object.EAST = {};
                    Object.assign( object.WEST, object.SOUTH ).isCopy = true;
                    Object.assign( object.EAST, object.SOUTH ).isCopy = true;
                }

                if( !object.hasOwnProperty( "NORTH" ) ) {
                    object.NORTH = {};
                    Object.assign( object.NORTH, object.SOUTH ).isCopy = true;
                }

                if( !object.EAST.isCopy )
                    createAnimation( scene, atlasName, object.EAST );
                if( !object.SOUTH.isCopy )
                    createAnimation( scene, atlasName, object.SOUTH );
                if( !object.WEST.isCopy )
                    createAnimation( scene, atlasName, object.WEST );
                if( !object.NORTH.isCopy )
                    createAnimation( scene, atlasName, object.NORTH );
            }
        }
    }

    ANIMATION_DATA[atlasName] = data;
}

export function createAnimation( scene, atlasName, animation, key = "" ) {
    if( key == "" ) key = animation.key;


    let frames = scene.anims.generateFrameNames( atlasName, {
        prefix: animation.key,
        suffix: ".png",
        start: 0,
        end: animation.frameCount
    } );

    scene.anims.create( {
        key: key,
        frames: frames,
        frameRate: 10,
        repeat: animation.repeat
    } );
}


export function createDPadButton( scene, x, y, direction ) {
    let button = scene.add.image( x, y, 'squareButton' ).setScale( 0.3 ).setScrollFactor( 0 ).setDepth( 40 );
    //alert( button );
    button.setInteractive();

    button.on( "pointerdown", () => {
        button.pointerDown = true;
    } );
    button.on( "pointerover", ( pointer ) => {
        if( pointer.isDown ) {
            button.pointerDown = true;
        }
    } );

    button.on( "pointerup", () => {
        button.pointerDown = false;
    } );
    button.on( "pointerout", () => {
        button.pointerDown = false;
    } );

    return button;
}

export const DIALOG_SPACE = {
    title: 25,
    content: 25,
    choice: 15,

    left: 25,
    right: 25,
    top: 25,
    bottom: 25,
};

export const LABEL_SPACE = {
    left: 10,
    right: 10,
    top: 10,
    bottom: 10,
};

export function centerTextInLabel( label ) {
    let difference = label.width - label.childrenMap.text.width - LABEL_SPACE.left - LABEL_SPACE.right;
    label.childrenMap.text.setPadding( difference / 2, 0, difference / 2, 0 );
}