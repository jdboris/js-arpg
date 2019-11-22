import { DIRECTION, MOB_STATE, ANIMATION_DATA } from "./utilities.js";

export class LevelEntity extends Phaser.Physics.Arcade.Sprite {
    constructor( scene, x, y, atlasName = "", animationBase = "", name = "", rotateWithDirection = false ) {
        super( scene, x, y, atlasName, "" );

        // NOTE: Add the LevelEntity to the scene in child constructors,
        //       in order to access members provided by adding it to the scene (like setSize)
        //       in inheriting class constructors

        this.faceDirection = DIRECTION.SOUTH;
        this.faceDirectionString = "SOUTH";
        this.moveDirection = -1;

        this.name = name;
        this.atlasName = atlasName;
        this.animationBase = animationBase;

        this.states = 0;

        this.rotateWithDirection = rotateWithDirection;

        this.colliders = {
            structures: null,
            mobs: null,
            abilityEffects: null
        }

        // note: don't draw before child constructors
        //this.draw();
        //this.anims.stop();

        /*
        this.on( 'animationcomplete', function ( anim, frame ) {
            this.emit( 'animationcomplete_' + anim.key, anim, frame );
        }, this );

        this.on( 'animationcomplete_run', function () { } );
        this.on( 'animationcomplete_jump', function () { } );
        this.on( 'animationcomplete_walk', function () { } );
        */

        this.oldStates = this.states;
        this.pathfindingCooldownTimer = this.scene.time.addEvent( {
            delay: 1000,
            callbackScope: this,
            callback: () => {
                this.pathfindingCooldownTimer.paused = true;
            },
            loop: true
        } );

        this.pathfindingTimeline = { stop: () => { } };


        this.pathfinding = {
            path: [],
            index: 0,
            isComplete: function () {
                return this.index == this.path.length;
            }
        };
    }

    update( delta ) {
        this.oldStates = this.states;
        this.body.stop();

        if( this.moveDirection != -1 && !this.isInState( MOB_STATE.DEAD ) ) {

            // Standard collision detection:
            this.scene.physics.velocityFromAngle( this.moveDirection, this.moveSpeed, this.body.velocity );

            // Additional collision detection:
            /*
            let velocity = this.scene.physics.velocityFromAngle( this.moveDirection, this.moveSpeed );

            let collidingEntity = null;

            collidingEntity = this.willCollideWith( this.scene.levelEntities, { x: velocity.x, y: 0 }, delta );
            if( velocity.x != 0 && !collidingEntity ) {
                this.setVelocityX( velocity.x );
            }

            collidingEntity = this.willCollideWith( this.scene.levelEntities, { x: 0, y: velocity.y }, delta );
            if( velocity.y != 0 && !collidingEntity ) {
                this.setVelocityY( velocity.y );
            }
            */
        }

        if( this.rotateWithDirection )
            this.setRotation( Phaser.Math.DegToRad( this.faceDirection ) );

        this.onUpdate();
    }

    draw() {
        if( this.isInState( MOB_STATE.DEAD ) ) {

        } else {
            this.faceDirectionString = "";

            if( this.faceDirection >= DIRECTION.WEST - 45 && this.faceDirection <= DIRECTION.WEST + 45 ) {
                this.faceDirectionString = "WEST";
            } else if( this.faceDirection >= 360 - 45 || this.faceDirection <= DIRECTION.EAST + 45 ) {
                this.faceDirectionString = "EAST";
            } else if( this.faceDirection > DIRECTION.NORTH - 45 && this.faceDirection < DIRECTION.NORTH + 45 ) {
                this.faceDirectionString = "NORTH";
            } else if( this.faceDirection > DIRECTION.SOUTH - 45 && this.faceDirection < DIRECTION.SOUTH + 45 ) {
                this.faceDirectionString = "SOUTH";
            }

            this.playAnimation( "MOVING" );

            if( this.moveDirection == -1 ) {
                this.anims.stop();
            }
        }
    }

    isInState( state ) {
        if( this.states & state ) return true;
        else return false;
    }

    enterState( state ) {
        this.states |= state;
    }

    exitState( state ) {
        this.state &= ~state;
    }

    playAnimation( action ) {
        if( this.atlasName != "" ) {
            let animation = ANIMATION_DATA[this.atlasName][this.animationBase][action][this.faceDirectionString];
            this.flipX = animation.flipX;
            this.flipY = animation.flipY;
            this.anims.play( animation.key, true );
        }
    }

    chainAnimation( action ) {
        if( this.atlasName != "" ) {
            let animation = ANIMATION_DATA[this.atlasName][this.animationBase][action][this.faceDirectionString];
            //this.flipX = animation.flipX;
            //this.flipY = animation.flipY;
            this.anims.chain( animation.key );
        }
    }

