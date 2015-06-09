$(function () {
    /*造价总汇 表格隔行变色*/
    //$(".sjsbjq_zjzh_table tbody tr:even").addClass("even-row");
    //$(".sjsbjq_zjzh_table tbody tr:odd").addClass("odd-row");

    /*驳回原因弹层*/
    $('#bh_tc_qx,#bh_tc_close').click(function () {
        $('#bh-tc-k').hide();
    });
});

var docCookies = {
    getItem: function (sKey) {
        if (!sKey) {
            return null;
        }
        return decodeURIComponent(document.cookie.replace(new RegExp("(?:(?:^|.*;)\\s*" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=\\s*([^;]*).*$)|^.*$"), "$1")) || null;
    },
    setItem: function (sKey, sValue, vEnd, sPath, sDomain, bSecure) {
        if (!sKey || /^(?:expires|max\-age|path|domain|secure)$/i.test(sKey)) {
            return false;
        }
        var sExpires = "";
        if (vEnd) {
            switch (vEnd.constructor) {
                case Number:
                    sExpires = vEnd === Infinity ? "; expires=Fri, 31 Dec 9999 23:59:59 GMT" : "; max-age=" + vEnd;
                    break;
                case String:
                    sExpires = "; expires=" + vEnd;
                    break;
                case Date:
                    sExpires = "; expires=" + vEnd.toUTCString();
                    break;
            }
        }
        document.cookie = encodeURIComponent(sKey) + "=" + encodeURIComponent(sValue) + sExpires + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "") + (bSecure ? "; secure" : "");
        return true;
    },
    removeItem: function (sKey, sPath, sDomain) {
        if (!this.hasItem(sKey)) {
            return false;
        }
        document.cookie = encodeURIComponent(sKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 GMT" + (sDomain ? "; domain=" + sDomain : "") + (sPath ? "; path=" + sPath : "");
        return true;
    },
    hasItem: function (sKey) {
        if (!sKey) {
            return false;
        }
        return (new RegExp("(?:^|;\\s*)" + encodeURIComponent(sKey).replace(/[\-\.\+\*]/g, "\\$&") + "\\s*\\=")).test(document.cookie);
    },
    keys: function () {
        var aKeys = document.cookie.replace(/((?:^|\s*;)[^\=]+)(?=;|$)|^\s*|\s*(?:\=[^;]*)?(?:\1|$)/g, "").split(/\s*(?:\=[^;]*)?;\s*/);
        for (var nLen = aKeys.length, nIdx = 0; nIdx < nLen; nIdx++) {
            aKeys[nIdx] = decodeURIComponent(aKeys[nIdx]);
        }
        return aKeys;
    }
};
function PriceTable(data, config) {
    if (!data) {
        return
    }
    config = config || {};
    var self = this;
    var title = config.title;
    var idPrefix = this.idPrefix = config.idPrefix;

    this.hasAmount = config.hasAmount;
    var wrapper = '<table class="table ' + config.tableClass + '"><tr><td class="tt">' + config.title + '</td>'
        + '<td class="list"><div class="fixed-header"></div><div class="fixed-body"><div class="body-inner"></div></div></td></tr>';

    var table_html = '<table><thead>'
        + '<tr>'
        + '<th class="proj" rowspan="2">项目</th>'
        + (config.hasAmount ? '<th class="amount" rowspan="2">工程量</th>' : '')
        + '<th colspan="3" class="unit" style="text-align: center;">单价</th>'
        + '<th rowspan="2"></th>'
        + '</tr>'
        + '<tr>'
        + '<th class="unit">主材</th>'
        + '<th class="unit">辅材</th>'
        + '<th class="unit">人工</th>'
        + '</tr>'
        + '</thead><tbody>'
        + '</tbody></table>';
    var $table = $(table_html);
    var $wrapper = $(wrapper);
    var $fixedHeader = this.header = $wrapper.find(".fixed-header");
    var $fixedBody = this.body = $wrapper.find(".fixed-body .body-inner");

    this.lastCell = config.lastCell || function () {
        return $("<td />")
    };
    $table.appendTo($fixedHeader);
    $table.clone().appendTo($fixedBody);

    this.elem = $wrapper;
    this.data = data;
    $.each(data, function (i, item) {
        self.add(item);
    });
}

PriceTable.prototype.add = function (item) {
    var html = '<tr id=' + (this.idPrefix + item.id) + '>'
        + '<td>' + item.name + '</td>'
        + (this.hasAmount ? ('<td><input class="tag" onchange="modify2cookie(this.value,this.id,$(this).data(' + '\'limit\'' + '));" data-limit="' + item.name + '-' + item.limit + '" id="' + (this.idPrefix + item.id + "_labour_cost") + '" typx="text" value="' + item.number + '"></div></td>') : '')
        + '<td>' + item.main_price + '</td>'
        + '<td>' + item.minor_price + '</td>'
        + '<td>' + item.labour_cost + '</td>'
        + '</tr>';
    var $tr = $(html);
    $tr.append(this.lastCell(item));

    $tr.appendTo(this.body.find("tbody"));
    $tr.clone().attr("id", "").appendTo(this.header.find("tbody"));
    this.data[item.name] = item;
}

PriceTable.prototype.remove = function (id) {
    this.header.find("#" + this.idPrefix + id).remove();
    this.body.find("#" + this.idPrefix + id).remove();
    var data = this.data;
    var index = -1;
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.id == id) {
            index = i;
            break;
        }
    }

    this.data[name] = null;
}

