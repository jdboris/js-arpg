import { Mob } from "../mob.js";
import { Ability } from "../ability.js";
import { AbilityEffect } from "../ability-effect.js";
import { Interface } from "../ui/interface.js";
import { MOB_STATE, MOB_TEAM } from "../utilities.js";


export class Mage extends Mob {

    constructor( scene, x, y, name = "White Mage" ) {
        super( scene, x, y, "character-atlas", "WHITE_MAGE", 150, 5, 100, name );
        this.setSize( 16, 10 );
        this.setOffset( 0, 6 );
        this.abilities = [new Fireball( this )];
        this.missesToAdjust = 2;
    }

    onUpdate() {

        if( Interface.controlledMob !== this ) {

            this.scene.mobs.iterate( ( mob ) => {
                if( !mob.isInState( MOB_STATE.DEAD ) &&
                    mob.mobTeam != MOB_TEAM.NEUTRAL &&
                    this.mobTeam != MOB_TEAM.NEUTRAL &&
                    mob.mobTeam != this.mobTeam &&
                    mob != this &&
                    this.enemies.indexOf( mob ) == -1 &&
                    Phaser.Math.Distance.Between( this.x, this.y, mob.x, mob.y ) < 500 &&
                    this.canSee( mob ) ) {

                    this.addEnemy( mob );
                }
            } );

            for( let enemy of this.enemies ) {
                if( enemy.isInState( MOB_STATE.DEAD ) )
                    this.removeEnemy( enemy )
            }

            let enemy = this.getNearestEnemy();

            if( enemy != null ) {
                let canSee = this.canSee( enemy );
                let distance = Phaser.Math.Distance.Between( this.x, this.y, enemy.x, enemy.y );
                let isMissing = this.misses >= this.missesToAdjust;

                if( this.isInState( MOB_STATE.DEAD ) || enemy == null ) {
                    this.moveDirection = -1;
                } else if( !canSee || distance > 250 || isMissing ) {
                    this.moveToWithPathfinding( enemy.x, enemy.y );
                } else {
                    this.moveDirection = -1;
                }

                if( !isMissing && canSee && distance < 500 && this.abilities[0].isReady() ) {
                    this.abilities[0].cast( { targetX: enemy.x, targetY: enemy.y } );
                }

                // Give the Mob time to adjust position, then reset the misses
                if( isMissing && !this.isAdjusting ) {
                    this.isAdjusting = true;
                    setTimeout( function () {
                        this.misses = 0;
                        this.isAdjusting = false;
                    }.bind( this ), 1000 );
                }
            }

            if( this.enemies.length == 0 )
                this.moveDirection = -1;
        }

    }
}

export class FireballEffect extends AbilityEffect {
    constructor( caster, x, y ) {
        super( caster, x, y, "effects-fireballs-atlas", "FIREBALL_1", 300, "Fireball", true );
        this.setSize( 12, 12 );
        //this.setOffset( 12, -6 );
    }

    onMobCollide( self, entity ) {
        //console.log( entity );
        if( entity != this.caster && entity.mobTeam != this.caster.mobTeam && !entity.isInState( MOB_STATE.DEAD ) ) {
            entity.takeDamage( 1, this.caster );
            this.destroy();
        }
    }

    onStructureCollide( self, structure ) {
        this.caster.misses++;
        this.destroy();
    }
}

export class Fireball extends Ability {

    constructor( caster ) {
        super( caster, "Powerful Fireball", 200, 500 );
    }

    onCastStart( parameters = null ) {

        if( this.caster.isInState( MOB_STATE.DEAD ) ) return false;

        if( parameters != null ) {
            this.targetX = parameters.targetX;
            this.targetY = parameters.targetY;
        } else {
            let pointer = this.caster.scene.input.activePointer;
            this.targetX = pointer.worldX;
            this.targetY = pointer.worldY;
        }
    }

    onCastComplete( parameters = null ) {
        let fireball = new FireballEffect( this.caster, this.caster.x, this.caster.y );
        fireball.moveTo( this.targetX, this.targetY );
    }

    onCooldownComplete( parameters = null ) {
        //console.log( "Fireball ready!" );
    }

}

export class Knight extends Mob {

    constructor( scene, x, y ) {
        super( scene, x, y, "character-atlas", "SILVER_KNIGHT", 100, 10, 5, "Ken the Knight" );
        this.setSize( 16, 10 );
        this.setOffset( 0, 6 );
        this.abilities = [new Slash( this )];
    }
}

export class Slash extends Ability {

    constructor( caster ) {
        super( caster, "Powerful Slash", 1, 100 );
    }

    onCastStart() {
        console.log( "Charging Slash..." );
    }

    onCastComplete() {
        console.log( "SLASHING!" );
    }

    onCooldownComplete() {
        console.log( "Slash ready!" );
    }

}