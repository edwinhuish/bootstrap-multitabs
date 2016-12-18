//Make sure jQuery has been loaded
if (typeof jQuery === "undefined") {
    throw new Error("MultiTabs requires jQuery");
}((function($){
    //STRICT MODE
    "use strict";
    var NAMESPACE, tabIndex, _ignoreHashChange; //variable
    var MultiTabs,  handler, getTabIndex, toJoinerStr, toHumpStr,  isExtUrl, sumWidth, trimText, insertRule, isEmptyObject, supportStorage;  //function
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
        '               <li><a data-id="multitabs_main_0" class="mt-nav-tab" data-content="main" data-index="0" data-url="welcome_to_use_multitabs"> Home </a></li>' +
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
        '       <div id="multitabs_main_0" class="tab-pane active"  data-content="main" data-index="0" data-url="welcome_to_use_multitabs"><h1>Demo page</h1><h2>Welcome to use bootstrap multi-tabs :) </h2></div>' +
        '   </div>' +
        '</div>',
        classic : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
        '   <div class="mt-nav-bar {navBarClass}" style="background-color: {backgroundColor};">' +
        '       <nav class="mt-nav mt-nav-panel">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li><a data-id="multitabs_main_0" class="mt-nav-tab" data-content="main" data-index="0" data-url="welcome_to_use_multitabs"> Home </a></li>' +
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
        '       <div id="multitabs_main_0" class="tab-pane active"  data-content="main" data-index="0" data-url="welcome_to_use_multitabs"><h1>Demo page</h1><h2>Welcome to use bootstrap multi-tabs :) </h2></div>' +
        '   </div>' +
        '</div>',
        simple : '<div class="mt-wrapper {mainClass}" style="height: 100%;" >' +
        '   <div class="mt-nav-bar {navBarClass}" style="background-color: {backgroundColor};">' +
        '       <nav class="mt-nav mt-nav-panel">' +
        '           <ul  class="nav {nav-tabs}">' +
        '               <li><a data-id="multitabs_main_0" class="mt-nav-tab" data-content="main" data-index="0" data-url="welcome_to_use_multitabs"> Home </a></li>' +
        '           </ul>' +
        '       </nav>' +
        '   </div>' +
        '   <div class="tab-content mt-tab-content " >' +
        '       <div id="multitabs_main_0" class="tab-pane active"  data-content="main" data-index="0" data-url="welcome_to_use_multitabs"><h1>Demo page</h1><h2>Welcome to use bootstrap multi-tabs :) </h2></div>' +
        '   </div>' +
        '</div>',
        navTab : '<a data-id="{navTabId}" class="mt-nav-tab" data-content="{content}" data-index="{index}" data-url="{url}">{title}</a>',
        closeBtn : ' <i class="mt-close-tab fa fa-times" style="{style}"></i>',
        ajaxTabPane : '<div id="{tabPaneId}" class="tab-pane {class}"></div>',
        iframeTabPane : '<iframe id="{tabPaneId}" class="tab-pane {class}"  width="100%" height="100%" frameborder="0" src="" seamless></iframe>'
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
     * multitabs constructor
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
            var param, navTabHtml, closeBtnHtml, display, tabPaneHtml, index, id, $navTab, $tabPane;
            if(! ( param = self._getParam(obj) )) return self;   //return multitabs obj when is invaid obj
            if( $navTab = self._exist(param)){
                self.active($navTab);
                return self;
            }
            param.active = param.active === undefined ? active : param.active;

            //Prohibited open more than 1 editor tab
            if(param.content === 'editor' && $editor.length && $editor.hasClass('unsave')){
                $navTab = $el.navPanelList.find('a[data-content="editor"]');
                self.active($navTab);
                $tabPane = self._getTabPane($navTab);
                $tabPane.before('<div class="help-block alert alert-warning">' + options.language.editorUnsave.cover + '</div>');
                return self;
            }
            index = getTabIndex(param.content, options.navBar.maxTabs);
            id = 'multitabs_' + param.content + '_' + index;
            //get layoutTemplates
            display = options.showClose ? 'display:inline;' : '';
            closeBtnHtml = (param.content === 'main') ? '' : defaultLayoutTemplates.closeBtn.replace('{style}', display); //main content can not colse.
            navTabHtml = defaultLayoutTemplates.navTab
                    .replace('{navTabId}', id)
                    .replace('{content}', param.content)
                    .replace('{index}',index)
                    .replace('{url}', param.url)
                    .replace('{title}', param.title)
                +   closeBtnHtml;
            //tab create
            var $navTabLi = $el.navPanelList.find('a[data-content="'+ param.content +'"][data-index="'+ index +'"]').parent('li');
            if($navTabLi.length){
                $navTabLi.html(navTabHtml);
                self._getTabPane($navTabLi.find('a:first')).remove();  //remove old content pane directly
            }else $el.navPanelList.append( '<li>' + navTabHtml + '</li>');
            $navTab = $el.navPanelList.find('a[data-id="'+ id +'"]');
            //tab-pane create
            if(param.iframe){
                tabPaneHtml = defaultLayoutTemplates.iframeTabPane
                    .replace('{class}', options.iframeTabPane.class)
                    .replace('{tabPaneId}', id);
            }else{
                tabPaneHtml = defaultLayoutTemplates.ajaxTabPane
                    .replace('{class}', options.ajaxTabPane.class)
                    .replace('{tabPaneId}', id);
            }
            $el.tabContent.append(tabPaneHtml);
            //add tab to storage
            self._storage(id, param);
            if(param.active) self.active($navTab);
            return self;
        },

        /**
         * active navTab
         * @param navTab
         * @returns self      Chain structure.
         */
        active : function (navTab) {
            var self = this, $el = self.$element,  options = self.options;
            var $navTab = self._getNavTab(navTab), $navTabLi = $navTab.parent('li'),
                storage, $prevActivedTab = $el.navPanelList.find('li.active:first').find('a:first');
            if(!navTab || !$navTabLi.length) return self;  //if navTab no exist, return self
            var url = $navTab.attr('data-url'),
                content = $navTab.attr('data-content'),
                $tabPane = self._getTabPane($navTab);
            if(!$tabPane.length) return self;            //if tabPane no exist, return self

            //change storage active status
            storage = self._storage();
            if( storage[$prevActivedTab.attr('id')] ) storage[$prevActivedTab.attr('id')].active = false;
            if( storage[$navTab.attr('id')] ) storage[$navTab.attr('id')].active = true;
            self._resetStorage(storage);
            //active navTab and tabPane
            $prevActivedTab.closest('li').removeClass('active');
            $navTabLi.addClass('active');
            self._fixTabPosition($navTab);
            self._getTabPane($prevActivedTab).removeClass('active');
            $tabPane.addClass('active');
            self._fixTabContentLayout($tabPane);
            //if navTab-pane empty, load content
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
            //when showHash is true and have url
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
            if($navTabLi.length && $tabPane.length){
                if($navTab.attr('data-content') === 'editor' && $tabPane.hasClass('unsave')){
                    if(!self._unsaveConfirm()) return self;
                }
            }
            if ($navTabLi.hasClass("active")) {
                var $nextLi = $navTabLi.next("li:first"), $prevLi = $navTabLi.prev("li:last");
                if ($nextLi.size()) {
                    self.active($nextLi);
                }else if ($prevLi.size()) {
                    self.active($prevLi);
                }
            }
            self._delStorage( $navTab.attr('id') ); //remove tab from session storage
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
            $el.navPanelList.find('li:not(.active)').find('a:not([data-content="main"]):not([data-content="editor"])').each(function () {
                var $navTab = $(this);
                self._delStorage( $navTab.attr('id') ); //remove tab from session storage
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
                var $navTab = $(this);
                self._delStorage( $navTab.attr('id') ); //remove tab from session storage
                self._getTabPane($navTab).remove(); //remove tab-content
                $navTab.parent('li').remove();  //remove navtab
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
            $el.navTabMain    = $('#multitabs_main_0');
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
            var self = this, $el = self.$element, options = self.options, storage, init = options.init, param;
            if( supportStorage){
                storage = self._storage();
                $.each(storage, function (k,v) {
                    self.create(v, false);
                })
            }
            if( isEmptyObject(storage)){
                init = (init instanceof Array) ? init : [];
                for(var i = 0; i < init.length; i++){
                    param = self._getParam( init[i]);
                    if( param ) self.create(param);
                }
            }
            //if no any tab actived, active the main tab
            if(!$el.navPanelList.children('li.active').length && !window.location.hash.substr(1)) {
                self.active($el.navPanelList.find('[data-content="main"]:first'));
            }
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

            //drag tab
            handler($el.navPanelList, 'mousedown', '.mt-nav-tab:not([data-content="main"])', function (event) {
                var $navTabLi = $(this).closest('li');
                var $prevNavTabLi = $navTabLi.prev();
                var isMove = true, moved = false;
                var navTabBlankHtml = '<li id="multitabs_tmp_tab_blank" class="mt-tmp" style="width:' + $navTabLi.outerWidth() + 'px; height:'+ $navTabLi.outerHeight() +'px;"><a style="width: 100%;  height: 100%; "></a></li>';
                var abs_x = event.pageX - $navTabLi.offset().left + $el.navBar.offset().left;
                $navTabLi.prev().after(navTabBlankHtml);
                $navTabLi.css({'left': event.pageX - abs_x + 'px', 'position': 'absolute', 'z-index': 9999})
                    .addClass('mt-tmp')
                    .find('a:first').css({'background' : '#f39c12'});

                $(document).on('mousemove', function (event) {
                    if (isMove) {
                        $navTabLi.css({'left': event.pageX - abs_x + 'px'});
                        $el.navPanelList.children('li:not(".mt-tmp")').each(function () {
                            var leftWidth = $(this).offset().left + $(this).outerWidth() + 20; //20 px more for gap
                            if( leftWidth > $navTabLi.offset().left  ){
                                if($(this).next().attr('id') != 'multitabs_tmp_tab_blank'){
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
                    if (isMove) {
                        return false;
                    }
                }).on('mouseup', function () {
                    if(isMove){
                        $navTabLi.css({'left': '0px', 'position': 'relative', 'z-index': 'inherit'})
                            .removeClass('mt-tmp')
                            .find('a:first').css({'background' : ''});
                        $('#multitabs_tmp_tab_blank').remove();
                        if(moved){
                            $prevNavTabLi.after($navTabLi);
                        }
                    }
                    isMove = false;
                });
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
                        var hash, url, $navTabLi, $navTab, a;
                        hash = window.location.hash;
                        if(!hash) return false;
                        url = hash.replace('#','');
                        $navTab = $el.navPanelList.find('[data-url="'+ url +'"]:first');
                        if($navTab.length){
                            $navTabLi = $navTab.parent('li');
                            if(!$navTabLi.hasClass('active')) self.active($navTabLi);
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
            if(isEmptyObject(obj)) return false;
            var self = this,  options = self.options, param, $obj = $(obj), objData = $obj.data();
            param = isEmptyObject(objData) ?  {} : objData;
            //url
            param.url = param.url || obj.url || $obj.attr('href') || $obj.attr('url');
            param.url = $.trim(decodeURIComponent(param.url.replace('#', '')));
            if (!param.url.length) return false;
            //iframe
            param.iframe = param.iframe || obj.iframe || isExtUrl(param.url) || options.iframe;
            //content
            param.content = param.content || obj.content || options.content;
            //title
            param.title = param.title || obj.title || $obj.text() || param.url.replace('http://', '').replace('https://', '') || options.language.navBar.title;
            param.title = trimText(param.title, options.navBar.maxTitleLength);
            //active
            param.active = param.active || obj.active;
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
                if( !key ) return storage;
                if( !param ) return storage[key];
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
                if( !key ) return storage;
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
            if(!param) return false;
            var self = this, $el = self.$element, $navTab;
            $navTab = $el.navPanelList.find('a[data-url="'+ param.url +'"]');
            if( $navTab.length ) {
                return $navTab;
            } else return  false ;
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
        var self = $(this), multitabs = $(document).data('multitabs'), options = typeof option === 'object' && option, opts;
        if (!multitabs) {
            opts = $.extend(true, {}, $.fn.multitabs.defaults, options, self.data());
            opts.style = (opts.style === 'nav-pills') ? 'nav-pills' : 'nav-tabs';
            multitabs = new MultiTabs(this, opts);
            $(document).data('multitabs', multitabs);
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
        showHash : false,
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