function PricePop(config) {
    this.onSure = config.onSure || function () {
    };
    this.title = config.title;
    this.selectedData = config.selectedData;
    this.toSelectData = config.toSelectData;
}

PricePop.prototype.open = function () {
    var self = this;
    this.overlay = $("<div class='overlay' />").appendTo($("body"));
    this.box = $("<div class='popbox' />").appendTo(this.overlay);
    var closeBtn = $("<div class='close'></div>").appendTo(this.box);
    closeBtn.on("click", function () {
        self.close();
    });
    $("body").addClass("popbox-open");

    this.createElem();
}

PricePop.prototype.createElem = function () {
    var self = this;
    var h1 = "<h1 class='title'>" + this.title + "</h1>";

    var selectedTable = new PriceTable(this.selectedData, {
        idPrefix: "selected-",
        tableClass: "selected",
        hasAmount: true,
        lastCell: function (data) {
            var $td = $('<td><div class="remove"></div></td>');
            var self = this;
            $td.on("click", function () {
                toSelectTable.add(data);
                self.remove(data.id);
                var room = docCookies.getItem('modify_room');
                addCookie('delete', room + '_' + data.id);
                // deleteCookie('add', room + '_' + data.id);
            });
            return $td;
        },
        title: "已选"
    });

    var toSelectTable = new PriceTable(this.toSelectData, {
        idPrefix: "toselect-",
        title: "可选",
        tableClass: "toselect",
        lastCell: function (data) {
            var $td = $('<td class="choose">选取</td>');
            var self = this;
            $td.on("click", function () {
                selectedTable.add(data);
                self.remove(data.id);
                var room = docCookies.getItem('modify_room');
                addCookie('add', room + '_' + data.id);
                // deleteCookie('delete', room + '_' + data.id);
            });
            return $td;
        }
    });

    $(h1).appendTo(this.box);
    selectedTable.elem.appendTo(this.box);
    toSelectTable.elem.appendTo(this.box);
    var buttons = '<div class="buttons">'
        + '<div class="button sure">确认</div>'
        + '<div class="button cancel">取消</div>'
        + '</div>';
    var $buttons = $(buttons);
    $buttons.find(".sure").on("click", function () {
        // luxin 1115
        //加一个从目前的 selected 表格的所有工程量到 modify 这个 cookie 的对应
//        var room = docCookies.getItem('modify_room');
//        selected2modify(selectedTable,room);
        cookie2url();
        //var url = cookie2url();
        //window.location.href = url;
    });
    $buttons.find(".cancel").on("click", function () {
        self.close();
    });
    $buttons.appendTo(this.box);
}

PricePop.prototype.close = function () {
    $("body").removeClass("popbox-open");
    this.overlay.remove();
    this.box.remove();
}

/*
 function selected2modify(selectedTable,room){
 var data = selectedTable.data;
 var new_modify='';


 $.each(data, function (i, item) {
 //todo 这里的labour_cost 需要从页面上去每个 id 的工程量   luxin
 //selected-06-01-03_labour_cost
 var name = "selected-"+item.id+"_labour_cost";
 var aa = '#'+name+'';

 var labour_cost=$(aa).val();
 new_modify=new_modify+','+room+'_'+item.id+'_'+labour_cost;
 });

 //    for (var i = 0; i < data.length; i++) {
 //        var item = data[i];
 //        //todo 这里的labour_cost 需要从页面上去每个 id 的工程量   luxin
 //        //selected-06-01-03_labour_cost
 //        var name = "selected-"+item.id+"_labour_cost";
 //        var labour_cost=$('"#'+name+'"').val();
 //        new_modify=new_modify+','+room+'_'+item.id+'_'+labour_cost;
 //    }

 if(docCookies.hasItem('modify')){

 var modify = docCookies.getItem('modify');
 modify=modify+","+new_modify;
 docCookies.setItem('modify',modify);
 }else{

 var modify=new_modify;
 docCookies.setItem('modify',modify);
 }


 }
 */
