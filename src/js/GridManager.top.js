/*
 * GridManager: 表头吸顶
 * */
define(['cTool'], function($) {
    var topGM = {
        /*
         @绑定表头吸顶功能
         $.table: table [jquery object]
         */
        bindSetTopFunction: function(table){
            var _this = this;
            //绑定窗口变化事件
            $(window).resize(function() {
                $(_this.scrollDOM).trigger('scroll', [true]);
            });
            //绑定模拟X轴滚动条
            $('.scroll-area').unbind('scroll');
            $('.scroll-area').bind('scroll', function(){
                $(this).parents('.table-div').scrollLeft(this.scrollLeft);
                this.style.left = this.scrollLeft + 'px';
            });
            //_this.scrollDOM != window 时 清除_this.scrollDOM 的padding值
            if(_this.scrollDOM != window){
                $(_this.scrollDOM).css('padding','0px');
            }

            //绑定滚动条事件
            //$._isWindowResize_:是否为window.resize事件调用
            $(_this.scrollDOM).unbind('scroll');
            $(_this.scrollDOM).bind('scroll', function(e, _isWindowResize_){
                var _scrollDOM = $(this),
                    _theadBackground,		//列表头的底色
                    _tableDIV,				//列表所在的DIV,该DIV的class标识为table-div
                    _tableWarp,				//列表所在的外围容器
                    _setTopHead,			//吸顶元素
                    _tableOffsetTop,		//列表与_tableDIV之间的间隙，如marin-top,padding-top
                    _table,					//原生table
                    _thead,					//列表head
                    _thList,				//列表下的th
                    _tbody;					//列表body
                var _scrollDOMTop = _scrollDOM.scrollTop(),
                    _tDIVTop = 0;
                var _tWarpMB	= undefined; //吸顶触发后,table所在外围容器的margin-bottom值

                _tableDIV 		= table.parents('.table-div').eq(0);
                _tableWarp 		= _tableDIV.parents('.table-warp').eq(0);
                _table			= table.get(0);
                _thead 			= $('> thead[class!="set-top"]', table);
                _tbody 			= $('tbody', table);

                if(!_tableDIV || _tableDIV.length == 0){
                    return true;
                }
                _tDIVTop 		= _this.scrollDOM == window ? _tableDIV.offset().top : 0;

                _tableOffsetTop = _table.offsetTop;
                _setTopHead 	= $('.set-top', table);
                //当前列表数据为空
                if($('tr', _tbody).length == 0){
                    return true;
                }
                //配置X轴滚动条
                var scrollArea = $('.scroll-area', _tableWarp);
                if(_tableDIV.width() < table.width()){  //首先验证宽度是否超出了父级DIV
                    if(_this.scrollDOM == window){
                        _tWarpMB = Number(_tableDIV.height())
                            + Number(_tableWarp.css('margin-bottom').split('px')[0])
                            //		 - Number(_tableWarp.css('padding-bottom').split('px')[0])
                            //	 - window.scrollY
                            //	 #151010 该属性不是通用属性 虽然在高版本的火狐或谷歌中可以实现，考虑后还是使用scrollTop
                            //   IE 支持  document.documentElement.scrollTop
                            //   firebox 支持 document.documentElement.scrollTop  window.scrollY
                            //	 Chrome 支持 document.body.scrollTop window.scrollY
                            - (document.body.scrollTop || document.documentElement.scrollTop || window.scrollY)
                            - (window.innerHeight - _tableDIV.offset().top);
                    }else{
                        _tWarpMB = Number(_tableDIV.height())
                            + Number(_tableWarp.css('margin-bottom').split('px')[0])
                            - _scrollDOM.scrollTop()
                            - _scrollDOM.height();
                    }

                    if(_tWarpMB < 0){
                        _tWarpMB = 0;
                    }
                    $('.sa-inner', scrollArea).css({
                        width : table.width()
                    });
                    scrollArea.css({
                        bottom	: _tWarpMB - 18,
                        left	: _tableDIV.scrollLeft()
                    });
                    scrollArea.scrollLeft(_tableDIV.scrollLeft());
                    scrollArea.show();
                }else{
                    scrollArea.hide();
                }

                //表头完全可见 分两种情况 scrollDOM 为 window 或自定义容器
                if(_this.scrollDOM == window ? (_tDIVTop - _scrollDOMTop >= -_tableOffsetTop) : (_scrollDOMTop == 0)){
                    if(_thead.hasClass('scrolling')){
                        _thead.removeClass('scrolling');
                    }
                    _setTopHead.remove();
                    return true;
                }
                //表完全不可见
                if(_this.scrollDOM == window ? (_tDIVTop - _scrollDOMTop < 0 &&
                    Math.abs(_tDIVTop - _scrollDOMTop) + _thead.height() - _tableOffsetTop > _tableDIV.height()) : false){
                    _setTopHead.show();
                    _setTopHead.css({
                        top		: 'auto',
                        bottom	: '0px'
                    });
                    return true;
                }
                //配置表头镜像
                //当前表未插入吸顶区域 或 事件触发事件为window.resize

                //配置吸顶区的宽度
                if(_setTopHead.length == 0 || _isWindowResize_){
                    _setTopHead.length == 0 ? table.append(_thead.clone(false).addClass('set-top')) : '';
                    _setTopHead = $('.set-top', table);
                    _setTopHead.css({
                        width : _thead.width()
                        + Number(_thead.css('border-left-width').split('px')[0] || 0)
                        + Number(_thead.css('border-right-width').split('px')[0] || 0)
                        ,left: table.css('border-left-width')
                    });
                    //$(v).width(_thList.get(i).offsetWidth)  获取值只能精确到整数
                    //$(v).width(_thList.eq(i).width()) 取不到宽
                    //调整吸顶表头下每一个th的宽度[存在性能问题，后期需优化]
                    _thList = $('th', _thead);
                    $.each($('th', _setTopHead), function(i, v){
                        $(v).css({
                            width : _thList.eq(i).width()
                            + Number(_thList.eq(i).css('border-left-width').split('px')[0] || 0)
                            + Number(_thList.eq(i).css('border-right-width').split('px')[0] || 0)
                        });
                    });
                }
                //当前吸引thead 没有背景时 添加默认背景
                if(!_setTopHead.css('background') ||
                    _setTopHead.css('background') == '' ||
                    _setTopHead.css('background') == 'none'){
                    _setTopHead.css('background', '#f5f5f5');
                }

                //表部分可见
                if( _this.scrollDOM == window ? (_tDIVTop - _scrollDOMTop < 0 &&
                    Math.abs(_tDIVTop - _scrollDOMTop) <= _tableDIV.height() +_tableOffsetTop) : true){
                    if(!_thead.hasClass('scrolling')){
                        _thead.addClass('scrolling');
                    }
                    _setTopHead.css({
                        top		: _scrollDOMTop  - _tDIVTop + _this.topValue,
                        bottom	: 'auto'
                    });
                    _setTopHead.show();
                    return true;
                }
                return true;
            });
            $(_this.scrollDOM).trigger('scroll');
        }
    };
    return topGM;
});