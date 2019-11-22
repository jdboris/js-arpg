import { LevelEntity } from "./level-entity.js";
import { MOB_STATE, MOB_TEAM, valueByName } from "./utilities.js";
import { Interface } from "./ui/interface.js";

export class Mob extends LevelEntity {

	static make( scene, tiledData ) {
		//let constructor = EntityTypes[tiledData.type][valueByName( tiledData, "class" )];
		let mob = new this( scene, tiledData.x, tiledData.y, tiledData.name );
		mob.mobTeam = MOB_TEAM[valueByName( tiledData, "mobTeam" )];
		if( valueByName( tiledData, "controlled" ) )
			Interface.controlledMob = mob;
		return mob;
	}

	constructor( scene, x, y, atlasName, animationName, moveSpeed, health, mana, name = "" ) {

		super( scene, x, y, atlasName, animationName, name );

		scene.addMob( this );

		this.moveSpeed = moveSpeed;
		this.health = health;
		this.mana = mana;
		this.abilities = [];
		this.mobTeam = MOB_TEAM.NEUTRAL;
		this.damageMultiplier = 1.0;
		this.damageReduction = 0.0;

		// This list of Mobs that this Mob is aware of and aggressive towards
		this.enemies = [];

		// The number of times this Mob has missed an ability since the counter was reset last
		this.misses = 0;
		this.missesToAdjust = 3;
		this.isAdjusting = false;
	}

	update( delta ) {
		super.update( delta );
	}

	enterState( state ) {
		let wasDead = this.isInState( MOB_STATE.DEAD );

		super.enterState( state );

		if( state == MOB_STATE.DEAD && !wasDead ) {
			this.playAnimation( "DEATH" );
			this.chainAnimation( "DEAD" );
		}
	}

	exitState( state ) {
		super.exitState( state );
	}

	takeDamage( damage, attacker = null ) {
		this.health -= damage * this.damageMultiplier - this.damageReduction;

		if( this.health <= 0 ) {
			this.enterState( MOB_STATE.DEAD );
			// NOTE: This may mess up other stuff
			this.scene.mobGroup.remove( this );
			this.removeColliders();
		}

		if( attacker != null && this.enemies.indexOf( attacker ) == -1 )
			this.addEnemy( attacker );
	}

	addEnemy( mob ) {
		if( this.enemies.indexOf( mob ) != -1 )
			console.error( "Error: Attempt to add a mob to the enemies list twice." );
		else
			this.enemies.push( mob );
	}

	removeEnemy( mob ) {
		let index = this.enemies.indexOf( mob );
		if( index != -1 )
			this.enemies.splice( index, 1 );
	}

	getNearestMob( condition = ( mob ) => { return true; } ) {

		let shortestDistance = 999999999;
		let nearestMob = null;

		this.scene.mobs.iterate( ( mob ) => {
			if( condition( mob ) ) {
				let distance = Math.sqrt( Math.pow( ( mob.y - this.y ), 2 ) + Math.pow( ( mob.x - this.x ), 2 ) );
				if( distance < shortestDistance ) {
					shortestDistance = distance;
					nearestMob = mob;
				}
			}
		} );

		return nearestMob;
	}

	getNearestEnemy() {
		let shortestDistance = 999999999;
		let nearestEnemy = null;

		for( let enemy of this.enemies ) {
			let distance = Math.sqrt( Math.pow( ( enemy.y - this.y ), 2 ) + Math.pow( ( enemy.x - this.x ), 2 ) );
			if( distance < shortestDistance ) {
				shortestDistance = distance;
				nearestEnemy = enemy;
			}
		};

		return nearestEnemy;
	}
}