function modify2cookie(value, id, item) {
    var name = item.split('-')[0];
    var limit = item.split('-')[1];
    if (~~value > ~~limit && ~~limit > 0) {
        alert('项目：' + name + '，工程量不可超过' + limit);
        return;
    }
    var labour_cost = value;
    var room = docCookies.getItem('modify_room');
    var item_id = id.substr(9, 7);
    var new_modify = room + '_' + item_id + '_' + labour_cost;
    resetCookie('modify', new_modify);
    if (docCookies.hasItem('modify')) {
        var modify = docCookies.getItem('modify');
        modify = modify + "," + new_modify;
        docCookies.setItem('modify', trim(modify, ',null '));
    } else {

        var modify = new_modify;
        docCookies.setItem('modify', trim(modify, ',null '));
    }

}

function modify_material2cookie(value, id, item) {
    var name = item.split('-')[0];
    var limit = item.split('-')[1];
    if (~~value > ~~limit && ~~limit > 0) {
        alert('项目：' + name + '，数量不可超过' + limit);
        return;
    }
    var number = value;
    var room = docCookies.getItem('modify_material');
    var item_id = id.substr(9, 8);
    var new_modify = room + '_' + item_id + '_' + number;
    //alert(new_modify);
    resetCookie('modify', new_modify);
    if (docCookies.hasItem('zc_modify')) {

        var modify = docCookies.getItem('zc_modify');
        if (modify != null) {
            modify = modify + "," + new_modify;
            docCookies.setItem('zc_modify', trim(modify, ',null '));
        }
        else {
            modify = new_modify;
            docCookies.setItem('zc_modify', trim(modify, ',null '));
        }
    } else {
        modify = new_modify;
        docCookies.setItem('zc_modify', trim(modify, ',null '));
    }

}

function cookie2url() {
    var order_id = $('#order-id').val();
    var add_item = docCookies.getItem('add');
    var delete_item = docCookies.getItem('delete');
    var modify_item = docCookies.getItem('modify');
    var zc_add = docCookies.getItem('zc_add');
    var zc_delete = docCookies.getItem('zc_delete');
    var zc_modify = docCookies.getItem('zc_modify');
    var direction = docCookies.getItem('direction');
    var anchor = docCookies.getItem('anchor');
    if (anchor == null || anchor == '' || anchor == undefined) {
        anchor = false;
    }
    $.ajax({
        type: "POST",
        url: "/calc/saveParamsToDB",
        dataType: "json",
        data: {
            "order_id": order_id,
            "zadd": add_item,
            "zdelete": delete_item,
            "zmodify": modify_item,
            "zc_add": zc_add,
            "zc_delete": zc_delete,
            "zc_modify": zc_modify,
            "anchor": (anchor ? anchor : ''),
            "direction": direction
        },
        success: function (json) {
            if (json.status == 'ok') {
                var url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?id=" + order_id;
                if (!!anchor) {
                    url += '#' + anchor;
                }
                window.location.href = url;
                location.reload();
            } else {
                $('.save-msg').fadeIn('slow').text(json.message).delay(2000).fadeOut('slow');
            }
        }
    });
    //var url = window.location.protocol + "//" + window.location.host + window.location.pathname + "?square=" + square + "&wo=" + wo + "&ting=" + ting + "&chu=" + chu + "&wei=" + wei + "&yangtai=" + yangtai + "&guodao=" + guodao + "&type=" + type + "&orderID=" + orderID;
    //
    //
    //
    //if (n_square == undefined || n_square == '' || n_square === null) {
    //
    //} else {
    //    url = url + "&n_square=" + n_square;
    //}
    //
    //if (add_item) {
    //    url += "&strurl=add:" + add_item;
    //    if (delete_item) {
    //        url += "zdelete:" + delete_item;
    //    }
    //    if (modify_item) {
    //        url += "zmodify:" + modify_item;
    //    }
    //} else if (delete_item) {
    //    url += "&strurl=delete:" + delete_item;
    //    if (modify_item) {
    //        url += "zmodify:" + modify_item;
    //    }
    //} else if (modify_item) {
    //
    //    url += "&strurl=modify:" + modify_item;
    //}
    //if (zc_add) {
    //    url += "&material=zc_add:" + zc_add;
    //    if (zc_delete) {
    //        url += "zc_delete:" + zc_delete;
    //    }
    //    if (zc_replace) {
    //        url += "zc_replace:" + zc_replace;
    //    }
    //    if (zc_modify) {
    //        url += "zc_modify:" + zc_modify;
    //    }
    //} else if (zc_delete) {
    //    url += "&material=zc_delete:" + zc_delete;
    //    if (zc_replace) {
    //        url += "zc_replace:" + zc_replace;
    //    }
    //    if (zc_modify) {
    //        url += "zc_modify:" + zc_modify;
    //    }
    //} else if (zc_replace) {
    //    url += "&material=zc_replace:" + zc_replace;
    //    if (zc_modify) {
    //        url += "zc_modify:" + zc_modify;
    //    }
    //} else if (zc_modify) {
    //    url += "&material=zc_modify:" + zc_modify;
    //}
    //
    //if (anchor) {
    //    url += '#' + anchor;
    //}
    ////alert(url);
    //return url;

}

