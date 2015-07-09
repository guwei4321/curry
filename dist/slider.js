define(['zepto'],function($) {
    function Slider(config) {
        this.config = $.extend({}, {
            loop: false,
            speed: 400,
            index: 0,
            autoPlay: true,
            interval: 4000,
            classWrap: '.ui-slider',
            classContainer: '.ui-slider-group'
        }, config)
    }
    $.extend(Slider.prototype, {
        create: function(){

        },
        // 根据 items 里面的数据决定是否插入到 containter 中
        _createItems: function(containter, items){

        },
        // 设置高/宽度
        _setSize: function(el, index){

        },
        // 重排 items
        _redraw: function(){

        },
        _move: function(){

        },
        _translate: function( index, dist, speed ){
            var cssPrefix = $.fx.cssPrefix,
                slide = this._items[ index ],
                style = slide && slide.style;

            if ( !style ) {
                return false;
            }

            style.cssText += cssPrefix + 'transition-duration:' + speed +
                    'ms;' + cssPrefix + 'transform: translate(' +
                    dist + 'px, 0)' + translateZ + ';';

        },
        _tansitionEnd: function(e){
             if ( ~~e.target.getAttribute( 'data-index' ) !== this.index ) {
                return;
            }

            this.trigger( 'slideend', this.index );
        },
        _slide: function(from, diff, dir, width, speed, opts){
            var me = this,
                to;

            to = me._circle( from - dir * diff );

            // 如果不是loop模式，以实际位置的方向为准
            if ( !opts.loop ) {
                dir = Math.abs( from - to ) / (from - to);
            }

            // 调整初始位置，如果已经在位置上不会重复处理
            this._move( to, -dir * width, 0, true );

            this._move( from, width * dir, speed );
            this._move( to, 0, speed );

            this.index = to;
            return this.trigger( 'slide', to, from );
        },
        slideTo: function( to, speed ){
            if ( this.index === to || this.index === this._circle( to ) ) {
                return this;
            }

            var opts = this._options,
                index = this.index,
                diff = Math.abs( index - to ),

                // 1向左，-1向右
                dir = diff / (index - to),
                width = this.width;

            speed = speed || opts.speed;

            return this._slide( index, diff, dir, width, speed, opts );
        },
        _resume: function(){

        },
        _stop: function(){

        },
        _auto: function(){

        },
        prev: function(){

        },
        next: function(){

        },
        getIndex: function(){

        }
    });
    return Slider;
})