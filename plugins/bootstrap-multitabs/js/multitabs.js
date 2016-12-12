//Make sure jQuery has been loaded
if (typeof jQuery === "undefined") {
    throw new Error("MultiTabs requires jQuery");
}((function($){
    //STRICT MODE
    "use strict";
    var NAMESPACE, tabIndex, _ignoreHashChange; //variable
    var MultiTabs,  handler, getTabIndex, toJoinerStr, toHumpStr,  isExtUrl, sumWidth, trimText, insertRule, isEmptyObject;  //function
    var defaultLayoutTemplates, defaultLanguage, defaultAjaxTabPane, defaultIframeTabPane, defaultNavBar;  //default variable

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
        if ( typeof childSelector !== "string" ) {
            fn = fn || childSelector;
            childSelector = '';
        }
        $selector.off(ev, childSelector, fn).on(ev, childSelector, fn);
    };

    /**
     * get index for tab
     * @param content   content type, for 'main' and 'editor' just can be 1
     * @param capacity  capacity of tab, except 'main' and 'editor'
     * @returns int     return index
     */
    getTabIndex = function(content, capacity){
        if(content === 'main' || content === 'editor') return 0;
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
        maxLength = maxLength || defaultNavBar.maxTitleLength;
        var words = String(text).split(' ');
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
     * insert CSS style
     *
     * Example
     * .fixed .mt-nav-tools-right{
     *    position: fixed;
     *    right: 0;
     *    background-color : #fff;
     * }
     *
     * can be inserted as below:
     * insertRule('.fixed .mt-nav-tools-right', 'position: fixed; right: 0; background-color : #fff;');
     *
     * @param selectorText      selector in string
     * @param cssText           css style in string
     * @param position          position for insert, default is 0
     */
    insertRule = function (selectorText, cssText, position) {
        var sheet = document.styleSheets[0];
        position = position || 0;
        if (sheet.insertRule) {
            sheet.insertRule(selectorText + "{" + cssText + "}", position);
        } else if (sheet.addRule) {
            sheet.addRule(selectorText, cssText, position);
        }
    };

    /**
     * check the obj is empty object
     */
    isEmptyObject = function (obj) {
        for (var key in obj) {
            return false;
        }
        return true;
    };

    /**
     * change Hump type string to string with '-'
     */
    toJoinerStr = function(humpStr){
        return humpStr.replace(/\./g, '').replace(/([A-Z])/g, "-$1").toLowerCase();
    };

    /**
     * change string with '-' to Hump type
     */
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
        default : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
        '   <div class="mt-nav-bar {navBarClass}" style="background-color: {backgroundColor};">' +
        '       <div class="mt-nav mt-nav-tools-left">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li class="mt-move-left"><a><i class="fa fa-backward"></i></a></li>' +
        '           </ul>' +
        '       </div>' +
        '       <nav class="mt-nav mt-nav-panel">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li><a class="mt-nav-tab" data-content="main" data-index="0" data-id="welcome_to_use_multitabs"> Home </a></li>' +
        '           </ul>' +
        '       </nav>' +
        '       <div class="mt-nav mt-nav-tools-right">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li class="mt-move-right"><a><i class="fa fa-forward"></i></a></li>' +
        '               <li class="mt-dropdown dropdown">' +
        '                   <a href="#"  class="dropdown-toggle" data-toggle="dropdown">{dropdown}<span class="caret"></span></a>' +
        '                   <ul role="menu" class="dropdown-menu dropdown-menu-right">' +
        '                       <li class="mt-show-actived-tab"><a>{showActivedTab}</a></li>' +
        '                       <li class="divider"></li>' +
        '                       <li class="mt-close-all-tabs"><a>{closeAllTabs}</a></li>' +
        '                       <li class="mt-close-other-tabs"><a>{closeOtherTabs}</a></li>' +
        '                   </ul>' +
        '               </li>' +
        '           </ul>' +
        '       </div>' +
        '   </div>' +
        '   <div class="tab-content mt-tab-content " >' +
        '       <div class="tab-pane active"  data-content="main" data-index="0" data-id="welcome_to_use_multitabs"><h1>Demo page</h1><h2>Welcome to use bootstrap multi-tabs :) </h2></div>' +
        '   </div>' +
        '</div>',
        classic : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
        '   <div class="mt-nav-bar {navBarClass}" style="background-color: {backgroundColor};">' +
        '       <nav class="mt-nav mt-nav-panel">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li><a class="mt-nav-tab" data-content="main" data-index="0" data-id="welcome_to_use_multitabs"> Home </a></li>' +
        '           </ul>' +
        '       </nav>' +
        '       <div class="mt-nav mt-nav-tools-right">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li class="mt-dropdown dropdown">' +
        '                   <a href="#"  class="dropdown-toggle" data-toggle="dropdown">{dropdown}<span class="caret"></span></a>' +
        '                   <ul role="menu" class="mt-hidden-list dropdown-menu dropdown-menu-right"></ul>' +
        '               </li>' +
        '           </ul>' +
        '       </div>' +
        '   </div>' +
        '   <div class="tab-content mt-tab-content " >' +
        '       <div class="tab-pane active"  data-content="main" data-index="0" data-id="welcome_to_use_multitabs"><h1>Demo page</h1><h2>Welcome to use bootstrap multi-tabs :) </h2></div>' +
        '   </div>' +
        '</div>',
        simple : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
        '   <div class="mt-nav-bar {navBarClass}" style="background-color: {backgroundColor};">' +
        '       <nav class="mt-nav mt-nav-panel">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li><a class="mt-nav-tab" data-content="main" data-index="0" data-id="welcome_to_use_multitabs"> Home </a></li>' +
        '           </ul>' +
        '       </nav>' +
        '   </div>' +
        '   <div class="tab-content mt-tab-content " >' +
        '       <div class="tab-pane active"  data-content="main" data-index="0" data-id="welcome_to_use_multitabs"><h1>Demo page</h1><h2>Welcome to use bootstrap multi-tabs :) </h2></div>' +
        '   </div>' +
        '</div>',
        tab : '<a class="mt-nav-tab" data-content="{content}" data-index="{index}" data-id="{did}">{title}</a>',
        closeBtn : ' <i class="mt-close-tab fa fa-times" style="{style}"></i>',
        ajaxTabPane : '<div class="tab-pane {class}"  data-content="{content}" data-index="{index}" data-id="{did}"></div>',
        iframeTabPane : '<iframe class="tab-pane {class}"  width="100%" height="100%" frameborder="0" src="" data-content="{content}" data-index="{index}" data-id="{did}" seamless></iframe>'
    };

    /**
     * default language is English
     */
    defaultLanguage = {
        navBar : {
            title          : 'Tab',                             //default tab title
            dropdown       : '<i class="fa fa-bars"></i>',      //dropdown menu display name
            showActivedTab : 'Show Activated Tab',              //show activated tab
            closeAllTabs   : 'Close All Tabs',                  //close all tabs
            closeOtherTabs : 'Close Other Tabs'                 //close other tabs
        },
        editorUnsave: {
            colse : 'Your data is not save, are you sure to lose it?',   //close unsave editor tab's warraning
            cover : 'Can not cover Editor without saving the old one!'   //cover unsave editor tab's warraning
        }
    };

    /**
     * default navigation bar
     */
    defaultNavBar = {
        class : '',                     //class, default is empty, can add as you want
        maxTabs : 15,                   //maximum tab quantity
        maxTitleLength : 25,            //maximum tab's title length
        backgroundColor : '#f5f5f5'     //default nav-bar background color
    };

    /**
     * default ajax tab-pane option
     */
    defaultAjaxTabPane = {
        class : ''                  //class, default is empty, can add as you want
    };

    /**
     * default iframe tab-pane option
     */
    defaultIframeTabPane = {
        class : '',                 //class, default is empty, can add as you want
        otherHeight : 0             //other height. (the height need to remove for iframe, example: footer)
    };

    /**
     * multitabs main function
     * @param element       Primary container
     * @param options       options
     * @constructor
     */
    MultiTabs = function (element, options) {
        var self = this;
        self.$element = $(element);
        if (!self._validate()) {
            return;
        }
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
         * create tab and return self.
         * @param obj           the obj to trigger multitabs
         * @param active        if true, active tab after create
         * @returns self        Chain structure.
         */
        create : function (obj, active) {
            var self = this,
                options = self.options,
                $el = self.$element,
                $editor = $el.tabContent.find('.tab-pane[data-content="editor"]');
            var param, tabHtml, closeBtnHtml, display, tabPaneHtml, iframe, index, $tab, $tabPane;
            param = self._isNew(obj);
            if(!param) return self;
            //Prohibited open more than 1 editor tab
            if(param.content === 'editor' && $editor.length && $editor.hasClass('unsave')){
                $tab = $el.navPanelList.find('a[data-content="editor"]').parent('li');
                self.active($tab);
                $tabPane = self._getTabPane($tab);
                $tabPane.before('<div class="help-block alert alert-warning">' + options.language.editorUnsave.cover + '</div>');
                return self;
            }
            index = getTabIndex(param.content, options.navBar.maxTabs);
            //get layoutTemplates
            display = options.showClose ? 'display:inline;' : '';
            closeBtnHtml = (param.content === 'main') ? '' : defaultLayoutTemplates.closeBtn.replace('{style}', display); //main content can not colse.
            tabHtml = defaultLayoutTemplates.tab.replace('{content}', param.content)
                    .replace('{index}',index)
                    .replace('{did}', param.url)
                    .replace('{title}', param.title) +
                closeBtnHtml;
            //tab create
            $tab = $el.navPanelList.find('a[data-content="'+ param.content +'"][data-index="'+ index +'"]').parent('li');
            if($tab.length){
                $tab.html(tabHtml);
            }else $el.navPanelList.append( '<li>' + tabHtml + '</li>');
            $tab = $el.navPanelList.find('a[data-content="'+ param.content +'"][data-index="'+ index +'"]').closest('li');
            //tab-pane create
            iframe = param.iframe === undefined ? options.iframe : param.iframe;
            if(iframe){
                tabPaneHtml = defaultLayoutTemplates.iframeTabPane.replace('{class}', options.iframeTabPane.class);
            }else{
                tabPaneHtml = defaultLayoutTemplates.ajaxTabPane.replace('{class}', options.ajaxTabPane.class);
            }
            tabPaneHtml = tabPaneHtml
                .replace('{content}', param.content)
                .replace('{index}',index)
                .replace('{did}', param.url);
            $el.tabContent.find('.tab-pane[data-content="'+ param.content +'"][data-index="'+index+'"]').remove(); //remove old content directly
            $el.tabContent.append(tabPaneHtml);
            if(active) self.active($tab);
            return self;
        },

        /**
         * active tab
         * @param tab
         * @returns self      Chain structure.
         */
        active : function (tab) {
            var self = this, $el = self.$element, options = self.options;
            var $tab = $(tab), $tabA;
            if($tab.is('a')){
                $tabA = $el.navPanelList.find('[data-id="' + $tab.attr('data-id') + '"]');
                $tab = $tabA.closest('li');
            }else{
                $tabA = $el.navPanelList.find('[data-id="' + $tab.find('a:first').attr('data-id') + '"]');
                $tab = $tabA.closest('li');
            }
            if(!tab || !$tab.length) return self;
            var url = $tabA.attr('data-id'),
                content = $tabA.attr('data-content'),
                $tabPane = self._getTabPane($tab);
            if(!$tabPane.length) return self;
            $tab.addClass('active').siblings().removeClass('active');
            self._fixTabPosition($tab);
            $tabPane.addClass('active').siblings().removeClass('active');
            self._fixTabContentLayout($tabPane);
            //if tab-pane empty, load content
            if(!$tabPane.html()){
                if(!$tabPane.is('iframe')){
                    $.ajax({
                        url: url,
                        dataType: "html",
                        success: function(callback) {
                            $tabPane.html(options.ajaxSuccess(callback));
                        },
                        error : function (callback) {
                            $tabPane.html(options.ajaxError(callback));
                        }
                    });

                } else {
                    if(!$tabPane.attr('src')){
                        $tabPane.attr('src', url);
                    }
                }

            }
            if(options.showHash && url) {
                _ignoreHashChange = true;
                window.location.hash = '#' + url;
            }
            return self;
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
                leftWidth = 0, marginLeft = 0, $tab;
            if (sumTabsWidth < navPanelWidth) {
                return self
            } else {
                $tab = $el.navPanelList.children('li:first');
                while ((marginLeft + $tab.width()) <= navPanelListMarginLeft) {
                    marginLeft += $tab.outerWidth(true);
                    $tab = $tab.next();
                }
                marginLeft = 0;
                if (sumWidth($tab.prevAll()) > navPanelWidth) {
                    while (( (marginLeft + $tab.width()) < navPanelWidth) && $tab.length > 0) {
                        marginLeft += $tab.outerWidth(true);
                        $tab = $tab.prev();
                    }
                    leftWidth = sumWidth($tab.prevAll());
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
                leftWidth = 0, $tab, marginLeft;
            if (sumTabsWidth < navPanelWidth) {
                return self;
            } else {
                $tab = $el.navPanelList.children('li:first');
                marginLeft = 0;
                while ((marginLeft + $tab.width()) <= navPanelListMarginLeft) {
                    marginLeft += $tab.outerWidth(true);
                    $tab = $tab.next();
                }
                marginLeft = 0;
                while (( (marginLeft + $tab.width()) < navPanelWidth) && $tab.length > 0) {
                    marginLeft += $tab.outerWidth(true);
                    $tab = $tab.next();
                }
                leftWidth = sumWidth($tab.prevAll());
                if (leftWidth > 0) {
                    $el.navPanelList.animate({marginLeft : 0 - leftWidth + "px"}, "fast");
                }
            }
            return self;
        },

        /**
         * close tab
         * @param tab
         * @return self     Chain structure.
         */
        close: function (tab) {
            var self = this, $tab, $tabPane;
            $tab = $(tab);
            $tab = $tab.is('a') ? $tab.closest('li') : $tab;
            $tabPane = self._getTabPane($tab);
            if($tab.length && $tabPane.length){
                if($tabPane.attr('data-content') === 'editor' && $tabPane.hasClass('unsave')){
                    if(!self._unsaveConfirm()) return self;
                }
            }
            if ($tab.hasClass("active")) {
                if ($tab.next("li").size()) {
                    self.active($tab.next("li:first"));
                }else if ($tab.prev("li").size()) {
                    self.active($tab.prev("li:last"));
                }
            }
            $tab.remove();
            $tabPane.remove();
            return self;
        },

        /**
         * close others tab
         * @return self     Chain structure.
         */
        closeOthers : function () {
            var self = this, $el = self.$element;
            $el.navPanelList.find('li:not(.active)').find('a:not([data-content="main"]):not([data-content="editor"])').each(function () {
                var $tabA = $(this);
                var url = $tabA.attr('data-id');
                var content = $tabA.attr('data-content');
                $el.tabContent.find('.tab-pane[data-content="'+ content +'"][data-id="'+ url +'"]:first').remove();
                $tabA.parent('li').remove()
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
            var tab = $el.navPanelList.find('li.active:first');
            self._fixTabPosition(tab);
            return self;
        },

        /**
         * close all tabs, (except main and editor tab)
         * @return self     Chain structure.
         */
        closeAll : function(){
            var self = this, $el = self.$element;
            $el.navPanelList.find('a:not([data-content="main"]):not([data-content="editor"])').each(function(){
                var $tabA = $(this);
                var $tab = $tabA.parent('li');
                var url = $tabA.attr('data-id');
                var content = $tabA.attr('data-content');
                $el.tabContent.find('.tab-pane[data-content="'+ content +'"][data-id="'+ url +'"]:first').remove(); //remove tab-content
                $tab.remove();  //remove
            });
            self.active($el.navPanelList.find('a[data-content="main"]:first').parent('li'));
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
            $el.html(defaultLayoutTemplates[options.layout]
                .replace('{mainClass}', toJoinerStr(options.class))
                .replace('{navBarClass}' , options.navBar.class)
                .replace(/\{nav-tabs\}/g , options.style)
                .replace(/\{backgroundColor\}/g, options.navBar.backgroundColor)
                .replace('{dropdown}' , options.language.navBar.dropdown)
                .replace('{showActivedTab}' , options.language.navBar.showActivedTab)
                .replace('{closeAllTabs}' , options.language.navBar.closeAllTabs)
                .replace('{closeOtherTabs}' , options.language.navBar.closeOtherTabs)
            );
            $el.wrapper       = $el.find('.mt-wrapper:first');
            $el.navBar        = $el.find('.mt-nav-bar:first');
            $el.navToolsLeft  = $el.navBar.find('.mt-nav-tools-left:first');
            $el.navPanel      = $el.navBar.find('.mt-nav-panel:first');
            $el.navPanelList  = $el.navBar.find('.mt-nav-panel:first ul');
            $el.navToolsRight = $el.navBar.find('.mt-nav-tools-right:first');
            $el.tabContent    = $el.find('.tab-content:first');
            //hide tab-header if maxTabs less than 1
            if(options.navBar.maxTabs <= 1){
                options.navBar.maxTabs = 1;
                $el.navBar.hide();
            }
            //set the nav-panel width
            var toolWidth = $el.navBar.find('.mt-nav-tools-left:visible:first').width() + $el.navBar.find('.mt-nav-tools-right:visible:first').width();
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
            var self = this, $el = self.$element, options = self.options, init = options.init, param;
            init = (init instanceof Array) ? init : [];
            for(var i = 0; i < init.length; i++){
                param = self._getParam( init[i]);
                if( param ) self.create(param);
            }
            //if no any tab actived, active the main tab
            if(!$el.navPanelList.children('li.active').length && !window.location.hash.substr(1)) self.active($el.navPanelList.find('[data-content="main"]:first').parent('li'));
            return self;
        },

        /**
         * validate check
         * @return boolean
         * @private
         */
        _validate: function () {
            var self = this, $exception;
            if( isEmptyObject($(document).data('multitabs'))) return true;
            $exception = '<div class="help-block alert alert-warning">' +
                '<h4>Duplicate Instance</h4>' +
                'MultiTabs only can be 1 Instance.' +
                '</div>';
            self.$element.before($exception);
            return false;
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
            handler($el.navBar, 'click', '.mt-nav-tab', function(){
                self.active(this);
                // return false; //fixed while showHash is false, still change hash
            });
            //close tab
            handler($el.navBar, 'click', '.mt-close-tab', function(){
                self.close($(this).closest('li'));
                return false; //Avoid possible BUG
            });
            //move left
            handler($el.navBar, 'click', '.mt-move-left', function(){
                self.moveLeft();
                return false; //Avoid possible BUG
            });
            //move right
            handler($el.navBar, 'click', '.mt-move-right', function(){
                self.moveRight();
                return false; //Avoid possible BUG
            });
            //show actived tab
            handler($el.navBar, 'click', '.mt-show-actived-tab', function(){
                self.showActive();
                return false; //Avoid possible BUG
            });
            //close all tabs
            handler($el.navBar, 'click', '.mt-close-all-tabs', function(){
                self.closeAll();
                return false; //Avoid possible BUG
            });
            //close other tabs
            handler($el.navBar, 'click', '.mt-close-other-tabs', function(){
                self.closeOthers();
                return false; //Avoid possible BUG
            });
            //close window warning.
            handler($(window), 'beforeunload',function(){
                if($el.tabContent.find('.tab-pane[data-content="editor"]').hasClass('unsave')){
                    return options.language.editorUnsave.close;
                }
            });
            //fixed the nav-bar
            var navBarHeight = $el.navBar.outerHeight();
            $el.tabContent.css('paddingTop', navBarHeight);
            if(options.fixed){
                handler($(window), 'scroll', function(){
                    var scrollTop = $(this).scrollTop();
                    scrollTop = scrollTop < ($el.wrapper.height() - navBarHeight) ? scrollTop + 'px' : 'auto';
                    $el.navBar.css('top',scrollTop);
                    return false; //Avoid possible BUG
                });
            }
            //if show hash， bind hash change
            if(options.showHash){
                handler($(window), 'hashchange load', function(){
                    if(!_ignoreHashChange){
                        var hash, url, $tab, $tabA, a, param;
                        hash = window.location.hash;
                        if(!hash) return false;
                        url = hash.replace('#','');
                        $tabA = $el.navPanelList.find('[data-id="'+ url +'"]:first');
                        if($tabA.length){
                            $tab = $tabA.closest('li');
                            if(!$tab.hasClass('active')) self.active($tab);
                            return false;
                        }else{
                            a = document.createElement('a');
                            a.href=url;
                            self.create(a, true);
                            return false;
                        }
                    }
                    _ignoreHashChange = false;
                    return false;
                });
            }
            //if layout === 'classic' show hide list in dropdown menu
            if(options.layout === 'classic'){
                handler($el.navBar, 'click', '.mt-dropdown:not(.open)', function(){ //just trigger when dropdown not open.
                    var list = self._getHiddenList();
                    var $dropDown  = $('.mt-hidden-list').empty();
                    if(list) {  //when list is not empty
                        while(list.prevList.length){
                            $dropDown.append(list.prevList.shift()[0].outerHTML);
                        }
                        while(list.nextList.length){
                            $dropDown.append(list.nextList.shift()[0].outerHTML);
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
            var self = this,  options = self.options, param, objData = $(obj).data();
            param = isEmptyObject(objData) ? (obj || {}) : objData;
            param.url = param.url || $(obj).attr('href') || $(obj).attr('url');
            param.url = $.trim(decodeURIComponent(param.url.replace('#', '')));
            if (!param.url.length) return false;
            param.iframe = param.iframe || isExtUrl(param.url) || options.iframe;
            param.content = param.content || options.content;
            param.title = param.title || $(obj).text() || param.url.replace('http://', '').replace('https://', '') || options.language.navBar.title;
            param.title = trimText(param.title, options.navBar.maxTitleLength);
            return param;
        },

        /**
         * check if is the new one. 
         * @param obj
         * @returns {*}         When exist, active the tab and return false, else return param
         */
        _isNew : function (obj) {
            var self = this, $el = self.$element;
            var param, tab;
            param = self._getParam(obj);
            if(!param) return false;
            tab = $el.navPanelList.find('a[data-id="'+ param.url +'"]').closest('li');   
            if(tab && tab.length && self._getTabPane(tab).length) {
                self.active(tab);
                return false
            }else return param;
        },

        /**
         * get tab-pane from tab
         * @param tab
         * @returns {*}
         * @private
         */
        _getTabPane : function(tab){
            var self = this, $el = self.$element, $tabA = $(tab).children('a:first'), url = $tabA.attr('data-id'), content = $tabA.attr('data-content');
            return $el.tabContent.find('.tab-pane[data-content="'+ content +'"][data-id="'+ url +'"]:first');
        },

        /**
         * fix nav tab position
         * @param tab
         * @private
         */
        _fixTabPosition : function (tab) {
            var self = this, $el = self.$element,
                $tab = tab,
                tabWidth = $tab.outerWidth(true),
                prevWidth = $tab.prev().outerWidth(true),
                pprevWidth = $tab.prev().prev().outerWidth(true),
                sumPrevWidth = sumWidth($tab.prevAll()),
                sumNextWidth = sumWidth($tab.nextAll()),
                navPanelWidth = $el.navPanel.outerWidth(true),
                sumTabsWidth = sumWidth($el.navPanelList.children('li')),
                leftWidth = 0;
            //all nav tab's width no more than nav-panel's width
            if (sumTabsWidth < navPanelWidth) {
                leftWidth = 0
            } else {
                //when tab and his right tabs sum width less or same as nav-panel, it means nav-panel can contain the tab and his right tabs
                if ( (prevWidth + tabWidth + sumNextWidth) <= navPanelWidth ) {
                    leftWidth = sumPrevWidth; //sum width of left part
                    //add width from the left, calcular the maximum tabs can contained by nav-panel
                    while ( (sumTabsWidth - leftWidth + prevWidth ) < navPanelWidth) {
                        $tab = $tab.prev();  //change the left tab
                        leftWidth -= $tab.outerWidth(); //reduce the left part width
                    }
                } else { //nav-panel can not contain the tab and his right tabs
                    //when the tab and his left part tabs's sum width more than nav-panel, all the width of 2 previous tabs's width set as the nav-panel margin-left.
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
                tabPrevList = [], tabNextList = [],  $tab, marginLeft;
            //all tab's width no more than nav-panel's width
            if (sumTabsWidth < navPanelWidth) {
                return false;
            } else {
                $tab = $el.navPanelList.children('li:first');
                //overflow hidden left part
                marginLeft = 0;
                //from the first tab, add all left part hidden tabs
                while ((marginLeft + $tab.width()) <= navPanelListMarginLeft) {
                    marginLeft += $tab.outerWidth(true);
                    tabPrevList.push($tab);
                    $tab = $tab.next();
                }
                //overflow hidden right part
                if(sumTabsWidth > marginLeft){ //check if the right part have hidden tabs
                    $tab = $el.navPanelList.children('li:last');
                    marginLeft = sumTabsWidth; //set margin-left as the Rightmost, and reduce one and one.
                    while(marginLeft > (navPanelListMarginLeft + navPanelWidth) ){
                        marginLeft -= $tab.outerWidth(true);
                        tabNextList.unshift($tab); //add param from top
                        $tab = $tab.prev();
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
            }else{
                $('body').removeClass('full-height-layout');
            }
        },

        /**
         * editor unsave confirm
         * @private
         */
        _unsaveConfirm : function(){
            var self = this, options = self.options;
            return confirm(options.language.editorUnsave.close);
        }
    };

    /**
     * Entry function
     * @param option
     */
    $.fn.multitabs = function(option){
        var self = $(this), data = $(document).data('multitabs'), options = typeof option === 'object' && option, opts;
        if (!data) {
            opts = $.extend(true, {}, $.fn.multitabs.defaults, options, self.data());
            opts.style = (opts.style === 'nav-pills') ? 'nav-pills' : 'nav-tabs';
            data = new MultiTabs(this, opts);
            $(document).data('multitabs', data);
        }
        return $(document).data('multitabs');
    };

    /**
     * Default Options
     * @type {{showHash: boolean, mode: string, maxTabs: number, maxTitleLength: number, tabTitle: string, content: string}}
     */
    $.fn.multitabs.defaults = {
        init :[],
        style : 'nav-tabs',          //can be nav-tabs or nav-pills
        fixed : false,
        showHash : true,
        showClose : false,
        content : 'info',
        link : '.multitabs',
        class : '',
        iframe : false,                     //iframe mode, default is false, just use iframe for external link
        layout : 'default',
        navBar : defaultNavBar,
        ajaxTabPane : defaultAjaxTabPane,
        iframeTabPane : defaultIframeTabPane,
        language : defaultLanguage,
        ajaxSuccess : function (callback) {
            return callback;
        },
        ajaxError : function (callback) {
            return callback;
        }
    };

})(jQuery));