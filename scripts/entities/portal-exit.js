import { LevelEntity } from "../level-entity.js ";

export class PortalExit extends LevelEntity {

    static make( scene, tiledData ) {
        //let constructor = EntityTypes[tiledData.type][valueByName( tiledData, "class" )];

        let exit = new this( scene, tiledData.x, tiledData.y, tiledData.width, tiledData.height, tiledData.name );

        return exit;
    }

    constructor( scene, x, y, width, height, name = "" ) {
        super( scene, x, y, "", "", name );

        scene.addPortalExit( this );

        this.setVisible( false );
        this.setDisplayOrigin( 0, 0 );
        this.setDisplaySize( width, height );
    }
}