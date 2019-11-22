import { LevelEntity } from "../level-entity.js";
import { DIRECTION, EntityTypes, changeToScene, valueByName } from "../utilities.js";
import { Interface } from "../ui/interface.js";
import * as Scenes from "../scenes/scenes.js";

export class PortalEntrance extends LevelEntity {

    static make( scene, tiledData ) {
        //let constructor = EntityTypes[tiledData.type][valueByName( tiledData, "class" )];

        let entrance = new this( scene, tiledData.x, tiledData.y, tiledData.width, tiledData.height,
            DIRECTION[valueByName( tiledData, "enterFrom" )],
            valueByName( tiledData, "targetScene" ),
            valueByName( tiledData, "targetExit" ) );

        return entrance;
    }

    constructor( scene, x, y, width, height, enterFrom, targetScene, targetExit ) {
        super( scene, x, y );

        scene.addPortalEntrance( this );

        this.setVisible( false );
        this.setDisplayOrigin( 0, 0 );
        this.setDisplaySize( width, height );

        this.enterFromDirection = enterFrom;
        this.targetSceneKey = targetScene;
        this.targetExitName = targetExit;
    }

    sendMobThrough( mob ) {

        if( mob.moveDirection != -1 ) {
            let difference = ( mob.moveDirection - ( ( this.enterFromDirection + 180 ) % 360 ) + 180 + 360 ) % 360 - 180;

            if( difference <= 90 && difference >= -90 ) {
                this.scene.removeMob( mob );

                if( mob == Interface.controlledMob ) {
                    let targetExit = this.targetExitName;

                    // Use these to position the Mob proportionately to the exit
                    // NOTE: Must use display width/height because of a stupid bug
                    let exitXModifier = ( mob.x - this.x ) / this.displayWidth;
                    let exitYModifier = ( mob.y - this.y ) / this.displayHeight;

                    changeToScene( this.scene, Scenes[this.targetSceneKey], function () {
                        let portalExit = this.tilemap.findObject( "ENTITY", entity => ( entity.type == "PortalExit" && entity.name == targetExit ) );

                        mob.x = portalExit.x + portalExit.width * exitXModifier;
                        mob.y = portalExit.y + portalExit.height * exitYModifier;
                        this.addMob( mob );
                    } );
                } else {
                    let newScene = this.scene.scene.manager.getScene( this.targetSceneKey );

                    if( newScene )
                        newScene.addMob( mob );
                    else
                        console.error( "Error: Mob traveling to scene that hasn't been started yet." );
                }
            }
        }
    }
}