    // Call this every update
    moveTo( x, y, direction = -1 ) {
        if( !this.isInState( MOB_STATE.DEAD ) ) {
            if( direction == -1 ) {
                this.moveDirection = Phaser.Math.RadToDeg( Phaser.Math.Angle.Between( this.x, this.y, x, y ) );
                if( this.moveDirection < 0 )
                    this.moveDirection = 360 + this.moveDirection;

                this.faceDirection = this.moveDirection;
            } else {
                this.moveDirection = direction;
                this.faceDirection = direction;
            }
            // Stop any previous movement from the last frame
            //this.body.setVelocity( 0 );

            // NOTE: DON't do this, it makes objects phase into each other
            //this.scene.physics.moveTo( this, x, y );

            // Normalize and scale the velocity so that player can't move faster along a diagonal
            //this.body.velocity.normalize().scale( this.moveSpeed );
        }
    }

    moveToWithPathfinding( x, y ) {

        if( this.pathfindingCooldownTimer.paused == true ) {

            let toX = Math.floor( x / this.scene.tilemap.tileWidth );
            let toY = Math.floor( y / this.scene.tilemap.tileHeight );
            let fromX = Math.floor( this.x / this.scene.tilemap.tileWidth );
            let fromY = Math.floor( this.y / this.scene.tilemap.tileHeight );

            this.scene.pathfinder.findPath( fromX, fromY, toX, toY, function ( path ) {
                if( path === null ) {
                    console.warn( "Path was not found." );
                } else {
                    this.pathfindingTimeline.stop();

                    /*
                    // Sets up a list of tweens, one for each tile to walk, that will be chained by the timeline
                    let tweens = [];

                    for( let i = 0; i < path.length - 1; i++ ) {
                        let ex = path[i + 1].x;
                        let ey = path[i + 1].y;
                        tweens.push( {
                            targets: this,
                            x: { value: ex * this.scene.tilemap.tileWidth, duration: 200 },
                            y: { value: ey * this.scene.tilemap.tileHeight, duration: 200 }
                        } );
                    }

                    this.pathfindingTimeline = this.scene.tweens.timeline( {
                        tweens: tweens
                    } );
                    */

                    this.pathfinding.path = path;
                    this.pathfinding.index = 1;

                    this.pathfindingCooldownTimer.paused = false;
                }
            }.bind( this ) );

            this.scene.pathfinder.calculate();

        }

        this.moveAlongPath();
    }

    moveAlongPath() {
        let path = this.pathfinding.path;

        if( this.pathfinding.index < path.length ) {
            let point = path[this.pathfinding.index];
            let x = point.x * this.scene.tileset.tileWidth + this.scene.tileset.tileWidth / 2;
            let y = point.y * this.scene.tileset.tileHeight + this.scene.tileset.tileHeight / 2;
            let distance = Math.sqrt( Math.pow( ( y - this.y ), 2 ) + Math.pow( ( x - this.x ), 2 ) );
            if( distance > 10 ) {
                this.moveTo( x, y );
            } else
                this.pathfinding.index++;
        }
    }

    // If this LevelEntity can see the other specified LevelEntity around tiles in the "World" layer
    canSee( entity ) {
        let line = new Phaser.Geom.Line( this.x, this.y, entity.x, entity.y );

        let tileGrid = this.scene.tilemap.getLayer( "World" ).data;

        for( let row of tileGrid ) {
            for( let tile of row ) {
                if( tile.index != -1 && Phaser.Geom.Intersects.LineToRectangle( line, tile.getBounds() ) )
                    return false;
            }
        }

        return true;
    }

    willCollideWith( entities, velocity, delta ) {

        let currentBounds = this.getBounds();
        let nextBounds = this.getBounds();
        nextBounds.x += velocity.x / delta;
        nextBounds.y += velocity.y / delta;
        let collidingEntity = null;

        entities.iterate( ( entity ) => {
            if( this != entity ) {
                let otherBounds = entity.getBounds();
                if( !Phaser.Geom.Intersects.RectangleToRectangle( currentBounds, otherBounds ) ) {
                    if( Phaser.Geom.Intersects.RectangleToRectangle( nextBounds, otherBounds ) ) {
                        collidingEntity = entity;
                    }
                }
            }
        } );

        return collidingEntity;
    }


    removeColliders() {

        for( let key in this.colliders ) {
            this.scene.physics.world.removeCollider( this.colliders[key] );
        }
    }

    // Override these:

    onUpdate() { }
    onMobCollide( self, mob ) { }
    onAbilityEffectCollide( self, effect ) { }
    onStructureCollide( self, structure ) { }
    onDurationEnd() { console.log( "onDurationEnd()" ); }
}