function modify_room(jjson, room) {
    docCookies.setItem('modify_room', room);
    var selected = {};
    var unselected = {};
    for (var item in jjson) {
        var item_dict = jjson[item];
        var is_need = item_dict['is_need'];
        if (is_need == '1') {
            selected[item] = item_dict;
        } else if (is_need == '0') {
            unselected[item] = item_dict;
        }
    }
    return [selected, unselected];
}

function modify_material(jjson, room) {
    docCookies.setItem('modify_material', room);
    var selected = {};
    var unselected = {};
    for (var item in jjson) {
        var item_dict = jjson[item];
        var isNeed = item_dict['isNeed'];
        if (isNeed == '1') {
            selected[item] = item_dict;
        } else if (isNeed == '0') {
            unselected[item] = item_dict;
        }
    }
    return [selected, unselected];
}

function replace_material(jjson, room) {
    docCookies.setItem('replace_material', room);
    var unselected = {};
    for (var item in jjson) {
        var item_dict = jjson[item];
        var level = item_dict['level'];
        if (level != '0') {
            unselected[item] = item_dict;
        }
    }
    return unselected;
}

function setDirection(dir) {
    docCookies.setItem('direction', dir);
}

function add_anchor(anchor) {
    docCookies.setItem('anchor', anchor);
}

function trim(str, charlist) {
    var whitespace, l = 0,
        i = 0;
    str += '';

    if (!charlist) {
        // default list
        whitespace =
            ' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
    } else {
        // preg_quote custom list
        charlist += '';
        whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
    }

    l = str.length;
    for (i = 0; i < l; i++) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(i);
            break;
        }
    }

    l = str.length;
    for (i = l - 1; i >= 0; i--) {
        if (whitespace.indexOf(str.charAt(i)) === -1) {
            str = str.substring(0, i + 1);
            break;
        }
    }

    return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}

function addCookie(name, cookie) {
    if (docCookies.hasItem(name)) {
        switch (name) {
            case 'add':
                resetCookie('delete', cookie);
                break;
            case 'delete':
                //resetCookie('add', cookie);
                resetCookie('modify', cookie);
                break;
            case 'zc_add':
                resetCookie('zc_delete', cookie);
                break;
            case 'zc_delete':
                resetCookie('zc_add', cookie);
                resetCookie('zc_modify', cookie);
                break;
        }
        var old_cookie = docCookies.getItem(name);
        var final_cookie = old_cookie + ',' + cookie;
        docCookies.setItem(name, trim(final_cookie, ',null '));

    } else {
        docCookies.setItem(name, trim(cookie), ',null ');
    }
}

function resetCookie(name, cookie) {
    if (name == 'modify' || name == 'zc_modify') {
        var tmp = cookie.split('_');
        cookie = tmp[0] + '_' + tmp[1];
    }
    //alert('cookie:' + cookie);
    if (docCookies.hasItem(name) && docCookies.getItem(name) != '' && docCookies.getItem(name) != null) {
        var old_cookie_str = docCookies.getItem(name);
        var old_cookie_arr = old_cookie_str.split(',');
        var new_cookie_str = '';
        for (var i = 0; i < old_cookie_arr.length; i++) {
            var old_cookie = '';
            if (name == 'modify' || name == 'zc_modify') {
                var old_cookie_tmp = old_cookie_arr[i].split('_');
                old_cookie = old_cookie_tmp[0] + '_' + old_cookie_tmp[1];
            } else {
                old_cookie = old_cookie_arr[i];
            }
            //alert('old_cookie:' + old_cookie);
            if (cookie == old_cookie) {
            } else {
                new_cookie_str += old_cookie_arr[i] + ',';
            }
        }
        new_cookie_str = new_cookie_str.substr(0, new_cookie_str.length - 1);
        docCookies.setItem(name, trim(new_cookie_str, ',null '));
    } else {
        return false;
    }
}

function deleteCookie(name, cookie) {
    if (docCookies.hasItem(name)) {
        var old_cookie = docCookies.getItem(name);
        var array_cookie = old_cookie.split(',');
        var index = array_cookie.indexOf(cookie);
        if (index != -1) {
            array_cookie[index] = '';
        }
        var final_cookie = '';
        for (var i = 0; i < array_cookie.length; i++) {
            if (array_cookie[i] != '' && array_cookie != 'null') {
                final_cookie = array_cookie[i] + ',';
            }
        }

        docCookies.setItem(name, trim(final_cookie, ',null '));
    }
}

