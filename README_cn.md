# bootstrap-multitabs / bootstrap 多标签页 #

## 效果图 ##
### default/默认 (带有向左、向右移动以及选项菜单) ###
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/demo/index.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/demo/index-default-pills.html)
![Multi Tabs Screenshot](screenshot-default.jpg)
### classic/折叠 (折叠隐藏tab) ###
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/demo/index-classic.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/demo/index-classic-pills.html)
![Multi Tabs Screenshot](screenshot-classic.jpg)
### simple ###
Demo: [nav-tabs](http://edwinhuish.oschina.io/multi-tabs/demo/index-simple.html) and [nav-pills](http://edwinhuish.oschina.io/multi-tabs/demo/index-simple-pills.html)
![Multi Tabs Screenshot](screenshot-simple.jpg)

## 作用与优势 ##
1. 通过简单的配置，生成可智能适配ajax和iframe的多标签页。
2. 可以直接套用bootstrap的各种模板样式。
3. 在不关闭窗口的情况下，直接刷新页面能保留所有标签页。（如果使用了表单，请完成表单后再进行此操作）
4. 导航标签tab可移动
5. 当标签数量设置为 1 的时候，隐藏便签列表

## 安装需求 ##
1. [Bootstrap](http://getbootstrap.com/)
2. [JQuery](http://jquery.com/)
3. [Font Awesone](http://fontawesome.io/icons/)

## 使用 ##
1. 在html的head内引用multitabs的CSS
```html
<!-- Multi Tabs -->
<link rel="stylesheet" href="plugins/bootstrap-multitabs/css/style.css">
```

2. 在body底部引用multitabs的JS
```html
<!-- Multi Tabs -->
<script src="plugins/bootstrap-multitabs/js/multitabs.js"></script>
```

3. 并绑定multitabs的区域
```html
<script>
    $('#content_wrapper').multitabs();
</script>
```

4. 最后在需要关联链接中加入"multitabs"的class
```html
<a class="multitabs" href="pages/index-ajax-2.html">ajax INFO Tab 2</a>
```

** 至此，最简单的bootstrap-multitabs配置成功！**


## 进阶配置 ##

###链接可添加参数###
1. ```[data-type="info"]``` 指定为content类型为info，共有3种( main | info ), info 为缺省配置，可以不用指定。
2. ```[data-iframe="true"]``` 指定为iframe模式，当值为false的时候，为智能模式，自动判断（内网用ajax，外网用iframe）。缺省为false。
3. ```[data-title="new tab"]``` 设置后指定标签页的标题，默认读取链接字体。
4. ```[data-url="index.html"]``` 如果对象不是```<a>```链接，此值可以指定链接URL

### 初始化配置 ###
下面这些为默认配置，可以自行修改
```html
<script>
    $('#content_wrapper').multitabs({
        link : '.multitabs',                        //触发multitabs的selector text，注意需要有".","#"等
        iframe : false,                             //iframe模式的总局设置。当值为false的时候，为智能模式，自动判断（内网用ajax，外网用iframe）。缺省为false。
        class : '',                                 //主框架的class
        init : [                                    //需要在初始加载的tab
            {                                       
                type :'',                           //标签页的类型，有 main | info，缺省为 info
                title : '',                         //标题（可选），没有则显示网址
                content: '',                        //html内容，如果设定此值，下面的URL设定则无效
                url : ''                            //链接
            }, 
            {  /** 更多tab。。**/  },                //依次添加需要的页面
            {  /** 更多tab。。**/  },                //依次添加需要的页面
        ],       
        nav : {
            backgroundColor : '#f5f5f5',            //默认nav-bar 背景颜色
            class : '',                             //为nav添加class
            draggable : true,                       //nav tab 可拖动选项
            fixed : false,                          //固定标签头列表
            layout : 'default',                     //有两种模式，'default', 'classic'(所有隐藏tab都在下拉菜单里) 和 'simple'
            maxTabs : 15,                           //最多tab数量。（main和editor不计算在内) 当为1时，整个标签栏隐藏。main和editor分别只能有1个标签。
            maxTabTitleLength : 25,                 //tab标题的最大长度
            showCloseOnHover : true,                //当值为true，仅在鼠标悬浮时显示关闭按钮。false时一直显示
            style : 'nav-tabs',                     //可以为nav-tabs 或 nav-pills
        },
        content : {
            ajax : {
                class : '',                         //为ajax tab-pane 添加class
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
                class : ''                          //为iframe tab-pane 添加class
            }
        },
        language : {                                //语言配置
            nav : {
                title : 'Tab',                                  //默认的标签页名称
                dropdown : '<i class="fa fa-bars"></i>',        //标签栏的下拉菜单名称
                showActivedTab : 'Show Activated Tab',          //下拉菜单的显示激活页面
                closeAllTabs : 'Close All Tabs',                //下拉菜单的关闭所有页面
                closeOtherTabs : 'Close Other Tabs',            //下拉菜单的关闭其他页面
            }
        }
    });
</script>
```

### 关于 content 的类型 ###
标签页 content 的类型，有 main | info 。 
1. main页放产品列表，用户列表，邮件列表，这些需要id，且js操作容易混乱，故限制只能有1个。当然，你也可以仅仅main页放网站概况，其他一律用info页。只是容易冲突。
2. info放产品详情，用户详情，邮件详情这些少id，以及js操作重复的页面。

## iframe注意事项 ##
1. 为了自适应iframe高度，请依照下面这个样式添加CSS。 其中 ```.content-wrapper``` 是当前使用multitabs的wrapper。 ```.wrapper``` 为 ```.content-wrapper``` 的父层，需要将所有父层都添加 ```height: 100%```
```html
<style type="text/css">
    body,
    body.full-height-layout .wrapper,
    html{
        height: 100%;
    }
    body.full-height-layout .content-wrapper{           /*使用multitabs的wrapper*/
        height: calc(100% - 140px)                      /*减去网页header和footer的高度，AdminLTE的为140px*/
    }
</style>
```

2. 在iframe内触发父document的Multitabs方法新建tab: (ifame 页无须加载jquery)

```html
<script>
    parent.$(parent.document).data('multitabs').create({
        iframe : true,                                //指定为iframe模式，当值为false的时候，为智能模式，自动判断（内网用ajax，外网用iframe）。缺省为false。
        title : 'open by iframe',                     //标题（可选），没有则显示网址
        url : 'pages/index-2.html'                    //链接（必须），如为外链，强制为info页
    }, true);                                         //true 则激活新增的tab页
</script>
```