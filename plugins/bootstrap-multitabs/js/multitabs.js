//Make sure jQuery has been loaded before app.js
if (typeof jQuery === "undefined") {
    throw new Error("MultiTabs requires jQuery");
}
((function($){
    "use strict";
    var NAMESPACE;
    var MultiTabs,  handler, getTabIndex, toJoinerStr, toHumpStr,  isExtUrl, sumWidth, trimText, jquerySelectorEncode;
    var tabIndex;
    var defaultLayoutTemplates, defaultLanguage, defaultAjaxTabPane, defaultIframeTabPane, defaultTabHeader;

    NAMESPACE = '.multitabs';

    handler = function ($selector, event, childSelector, fn, skipNS) {
        var ev = skipNS ? event : event.split(' ').join(NAMESPACE + ' ') + NAMESPACE;
        if ( typeof childSelector !== "string" ) {
            fn = fn || childSelector;
            childSelector = '';
        }
        $selector.off(ev, childSelector, fn).on(ev, childSelector, fn);
    };

    getTabIndex = function(content, capacity){
        if(content === 'main' || content === 'editor') return 0;
        capacity = capacity || 8; //允许多少tab页面，超过则覆盖
        tabIndex = tabIndex || 0;
        tabIndex++;
        tabIndex = tabIndex % capacity;
        return tabIndex;
   };
    trimText = function (text, maxLength){
        maxLength = maxLength || defaultTabHeader.maxTabTitleLength;
        var words = text.split(' ');
        var t = '';
        for(var i=0; i<words.length; i++ ){
            var w =  $.trim(words[i]);
            t += w ? (w + ' ') : '';
        }

        if(t.length > maxLength) {
            t = t.substr(0, maxLength);
            t += '...'
        }
        return t;
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
        })(url);
        var webRoot = window.location.protocol + '//' + window.location.host + '/';
        var urlRoot = absUrl.substr(0, webRoot.length);
        return ( ! (urlRoot===webRoot) );
    };

    jquerySelectorEncode = function(str){
        return str.replace(/\./g, "\\\\.").replace(/\//g, "\\\\/").replace(/\[/g, "\\\\[").replace(/\]/g, '\\\\]');
    };

    /**
     * 将驼峰式string 转化为带'-'连接符的字符串
     * @param humpStr
     * @returns {string}
     */
    toJoinerStr = function(humpStr){
        return humpStr.replace(/\./g, '').replace(/([A-Z])/g, "-$1").toLowerCase();
    };

    toHumpStr = function(joinerStr){
        return joinerStr.replace(/\./g, '').replace(/\-(\w)/g, function(x){return x.slice(1).toUpperCase();});
    };



    /**
     * Layout Templates
     */
    defaultLayoutTemplates = {
        /**
         * Main Layout
         */
        main : '<div class="mt-tab-wrapper {mainClass}" style="height: 100%;">' +
        '   <div class="mt-tab-header">' +
        '       <nav class="mt-tab-tools-left">' +
        '           <ul  class="nav nav-tabs">' +
        '               <li class="mt-move-left"><a><i class="fa fa-backward"></i></a></li>' +
        '           </ul>' +
        '       </nav>' +
        '       <nav class="mt-tab-panel">' +
        '           <ul  class="nav nav-tabs">' +
        '           </ul>' +
        '       </nav>' +
        '       <nav class="mt-tab-tools-right">' +
        '           <ul  class="nav nav-tabs">' +
        '               <li class="mt-move-right"><a><i class="fa fa-forward"></i></a></li>' +
        '               <li class="mt-dropdown-option dropdown">' +
        '                   <a href="#"  class="dropdown-toggle" data-toggle="dropdown">{option}<span class="caret"></span></a>' +
        '                   <ul role="menu" class="dropdown-menu dropdown-menu-right">' +
        '                       <li class="mt-show-actived-tab"><a>{showActivedTab}</a></li>' +
        '                       <li class="divider"></li>' +
        '                       <li class="mt-close-all-tabs"><a>{closeAllTabs}</a></li>' +
        '                       <li class="mt-close-other-tabs"><a>{closeOtherTabs}</a></li>' +
        '                   </ul>' +
        '               </li>' +
        '           </ul>' +
        '       </nav>' +
        '   </div>' +
        '   <div class="tab-content" ></div>' +
        '</div>',
        tab : '<a href="{href}"  data-content="{content}" data-index="{index}" data-id="{did}">{title}{closeBtn}</a>',
        closeBtn : ' <i class="fa fa-times"></i>',
        ajaxTabPane : '<div class="tab-pane active {class}"  data-content="{content}" data-index="{index}" data-id="{did}"></div>',
        iframeTabPane : '<iframe class="tab-pane active {class}"  width="100%" height="100%" frameborder="0" src="{src}" data-content="{content}" data-index="{index}" data-id="{did}" seamless></iframe>',
    };

    defaultLanguage = {
        title : 'Tab',
        option : 'Option',
        showActivedTab : 'Show Activated Tab',
        closeAllTabs : 'Close All Tabs',
        closeOtherTabs : 'Close Other Tabs'
    };
    defaultTabHeader = {
        class : '',
        maxTabs : 8,
        maxTabTitleLength : 25,
    };
    defaultAjaxTabPane = {
        class : '',
    };
    defaultIframeTabPane = {
        class : '',
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
            $el.html(options.layoutTemplates.main
                .replace('{mainClass}', 'main-' + toJoinerStr(options.linkClass))
                .replace('{option}' , options.language.option)
                .replace('{showActivedTab}' , options.language.showActivedTab)
                .replace('{closeAllTabs}' , options.language.closeAllTabs)
                .replace('{closeOtherTabs}' , options.language.closeOtherTabs)
            );
            $el.tabHeader = $el.find('.mt-tab-header:first');
            $el.tabToolsLeft = $el.tabHeader.find('.mt-tab-tools-left:first');
            $el.tabPanel = $el.tabHeader.find('.mt-tab-panel:first');
            $el.tabToolsRight = $el.tabHeader.find('.mt-tab-tools-right:first');
            $el.tabContent = $el.find('.tab-content:first');
            //hide tab-header if maxTabs less than 1
            if(options.tabHeader.maxTabs <= 1){
                options.tabHeader.maxTabs = 1;
                $el.tabHeader.hide();
            };
            //set the tab-panel width
            var toolWidth = $el.tabHeader.find('.mt-tab-tools-left:visible:first').outerWidth(true) + $el.tabHeader.find('.mt-tab-tools-right:visible:first').outerWidth(true);
            $el.tabPanel.css('width', 'calc(100% - ' + toolWidth + 'px');
            $el.tabContent.css('height', 'calc(100% - ' + $el.tabHeader.outerHeight(true));
            self.options = options;
            //check the tab-panel is empty.
            if(!$el.tabPanel.find('ul.nav-tabs:first li').length){
                self._create({
                    title: 'home',
                    iframe: false,
                    content: 'main',
                    url : 'pages/index-ajax-1.html'
                });
            }
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
            var self = this, $el = self.$element, options = self.options;
            //create tab
            handler($(document), 'click', options.linkClass, function(){
                event.preventDefault();
                var param = self._check(this);
                if(param) self._create(param);
            });
            //active tab
            handler($(document), 'click', '.mt-tab-panel a', function(){
                event.preventDefault();
                self._active($(this).parents('li:first'));
            });
            //close tab
            handler($(document), 'click', '.mt-tab-panel a > i', function(){
                event.preventDefault();
                self._close($(this).parents('li:first'));
            });
            //move left
            handler($el.tabToolsLeft.find('.mt-move-left:first'), 'click', function(){
                event.preventDefault();
                self._moveLeft();
            });
            //move right
            handler($el.tabToolsRight.find('.mt-move-right:first'), 'click', function(){
                event.preventDefault();
                self._moveRight();
            });
            //show actived tab
            handler($el.tabToolsRight.find('.mt-show-actived-tab:first'), 'click', function(){
                event.preventDefault();
                self._showActive();
            });
            //close all tabs
            handler($el.tabToolsRight.find('.mt-close-all-tabs:first'), 'click', function(){
                event.preventDefault();
                self._closeAll();
            });
            //close other tabs
            handler($el.tabToolsRight.find('.mt-close-other-tabs:first'), 'click', function(){
                event.preventDefault();
                self._closeOthers();
            });

        },
        _check : function (obj) {
            var newTab = true, param;
            var self = this, $el = self.$element, options = self.options;
            param = $(obj).data() || {};
            param.url = param.url || $(obj).attr('href');
            param.url = decodeURIComponent(param.url.replace('#', ''));
            if ($.trim(param.url).length == 0) return false;
            param.iframe = param.iframe || isExtUrl(param.url) || options.iframe;
            if(param.iframe || param.content == undefined) param.content = options.content;
            param.title = trimText($(obj).text(), options.tabHeader.maxTabTitleLength) || trimText(options.language.title, options.tabHeader.maxTabTitleLength);
            var tab = $el.tabPanel.find('a[data-id="'+ param.url +'"][data-content="'+ param.content +'"]').parent('li');
            var content = $el.tabContent.find('.tab-pane[data-id="'+ param.url +'"][data-content="'+ param.content +'"]');
            if (tab.length && !tab.hasClass("active")) {
                tab.addClass("active").siblings("li").removeClass("active");
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
                return param;
            }
            self._fixTabPosition(tab);
            return false
        },
        _create : function (param) {
            var self = this,
                options = self.options,
                $el = self.$element,
                $editor = $el.tabContent.find('.tab-pane[data-content="editor"]');
            //禁止打开多个edit页面，如果edit页面存在，也禁止覆盖
            if(param.content == 'editor' && $editor.length && $editor.hasClass('unsave')){
                alert("Please colse or save the Editor before open the other!");
                //----------------------------------------------------
                window.location.hash= encodeURI($editor.attr('data-id'));
                //----------------------------------------------------
                return false;
            }
            var index = getTabIndex(param.content, options.tabHeader.maxTabs);
            //remove same index tab.
            var tabLi = $el.tabPanel.find('a[data-content="'+ param.content +'"][data-index="'+ index +'"]').parent('li');
            //get layoutTemplates
            var tabHtml, closeBtnHtml, tabPaneHtml, iframe, tabId;
            closeBtnHtml = (param.content === 'main') ? '' : options.layoutTemplates.closeBtn; //main content can not colse.
            //tabId = toHumpStr(options.linkClass) + '_' + param.content + '_' +  index;
            //tabId = jquerySelectorEncode(encodeURI(param.url));
            tabHtml = options.layoutTemplates.tab.replace('{href}', '#'+ param.url)
                .replace('{content}', param.content)
                .replace('{index}',index)
                .replace('{did}', param.url)
                .replace('{title}', param.title)
                .replace('{closeBtn}', closeBtnHtml);
            //tab create
            $el.tabPanel.find('li').removeClass('active');
            if($(tabLi).length){
                $(tabLi).addClass('active').html(tabHtml);
            }else $el.tabPanel.find('ul:first').append( '<li class="active">' + tabHtml + '</li>');
            //tab-pane create
            iframe = param.iframe === undefined ? options.iframe : param.iframe;
            if(iframe){
                tabPaneHtml = options.layoutTemplates.iframeTabPane.replace('{src}', param.url).replace('{class}', options.iframeTabPane.class);
            }else{
                tabPaneHtml = options.layoutTemplates.ajaxTabPane.replace('{class}', options.ajaxTabPane.class);
            }
            tabPaneHtml = tabPaneHtml
                //.replace('{id}', encodeURI(param.url))
                .replace('{content}', param.content)
                .replace('{index}',index)
                .replace('{did}', param.url);
            $el.tabContent.children().removeClass('active');
            $el.tabContent.find('.tab-pane[data-content="'+ param.content +'"][data-index="'+index+'"]').remove();//直接移除旧的content，不应重复判断是否同内容。
            $el.tabContent.append(tabPaneHtml);
            var $content = $el.tabContent.find('.tab-pane.active:first');
            self._fixLayout($content);
            if(!iframe) $content.load(param.url);
            self._fixTabPosition($el.tabPanel.find('li.active:first'));
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
            var tabPanelWidth = $el.tabPanel.outerWidth(true);
            var totalTabsWidth = sumWidth($el.tabPanel.find('li'));
            var px = 0;
            if (totalTabsWidth < tabPanelWidth) {
                return false
            } else {
                var _tab = $el.tabPanel.find('li:first');
                var marginLeft = 0;
                while ((marginLeft + _tab.width()) <= tabPanelMarginLeft) {
                    marginLeft += _tab.outerWidth(true);
                    _tab = $(_tab).next()
                }
                marginLeft = 0;
                if (sumWidth($(_tab).prevAll()) > tabPanelWidth) {
                    while (( (marginLeft + _tab.width()) < tabPanelWidth) && _tab.length > 0) {
                        marginLeft += _tab.outerWidth(true);
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
            var tabPanelWidth = $el.tabPanel.outerWidth(true);
            var totalTabsWidth = sumWidth($el.tabPanel.find('li'));
            var px = 0;
            if (totalTabsWidth < tabPanelWidth) {
                return false;
            } else {
                var _tab = $el.tabPanel.find('li:first');
                var marginLeft = 0;
                while ((marginLeft + _tab.width()) <= tabPanelMarginLeft) {
                    marginLeft += _tab.outerWidth(true);
                    _tab = $(_tab).next()
                }
                marginLeft = 0;
                while (( (marginLeft + _tab.width()) < tabPanelWidth) && _tab.length > 0) {
                    marginLeft += _tab.outerWidth(true);
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
            var self = this, $el = self.$element, $tab = $(tab);
            if ($tab.hasClass("active")) {
                if ($tab.next("li").size()) {
                    self._active($tab.next("li:first"));
                }else if ($tab.prev("li").size()) {
                    self._active($tab.prev("li:last"));
                }
            }
            $tab.remove();
            var tabA = $tab.find("a:first");
            var url = tabA.attr('href').replace('#','');
            var content = tabA.attr('data-content');
            $el.tabContent.find('.tab-pane[data-content="'+ content +'"][data-id="'+ url +'"]:first').remove();
        },
        _closeOthers : function () {
            var self = this, $el = self.$element;
            $el.tabPanel.find('li:not(.active)').find('a:not([data-content="main"]):not([data-content="editor"])').each(function () {
                var $tabA = $(this);
                var url = $tabA.attr('href').replace('#','');
                var content = $tabA.attr('data-content');
                $el.tabContent.find('.tab-pane[data-content="'+ content +'"][data-id="'+ url +'"]:first').remove();
                $tabA.parent('li').remove()
            });
            $el.tabPanel.find('ul:first').css("margin-left", "0");
        },
        _showActive : function () {
            var self = this, $el = self.$element;
            var tab = $el.tabPanel.find('li.active:first');
            self._fixTabPosition(tab);
        },
        _closeAll : function(){
            var self = this, $el = self.$element;
            $el.tabPanel.find('a:not([data-content="main"]):not([data-content="editor"])').each(function(){
                var $tabA = $(this);
                var $tab = $tabA.parent('li');
                var url = $tabA.attr('href').replace('#','');
                var content = $tabA.attr('data-content');
                $el.tabContent.find('.tab-pane[data-content="'+ content +'"][data-id="'+ url +'"]:first').remove(); //remove tab-content
                $tab.remove();  //remove
            });
            self._active($el.tabPanel.find('a[data-content="main"]:first').parent('li'));
        },
        _active : function (tab) {
            var self = this, $el = self.$element;
            var $tab = $(tab);
            if (!$tab.hasClass("active")) {
                $tab.addClass('active').siblings().removeClass('active');
                var tabA = $tab.find('a:first');
                var url = tabA.attr('href').replace('#','');
                var content = tabA.attr('data-content');
                var $tabPane = $el.tabContent.find('.tab-pane[data-content="'+ content +'"][data-id="'+ url +'"]:first');
                $tabPane.addClass('active').siblings().removeClass('active');
                self._fixLayout($tabPane);
            }
        },
        _fixLayout : function(tabPane){
            var $tabPane = $(tabPane);
            if($tabPane.is('iframe')){
                $('body').addClass('full-height-layout');
            }else{
                $('body').removeClass('full-height-layout');
            }
        }
    };

    /**
     * Main function
     * @param option
     */
    $.fn.multitabs = function(option){
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
        showHash : false,
        content : 'info',
        linkClass : '.multi-tabs',
        iframe : false,                     //iframe mode, default is false, just use iframe for external link
        tabHeader : defaultTabHeader,
        ajaxTabPane : defaultAjaxTabPane,
        iframeTabPane : defaultIframeTabPane,
        layoutTemplates : defaultLayoutTemplates,
        language : defaultLanguage,
    };

})(jQuery));