//自动保存cookie
function saveCookie() {
    var orderID = $("input[name='order_id']").val();
    var add_item = docCookies.getItem('add');
    var delete_item = docCookies.getItem('delete');
    var modify_item = docCookies.getItem('modify');
    var zc_add = docCookies.getItem('zc_add');
    var zc_delete = docCookies.getItem('zc_delete');
    var zc_modify = docCookies.getItem('zc_modify');
    $.ajax({
        type: "POST",
        url: "/calc/saveCookie",
        dataType: "json",
        data: {
            "order_id": orderID,
            "zadd": add_item,
            "zdelete": delete_item,
            "zmodify": modify_item,
            "zc_add": zc_add,
            "zc_delete": zc_delete,
            "zc_modify": zc_modify
        },
        success: function (json) {
            var msg = '';
            if (json.status == 'error') {
                msg = json.message;
            } else {
                msg = json.data + '系统自动保存了您的操作';
            }
            $('.save-msg').fadeIn('slow').text(msg).delay(2000).fadeOut('slow')
        }
    });
}

/*======================================================================*/
/*编辑主材*/
function ZCPriceTable(data, config) {
    if (!data) {
        return
    }
    config = config || {};
    var self = this;
    var title = config.title;
    var idPrefix = this.idPrefix = config.idPrefix;

    this.hasAmount = config.hasAmount;
    var wrapper = '<table class="table ' + config.tableClass + '"><tr><td class="tt">' + config.title + '</td>'
        + '<td class="list"><div class="fixed-header"></div><div class="fixed-body"><div class="body-inner"></div></div></td></tr>';

    var table_html = '<table><thead>'
        + '<tr>'
        + '<th class="proj" style="height:44px; width:344px">项目</th>'
        + (config.hasAmount ? '<th class="amount" style="width:130px">数量</th>' : '')
        + '<th  rowspan="2" class="unit" style="text-align: center;">单价</th>'
        + '<th rowspan="2"></th>'
        + '</tr>'
        + '</thead><tbody style="width:100%">'
        + '</tbody></table>';
    var $table = $(table_html);
    var $wrapper = $(wrapper);
    var $fixedHeader = this.header = $wrapper.find(".fixed-header");
    var $fixedBody = this.body = $wrapper.find(".fixed-body .body-inner");

    this.lastCell = config.lastCell || function () {
        return $("<td />")
    };
    $table.appendTo($fixedHeader);
    $table.clone().appendTo($fixedBody);

    this.elem = $wrapper;
    this.data = data;
    $.each(data, function (i, item) {
        self.add(item);
    });
}

function add_one(id) {
    $('#selected-' + id + ' ').val(parseInt($('#selected-' + id + ' ').val()) + 1);
}
function delete_one(id) {
    if (parseInt($('#selected-' + id).val()) >= 1) {
        $('#selected-' + id + ' ').val(parseInt($('#selected-' + id + ' ').val()) - 1);
    }
}

ZCPriceTable.prototype.add = function (item) {
    var html = '<tr id=' + (this.idPrefix + item.c_id) + '>'
        + '<td>' + item.category_l2 + '--' + ((item.brand == '' || item.brand == undefined || item.brand == null) ? '' : item.brand + '--') + item.name + '</td>'
        + (this.hasAmount ? ('<td><input class="zc_tag" onchange="modify_material2cookie(this.value,this.id,$(this).data(' + '\'limit\'' + '));" data-limit="' + item.name + '-' + item.limit + '" id="'
        + (this.idPrefix + item.c_id) + '" type="text" value="' + item.number + '"></div>'
        + '</td>') : '')
        + '<td>' + item.price + '</td>'
        + '</tr>';
    var $tr = $(html);

    $tr.append(this.lastCell(item));

    $tr.appendTo(this.body.find("tbody"));
    $tr.clone().attr("id", "").appendTo(this.header.find("tbody"));
    this.data[item.name] = item;
}

ZCPriceTable.prototype.remove = function (c_id) {
    this.header.find("#" + this.idPrefix + c_id).remove();
    this.body.find("#" + this.idPrefix + c_id).remove();
    var data = this.data;
    var index = -1;
    for (var i = 0; i < data.length; i++) {
        var item = data[i];
        if (item.c_id == c_id) {
            index = i;
            break;
        }
    }

    this.data[name] = null;
}

function ZCPricePop(config) {
    this.onSure = config.onSure || function () {
    };
    this.title = config.title;
    this.selectedData = config.selectedData;
    this.toSelectData = config.toSelectData;
}

