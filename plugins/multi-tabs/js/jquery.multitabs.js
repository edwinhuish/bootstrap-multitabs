//Make sure jQuery has been loaded before app.js
if (typeof jQuery === "undefined") {
    throw new Error("MultiTabs requires jQuery");
}



/**
 * 黑：M_main
 红：M_head
 蓝：M_body
 紫：M_tabPanel
 黄：M_tab

 */
((function($){
    "use strict";
    var NAMESPACE;
    var MultiTabs, getNum, handler, getTabIndex, insertRule, isExtUrl, sumWidth, trimLinkText;

    NAMESPACE = '.multitabs'

    handler = function ($selector, event, childSelector, fn, skipNS) {
        var ev = skipNS ? event : event.split(' ').join(NAMESPACE + ' ') + NAMESPACE;
        if ( typeof childSelector !== "string" ) {
            fn = fn || childSelector;
            childSelector = '';
        }
        $selector.off(ev, childSelector, fn).on(ev, childSelector, fn);
    };

    getTabIndex = function(content, capacity){
       if(content === 'content-main' || content === 'content-edit'){
           return 0;
       }else{
           if(!capacity) capacity = 8; //允许多少tab页面，超过则覆盖
           if(undefined === sessionStorage.infoTabIndex){
               sessionStorage.infoTabIndex = 0;
           }else{
               sessionStorage.infoTabIndex++;
               sessionStorage.infoTabIndex = sessionStorage.infoTabIndex % capacity;
           }
           return sessionStorage.infoTabIndex;
       }
   };
    trimLinkText = function (text){
        var words = text.split(' ');
        var newText = '';
        $.each(words, function(index, value) {
            if($.trim(value))
                newText += ($.trim(value) + ' ');
        });
        return $.trim(newText);
    };
    sumWidth = function (WidthObjList) {
        var width = 0;
        $(WidthObjList).each(function () {
            width += $(this).outerWidth(true)
        });
        return width
    };

    isExtUrl = function (url){
        var absUrl = (function(url){
            var a = document.createElement('a');
            a.href=url;
            return a.href;
        })();
        var webRoot = window.location.protocol + '//' + window.location.host + '/';
        var urlRoot = absUrl.substr(0, webRoot.length);
        return ( ! (urlRoot===webRoot) );
    };


    insertRule = function(selectorText,cssText,position){
        position = position || 0;
        var sheet = document.styleSheets[0];
        if(sheet.insertRule){
            sheet.insertRule(selectorText+"{" + cssText + "}",position);
        }
        else if(sheet.addRule){
            sheet.addRule(selectorText, cssText, position);
        }
    };

    getNum = function (num, def) {
        def = def || 0;
        if (typeof num === "number") {
            return num;
        }
        if (typeof num === "string") {
            num = parseFloat(num);
        }
        return isNaN(num) ? def : num;
    };

    MultiTabs = function (element, options) {
        var self = this;
        self.$element = $(element);
        if (!self._validate()) {
            return;
        }
        self._init(options);
        self._listen();
    };
    MultiTabs.prototype = {
        constructor: MultiTabs,
        _init: function (options) {
            var self = this, $el = self.$element;
            $el.empty().append($.fn.multitabs.template.main);
            $el.tabHeader = $el.find('.mt-tab-header:first');
            $el.tabToolsLeft = $el.tabHeader.find('.mt-tab-tools-left:first');
            $el.tabPanel = $el.tabHeader.find('.mt-tab-panel:first');
            $el.tabToolsRight = $el.tabHeader.find('.mt-tab-tools-right:first');
            $el.tabContent = $el.find('.tab-content:first');
            var toolWidth = $el.tabToolsLeft.width() + $el.tabToolsRight.width();
            $el.tabPanel.css('width', 'calc(100% - ' + toolWidth + 'px');
            self.options = options;
        },
        _validate: function () {
            var self = this, $exception;
            if (self.$element.length == 1) {
                return true;
            }
            $exception = '<div class="help-block alert alert-warning">' +
                '<h4>Duplicate Instance</h4>' +
                'MultiTabs only can be 1 Instance.' +
                '</div>';
            self.$element.after($exception);
            return false;
        },
        _listen: function () {
            var self = this, $el = self.$element;
            handler($(document), 'click', '.multi-tabs', function(){
                var url = $(this).attr('href').replace('#','');
                self._create(url);
                return;
            });
        },
        _create : function (url) {
            var self = this,
                options = self.options,
                $el = self.$element,
                $editor = $el.tabContent.find('.tab-pane[data-content="editor"]');
            //禁止打开多个edit页面，如果edit页面存在，也禁止覆盖
            if(options.content == 'editor' && $editor.length && $editor.hasClass('unsave')){
                alert("Please colse or save the Editor before open the other!");
                //----------------------------------------------------
                window.location.hash= encodeURI($editor.attr('data-id'));
                //----------------------------------------------------
                return false;
            }
            url = url.replace('#','');
            var index = getTabIndex(options.content, options.maxTabs);
            var tabHtml, closeBtn, contenthtml;
            tabHtml = $.fn.multitabs.template.tab;
            closeBtn = (options.content === 'main')? '' : $.fn.multitabs.template.closeBtn; //main content can not colse.
            //remove same index tab.
            var tab = $el.tabPanel.find('li[data-content="'+ options.content +'"][data-index="'+ index +'"]');
            var tabPane = $el.tabContent.find('.tab-pane[data-content="'+ options.content +'"][data-index="'+ index +'"]');
            if(tab.length){
                $(tab).remove();
                $(tabPane).remove();
            }
            //tab create
            $el.tabPanel.find('li').removeClass('active');
            $el.tabPanel.find('ul:first').append(tabHtml);
            $el.tabPanel.find('li.active').children('a:first')
                .attr('data-content', options.content)
                .attr('data-index',index)
                .attr('data-id', url)
                .attr('href','#_'+ options.content + '_' + index)
                .text(options.title)
                .append(closeBtn);
            //tab-content create
            if( options.iframe){
                contenthtml = $.fn.multitabs.template.iframeContent;
            }else{
                contenthtml = $.fn.multitabs.template.ajaxContent;
            }
            $el.tabContent.children().removeClass('active');
            $el.tabContent.find('.tab-pane[data-content="'+ options.content +'"][data-index="'+index+'"]').remove();//直接移除旧的content，不应重复判断是否同内容。
            $el.tabContent.append(contenthtml);
            var content = $el.tabContent.find('.tab-pane.active:first')
                .attr('data-content', options.content)
                .attr('data-index', index)
                .attr('id', '_' + options.content + '_' + index)
                .attr('data-id',url)
                .attr('data-title',options.title);
            if($(content).is('iframe')){
                $(content).attr('src', url);
                $('body').addClass('full-height-layout');
            }else{
                $(content).addClass($.fn.multitabs.defaults.contentDisplay).load(url);
                $('body').removeClass('full-height-layout');
            }
        },
        _check : function (url) {
            var newTab = true;
            var self = this, $el = self.$element, options = self.options;
            url = decodeURIComponent(url.replace('#', ''));
            if (url == undefined || $.trim(url).length == 0) return false;
            if(isExtUrl(url)) options.iframe = true;
            if(options.iframe) options.content='info';
            var tab = $el.tabPanel.find('a[data-id="'+ url +'"]').parent('li');
            var content = $el.tabContent.find('.tab-pane[data-id="'+ url +'"]');
            if(tab.length){
                if (!tab.hasClass("active")) {
                    tab.addClass("active").siblings("li").removeClass("active");
                    self._fixTabPosition(tab);
                }
            }
            if(content.length || content.is('iframe')){
                $(content).addClass('active').siblings(".tab-pane").removeClass('active');
                newTab = false;
                if(content.is('iframe')){
                    $('body').addClass('full-height-layout');
                }else{
                    $('body').removeClass('full-height-layout');
                }
            }

            if ( !tab.length || !content.length || newTab ) {
                self._create(url);
                self._fixTabPosition($el.tabPanel.find('li.active:first'));
            }
            return false
        },
        _fixTabPosition : function (tab) {
            var self = this, $el = self.$element;
            var tabWidth = $(tab).outerWidth(true);
            var tabNextWidth = $(tab).next().outerWidth(true);
            var tabPrevWidth = $(tab).prev().outerWidth(true);
            var tabMarginLeft = sumWidth($(tab).prevAll());
            var tabMarginRight = sumWidth($(tab).nextAll());
            var tabPanelWidth = $el.tabPanel.outerWidth(true);
            var totalTabsWidth = sumWidth($el.tabPanel.find('li'));
            var px = 0;
            if (totalTabsWidth < tabPanelWidth) {
                px = 0
            } else {
                if (tabMarginRight <= (tabPanelWidth - tabWidth - tabNextWidth)) {
                    if ((tabPanelWidth - tabNextWidth) > tabMarginRight) {
                        px = tabMarginLeft;
                        var _tab = tab;
                        while ((px - $(_tab).outerWidth()) > (totalTabsWidth - tabPanelWidth)) {
                            px -= $(_tab).prev().outerWidth();
                            _tab = $(_tab).prev()
                        }
                    }
                } else {
                    if (tabMarginLeft > (tabPanelWidth - tabWidth - tabPrevWidth)) {
                        px = tabMarginLeft - tabPrevWidth
                    }
                }
            }
            $el.tabPanel.find('ul:first').animate({
                marginLeft : 0 - px + "px"
            }, "fast");
        },
        _moveLeft : function () {
            var self = this, $el = self.$element;
            var tabPanelMarginLeft = Math.abs(parseInt($el.tabPanel.find('ul:first').css("margin-left")));
            var tabPanelWidth = $el.tabPanel.width();
            var totalTabsWidth = sumWidth($el.tabPanel.find('li'));
            var px = 0;
            if (totalTabsWidth < tabPanelWidth) {
                return false
            } else {
                var _tab = $el.tabPanel.find('li:first');
                var marginLeft = 0;
                while ((marginLeft + _tab.width()) <= tabPanelMarginLeft) {
                    marginLeft += _tab.width();
                    _tab = $(_tab).next()
                }
                marginLeft = 0;
                if (sumWidth($(_tab).prevAll()) > tabPanelWidth) {
                    while (( (marginLeft + _tab.width()) < tabPanelWidth) && _tab.length > 0) {
                        marginLeft += _tab.width();
                        _tab = $(_tab).prev()
                    }
                    px = sumWidth($(_tab).prevAll())
                }
            }
            $el.tabPanel.find('ul:first').animate({
                marginLeft : 0 - px + "px"
            }, "fast")
        },
        _moveRight : function () {
            var self = this, $el = self.$element;
            var tabPanelMarginLeft = Math.abs(parseInt($el.tabPanel.find('ul:first').css("margin-left")));
            var tabPanelWidth = $el.tabPanel.width();
            var totalTabsWidth = sumWidth($el.tabPanel.find('li'));
            var px = 0;
            if (totalTabsWidth < tabPanelWidth) {
                return false;
            } else {
                var _tab = $el.tabPanel.find('li:first');
                var marginLeft = 0;
                while ((marginLeft + _tab.width()) <= tabPanelMarginLeft) {
                    marginLeft += _tab.width();
                    _tab = $(_tab).next()
                }
                marginLeft = 0;
                while (( (marginLeft + _tab.width()) < tabPanelWidth) && tabs.length > 0) {
                    marginLeft += _tab.width();
                    _tab = $(_tab).next()
                }
                px = sumWidth($(_tab).prevAll());
                if (px > 0) {
                    $el.tabPanel.find('ul:first').animate({
                        marginLeft : 0 - px + "px"
                    }, "fast")
                }
            }
        },
        _close: function (tab) {
            var self = this, $el = self.$element;
            var close = true;
            var tabLink = $(tab).child("a");
            var dataId = tabLink.attr("data-id");
            var content = $el.tabContent.find('.tab-pane[data-id="'+dataId+'"]:first');
            if(close){
                if (tab.hasClass("active")) {
                    if (tab.next("li").size()) {
                        tab.next("li:first").addClass('active');
                    }else if (tab.prev("li").size()) {
                        tab.prev("li:last").addClass('active');
                    }
                }
                tab.remove();
                $el.tabContent.find('.tab-pane[data-id="'+dataId+'"]').remove();
                window.location.hash = $el.tabPanel.find('li.active:first').child('a').attr('data-id');
                return false;
            }
            return false;
        },
        _closeOthers : function (tab) {
            var self = this, $el = self.$element;
            $el.tabPanel.find('li:not(.active)').find('a:not([data-content="main"]):not([data-content="editor"])').each(function () {
                $el.tabContent.children('.tab-pane[data-id="'+ $(this).attr("data-id") +'"]').remove();
                $(this).parent('li').remove()
            });
            $el.tabPanel.child('ul').css("margin-left", "0");
        },
        _showActive : function () {
            var self = this, $el = self.$element;
            var tab = $el.tabPanel.child('li.active');
            self._fixTabPosition(tab);
        },
        _enable : function (tab) {
            var self = this, $el = self.$element;
            if (!$(tab).hasClass("active")) {
                window.location.hash= encodeURI($(tab).child('a').attr("data-id"));
            }
        }
    }

    /**
     * Main function
     * @param option
     */
    $.fn.multitabs = function(option){
        var mainFrame = $(this), options = typeof option === 'object' && option;


        var args = Array.apply(null, arguments), retvals = [];
        args.shift();

        $(this).each(function () {
            var self = $(this), data = self.data('multitabs'), options = typeof option === 'object' && option,
                opts;

            if (!data) {
                opts = $.extend(true, {}, $.fn.multitabs.defaults, options, self.data());
                data = new MultiTabs(this, opts);
                self.data('multitabs', data);
            }
            if (typeof option === 'string') {
                retvals.push(data[option].apply(data, args));
            }
        });
        switch (retvals.length) {
            case 0:
                return this;
            case 1:
                return retvals[0];
            default:
                return retvals;
        }
    };

    /**
     * Default Options
     * @type {{showHash: boolean, mode: string, maxTabs: number, maxTabTitleLength: number, tabTitle: string, content: string}}
     */
    $.fn.multitabs.defaults = {
        showHash : true,
        iframe : true,  //can be auto or iframe
        maxTabs : 8,
        maxTabTitleLength : 15,
        tabTitle : 'multi-tab',
        content : 'info',
        contentDisplay : 'fade'
    };

    /**
     * Template
     * @type {{head: string, body: string}}
     */
    $.fn.multitabs.template = {
        main:'<div class="mt-tab-wrapper">' +
            '<div class="mt-tab-header">' +
                '<nav class="mt-tab-tools-left">' +
                    '<ul  class="nav nav-tabs">' +
                        '<li class="mt-move-left"><a><i class="fa fa-backward"></i></a></li>' +
                    '</ul>' +
                '</nav>' +
                '<nav class="mt-tab-panel">' +
                    '<ul  class="nav nav-tabs">' +
                        '<li class="active"><a href="" data-toggle="tab" data-content="main">Home</a></li>' +
                    '</ul>' +
                '</nav>' +
                '<nav class="mt-tab-tools-right">' +
                    '<ul  class="nav nav-tabs">' +
                        '<li class="mt-move-right"><a><i class="fa fa-forward"></i></a></li>' +
                        '<li class="mt-dropdown-option dropdown">' +
                            '<a href="#"  class="dropdown-toggle" data-toggle="dropdown">Option<span class="caret"></span></a>' +
                            '<ul role="menu" class="dropdown-menu dropdown-menu-right">' +
                                '<li class="mt-show-actived-tab"><a>Show Activated Tab</a></li>' +
                                '<li class="divider"></li>' +
                                '<li class="mt-close-all-tabs"><a>Close All Tabs</a></li>' +
                                '<li class="mt-close-other-tabs"><a>Close Other Tabs</a></li>' +
                           ' </ul>' +
                        '</li>' +
                    '</ul>' +
                '</nav>' +
            '</div>' +
            '<div class="tab-content"></div>' +
        '</div>',
        tab : '<li class="active"><a href="" data-toggle="tab">tab</a></li>',
        closeBtn : ' <i class="fa fa-times"></i>',
        ajaxContent : '<div class="tab-pane active"></div>',
        iframeContent : '<iframe class="tab-pane active" width="100%" height="100%" frameborder="0" src="" seamless></iframe>',
    };



    // $.fn.multitabs.local.en = {
    //     head : {
    //         button: {
    //             option : {
    //                 text: 'Option',
    //                 showA
    //             }
    //         }
    //     }
    // }
})(jQuery))
