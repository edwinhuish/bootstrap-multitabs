//Make sure jQuery has been loaded before app.js
if (typeof jQuery === "undefined") {
    throw new Error("MultiTabs requires jQuery");
}



//$(function () {
//
//    $(window).on("hashchange load", function () {
//        var hash = window.location.hash;
//        if(!hash.substr(1)){
//            window.location.hash = $('#M_mainTabs div.page-tabs-content a.content-main[data-index="0"]').attr('data-id');
//        }
//        tabCheck();
//    });
//    function sumWidth(WidthObjList) {
//        var width = 0;
//        $(WidthObjList).each(function () {
//            width += $(this).outerWidth(true)
//        });
//        return width
//    };
//    function getTabIndex(content, capacity){
//        if(content === 'content-main' || content === 'content-edit'){
//            return 0;
//        }else{
//            if(!capacity) capacity = 8; //允许多少tab页面，超过则覆盖
//            if(undefined === sessionStorage.infoTabIndex){
//                sessionStorage.infoTabIndex = 0;
//            }else{
//                sessionStorage.infoTabIndex++;
//                sessionStorage.infoTabIndex = sessionStorage.infoTabIndex % capacity;
//            }
//            return sessionStorage.infoTabIndex;
//        }
//    };
//    function getUrlParam(url){
//        var param = {};
//        var paramStr = url.substr(url.indexOf('?')+1).replace(/\+/g, ' ');
//        var equation = paramStr.split('&');
//        $.each(equation,function(){
//           var kval = this.split('=');
//            if(kval[1] === 'false') kval[1] = false;
//            if(kval[1] === 'true')  kval[1] = true;
//            param[kval[0]] = kval[1];
//        });
//        return param;
//    }
//    function tabCheck() {
//        var newTab = true;
//        var url,param;
//        url = window.location.hash.replace('#', '');
//        if (url == undefined || $.trim(url).length == 0) return false;
//        param = getUrlParam(decodeURIComponent(url));
//        if(!param.content) {
//            window.location.hash += '&content=content-info';
//            return false;
//        }
//        if(isExtUrl(url)) param.iframe = true;
//        if(param.iframe || !param.content) param.content='content-info';
//        var tab = $('#M_mainTabs div.page-tabs-content a.M_tab.'+param.content+'[data-id="#'+url+'"]');
//        var content = $('#M_mainContent .M_content.'+param.content+'[data-id="#'+url+'"]');
//        if(tab.length){
//            if (!$(tab).hasClass("active")) {
//                $(tab).addClass("active").siblings(".M_tab").removeClass("active");
//                fixTab(tab);
//            }
//        }
//        if(content.length || content.is('iframe')){
//            $(content).addClass("active").show().siblings(".M_content").removeClass("active").hide();
//            newTab = false;
//            if(content.is('iframe')){
//                $('body').addClass('full-height-layout');
//            }else{
//                $('body').removeClass('full-height-layout');
//            }
//        }
//
//        if ( !tab.length || !content.length || newTab || param.refresh) {
//            tabCreate(url,param);
//            fixTab($("#M_mainTabs .M_tab.active"))
//        }
//        return false
//    };
//    function tabCreate(url,param) {
//    };
//    function fixTab(menuTab) {
//        var tabMarginLeft = sumWidth($(menuTab).prevAll());
//        var tabMarginRight = sumWidth($(menuTab).nextAll());
//        var otherWidth = sumWidth($('#M_mainTabs').children().not(".M_tabs"));
//        var tabZoneWidth = $('#M_mainTabs').outerWidth(true) - otherWidth;
//        var px = 0;
//        if ($("#M_mainTabs .page-tabs-content").outerWidth() < tabZoneWidth) {
//            px = 0
//        } else {
//            if (tabMarginRight <= (tabZoneWidth - $(menuTab).outerWidth(true) - $(menuTab).next().outerWidth(true))) {
//                if ((tabZoneWidth - $(menuTab).next().outerWidth(true)) > tabMarginRight) {
//                    px = tabMarginLeft;
//                    var tabs = menuTab;
//                    while ((px - $(tabs).outerWidth()) > ($("#M_mainTabs .page-tabs-content").outerWidth() - tabZoneWidth)) {
//                        px -= $(tabs).prev().outerWidth();
//                        tabs = $(tabs).prev()
//                    }
//                }
//            } else {
//                if (tabMarginLeft > (tabZoneWidth - $(menuTab).outerWidth(true) - $(menuTab).prev().outerWidth(true))) {
//                    px = tabMarginLeft - $(menuTab).prev().outerWidth(true)
//                }
//            }
//        }
//        $("#M_mainTabs .page-tabs-content").animate({
//            marginLeft : 0 - px + "px"
//        }, "fast");
//
//
//    }
//    function moveLeft() {
//        var tabMarginLeft = Math.abs(parseInt($("#M_mainTabs .page-tabs-content").css("margin-left")));
//        var otherWidth = sumWidth($('#M_mainTabs').children().not(".M_tabs"));
//        var tabZoneWidth = $('#M_mainTabs').outerWidth(true) - otherWidth;
//        var px = 0;
//        if ($("#M_mainTabs .page-tabs-content").width() < tabZoneWidth) {
//            return false
//        } else {
//            var tabs = $("#M_mainTabs .M_tab:first");
//            var menuTabs = 0;
//            while ((menuTabs + $(tabs).outerWidth(true)) <= tabMarginLeft) {
//                menuTabs += $(tabs).outerWidth(true);
//                tabs = $(tabs).next()
//            }
//            menuTabs = 0;
//            if (sumWidth($(tabs).prevAll()) > tabZoneWidth) {
//                while ((menuTabs + $(tabs).outerWidth(true)) < (tabZoneWidth) && tabs.length > 0) {
//                    menuTabs += $(tabs).outerWidth(true);
//                    tabs = $(tabs).prev()
//                }
//                px = sumWidth($(tabs).prevAll())
//            }
//        }
//        $("#M_mainTabs .page-tabs-content").animate({
//            marginLeft : 0 - px + "px"
//        }, "fast")
//    }
//    function moveRight() {
//        var tabMarginLeft = Math.abs(parseInt($("#M_mainTabs .page-tabs-content").css("margin-left")));
//        var otherWidth = sumWidth($('#M_mainTabs').children().not(".M_tabs"));
//        var tabZoneWidth = $('#M_mainTabs').outerWidth(true) - otherWidth;
//        var px = 0;
//        if ($("#M_mainTabs .page-tabs-content").width() < tabZoneWidth) {
//            return false
//        } else {
//            var tabs = $("#M_mainTabs .M_tab:first");
//            var menuTabs = 0;
//            while ((menuTabs + $(tabs).outerWidth(true)) <= tabMarginLeft) {
//                menuTabs += $(tabs).outerWidth(true);
//                tabs = $(tabs).next()
//            }
//            menuTabs = 0;
//            while ((menuTabs + $(tabs).outerWidth(true)) < (tabZoneWidth) && tabs.length > 0) {
//                menuTabs += $(tabs).outerWidth(true);
//                tabs = $(tabs).next()
//            }
//            px = sumWidth($(tabs).prevAll());
//            if (px > 0) {
//                $("#M_mainTabs .page-tabs-content").animate({
//                    marginLeft : 0 - px + "px"
//                }, "fast")
//            }
//        }
//    }
//    function tabClose() {
//        var close = true;
//        var id = $(this).parents(".M_tab").attr("data-id");
//        var content = $('#M_mainContent .M_content[data-id="'+id+'"]');
//        if($(this).parents(".M_tab").hasClass('content-edit') && !$(content).find('button.btn-save').hasClass('disabled')){
//                close = confirm("Your data is not save, are you sure to lose it?");
//        }
//        if(close){
//            if ($(this).parents(".M_tab").hasClass("active")) {
//                if ($(this).parents(".M_tab").next(".M_tab").size()) {
//                    $(this).parents(".M_tab").next(".M_tab:eq(0)").addClass('active');
//                }else if ($(this).parents(".M_tab").prev(".M_tab").size()) {
//                    $(this).parents(".M_tab").prev(".M_tab:last").addClass('active');
//                }
//            }
//            $(this).parents(".M_tab").remove();
//            $("#M_mainContent .M_content").each(function () {
//                if ($(this).attr("data-id") == id) {
//                    $(this).remove();
//                    return false
//                }
//            });
//            window.location.hash = $("#M_mainTabs .M_tab.active").attr('data-id');
//            return false
//        }
//        return false;
//    }
//    function tabCloseOther() {
//        $("#M_mainTabs .page-tabs-content").children("[data-id]").not(":first").not(".active").not(".content-edit").each(function () {
//            $('.M_content[data-id="' + $(this).attr("data-id") + '"]').remove();
//            $(this).remove()
//        });
//        $("#M_mainTabs .page-tabs-content").css("margin-left", "0")
//    }
//    function tabShowActive() {
//        fixTab($("#M_mainTabs .M_tab.active"))
//    }
//    function tabEnable() {
//        if (!$(this).hasClass("active")) {
//            window.location.hash= $(this).attr("data-id");
//        }
//    }
//    function getAbsUrl(url) {
//        var a = document.createElement('a');
//        a.href=url;
//        return a.href;
//    };
//    function isExtUrl(url){
//        var absUrl = getAbsUrl(url);
//        var webRoot = window.location.protocol + '//' + window.location.host + '/';
//        var urlRoot = absUrl.substr(0, webRoot.length);
//        return ( ! (urlRoot===webRoot) );
//    };
//    function trimLinkText(text){
//        var words = text.split(' ');
//        var newText = '';
//        $.each(words, function(index, value) {
//            if($.trim(value))
//                newText += ($.trim(value) + ' ');
//        });
//        var result = $.trim(newText);
//        if(result.length > $.multitabs.options.maxTabTitleLength){
//            result = result.substr(0, $.multitabs.options.maxTabTitleLength) + '...';
//        }
//        return result;
//    }
//
//    $(".multi-tabs-page").on("click", function(){
//        var href = $(this).attr('href') || $(this).data('url');
//        var url, param;
//        url = href.replace('#','');
//        param = {
//            content: $(this).attr("data-content") || $.multitabs.options.defaultContent,
//            title: trimLinkText($(this).text()) || $.multitabs.options.defaultTabTitle,
//            iframe: $(this).attr("data-iframe") || $.multitabs.options.iframe
//        };
//        if(isExtUrl(url)) param.iframe = true;
//        if(param.iframe) param.content = $.multitabs.options.defaultContent; //In the iframe mode, only can be in defaultContent
//        window.location.hash= '#' + url + '?' + $.param(param);
//        return false;
//    });
//    $(".M_tabCloseOther").on("click", tabCloseOther);
//    $(".M_tabShowActive").on("click", tabShowActive);
//    $(".M_tabs").on("click", ".M_tab", tabEnable);
//    $(".M_tabs").on("click", ".M_tab i", tabClose);
//    $(".M_tabLeft").on("click", moveLeft);
//    $(".M_tabRight").on("click", moveRight);
//    $(".M_tabCloseAll").on("click", function () {
//        $(".M_tabsContent").children("[data-id]").not(":first").not(".content-edit").each(function () {
//            $('.M_content[data-id="' + $(this).attr("data-id") + '"]').remove();
//            $(this).remove()
//        });
//        $(".M_tabsContent").children("[data-id]:first").each(function () {
//            window.location.hash = $(this).attr('data-id');
//        });
//    })
//});


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
    var MultiTabs, getNum, handler, getTabIndex;

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
            $el.append($.fn.multitabs.template.head, $.fn.multitabs.template.body);
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
            var self = this, $el = self.$element, $tabpanel = $el.find('.M_tabPanel:first'), $body = $el.find('.M_body:first');
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
                $tabpanel = $el.find('.M_tabPanel:first'),
                $body = $el.find('.M_body:first'),
                $editor = $body.find('.M_content[data-content="editor"]');
            //禁止打开多个edit页面，如果edit页面存在，也禁止覆盖
            if(options.content == 'editor' && $editor.length && $editor.hasClass('unsave')){
                if(typeof window.sweetAlert == 'function'){
                    sweetAlert("Warning!", "Please colse or save the Editor before open the other!", "warning")
                }else alert("Please colse or save the Editor before open the other!");
                //----------------------------------------------------
                window.location.hash= encodeURI($editor.attr('data-id'));
                //----------------------------------------------------
                return false;
            }
            var index = getTabIndex(options.content, options.maxTabs);
            var M_tabhtml,M_contenthtml;
            M_tabhtml = '<a href="javascript:;" class="active M_tab"></a>';
            var closeBtn = (options.content === 'main')? '' : ' <i class="fa fa-times-circle"></i>'; //main content can not colse.

            $tabpanel.find('a.M_tab').removeClass('active');
            var tab = $tabpanel.find('a.M_tab[data-content="' + options.content + '"][data-index="' + index + '"]');
            var content = $body.find('.M_content[data-content="' + options.content + '"][data-index="' + index + '"]');
            if($(tab).length <= 0){
                $tabpanel.append(M_tabhtml);
                $tabpanel.find('a.M_tab.active').attr('data-content', options.content).attr('data-index',index).attr('data-id','#'+url).text(options.title).append(closeBtn);
            }else{
                $(tab).empty().addClass('active').attr('data-id','#'+url).text(param.title).append(closeBtn);
            }
            if( param.iframe){
                M_contenthtml = '<iframe class="M_content active" width="100%" height="100%" frameborder="0" src="'+ url+'" seamless></iframe>';
            }else{
                M_contenthtml = '<div class="M_content active"></div>';
            }
            $('.M_content').removeClass('active').hide();
            $(content).remove();  //直接移除旧的content，不应重复判断是否同内容。
            $body.append(M_contenthtml);
            content = $body.find('.M_content.active:first').attr('data-content', options.content).attr('data-index', index).attr('data-id','#'+url).attr('data-title',options.title);
            if($(content).is('iframe')){
                $(content).show();
                $('body').addClass('full-height-layout');
            }else{
                $(content).load(url.replace('#','')).show();
                $('body').removeClass('full-height-layout');
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

        this.each(function () {
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
        mode : 'auto',  //can be auto or iframe
        maxTabs : 8,
        maxTabTitleLength : 15,
        tabTitle : 'multi-tab',
        content : 'content-info'
    };

    /**
     * Template
     * @type {{head: string, body: string}}
     */
    $.fn.multitabs.template = {
        head : '<div class="row M_head">' +
        '   <button class="roll-nav roll-left M_tabLeft"><i class="fa fa-backward"></i></button>' +
        '   <nav class="M_tabNav">' +
        '       <div class="M_tabPanel">' +
        '           <a href="javascript:;" class="active M_tab content-main" data-index="0" data-id="">Dashboard</a>' +
        '       </div>' +
        '   </nav>' +
        '   <button class="roll-nav roll-right M_tabRight"><i class="fa fa-forward"></i></button>' +
        '   <div class="btn-group roll-nav roll-right">' +
        '       <button class="dropdown" data-toggle="dropdown">Option<span class="caret"></span></button>' +
        '       <ul role="menu" class="dropdown-menu dropdown-menu-right">' +
        '           <li class="M_tabShowActive"><a>Show Activated Tab</a></li>' +
        '           <li class="divider"></li>' +
        '           <li class="M_tabCloseAll"><a>Close All Tabs</a></li>' +
        '           <li class="M_tabCloseOther"><a>Close Other Tabs</a></li>' +
        '       </ul>' +
        '   </div>' +
        '</div>',
        body : '<div class="M_body"></div>'
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