ZCPricePop.prototype.open = function () {
    var self = this;
    this.overlay = $("<div class='overlay' />").appendTo($("body"));
    this.box = $("<div class='popbox' />").appendTo(this.overlay);
    var closeBtn = $("<div class='close'></div>").appendTo(this.box);
    closeBtn.on("click", function () {
        self.close();
    });
    $("body").addClass("popbox-open");

    this.createElem();
}

ZCPricePop.prototype.createElem = function () {
    var self = this,
        h1 = "<h1 class='title'>" + this.title + "</h1>",
        $nav = $('<ul class="pop-nav-list-level"><li class="selected"><a href="javascript:;">低档</a></li><li><a href="javascript:;">中档</a></li><li><a href="javascript:;">高档</a></li></ul>'),
        selectedDataLow = {}, selectedDataMiddle = {}, selectedDataHigh = {},
        toSelectDataLow = {}, toSelectDataMiddle = {}, toSelectDataHigh = {};
    // low middle high
    $.each(this.selectedData, function (i, item) {
        switch (true) {
            case item.level === '1':
                selectedDataLow[item.prefix + item.c_id] = item;
                break;
            case item.level === '2':
                selectedDataMiddle[item.prefix + item.c_id] = item;
                break;
            case item.level === '3':
                selectedDataHigh[item.prefix + item.c_id] = item;
                break;
        }
    });

    $.each(this.toSelectData, function (i, item) {
        switch (true) {
            case item.level === '1':
                toSelectDataLow[item.prefix + item.c_id] = item;
                break;
            case item.level === '2':
                toSelectDataMiddle[item.prefix + item.c_id] = item;
                break;
            case item.level === '3':
                toSelectDataHigh[item.prefix + item.c_id] = item;
                break;
        }
    });


    var selectedTableLow = new ZCPriceTable(selectedDataLow, {
        idPrefix: "selected-",
        tableClass: "selected",
        hasAmount: true,
        lastCell: function (data) {
            var $td = $('<td><div class="remove"></div></td>');
            var self = this;
            $td.on("click", function () {
                toSelectTableLow.add(data);
                self.remove(data.c_id);
                var room = docCookies.getItem('modify_material');
                addCookie('zc_delete', room + '_' + data.c_id);
            });
            return $td;
        },
        title: "已选"
    });

    var selectedTableMiddle = new ZCPriceTable(selectedDataMiddle, {
        idPrefix: "selected-",
        tableClass: "selected",
        hasAmount: true,
        lastCell: function (data) {
            var $td = $('<td><div class="remove"></div></td>');
            var self = this;
            $td.on("click", function () {
                toSelectTableMiddle.add(data);
                self.remove(data.c_id);
                var room = docCookies.getItem('modify_material');
                addCookie('zc_delete', room + '_' + data.c_id);
            });
            return $td;
        },
        title: "已选"
    });

    var selectedTableHigh = new ZCPriceTable(selectedDataHigh, {
        idPrefix: "selected-",
        tableClass: "selected",
        hasAmount: true,
        lastCell: function (data) {
            var $td = $('<td><div class="remove"></div></td>');
            var self = this;
            $td.on("click", function () {
                toSelectTableHigh.add(data);
                self.remove(data.c_id);
                var room = docCookies.getItem('modify_material');
                addCookie('zc_delete', room + '_' + data.c_id);
            });
            return $td;
        },
        title: "已选"
    });


    var toSelectTableLow = new ZCPriceTable(toSelectDataLow, {
        idPrefix: "toselect-",
        title: "可选",
        tableClass: "toselect",
        lastCell: function (data) {
            var $td = $('<td class="choose">选取</td>');
            var self = this;
            $td.on("click", function () {
                selectedTableLow.add(data);
                self.remove(data.c_id);
                var room = docCookies.getItem('modify_material');
                addCookie('zc_add', room + '_' + data.c_id);
            });
            return $td;
        }
    });

    var toSelectTableMiddle = new ZCPriceTable(toSelectDataMiddle, {
        idPrefix: "toselect-",
        title: "可选",
        tableClass: "toselect",
        lastCell: function (data) {
            var $td = $('<td class="choose">选取</td>');
            var self = this;
            $td.on("click", function () {
                selectedTableMiddle.add(data);
                self.remove(data.c_id);
                var room = docCookies.getItem('modify_material');
                addCookie('zc_add', room + '_' + data.c_id);
            });
            return $td;
        }
    });

    var toSelectTableHigh = new ZCPriceTable(toSelectDataHigh, {
        idPrefix: "toselect-",
        title: "可选",
        tableClass: "toselect",
        lastCell: function (data) {
            var $td = $('<td class="choose">选取</td>');
            var self = this;
            $td.on("click", function () {
                selectedTableHigh.add(data);
                self.remove(data.c_id);
                var room = docCookies.getItem('modify_material');
                addCookie('zc_add', room + '_' + data.c_id);
            });
            return $td;
        }
    });

    $(h1).appendTo(this.box);
    $nav.appendTo(this.box);
    $('<div class="pop-nav-box-level">').appendTo(this.box);
    this.box.append('<div class="tab-box"></div>');
    //  低档
    this.box.find('.tab-box').append('<div class="tab-bd"></div>').find('.tab-bd:eq(0)').append(selectedTableLow.elem).append(toSelectTableLow.elem);
    //  中档
    this.box.find('.tab-box').append('<div class="tab-bd" style="display: none"></div>').find('.tab-bd:eq(1)').append(selectedTableMiddle.elem).append(toSelectTableMiddle.elem);
    //  高档
    this.box.find('.tab-box').append('<div class="tab-bd" style="display: none"></div>').find('.tab-bd:eq(2)').append(selectedTableHigh.elem).append(toSelectTableHigh.elem);
    $('</div>').appendTo(this.box);
    var buttons = '<div class="buttons">'
        + '<div class="button sure">确认</div>'
        + '<div class="button cancel">取消</div>'
        + '</div>';
    var $buttons = $(buttons);
    $buttons.find(".sure").on("click", function () {
        cookie2url();
        //var url = cookie2url();
        //window.location.href = url;
    });
    $buttons.find(".cancel").on("click", function () {
        self.close();
    });
    $buttons.appendTo(this.box);
    $nav.find('li').on('click', function () {
        $nav.find('li').eq($(this).index()).addClass('selected').siblings().removeClass('selected');
        self.box.find('.tab-box .tab-bd').eq($(this).index()).show().siblings().hide();
    })
}


