#bootstrap-multitabs / bootstrap 多标签页

##效果图
![Multi Tabs Screenshot](demo.jpg)

##作用
通过简单的配置，生成ajax和iframe的多标签页

##安装需求
1. [Bootstrap 3.x](http://getbootstrap.com/)
2. 最新 [JQuery](http://jquery.com/)

##使用
1. 在html的head内引用multitabs的CSS
```html
<!-- Multi Tabs -->
<link rel="stylesheet" href="plugins/bootstrap-multitabs/css/style.css">
```

2. 在body底部引用bultitabs的JS
```html
<!-- Multi Tabs -->
<script src="plugins/bootstrap-multitabs/js/multitabs.js"></script>
```

3. 并绑定multitabs的区域
```html
<script>
    $('.content-wrapper').multitabs();
</script>
```

4. 最后在需要关联链接中加入"multi-tabs"的class
```html
<a class="multi-tabs" href="pages/index-ajax-2.html">ajax INFO Tab 2</a>
```

**至此，最简单的bootstrap-multitabs配置成功！**


##进阶配置

###链接可添加参数
1. ```[data-content="info"]``` 指定为content为info，共有3种( main | editor | info ), info 为缺省配置，可以不用指定。另外main和editor分别只能有1个。
2. ```[data-iframe="true"]``` 指定为iframe模式，当值为false的时候，为智能模式，自动判断（内网用ajax，外网用iframe）。缺省为false。
3. ```[data-title="new tab"]``` 设置后指定标签页的标题，默认读取链接字体。
4. ```[data-url="index.html"]``` 如果对象不是<a>链接，此值可以指定链接URL

###初始化配置
下面这些为默认配置，可以自行修改
```html
<script>
    $('.content-wrapper').multitabs({
        showHash : false,                           //当值为true时，显示URL的hash，避免误按F5或者刷新的页面丢失，不过需要注意URL栏参数的泄露。
        content : 'info',                           //此处可以指定标签页类型名称，一般不需要修改。
        linkClass : '.multi-tabs',                  //触发multitabs的class，注意需要有"."
        iframe : false,                             //iframe模式的总局设置。当值为false的时候，为智能模式，自动判断（内网用ajax，外网用iframe）。缺省为false。
        tabHeader : {
            class : '',                             //为tabHeader添加class
            maxTabs : 8,                            //最多tab数量。（main和editor不计算在内)
            maxTabTitleLength : 25,                 //tab标题的最大长度
        },
        ajaxTabPane : {
            class : '',                             //为ajax tab-pane 添加class
        },
        iframeTabPane : {
            class : '',                             //为iframe tab-pane 添加class
        },
        language : {                                //语言设置
            title : 'Tab',                          //默认tab标题名称
            option : 'Option',                      //选项
            showActivedTab : 'Show Activated Tab',  //显示已激活标签页
            closeAllTabs : 'Close All Tabs',        //关闭所有tab
            closeOtherTabs : 'Close Other Tabs'     //关闭其他tab 
        },
    });
</script>
```