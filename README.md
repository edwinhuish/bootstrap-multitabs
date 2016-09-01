#bootstrap-multitabs
For chinese README.md, please read [简体中文](README_cn.md)

##Screenshot
###default  (with left/right/option button)
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/index.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/index-default-pills.html)
![Multi Tabs Screenshot](screenshot-default.jpg)
###classic (fold hidden tabs)
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/index-classic.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/index-classic-pills.html)
![Multi Tabs Screenshot](screenshot-classic.jpg)
###simple
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/index-simple.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/index-simple-pills.html)
![Multi Tabs Screenshot](screenshot-simple.jpg)

##Role and Benefits
1. Zero configuration.
2. Auto ajax / iframe
3. Can use the templates of bootstrap
4. While ``` showHash : true; //default ``` show hash in url. 
5. While ``` maxTabs : 1 ``` or small screen, hide the tab header.

##Requirements
1. [Bootstrap 3.x](http://getbootstrap.com/)
2. Newest [JQuery](http://jquery.com/)

##Use
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
    $('.content-wrapper').multitabs();
</script>
```

4. At last, add "multi-tabs" class in the link which you want.
```html
<a class="multi-tabs" href="pages/index-ajax-2.html">ajax INFO Tab 2</a>
```

** Now, the simple bootstrap-multitabs works!**


##Advanced setting

###Parameter of link
1. ```[data-content="info"]``` content type, can be (main | editor | info), info is the default and the normal one. Main and editor just can be 1 tab.
2. ```[data-iframe="true"]``` iframe mode, default is false. While false, is the auto mode (for the self page, use ajax, and the external, use iframe)
3. ```[data-title="new tab"]``` tab's tittle, if empty or undefined, tab's tittle will be link's text.
4. ```[data-url="index.html"]``` this parameter for the object not link.

###Initial Configuration
The following is the default configuration, you can modify as you want.
```html
<script>
    $('.content-wrapper').multitabs({
        showHash : true,                            //While is true, show hash in URL, in case refresh or F5, can stay in same tab page.
        showClose : false,                          //while is false, show close button in hover, if true, show close button always
        fixed : true ,                              //fixed the nav-bar
        layout : 'default',                         //it can be 'default', 'classic' (all hidden tab in dropdown list), and simple
        style : 'nav-tabs',                         //can be nav-tabs or nav-pills
        link : '.multi-tabs',                       //selector text to trigger multitabs. 
        iframe : false,                             //Global iframe mode, default is false, is the auto mode (for the self page, use ajax, and the external, use iframe)
        class : '',                                 //class for whole multitabs
        content : 'info',                           //change the data-content name, is not necessary to change.
        init : [                                    //tabs in initial
            {                                       
                content :'',                        //content type, may be main | info | editor, if empty, default is 'info'
                title : '',                         //title of tab, if empty, show the URL
                url : ''                            //URL, if it's external link, content type change to 'info'
            }, 
            {    ......    },                       //add more page.
            {    ......    },
        ],       
        navBar : {
            class : '',                             //class of navBar
            maxTabs : 15,                            //Max tabs number (without counting main and editor)
            maxTitleLength : 25,                    //Max title length of tab
            backgroundColor : '#f5f5f5',            //default nav-bar background color
        },
        ajaxTabPane : {
            class : '',                             //Class for ajax tab-pane
        },
        iframeTabPane : {
            class : '',                             //Class for iframe tab-pane 
            otherHeight : 0                         //other height for iframe, example: footer or header
        },
        language : {                                //language setting
            navBar : {
                title : 'Tab',                                  //default tab's tittle
                dropdown : '<i class="fa fa-bars"></i>',        //right tools dropdown name
                showActivedTab : 'Show Activated Tab',          //show active tab
                closeAllTabs : 'Close All Tabs',                //close all tabs
                closeOtherTabs : 'Close Other Tabs',            //close other tabs
            },
            editorUnsave: {
                colse : 'Your data is not save, are you sure to lose it?',   //the warning of closing editor without save
                cover : 'Can not cover Editor without saving the old one!'   //the warning of open another editor without save the old one.
            }
        }
    });
</script>
```

##Attention
For iframe's auto-height, please add CSS as blew to your page.

```.content-wrapper``` is the selector using multitabs. ```.wrapper``` is parent of ```.content-wrapper``` , all parent of wrapper multitabs must add ```height: 100%```
```html
    <style type="text/css">
        body,
        body.full-height-layout .wrapper,
        html{
            height: 100%;
        }
        body.full-height-layout .content-wrapper{           //the wrrapper using multitabs
            height: calc(100% - 140px)                      //Excluding header and footer's height, for AdminLTE, total is 140px
        }
    </style>
```

## editor tab
editor tab just can be 1.

While editor tab ```.tab-tape ``` have ``` .unsave ``` class:
1. Disallow overriding.
2. close confirm
3. close/refresh window confirm.