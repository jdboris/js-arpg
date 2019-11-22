


export class Ability {
    constructor( caster, name = "", castTime = 1, cooldown = 1 ) {
        this.caster = caster;
        this.name = name;

        // In milliseconds (1 means instant cast, 0 won't work)
        this.castTime = castTime;
        this.castTimer = null;

        // In milliseconds (1 means no cooldown, 0 won't work)
        this.cooldown = cooldown;
        this.cooldownTimer = null;
    }

    cast( parameters = null ) {
        if( this.isReady() ) {
            if( this.onCastStart( parameters ) !== false ) {
                this.castTimer = this.caster.scene.time.addEvent( {
                    delay: this.castTime,
                    callback: () => {
                        this.onCastComplete( parameters );

                        this.cooldownTimer = this.caster.scene.time.addEvent( {
                            delay: this.cooldown,
                            callback: () => {
                                this.onCooldownComplete( parameters );
                            },
                            args: [],
                            callbackScope: this,
                            loop: false,
                            repeat: 0,
                            startAt: 0,
                            timeScale: 1,
                            paused: false
                        } );
                    },
                    args: [],
                    callbackScope: this,
                    loop: false,
                    repeat: 0,
                    startAt: 0,
                    timeScale: 1,
                    paused: false
                } );
            }
        }
    }

    isReady() {
        return ( this.castTimer == null || this.castTimer.getProgress() == 1 ) &&
            ( this.cooldownTimer == null || this.cooldownTimer.getProgress() == 1 );
    }

    // Override these:

    onCastStart( parameters = null ) { console.log( "onCastStart()" ); }
    onCastComplete( parameters = null ) { console.log( "onCastComplete()" ); }
    onCooldownComplete( parameters = null ) { console.log( "onCooldownComplete()" ); }
}