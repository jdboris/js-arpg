
export class Button extends Phaser.GameObjects.Container {
    //class Button extends Phaser.GameObjects.Image {
    constructor( scene, buttonText, x, y, width = 100, height = 50 ) {
        super( scene, x, y );

        scene.add.existing( this );

        this.pointerDown = false;
        this.setSize( width, height );
        this.setInteractive();
        this.setScrollFactor( 0 );


        this.image = scene.add.
            image( 0, 0, "squareButton" ).
            setDepth( 40 ).
            setSize( width, height ).
            setDisplaySize( width, height );
        this.add( this.image );


        this.text = scene.add
            .text( this.image.width / 2, this.image.height / 2, buttonText, {
                font: "18px monospace",
                fill: "#4286f4",
                align: "center",
                //padding: { x: 10, y: 10 },
                //backgroundColor: "#01183d"
            } )
            .setDepth( 50 )
            .setOrigin( 0.5, 0.5 )
            .setPosition( 0, 0 );
        this.add( this.text );


        this.on( "pointerdown", () => {
            this.pointerDown = true;
        } );
        this.on( "pointerover", ( pointer ) => {
            if( pointer.isDown ) {
                this.pointerDown = true;
            }
        } );

        this.on( "pointerup", () => {
            if( this.pointerDown ) {
                this.onClick();
                this.pointerDown = false;
            }
        } );
        this.on( "pointerout", () => {
            this.pointerDown = false;
        } );

    }

    onClick() {
        console.log( "Button clicked" );
    }
}