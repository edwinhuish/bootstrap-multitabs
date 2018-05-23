//Make sure jQuery has been loaded
if (typeof jQuery === "undefined") {
    throw new Error("MultiTabs requires jQuery");
}((function($){
    "use strict";
    var NAMESPACE, tabIndex; //variable
    var MultiTabs,  handler, getTabIndex, isExtUrl, sumWidth, trimText,  supportStorage;  //function
    var defaultLayoutTemplates, defaultInit;  //default variable

    NAMESPACE = '.multitabs';  // namespace for on() function

    /**
     * splice namespace for on() function, and bind it
     * @param $selector         jQuery selector
     * @param event             event
     * @param childSelector     child selector (string), same as on() function
     * @param fn                function
     * @param skipNS            bool. If true skip splice namespace
     */
    handler = function ($selector, event, childSelector, fn, skipNS) {
        var ev = skipNS ? event : event.split(' ').join(NAMESPACE + ' ') + NAMESPACE;
        $selector.off(ev, childSelector, fn).on(ev, childSelector, fn);
    };

    /**
     * get index for tab
     * @param content   content type, for 'main' tab just can be 1
     * @param capacity  capacity of tab, except 'main' tab
     * @returns int     return index
     */
    getTabIndex = function(content, capacity){
        if(content === 'main') return 0;
        capacity = capacity || 8; //capacity of maximum tab quantity, the tab will be cover if more than it
        tabIndex = tabIndex || 0;
        tabIndex++;
        tabIndex = tabIndex % capacity;
        return tabIndex;
    };

    /**
     * trim text, remove the extra space, and trim text with maxLength, add '...' after trim.
     * @param text          the text need to trim
     * @param maxLength     max length for text
     * @returns {string}    return trimed text
     */
    trimText = function (text, maxLength){
        maxLength = maxLength || $.fn.multitabs.defaults.navTab.maxTitleLength;
        var words = (text + "").split(' ');
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

    supportStorage = function () {
        return !(sessionStorage === undefined);
    }

    /**
     * Calculate the total width
     * @param WidthObjList      the object list for calculate
     * @returns {number}        return total object width (int)
     */
    sumWidth = function (WidthObjList) {
        var width = 0;
        $(WidthObjList).each(function () {
            width += $(this).outerWidth(true)
        });
        return width
    };

    /**
     * Judgment is external URL
     * @param url           URL for judgment
     * @returns {boolean}   external URL return true, local return false
     */
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

    /**
     * Layout Templates
     */
    defaultLayoutTemplates = {
        /**
         * Main Layout
         */
        default : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
           '<div class="mt-nav-bar {navClass}" style="background-color: {backgroundColor};">' +
               '<div class="mt-nav mt-nav-tools-left">' +
                   '<ul  class="nav {nav-tabs}">' +
                       '<li class="mt-move-left"><a><i class="fa fa-backward"></i></a></li>' +
                   '</ul>' +
               '</div>' +
               '<nav class="mt-nav mt-nav-panel">' +
                   '<ul  class="nav {nav-tabs}"></ul>' +
               '</nav>' +
               '<div class="mt-nav mt-nav-tools-right">' +
                   '<ul  class="nav {nav-tabs}">' +
                       '<li class="mt-move-right"><a><i class="fa fa-forward"></i></a></li>' +
                       '<li class="mt-dropdown dropdown">' +
                           '<a href="#"  class="dropdown-toggle" data-toggle="dropdown">{dropdown}<span class="caret"></span></a>' +
                           '<ul role="menu" class="dropdown-menu dropdown-menu-right">' +
                               '<li class="mt-show-actived-tab"><a>{showActivedTab}</a></li>' +
                               '<li class="divider"></li>' +
                               '<li class="mt-close-all-tabs"><a>{closeAllTabs}</a></li>' +
                               '<li class="mt-close-other-tabs"><a>{closeOtherTabs}</a></li>' +
                           '</ul>' +
                       '</li>' +
                   '</ul>' +
               '</div>' +
           '</div>' +
           '<div class="tab-content mt-tab-content " > </div>' +
        '</div>',
        classic : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
           '<div class="mt-nav-bar {navClass}" style="background-color: {backgroundColor};">' +
               '<nav class="mt-nav mt-nav-panel">' +
                   '<ul  class="nav {nav-tabs}"> </ul>' +
               '</nav>' +
               '<div class="mt-nav mt-nav-tools-right">' +
                   '<ul  class="nav {nav-tabs}">' +
                       '<li class="mt-dropdown dropdown">' +
                           '<a href="#"  class="dropdown-toggle" data-toggle="dropdown">{dropdown}<span class="caret"></span></a>' +
                           '<ul role="menu" class="mt-hidden-list dropdown-menu dropdown-menu-right"></ul>' +
                       '</li>' +
                   '</ul>' +
               '</div>' +
           '</div>' +
           '<div class="tab-content mt-tab-content " > </div>' +
        '</div>',
        simple : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
           '<div class="mt-nav-bar {navClass}" style="background-color: {backgroundColor};">' +
               '<nav class="mt-nav mt-nav-panel">' +
                   '<ul  class="nav {nav-tabs}"> </ul>' +
               '</nav>' +
           '</div>' +
           '<div class="tab-content mt-tab-content " > </div>' +
        '</div>',
        navTab : '<a data-id="{navTabId}" class="mt-nav-tab" data-type="{type}" data-index="{index}" data-url="{url}">{title}</a>',
        closeBtn : ' <i class="mt-close-tab fa fa-times" style="{style}"></i>',
        ajaxTabPane : '<div id="{tabPaneId}" class="tab-pane {class}">{content}</div>',
        iframeTabPane : '<iframe id="{tabPaneId}" class="tab-pane {class}"  width="100%" height="100%" frameborder="0" src="" seamless></iframe>'
    };

    /**
     * Default init page
     * @type {*[]}
     */
    defaultInit = [{                              //default tabs in initial;
        type : 'main',                            //default is info;
        title : 'main',                           //default title;
        content: '<h1>Demo page</h1><h2>Welcome to use bootstrap multi-tabs :) </h2>'         //default content
    }];

    /**
     * multitabs constructor
     * @param element       Primary container
     * @param options       options
     * @constructor
     */
    MultiTabs = function (element, options) {
        var self = this;
        self.$element = $(element);
        self._init(options)._listen()._final();
    };

    /**
     * MultiTabs's function
     */
    MultiTabs.prototype = {
        /**
         * constructor
         */
        constructor: MultiTabs,

        /**
         * create tab and return this.
         * @param obj           the obj to trigger multitabs
         * @param active        if true, active tab after create
         * @returns this        Chain structure.
         */
        create : function (obj, active) {
            var options = this.options;
            var param, $navTab;
            if(! ( param = this._getParam(obj) )) {
                return this;   //return multitabs obj when is invaid obj
            }
            if( $navTab = this._exist(param)){
                this.active($navTab);
                return this;
            }
            param.active = !param.active ? active : param.active;
            //nav tab create
            $navTab = this._createNavTab(param);
            //tab-pane create
            this._createTabPane(param);
            //add tab to storage
            this._storage( param.did, param);
            if(param.active) {
                this.active($navTab);
            }
            return this;
        },

        /**
         * Create tab pane
         * @param param
         * @param index
         * @returns {*|{}}
         * @private
         */
        _createTabPane : function (param) {
            var self = this, $el = self.$element;
            $el.tabContent.append(self._getTabPaneHtml(param));
            return $el.tabContent.find('#' + param.did);
        },

        /**
         * get tab pane html
         * @param param
         * @param index
         * @returns {string}
         * @private
         */
        _getTabPaneHtml : function (param) {
            var self = this,  options = self.options;
            if(!param.content && param.iframe){
                return defaultLayoutTemplates.iframeTabPane
                    .replace('{class}', options.content.iframe.class)
                    .replace('{tabPaneId}', param.did);
            }else{
                return defaultLayoutTemplates.ajaxTabPane
                    .replace('{class}', options.content.ajax.class)
                    .replace('{tabPaneId}', param.did)
                    .replace('{content}', param.content);
            }
        },

        /**
         * create nav tab
         * @param param
         * @param index
         * @returns {*|{}}
         * @private
         */
        _createNavTab : function (param) {
            var self = this, $el = self.$element;
            var navTabHtml = self._getNavTabHtml(param);
            var $navTabLi = $el.navPanelList.find('a[data-type="'+ param.type +'"][data-index="'+ param.index +'"]').parent('li');
            if($navTabLi.length){
                $navTabLi.html(navTabHtml);
                self._getTabPane($navTabLi.find('a:first')).remove();  //remove old content pane directly
            }else {
                $el.navPanelList.append( '<li>' + navTabHtml + '</li>');
            }
            return $el.navPanelList.find('a[data-type="'+ param.type +'"][data-index="'+ param.index +'"]:first');

        },

        /**
         * get nav tab html
         * @param param
         * @param index
         * @returns {string}
         * @private
         */
        _getNavTabHtml : function (param) {
            var self = this,
                options = self.options;
            var closeBtnHtml, display;

            display = options.nav.showCloseOnHover ? '' : 'display:inline;';
            closeBtnHtml = (param.type === 'main') ? '' : defaultLayoutTemplates.closeBtn.replace('{style}', display); //main content can not colse.
            return defaultLayoutTemplates.navTab
                    .replace('{index}', param.index)
                    .replace('{navTabId}', param.did)
                    .replace('{url}', param.url)
                    .replace('{title}', param.title)
                    .replace('{type}', param.type)
                +   closeBtnHtml;
        },

        /**
         * generate tab pane's id
         * @param param
         * @param index
         * @returns {string}
         * @private
         */
        _generateId : function(param){
            return 'multitabs_' + param.type + '_' + param.index;
        },

        /**
         * active navTab
         * @param navTab
         * @returns self      Chain structure.
         */
        active : function (navTab) {
            var self = this, $el = self.$element,  options = self.options;
            var $navTab = self._getNavTab(navTab), $tabPane = self._getTabPane($navTab),
                $prevActivedTab = $el.navPanelList.find('li.active:first a');
            var prevNavTabParam = $prevActivedTab.length ? self._getParam($prevActivedTab) : {};
            var navTabParam = $navTab.length ? self._getParam($navTab) : {};
            //change storage active status
            var storage = self._storage();
            if( storage[prevNavTabParam.id] ) {
                storage[prevNavTabParam.id].active = false;
            }
            if( storage[navTabParam.id] ) {
                storage[navTabParam.id].active = true;
            }
            self._resetStorage(storage);
            //active navTab and tabPane
            $prevActivedTab.parent('li').removeClass('active');
            $navTab.parent('li').addClass('active');
            self._fixTabPosition($navTab);
            self._getTabPane($prevActivedTab).removeClass('active');
            $tabPane.addClass('active');
            self._fixTabContentLayout($tabPane);
            //fill tab pane
            self._fillTabPane($tabPane, navTabParam);
            return self;
        },
        /**
         * fill tab pane
         * @private
         */
        _fillTabPane : function (tabPane, param) {
            var self = this, options = self.options;
            var $tabPane = $(tabPane);
            //if navTab-pane empty, load content
            if(!$tabPane.html()){
                if(!$tabPane.is('iframe')){
                    $.ajax({
                        url: param.url,
                        dataType: "html",
                        success: function(callback) {
                            $tabPane.html(options.content.ajax.success(callback));
                        },
                        error : function (callback) {
                            $tabPane.html(options.content.ajax.error(callback));
                        }
                    });

                } else {
                    if(!$tabPane.attr('src')){
                        $tabPane.attr('src', param.url);
                    }
                }

            }
        },
        /**
         * move left
         * @return self
         */
        moveLeft : function () {
            var self = this, $el = self.$element,
                navPanelListMarginLeft = Math.abs(parseInt($el.navPanelList.css("margin-left"))),
                navPanelWidth = $el.navPanel.outerWidth(true),
                sumTabsWidth = sumWidth($el.navPanelList.children('li')),
                leftWidth = 0, marginLeft = 0, $navTabLi;
            if (sumTabsWidth < navPanelWidth) {
                return self
            } else {
                $navTabLi = $el.navPanelList.children('li:first');
                while ((marginLeft + $navTabLi.width()) <= navPanelListMarginLeft) {
                    marginLeft += $navTabLi.outerWidth(true);
                    $navTabLi = $navTabLi.next();
                }
                marginLeft = 0;
                if (sumWidth($navTabLi.prevAll()) > navPanelWidth) {
                    while (( (marginLeft + $navTabLi.width()) < navPanelWidth) && $navTabLi.length > 0) {
                        marginLeft += $navTabLi.outerWidth(true);
                        $navTabLi = $navTabLi.prev();
                    }
                    leftWidth = sumWidth($navTabLi.prevAll());
                }
            }
            $el.navPanelList.animate({marginLeft : 0 - leftWidth + "px"}, "fast");
            return self;
        },

        /**
         * move right
         * @return self
         */
        moveRight : function () {
            var self = this, $el = self.$element,
                navPanelListMarginLeft = Math.abs(parseInt($el.navPanelList.css("margin-left"))),
                navPanelWidth = $el.navPanel.outerWidth(true),
                sumTabsWidth = sumWidth($el.navPanelList.children('li')),
                leftWidth = 0, $navTabLi, marginLeft;
            if (sumTabsWidth < navPanelWidth) {
                return self;
            } else {
                $navTabLi = $el.navPanelList.children('li:first');
                marginLeft = 0;
                while ((marginLeft + $navTabLi.width()) <= navPanelListMarginLeft) {
                    marginLeft += $navTabLi.outerWidth(true);
                    $navTabLi = $navTabLi.next();
                }
                marginLeft = 0;
                while (( (marginLeft + $navTabLi.width()) < navPanelWidth) && $navTabLi.length > 0) {
                    marginLeft += $navTabLi.outerWidth(true);
                    $navTabLi = $navTabLi.next();
                }
                leftWidth = sumWidth($navTabLi.prevAll());
                if (leftWidth > 0) {
                    $el.navPanelList.animate({marginLeft : 0 - leftWidth + "px"}, "fast");
                }
            }
            return self;
        },

        /**
         * close navTab
         * @param navTab
         * @return self     Chain structure.
         */
        close: function (navTab) {
            var self = this, $tabPane;
            var $navTab = self._getNavTab(navTab), $navTabLi = $navTab.parent('li');
            $tabPane = self._getTabPane($navTab);
            //close unsave tab confirm
            if($navTabLi.length 
                && $tabPane.length
                && $tabPane.hasClass('unsave')
                && !self._unsaveConfirm()){
                return self;
            }
            if ($navTabLi.hasClass("active")) {
                var $nextLi = $navTabLi.next("li:first"), $prevLi = $navTabLi.prev("li:last");
                if ($nextLi.size()) {
                    self.active($nextLi);
                }else if ($prevLi.size()) {
                    self.active($prevLi);
                }
            }
            self._delStorage( $navTab.attr('data-id') ); //remove tab from session storage
            $navTabLi.remove();
            $tabPane.remove();
            return self;
        },

        /**
         * close others tab
         * @return self     Chain structure.
         */
        closeOthers : function () {
            var self = this, $el = self.$element;
            $el.navPanelList.find('li:not(.active)').find('a:not([data-type="main"])').each(function () {
                var $navTab = $(this);
                self._delStorage( $navTab.attr('data-id') ); //remove tab from session storage
                self._getTabPane($navTab).remove(); //remove tab-content
                $navTab.parent('li').remove();  //remove navtab
            });
            $el.navPanelList.css("margin-left", "0");
            return self;
        },

        /**
         * focus actived tab
         * @return self     Chain structure.
         */
        showActive : function () {
            var self = this, $el = self.$element;
            var navTab = $el.navPanelList.find('li.active:first a');
            self._fixTabPosition(navTab);
            return self;
        },

        /**
         * close all tabs, (except main tab)
         * @return self     Chain structure.
         */
        closeAll : function(){
            var self = this, $el = self.$element;
            $el.navPanelList.find('a:not([data-type="main"])').each(function(){
                var $navTab = $(this);
                self._delStorage( $navTab.attr('data-id') ); //remove tab from session storage
                self._getTabPane($navTab).remove(); //remove tab-content
                $navTab.parent('li').remove();  //remove navtab
            });
            self.active($el.navPanelList.find('a[data-type="main"]:first').parent('li'));
            return self;
        },

        /**
         * init function
         * @param options
         * @returns self
         * @private
         */
        _init: function (options) {
            var self = this, $el = self.$element;
            $el.html(defaultLayoutTemplates[options.nav.layout]
                .replace('{mainClass}', options.class)
                .replace('{navClass}' , options.nav.class)
                .replace(/\{nav-tabs\}/g , options.nav.style)
                .replace(/\{backgroundColor\}/g, options.nav.backgroundColor)
                .replace('{dropdown}' , options.language.nav.dropdown)
                .replace('{showActivedTab}' , options.language.nav.showActivedTab)
                .replace('{closeAllTabs}' , options.language.nav.closeAllTabs)
                .replace('{closeOtherTabs}' , options.language.nav.closeOtherTabs)
            );
            $el.wrapper       = $el.find('.mt-wrapper:first');
            $el.nav        = $el.find('.mt-nav-bar:first');
            $el.navToolsLeft  = $el.nav.find('.mt-nav-tools-left:first');
            $el.navPanel      = $el.nav.find('.mt-nav-panel:first');
            $el.navPanelList  = $el.nav.find('.mt-nav-panel:first ul');
            //$el.navTabMain    = $('#multitabs_main_0');
            $el.navToolsRight = $el.nav.find('.mt-nav-tools-right:first');
            $el.tabContent    = $el.find('.tab-content:first');
            //hide tab-header if maxTabs less than 1
            if(options.nav.maxTabs <= 1){
                options.nav.maxTabs = 1;
                $el.nav.hide();
            }
            //set the nav-panel width
            var toolWidth = $el.nav.find('.mt-nav-tools-left:visible:first').width() + $el.nav.find('.mt-nav-tools-right:visible:first').width();
            $el.navPanel.css('width', 'calc(100% - ' + toolWidth + 'px)');
            self.options = options;
            return self;
        },

        /**
         * final funcion for after init Multitabs
         * @returns self
         * @private
         */
        _final : function(){
            var self = this, $el = self.$element, options = self.options, storage, init = options.init, param;
            if( supportStorage){
                storage = self._storage();
                self._resetStorage({});
                $.each(storage, function (k,v) {
                       if (v.type === 'info') {
                        tabIndex = tabIndex || 0;
                        tabIndex++;
                    }
                    self.create(v, false);
                })
            }
            if( $.isEmptyObject(storage)){
                init = (!$.isEmptyObject(init) && init instanceof Array) ? init : defaultInit;
                for(var i = 0; i < init.length; i++){
                    param = self._getParam( init[i]);
                    if( param ) {
                        self.create(param);
                    }
                }
            }
            //if no any tab actived, active the main tab
            if(!$el.navPanelList.children('li.active').length) {
                self.active($el.navPanelList.find('[data-type="main"]:first'));
            }
            return self;
        },

        /**
         * bind action
         * @return self
         * @private
         */
        _listen: function () {
            var self = this, $el = self.$element, options = self.options;
            //create tab
            handler($(document), 'click', options.link, function(){
                self.create(this, true);
                return false; //Prevent the default link action
            });
            //active tab
            handler($el.nav, 'click', '.mt-nav-tab', function(){
                self.active(this);
            });

            //drag tab
            if(options.nav.draggable){
                handler($el.navPanelList, 'mousedown', '.mt-nav-tab', function (event) {
                    var $navTab = $(this), $navTabLi = $navTab.closest('li');
                    var $prevNavTabLi = $navTabLi.prev();
                    var dragMode = true, moved = false, isMain = ($navTab.data('type') === "main");
                    var navTabBlankHtml = '<li id="multitabs_tmp_tab_blank" class="mt-drag-tmp" style="width:' + $navTabLi.outerWidth() + 'px; height:'+ $navTabLi.outerHeight() +'px;"><a style="width: 100%;  height: 100%; "></a></li>';
                    var abs_x = event.pageX - $navTabLi.offset().left + $el.nav.offset().left;
                    $navTabLi.before(navTabBlankHtml);
                    $navTabLi.css({'left': event.pageX - abs_x + 'px', 'position': 'absolute', 'z-index': 9999})
                        .addClass('mt-drag-tmp')
                        .find('a:first').css({'background' : '#f39c12'});

                    $(document).on('mousemove', function (event) {
                        if (dragMode && !isMain) {
                            $navTabLi.css({'left': event.pageX - abs_x + 'px'});
                            $el.navPanelList.children('li:not(".mt-drag-tmp")').each(function () {
                                var leftWidth = $(this).offset().left + $(this).outerWidth() + 20; //20 px more for gap
                                if( leftWidth > $navTabLi.offset().left  ){
                                    if($(this).next().attr('id') !== 'multitabs_tmp_tab_blank'){
                                        moved = true;
                                        $prevNavTabLi = $(this);
                                        $('#multitabs_tmp_tab_blank').remove();
                                        $prevNavTabLi.after(navTabBlankHtml);
                                    }
                                    return false;
                                }
                            });
                        }
                    }).on("selectstart",function(){ //disable text selection
                        if (dragMode) {
                            return false;
                        }
                    }).on('mouseup', function () {
                        if(dragMode){
                            $navTabLi.css({'left': '0px', 'position': 'relative', 'z-index': 'inherit'})
                                .removeClass('mt-drag-tmp')
                                .find('a:first').css({'background' : ''});
                            $('#multitabs_tmp_tab_blank').remove();
                            if(moved){
                                $prevNavTabLi.after($navTabLi);
                            }
                        }
                        dragMode = false;
                    });
                });
            }

            //close tab
            handler($el.nav, 'click', '.mt-close-tab', function(){
                self.close($(this).closest('li'));
                return false; //Avoid possible BUG
            });
            //move left
            handler($el.nav, 'click', '.mt-move-left', function(){
                self.moveLeft();
                return false; //Avoid possible BUG
            });
            //move right
            handler($el.nav, 'click', '.mt-move-right', function(){
                self.moveRight();
                return false; //Avoid possible BUG
            });
            //show actived tab
            handler($el.nav, 'click', '.mt-show-actived-tab', function(){
                self.showActive();
                return false; //Avoid possible BUG
            });
            //close all tabs
            handler($el.nav, 'click', '.mt-close-all-tabs', function(){
                self.closeAll();
                return false; //Avoid possible BUG
            });
            //close other tabs
            handler($el.nav, 'click', '.mt-close-other-tabs', function(){
                self.closeOthers();
                return false; //Avoid possible BUG
            });

            //fixed the nav-bar
            var navHeight = $el.nav.outerHeight();
            $el.tabContent.css('paddingTop', navHeight);
            if(options.nav.fixed){
                handler($(window), 'scroll', function(){
                    var scrollTop = $(this).scrollTop();
                    scrollTop = scrollTop < ($el.wrapper.height() - navHeight) ? scrollTop + 'px' : 'auto';
                    $el.nav.css('top',scrollTop);
                    return false; //Avoid possible BUG
                });
            }
            //if layout === 'classic' show hide list in dropdown menu
            if(options.nav.layout === 'classic'){
                handler($el.nav, 'click', '.mt-dropdown:not(.open)', function(){ //just trigger when dropdown not open.
                    var list = self._getHiddenList();
                    var $dropDown  = $el.navToolsRight.find('.mt-hidden-list:first').empty();
                    if(list) {  //when list is not empty
                        while(list.prevList.length){
                            $dropDown.append(list.prevList.shift().clone());
                        }
                        while(list.nextList.length){
                            $dropDown.append(list.nextList.shift().clone());
                        }
                    }else{
                        $dropDown.append('<li>empty</li>');
                    }
                    // return false; //Avoid possible BUG
                });
            }
            return self;
        },

        /**
         * get the multitabs object's param
         * @param obj          multitabs's object
         * @returns param      param
         * @private
         */
        _getParam : function(obj){
            if($.isEmptyObject(obj)){
                return false;
            }
            var self = this,  options = self.options, param = {}, data = $(obj).data(), $obj = $(obj);

            //content
            param.content = data.content || obj.content || '';

            if(!param.content.length){
                //url
                param.url = data.url || obj.url || $obj.attr('href') || $obj.attr('url') || '';
                param.url = $.trim(decodeURIComponent(param.url.replace('#', '')));
            }else{
                param.url = '';
            }
            if (!param.url.length && !param.content.length){
                return false;
            }
            //iframe
            param.iframe = data.iframe || obj.iframe || isExtUrl(param.url) || options.iframe;
            //type
            param.type = data.type || obj.type || options.type;
            //title
            param.title = data.title || obj.title || $obj.text() || param.url.replace('http://', '').replace('https://', '') || options.language.nav.title;
            param.title = trimText(param.title, options.nav.maxTitleLength);
            //active
            param.active = data.active || obj.active || false;
            //index
            param.index = data.index || obj.index ||  getTabIndex(param.type, options.nav.maxTabs);
            //id
            param.did = data.did || obj.did || this._generateId(param);
            return param;
        },

        /**
         * session storage for tab list
         * @param key
         * @param param
         * @returns storage
         * @private
         */
        _storage : function (key, param) {
            if( supportStorage() ){
                var storage = JSON.parse(sessionStorage.multitabs || '{}');
                if( !key ){
                    return storage;
                }
                if( !param ){
                    return storage[key];
                }
                storage[key] = param;
                sessionStorage.multitabs = JSON.stringify(storage);
                return storage;
            }
        },

        /**
         * delete storage by key
         * @param key
         * @private
         */
        _delStorage : function (key) {
            if( supportStorage() ){
                var storage = JSON.parse(sessionStorage.multitabs || '{}');
                if( !key ){
                    return storage;
                }
                delete storage[key];
                sessionStorage.multitabs = JSON.stringify(storage);
                return storage;
            }
        },

        /**
         * reset storage
         * @param storage
         * @private
         */
        _resetStorage : function (storage) {
            if( supportStorage() && typeof storage === "object"){
                sessionStorage.multitabs = JSON.stringify(storage);
            }
        },

        /**
         * check if exist multitabs obj
         * @param param
         * @private
         */
        _exist : function(param){
            if(!param || !param.url){
                return false;
            }
            var self = this, $el = self.$element;
            var $navTab = $el.navPanelList.find('a[data-url="'+ param.url +'"]:first');
            if( $navTab.length ) {
                return $navTab;
            }else{
                return  false;
            }
        },

        /**
         * get tab-pane from tab
         * @param tab
         * @returns {*}
         * @private
         */
        _getTabPane : function(navTab){
            return $('#'+ $(navTab).attr('data-id'));
        },

        /**
         * get real navTab in the panel list.
         * @param navTab
         * @returns navTab
         * @private
         */
        _getNavTab : function (navTab) {
            var self = this, $el = self.$element;
            var dataId = $(navTab).attr('data-id') || $(navTab).find('a').attr('data-id');
            return $el.navPanelList.find('a[data-id="'+ dataId +'"]:first');
        },

        /**
         * fix nav navTab position
         * @param navTab
         * @private
         */
        _fixTabPosition : function (navTab) {
            var self = this, $el = self.$element,
                $navTabLi = $(navTab).parent('li'),
                tabWidth = $navTabLi.outerWidth(true),
                prevWidth = $navTabLi.prev().outerWidth(true),
                pprevWidth = $navTabLi.prev().prev().outerWidth(true),
                sumPrevWidth = sumWidth($navTabLi.prevAll()),
                sumNextWidth = sumWidth($navTabLi.nextAll()),
                navPanelWidth = $el.navPanel.outerWidth(true),
                sumTabsWidth = sumWidth($el.navPanelList.children('li')),
                leftWidth = 0;
            //all nav navTab's width no more than nav-panel's width
            if (sumTabsWidth < navPanelWidth) {
                leftWidth = 0
            } else {
                //when navTab and his right tabs sum width less or same as nav-panel, it means nav-panel can contain the navTab and his right tabs
                if ( (prevWidth + tabWidth + sumNextWidth) <= navPanelWidth ) {
                    leftWidth = sumPrevWidth; //sum width of left part
                    //add width from the left, calcular the maximum tabs can contained by nav-panel
                    while ( (sumTabsWidth - leftWidth + prevWidth ) < navPanelWidth) {
                        $navTabLi = $navTabLi.prev();  //change the left navTab
                        leftWidth -= $navTabLi.outerWidth(); //reduce the left part width
                    }
                } else { //nav-panel can not contain the navTab and his right tabs
                    //when the navTab and his left part tabs's sum width more than nav-panel, all the width of 2 previous tabs's width set as the nav-panel margin-left.
                    if ( (sumPrevWidth + tabWidth ) > navPanelWidth ) {
                        leftWidth = sumPrevWidth - prevWidth -pprevWidth
                    }
                }
            }
            leftWidth = leftWidth > 0 ? leftWidth : 0; //avoid leftWidth < 0 BUG
            $el.navPanelList.animate({marginLeft : 0 - leftWidth + "px"}, "fast");
        },

        /**
         * hidden tab list
         * @returns hidden tab list, the prevList and nextList
         * @private
         */
        _getHiddenList : function(){
            var self = this, $el = self.$element,
                navPanelListMarginLeft = Math.abs(parseInt($el.navPanelList.css("margin-left"))),
                navPanelWidth = $el.navPanel.outerWidth(true),
                sumTabsWidth = sumWidth($el.navPanelList.children('li')),
                tabPrevList = [], tabNextList = [],  $navTabLi, marginLeft;
            //all tab's width no more than nav-panel's width
            if (sumTabsWidth < navPanelWidth) {
                return false;
            } else {
                $navTabLi = $el.navPanelList.children('li:first');
                //overflow hidden left part
                marginLeft = 0;
                //from the first tab, add all left part hidden tabs
                while ((marginLeft + $navTabLi.width()) <= navPanelListMarginLeft) {
                    marginLeft += $navTabLi.outerWidth(true);
                    tabPrevList.push($navTabLi);
                    $navTabLi = $navTabLi.next();
                }
                //overflow hidden right part
                if(sumTabsWidth > marginLeft){ //check if the right part have hidden tabs
                    $navTabLi = $el.navPanelList.children('li:last');
                    marginLeft = sumTabsWidth; //set margin-left as the Rightmost, and reduce one and one.
                    while(marginLeft > (navPanelListMarginLeft + navPanelWidth) ){
                        marginLeft -= $navTabLi.outerWidth(true);
                        tabNextList.unshift($navTabLi); //add param from top
                        $navTabLi = $navTabLi.prev();
                    }
                }
                return {prevList : tabPrevList, nextList : tabNextList};
            }
        },



        /**
         * check if tab-pane is iframe, and add/remove class
         * @param tabPane
         * @private
         */
        _fixTabContentLayout : function(tabPane){
            var $tabPane = $(tabPane);
            if($tabPane.is('iframe')){
                $('body').addClass('full-height-layout');
                /** fix chrome croll disappear bug **/
                $tabPane.css("height", "99%");
                window.setTimeout(function () {
                    $tabPane.css("height", "100%");
                }, 0);
            }else{
                $('body').removeClass('full-height-layout');
            }
        },
    };

    /**
     * Entry function
     * @param option
     */
    $.fn.multitabs = function(option,id){
        var self = $(this), did = id ? id :'multitabs', multitabs = $(document).data(did), options = typeof option === 'object' && option, opts;
        if (!multitabs) {
            opts = $.extend(true, {}, $.fn.multitabs.defaults, options, self.data());
            opts.nav.style = (opts.nav.style === 'nav-pills') ? 'nav-pills' : 'nav-tabs';
            multitabs = new MultiTabs(this, opts);
            $(document).data(did, multitabs);
        }
        return $(document).data(did);
    };

    /**
     * Default Options
     * @type {}
     */
    $.fn.multitabs.defaults = {
        link : '.multitabs',                        //selector text to trigger multitabs.
        iframe : false,                             //Global iframe mode, default is false, is the auto mode (for the self page, use ajax, and the external, use iframe)
        class : '',                                 //class for whole multitabs
        type : 'info',                              //change the info content name, is not necessary to change.
        init : [],
        nav : {
            backgroundColor : '#f5f5f5',            //default nav-bar background color
            class : '',                             //class of nav
            draggable : true,                       //nav tab draggable option
            fixed : false,                          //fixed the nav-bar
            layout : 'default',                     //it can be 'default', 'classic' (all hidden tab in dropdown list), and simple
            maxTabs : 15,                           //Max tabs number (without counting main tab), when is 1, hide the whole nav
            maxTitleLength : 25,                    //Max title length of tab
            showCloseOnHover : true,                //while is true, show close button in hover, if false, show close button always
            style : 'nav-tabs'                      //can be nav-tabs or nav-pills
        },
        content :{
            ajax : {
                class : '',                         //Class for ajax tab-pane
                error : function (htmlCallBack) {
                    //modify html and return
                    return htmlCallBack;
                },
                success : function (htmlCallBack) {
                    //modify html and return
                    return htmlCallBack;
                }
            },
            iframe : {
                class : ''
            }
        },
        language : {                                            //language setting
            nav : {
                title : 'Tab',                                  //default tab's tittle
                dropdown : '<i class="fa fa-bars"></i>',        //right tools dropdown name
                showActivedTab : 'Show Activated Tab',          //show active tab
                closeAllTabs : 'Close All Tabs',                //close all tabs
                closeOtherTabs : 'Close Other Tabs',            //close other tabs
            }
        }
    };
})(jQuery));
