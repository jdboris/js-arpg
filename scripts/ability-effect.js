import { LevelEntity } from "./level-entity.js";

export class AbilityEffect extends LevelEntity {
    constructor( caster, x, y, atlasName, animationBase, moveSpeed, name = "", rotateWithDirection = false ) {
        super( caster.scene, x, y, atlasName, animationBase, name, rotateWithDirection );

        caster.scene.addAbilityEffect( this );

        this.caster = caster;
        this.moveSpeed = moveSpeed;
    }

    /*
    update( delta ) {
        super.update( delta );
    }
    */
}