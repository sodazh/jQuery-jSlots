
(function($){
    
    $.jSlots = function(el, options){

        var base = this;
        
        base.$el = $(el);
        base.el = el;
        
        base.$el.data("jSlots", base);
        
        base.init = function() {
            
            base.options = $.extend({},$.jSlots.defaultOptions, options);
            
            base.setup();
            base.bindEvents();
            
        };
        
        
        /* --------------------------------------------------------------------- */
        // DEFAULT OPTIONS
        /* --------------------------------------------------------------------- */

        $.jSlots.defaultOptions = {
            number : 3, // number of slots
            winnerNumber : 1, // number upon which to win, zero-based index
            spinner : '', // selector to start the slots on event
            spinEvent : 'click', // event to respond to
            onStart : $.noop,
            onWin : $.noop, // function to run on win
            easing : 'swing',
            time : 2000,
            loops : 6
        };
        
        /* --------------------------------------------------------------------- */
        // HELPERS
        /* --------------------------------------------------------------------- */
        
        base.randomRange = function(low, high) {
            return Math.floor( Math.random() * (1 + high - low) ) + low;
        };
        
        /* --------------------------------------------------------------------- */
        // VARS
        /* --------------------------------------------------------------------- */
        
        base.isSpinning = false;
        base.spinSpeed = 0;
        base.winCount = 0;
        base.doneCount = 0;
        
        base.$liHeight = 0;
        base.$liWidth = 0;
        
        base.winners = [];
        base.allSlots = [];
        
        /* --------------------------------------------------------------------- */
        // FUNCTIONS
        /* --------------------------------------------------------------------- */
        
        
        base.setup = function() {
            
            // set sizes
            
            var $list = base.$el;
            var $li = $list.find('li').first();
            
            base.$liHeight = $li.outerHeight();
            base.$liWidth = $li.outerWidth();
            
            base.liCount = base.$el.children().length;
            
            base.listHeight = base.$liHeight * base.liCount;
            
            base.increment = (base.options.time / base.options.loops) / base.options.loops;
            
            $li.clone().appendTo($list);
            
            base.$wrapper = $list.wrap('<div class="jSlots-wrapper"></div>').parent();
            
            // remove original, so it can be recreated with Slot 'top's
            base.$el.remove();
            
            // clone lists
            for (var i = base.options.number - 1; i >= 0; i--){
                base.allSlots.push( new base.Slot() );
            }
            
        };
        
        base.bindEvents = function() {
            $(base.options.spinner).bind(base.options.spinEvent, function(event) {
                if (!base.isSpinning) {
                    base.playSlots();
                }
            });
        };
        
        // new Slot contstructor
        base.Slot = function() {
            
            this.spinSpeed = 0;
            this.el = base.$el.clone().appendTo(base.$wrapper)[0];
            this.$el = $(this.el);
            this.loopCount = 0;
            
        };
        
        
        base.Slot.prototype = {
            
            spinEm : function() {

                var that = this;
                
                that.$el
                    .css( 'top', -base.listHeight)
                    .animate( { 'top' : '0px'}, that.spinSpeed, 'linear', function() {
                        that.lowerSpeed();
                    });

            },
            
            lowerSpeed : function() {

                this.spinSpeed += base.increment;
                this.loopCount++;

                if ( this.loopCount < base.options.loops ) {

                    this.spinEm();

                } else {

                    this.finish();

                }
            },
            
            finish : function() {
                
                var that = this;
                
                var endNum = base.randomRange( 1, base.liCount );

                var finalPos = - ( (base.$liHeight * endNum) - base.$liHeight );
                var finalSpeed = ( (this.spinSpeed * 0.5) * (base.liCount) ) / endNum;

                that.$el
                    .css( 'top', -base.listHeight )
                    .animate( {'top': finalPos}, finalSpeed, base.options.easing, function() {
                        base.checkWinner(endNum, that);
                    });
                
            }
            
        };
        
        base.checkWinner = function(endNum, slot) {
            
            base.doneCount++;

            if (endNum === base.options.winnerNumber) {
                base.winCount++;
                base.winners.push(slot.$el);
            }

            if (base.doneCount === base.options.number) {
                
                if ( base.winCount && $.isFunction(base.options.onWin) ) {
                    base.options.onWin(base.winCount, base.winners);
                }
                base.isSpinning = false;
            }
        };
        
        
        base.playSlots = function() {

            base.isSpinning = true;
            base.winCount = 0;
            base.doneCount = 0;
            base.spinSpeed = 0;
            base.winners = [];
            
            if ( $.isFunction(base.options.onStart) ) {
                base.options.onStart();
            }

            $.each(base.allSlots, function(index, val) {
                this.spinSpeed = 0;
                this.loopCount = 0;
                this.spinEm();
            });
            
        };

        
        base.onWin = function() {
            if ( $.isFunction(base.options.onWin) ) {
                base.options.onWin();
            }
        };
        
        
        // Run initializer
        base.init();
    };
    
    
    
    /* --------------------------------------------------------------------- */
    // JQUERY FN
    /* --------------------------------------------------------------------- */
    
    $.fn.jSlots = function(options){
        if (this.length) {
            return this.each(function(){
                (new $.jSlots(this, options));
            });
        }
    };
    
})(jQuery);
