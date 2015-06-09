define(['zepto'],function($) {
    function Slider(config) {
        this.config = $.extend({}, {
            loop: false,
            speed: 400,
            index: 0,
            autoPlay: true,
            interval: 4000,
            wrap: '.ui-slider'
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

        }
        _translate: function(){

        },
        _tansitionEnd: function(){

        },
        _slide: function(){

        },
        _resume: function(){

        },
        _stop: function(){

        },
        _auto: function(){

        },
        slideTo: function(){

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