ZCPricePop.prototype.close = function () {
    $("body").removeClass("popbox-open");
    this.overlay.remove();
    this.box.remove();
}

/*======================================================================*/
/*查看主材备选*/
function OptioinTable(data, config) {
    if (!data) {
        alert('对不起，没有可供备选的主材！');
        return;
    }
    config = config || {};
    var self = this;

    var wrapper = '<div class="ckbx-list-k">' + '</div>';
    var table_html = '<ul class="ckbx-list">' + '</ul>';

    var $table = $(table_html);
    var $wrapper = $(wrapper);
    var $fixedHeader = this.header = $wrapper;
    this.body = $table.find('.ckbx-list');

    $table.clone().appendTo($fixedHeader);
    //$table.appendTo($fixedBody);
    this.elem = $wrapper;
    this.data = data;
    $.each(data, function (i, item) {
        self.add(item);
    });
}

OptioinTable.prototype.add = function (item) {
    var html = '<li id="' + item.prefix + '_' + item.c_id + '">'
            //+ '<div class="ckbx-img"><img src="../../statics/images/baojiaqi/ckbx_01.jpg" /></div>'
        + '<div class="ckbx-con">'
        + '<dl>' + '<dt>' + item.brand + ' ' + item.name + '</dt>' + '<dd>单价：' + item.price + '</dd>' + '<dd>材料工艺：' + item.instruction + '</dd>'
        + '</dl>';

    var $tr = $(html);
    $tr.appendTo(this.header.find('.ckbx-list'));
}

function OptionPop(config) {
    this.onSure = config.onSure || function () {
    };
    this.title = config.title;
    this.toSelectData = config.toSelectData;
}

OptionPop.prototype.open = function () {
    var self = this;
    this.overlay = $("<div class='overlay' />").appendTo($("body"));
    this.box = $("<div class='popbox' />").appendTo(this.overlay);
    var closeBtn = $("<div class='close'></div>").appendTo(this.box);
    closeBtn.on("click", function () {
        self.close();
    });
    $("body").addClass("popbox-open");

    this.createElem();
}

OptionPop.prototype.createElem = function () {
    var self = this;
    var h1 = "<p class='ckbx-title-span'>" + this.title + "</p>";

    var toSelectTable = new OptioinTable(this.toSelectData);
    $(h1).appendTo(this.box);
    toSelectTable.elem.appendTo(this.box);

    $(".ckbx-list li").click(function () {
        $(this).addClass('ckbx-active').siblings('li').removeClass('ckbx-active');
        var id = $(this).attr('id');
        var room = docCookies.getItem('replace_material');
        addCookie('zc_replace', room + '_' + id.split('_')[1]);
    });

    var buttons = '<div class="buttons">'
        + '<div class="button sure">确认</div>'
        + '<div class="button cancel">取消</div>'
        + '</div>';
    var $buttons = $(buttons);
    $buttons.find(".sure").on("click", function () {
        cookie2url();
        //var url = cookie2url();
        //window.location.href = url;
    });
    $buttons.find(".cancel").on("click", function () {
        self.close();
    });
    $buttons.appendTo(this.box);
}

