/**
 * 移动端富文本编辑器
 * @author ganzw@gmail.com
 * @revisions https://github.com/Mrjeff578575/artEditor_revisions
 * @url    https://github.com/baixuexiyang/artEditor
 * 修改上传函数，以及预览部分，不再采用base64预览，而是直接采用表单上传,
 * 接下来nodejs转发请求给后端文件服务器,拿到请求成功之后的url进行图片预览。
 */
$.fn.extend({
    _opt: {
        placeholader: '<p>请输入文章正文内容</p>',
        validHtml: [],
        limitSize: 3,
        showServer: false,
        htmlArrTag:'',
        oldStr:'',
        flag: false,
    },
    artEditor: function (options) {
        var _this = this,
            styles = {
                "-webkit-user-select": "text",
                "user-select": "text",
                "overflow-y": "auto",
                "text-break": "break-all",
                "outline": "none",
                "cursor": "text"
            };
        $(this).css(styles).attr("contenteditable", true);
        //合并选项
        _this._opt = $.extend(_this._opt, options);
        try {
            $("#"+this._opt.imgTar).on('change',function(){
                var file = this.files[0];
                // 接受 jpeg, jpg, png 类型的图片
                if (!/\/(?:jpeg|jpg|png)/i.test(file.type)) return;
                if (Math.ceil(file.size / 1024 / 1024) > _this._opt.limitSize) {
                    console.error('文件太大');
                    return;
                }
                _this.doUpload();//上传图片
            });
            _this.placeholderHandler();
            _this.pasteHandler();
        } catch (e) {
            console.log(e);
        }
        if (_this._opt.formInputId && $('#' + _this._opt.formInputId)[0]) {
            $(_this).on('input', function () {
                $('#' + _this._opt.formInputId).val(_this.getValue());
            });
        }
    },
    doUpload: function (){
        var formData = new FormData($("#"+this._opt.imgFormId)[0]);
        var _this = this;
        $.ajax({
            url: this._opt.uploadUrl,
            type: 'POST',
            cache: false,
            data: formData,
            processData: false,
            contentType: false,
            success: function (res) {
                //返回图片url
                if(res.errno !== 0 ){
                    console.log('上传文件出错');
                    return
                }
                var src = _this._opt.uploadSuccess(res);
                var img = '<img src="' + src + '" style="width:90%;" />';
                _this.insertImage(img);
            },
            error: function (err) {
                console.log(err);
            }
        });
    },
    insertImage: function (src) {
        $(this).focus();
        var selection = window.getSelection ? window.getSelection() : document.selection;
        var range = selection.createRange ? selection.createRange() : selection.getRangeAt(0);
        if (!window.getSelection) {
            range.pasteHTML(src);
            range.collapse(false);
            range.select();
        } else {
            range.collapse(false);
            var hasR = range.createContextualFragment(src);
            var hasLastChild = hasR.lastChild;
            while (hasLastChild && hasLastChild.nodeName.toLowerCase() == "br" && hasLastChild.previousSibling && hasLastChild.previousSibling.nodeName.toLowerCase() == "br") {
                var e = hasLastChild;
                hasLastChild = hasLastChild.previousSibling;
                hasR.removeChild(e);
            }
            range.insertNode(range.createContextualFragment("<br/>"));
            range.insertNode(hasR);
            if (hasLastChild) {
                range.setEndAfter(hasLastChild);
                range.setStartAfter(hasLastChild);
            }
            selection.removeAllRanges();
            selection.addRange(range);
        }
        if (this._opt.formInputId && $('#' + this._opt.formInputId)[0]){
            $('#' + this._opt.formInputId).val(this.getValue());
        }
    },
    pasteHandler: function () {
        var _this = this;
        $(this).on("paste", function (e) {
            console.log(e.clipboardData.items);
            var content = $(this).html();
            console.log(content);
            valiHTML = _this._opt.validHtml;
            content = content.replace(/_moz_dirty=""/gi, "").replace(/\[/g, "[[-").replace(/\]/g, "-]]").replace(/<\/ ?tr[^>]*>/gi, "[br]").replace(/<\/ ?td[^>]*>/gi, "&nbsp;&nbsp;").replace(/<(ul|dl|ol)[^>]*>/gi, "[br]").replace(/<(li|dd)[^>]*>/gi, "[br]").replace(/<p [^>]*>/gi, "[br]").replace(new RegExp("<(/?(?:" + valiHTML.join("|") + ")[^>]*)>", "gi"), "[$1]").replace(new RegExp('<span([^>]*class="?at"?[^>]*)>', "gi"), "[span$1]").replace(/<[^>]*>/g, "").replace(/\[\[\-/g, "[").replace(/\-\]\]/g, "]").replace(new RegExp("\\[(/?(?:" + valiHTML.join("|") + "|img|span)[^\\]]*)\\]", "gi"), "<$1>");
            if (!/firefox/.test(navigator.userAgent.toLowerCase())) {
                content = content.replace(/\r?\n/gi, "<br>");
            }
            $(this).html(content);
        });
    },
    placeholderHandler: function () {
        var _this = this;
        $(this).on('focus', function () {
            if ($.trim($(this).html()) === _this._opt.placeholader) {
                $(this).html('');
            }
        })
            .on('blur', function () {
                if (!$(this).html()) {
                    $(this).html(_this._opt.placeholader);
                }
            });

        if (!$.trim($(this).html())) {
            $(this).html(_this._opt.placeholader);
        }
    },
    getValue: function () {
        var reg = /<([^ >])+[^>]*>(?:[\S\s]*?<\/\1>)?/;
        var str = $(this).html();
        //匹配出处理过的段落
        if(this._opt.htmlArrTag !== ""){
            str = str.replace(this._opt.oldStr, "");
        }
        if(this._opt.flag){
            return this._opt.htmlArrTag + str;
        }

        var htmlTag = str.match(reg);
        var _str = str;
        str = str.replace(reg, "");
        if(htmlTag !== null){
            str = "<p>"+str+"</p>" + htmlTag[0];
            this._opt.htmlArrTag = str;
            this._opt.oldStr = _str;
            //后面都有标签了
            this._opt.flag = true;
        }
        else{
            str = "<p>"+str+"</p>";
        }
        return str;
    },
    setValue: function (str) {
        $(this).html(str);
    }
});
