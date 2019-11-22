import { loadAnimationsFromAtlas, MOB_TEAM, EntityTypes, valueByName } from "./utilities.js";
import { Interface } from "./ui/interface.js";

import { EasyStar } from "./libraries/easystar-0.4.3.min.js";



export class WorldScene extends Phaser.Scene {

    constructor( tilesetKey ) {
        super();


        this.tilesetKey = tilesetKey;
        this.tilemapKey = this.constructor.name;
        this.tileset = null;
        this.tilemap = null;
        this.atlasList = [];
        // TODO: this.camera...


        this.levelEntityGroup = null;
        this.levelEntities = [];
        this.mobGroup = null;
        this.mobs = [];
        this.abilityEffectGroup = null;
        this.abilityEffects = [];
        this.portalEntranceGroup = null;
        this.portalEntrances = [];
        this.portalExitGroup = null;
        this.portalExits = [];

        this.belowLayer = null;
        this.worldLayer = null;
        this.aboveLayer = null;

        this.pathfinder = null;
    }

    init( data ) {
        data.callback.bind( this )();
    }

    preload() {

        this.load.image( this.tilesetKey, "assets/tilesets/" + this.tilesetKey + ".png" );
        this.load.tilemapTiledJSON( this.tilemapKey, "assets/tilemaps/" + this.tilemapKey + ".json" );

        // Atlases
        // NOTE: Assumes all files have the exact same name as the atlas + extension
        this.atlasList.push( "character-atlas" );
        this.atlasList.push( "effects-fireballs-atlas" );
        this.atlasList.push( "effects-explosions-atlas" );

        for( let atlas of this.atlasList )
            this.load.atlas( atlas, "assets/atlas/" + atlas + ".png", "assets/atlas/" + atlas + ".json" );
    }

    create() {

        // NOTE: These are used by the Interface
        this.cursors = this.input.keyboard.addKeys( {
            up: Phaser.Input.Keyboard.KeyCodes.W,
            down: Phaser.Input.Keyboard.KeyCodes.S,
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D
        } );

        for( let atlas of this.atlasList )
            loadAnimationsFromAtlas( this, atlas );

        this.tilemap = this.make.tilemap( { key: this.tilemapKey } );

        // Parameters: Tiled tileset name, Phaser image key
        this.tileset = this.tilemap.addTilesetImage( this.tilesetKey, this.tilesetKey );

        // Parameters: layer name (or index) from Tiled, tileset, x, y
        this.belowLayer = this.tilemap.createStaticLayer( "Below Player", this.tileset, 0, 0 );
        this.worldLayer = this.tilemap.createStaticLayer( "World", this.tileset, 0, 0 );
        this.aboveLayer = this.tilemap.createStaticLayer( "Above Player", this.tileset, 0, 0 );

        this.worldLayer.setCollisionByProperty( { collides: true } );

        this.aboveLayer.setDepth( 10 );

        this.levelEntityGroup = this.physics.add.group();
        this.levelEntities = this.levelEntityGroup.children;
        this.mobGroup = this.physics.add.group();
        this.mobs = this.mobGroup.children;
        this.abilityEffectGroup = this.physics.add.group();
        this.abilityEffects = this.abilityEffectGroup.children;
        this.portalEntranceGroup = this.physics.add.group();
        this.portalEntrances = this.portalEntranceGroup.children;
        this.portalExitGroup = this.physics.add.group();
        this.portalExits = this.portalExitGroup.children;


        const layer = this.tilemap.getObjectLayer( "ENTITY" );

        for( let entityData of layer.objects ) {

            // Call the static factory method
            if( entityData.properties )
                EntityTypes[entityData.type][valueByName( entityData, "class" )].make( this, entityData );
        }

        this.pathfinder = new EasyStar.js();

        let grid = [];
        for( let y = 0; y < this.tilemap.height; y++ ) {
            let col = [];
            for( let x = 0; x < this.tilemap.width; x++ ) {
                // In each cell we store the ID of the tile, which corresponds
                // to its index in the tileset of the map ("ID" field in Tiled)
                let tile = this.tilemap.getTileAt( x, y, false, "World" );
                if( !tile )
                    tile = this.tilemap.getTileAt( x, y, false, "Below Player" );
                if( !tile )
                    tile = this.tilemap.getTileAt( x, y, false, "Above Player" );

                col.push( tile.index );
            }
            grid.push( col );
        }
        this.pathfinder.setGrid( grid );

        let properties = this.tileset.tileProperties;
        let acceptableTiles = [];

        // firstgid and total are fields from Tiled that indicate the range of IDs that the tiles can take in that tileset
        for( let i = this.tileset.firstgid - 1; i < this.tileset.total; i++ ) {

            if( !properties.hasOwnProperty( i ) || !properties[i].collides )
                acceptableTiles.push( i + 1 );
            // If there is a cost attached to the tile, let's register it
            else if( properties[i].cost )
                this.pathfinder.setTileCost( i + 1, properties[i].cost );
        }

        this.pathfinder.setAcceptableTiles( acceptableTiles );

        this.onCreate();
    }

    update( time, delta ) {

        Interface.handleInput( time, delta );

        this.levelEntities.iterate( ( entity ) => {
            entity.update( delta );
            entity.draw();

        } );

    }

    addMob( mob ) {
        this.mobGroup.add( this.addLevelEntity( mob ) );
        mob.colliders.structures = this.physics.add.collider( mob, this.worldLayer, mob.onStructureCollide, null, mob );
        mob.colliders.mobs = this.physics.add.collider( mob, this.mobGroup, mob.onMobCollide, null, mob );
        return mob;
    }

    removeMob( mob ) {
        this.mobGroup.remove( this.removeLevelEntity( mob ) );
        //mob.colliders.structures = this.physics.add.collider( mob, this.worldLayer, mob.onStructureCollide, null, mob );
        //mob.colliders.mobs = this.physics.add.collider( mob, this.mobGroup, mob.onMobCollide, null, mob );
        return mob;
    }

    addAbilityEffect( effect ) {
        this.abilityEffectGroup.add( this.addLevelEntity( effect ) );
        effect.colliders.structures = this.physics.add.collider( effect, this.worldLayer, effect.onStructureCollide, null, effect );
        effect.colliders.mobs = this.physics.add.overlap( effect, this.mobGroup, effect.onMobCollide, null, effect );
        return effect;
    }

    addPortalEntrance( portalEntrance ) {
        this.portalEntranceGroup.add( this.addLevelEntity( portalEntrance ) );
        portalEntrance.colliders.mobs = this.physics.add.overlap( portalEntrance, this.mobGroup, function ( self, mob ) {
            this.sendMobThrough( mob );
            this.onMobCollide( portalEntrance, mob );
        }, null, portalEntrance );
        return portalEntrance;
    }

    addPortalExit( portalExit ) {
        this.portalExitGroup.add( this.addLevelEntity( portalExit ) );
        portalExit.colliders.mobs = this.physics.add.overlap( portalExit, this.mobGroup, function ( self, mob ) {

            //portalExit.sendMobThrough( mob );
            //portalExit.onMobCollide( portalExit, mob );
        }, null, portalExit );

        return portalExit;
    }

    addLevelEntity( entity ) {
        this.add.existing( entity );
        this.physics.world.enable( entity );
        this.levelEntityGroup.add( entity );
        entity.scene = this;
        return entity;
    }

    removeLevelEntity( entity ) {
        //this.add.existing( entity );
        entity.removeColliders();
        this.levelEntityGroup.remove( entity, true );
        entity.scene = null;
        return entity;
    }


    onCreate() { }
}