OptionPop.prototype.close = function () {
    $("body").removeClass("popbox-open");
    this.overlay.remove();
    this.box.remove();
}

/**
 * 无逻辑的简单模板方法
 * @param tpl
 * @param data
 * @returns {XML|string|*|void}
 */
function tpl(tpl, data) {
    return tpl.replace(/{{(.*?)}}/g, function ($1, $2) {
        return data[$2] === undefined ? '0' : data[$2];
    });
}

$(function () {
    var $houseUl = $('.housing-types');
    var houseTypeAyyay = [];
    $.each($('.sjsbjq_sx_con-exp .drop-down-box:eq(0)').find('.sjsbjq_sx_k1'), function (index, item) {
        var $item = $(item);
        houseTypeAyyay[index] = {};
        houseTypeAyyay[index].name = $item.find('input').val();
        houseTypeAyyay[index].zxtype = $item.find('input').attr('zxtype');
        houseTypeAyyay[index].id = $item.find('input').attr('id');

    })
    $('.add-room-btn').on('click', function () {
        var _len = $houseUl.find('li:not(.null-types)').length;
        getLi = function () {
            return '<li class="clearfix"> <div class="decorate-down-box"> <div class="selected-title"><span>卧室</span><b class="icon-tri"></b></div> <div class="drop-down-box" style="display: none;"></div> </div>';
        },
            getDropDown = function (_i) {
                var _tpl = '<div class="sjsbjq_sx_k1"> <input class="sjsbjq_radio type_radio_select" checked="checked" id="{{id}}" type="radio" name="housing-types-{{index}}" value="{{name}}" zxtype="{{zxtype}}"> <label for="{{id}}">{{name}}</label> </div>';
                var _html = '';
                $.each(houseTypeAyyay, function (index, item) {
                    houseTypeAyyay[index].index = _i;
                    _html += tpl(_tpl, item)
                });
                return _html;
            },
            getDropDownOther = function (_i) {
                return '<div class="house-types-input"> <span class="input-label">面积</span> <input name="housing-types-area-' + _i + '" type="text"> <span class="input-unit">平方米</span> </div> '
                    + '<div class="house-types-input"> <span class="input-label">周长</span> <input name="housing-types-perimeter-' + _i + '" type="text"> <span class="input-unit">米</span> </div> '
                    + '<div class="house-types-input"> <span class="input-label">层高</span> <input name="fhousing-types-loors-' + _i + '" type="text"> <span class="input-unit">米</span> </div>'
                    + '<div class="close-handle">X</div> </li>';
            };
        if (_len === 0) {
            $houseUl.html('').append(getLi() + getDropDownOther(_len + 1));
            $houseUl.find('li:eq(' + _len + ') .drop-down-box').append(getDropDown(_len + 1))
        } else {
            $houseUl.append(getLi() + getDropDownOther(_len + 1));
            $houseUl.find('li:eq(' + _len + ') .drop-down-box').append(getDropDown(_len + 1))
        }
        for (var i = 0; i < _len + 1; i++) {
            $('input[name="housing-types-' + i + '"]').change(function () {
                consnole.log($(this).val())
            })
        }
    });
    $houseUl.on('click', '.close-handle', function () {
        var _len = $houseUl.find('li').length;
        if (_len === 1) {
            alert('最后一个了，不能删！！')
            // $('.housing-types').append('<li class="null-types"></li>')
        } else {
            $(this).parent().remove();
        }
    })
        .on('mouseover', 'li:not(.null-types)', function () {
            $(this).addClass('hover')
        })
        .on('mouseout', 'li:not(.null-types)', function () {
            $(this).removeClass('hover')
        });
    // 下拉框
    $('body')
        .on('click', '.drop-down-box label', function (event) {
            var the = $(this);
            the.closest('.decorate-down-box').find('.selected-title span').html(the.prev().val());
            dropDownHide();
            event.stopPropagation();
            return false;
        })
        .on('click', function (e) {
            if (!!$(e.target).closest('.decorate-down-box')) {
                if ($('.drop-down-box').is(':visible')) {
                    dropDownHide();
                } else {
                    dropDownShow($(e.target).closest('.decorate-down-box'));
                }
            } else {
                dropDownHide();
            }
        });
    function dropDownShow(the) {
        the.find('.drop-down-box').show();
        the.find('.selected-title').addClass('open-title');
    }

    function dropDownHide() {
        $('.drop-down-box').hide();
        $('.selected-title').removeClass('open-title');
    }
});
115.29.140.177