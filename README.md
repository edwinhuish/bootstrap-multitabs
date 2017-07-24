# bootstrap-multitabs #
For chinese README.md, please read [简体中文](README_cn.md)

## Screenshot ##
### default (with left/right/option button) ###
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/demo/index.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/demo/index-default-pills.html)
![Multi Tabs Screenshot](screenshot-default.jpg)
### classic (fold hidden tabs) ###
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/demo/index-classic.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/demo/index-classic-pills.html)
![Multi Tabs Screenshot](screenshot-classic.jpg)
### simple ###
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/demo/index-simple.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/demo/index-simple-pills.html)
![Multi Tabs Screenshot](screenshot-simple.jpg)

## Role and Benefits ##
1. Zero configuration and auto ajax / iframe
2. Can use the templates of bootstrap
3. Can refresh window, and all the tabs will keep same as before.
4. Navigation tab draggable.
5. While ``` maxTabs : 1 ``` or small screen, hide the tab header.

## Requirements ###
1. [Bootstrap](http://getbootstrap.com/)
2. [JQuery](http://jquery.com/)
3. [Font Awesone](http://fontawesome.io/icons/)

## Use ##
1. Add multitabs's CSS in the head
```html
<!-- Multi Tabs -->
<link rel="stylesheet" href="plugins/bootstrap-multitabs/css/style.css">
```

2. Add multitabs's JS in the bottom ot body
```html
<!-- Multi Tabs -->
<script src="plugins/bootstrap-multitabs/js/multitabs.js"></script>
```

3. Bind the content wrapper
```html
<script>
    $('#content_wrapper').multitabs();
</script>
```

4. At last, add "multitabs" class in the link which you want.
```html
<a class="multitabs" href="pages/index-ajax-2.html">ajax INFO Tab 2</a>
```

** Now, the simple bootstrap-multitabs works! **


## Advanced setting ##

### Parameter of link ###
1. ```[data-type="info"]``` content type, can be (main | info), info is the default and the normal one. Main just can be 1 tab.
2. ```[data-iframe="true"]``` iframe mode, default is false. While false, is the auto mode (for the self page, use ajax, and the external, use iframe)
3. ```[data-title="new tab"]``` tab's tittle, if empty or undefined, tab's tittle will be link's text.
4. ```[data-url="index.html"]``` this parameter for the object not link.

### Initial Configuration ###
The following is the default configuration, you can modify as you want.
```html
<script>
    $('#content_wrapper').multitabs({
        link : '.multitabs',                        //selector text to trigger multitabs. 
        iframe : false,                             //Global iframe mode, default is false, is the auto mode (for the self page, use ajax, and the external, use iframe)
        class : '',                                 //class for whole multitabs
        init : [                                    //tabs in initial
            {                                       
                type :'',                           //content type, may be main | info, if empty, default is 'info'
                title : '',                         //title of tab, if empty, show the URL
                content: '',                        //content html, the url value is useless if set the content.
                url : ''                            //URL
            }, 
            {    /** more tabs**/    },             //add more page.
            {    /** more tabs**/    },             //add more page.
        ],       
        nav : {
            backgroundColor : '#f5f5f5',            //default nav-bar background color
            class : '',                             //class of nav
            draggable : true,                       //nav tab draggable option
            fixed : false,                          //fixed the nav-bar
            layout : 'default',                     //it can be 'default', 'classic' (all hidden tab in dropdown list), and simple
            maxTabs : 15,                           //Max tabs number (without counting main tab), when is 1, hide the whole nav
            maxTitleLength : 25,                    //Max title length of tab
            showCloseOnHover : true,                //while is true, show close button in hover, if false, show close button always
            style : 'nav-tabs',                     //can be nav-tabs or nav-pills
        },
        content : {
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
                class : ''                          //Class for iframe tab-pane 
            }
        },
        language : {                                //language setting
            nav : {
                title : 'Tab',                                  //default tab's tittle
                dropdown : '<i class="fa fa-bars"></i>',        //right tools dropdown name
                showActivedTab : 'Show Activated Tab',          //show active tab
                closeAllTabs : 'Close All Tabs',                //close all tabs
                closeOtherTabs : 'Close Other Tabs',            //close other tabs
            }
        }
    });
</script>
```

## Attention for iframe ##
1. For iframe's auto-height, please add CSS as blew to your page. ```.content-wrapper``` is the selector using multitabs. ```.wrapper``` is parent of ```.content-wrapper``` , all parent of wrapper multitabs must add ```height: 100%```
```html
<style type="text/css">
    body,
    body.full-height-layout .wrapper,
    html{
        height: 100%;
    }
    body.full-height-layout .content-wrapper{           /*the wrrapper using multitabs*/
        height: calc(100% - 140px)                      /*Excluding header and footer's height, for AdminLTE, total is 140px*/
    }
</style>
```

2. create tab with iframe's object:

```html
<scritp>
    parent.$(parent.document).data('multitabs').create({
        iframe : true,                                //iframe mode, default is false. While false, is the auto mode (for the self page, use ajax, and the external, use iframe)
        title : 'open by iframe',                     //title of tab, if empty, show the URL
        url : 'pages/index-2.html'                    //URL, if it's external link, content type change to 'info'
    }, true);                                         //true for active tab
</script>
```