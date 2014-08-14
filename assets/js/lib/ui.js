define(['zepto', 'underscore', 'async_storage'], function($, _, storage) {

    var UI = function(){


        this.classes = [
            'turquoise',
            'green-sea',
            'emerald',
            'nephritis',
            'peter-river',
            'belize-hole',
            'amethyst',
            'wisteria',
            'wet-asphalt',
            'midnight-blue',
            'sun-flower',
            'orange',
            'carrot',
            'pumpkin',
            'alizarin',
            'pomegranate',
            'clouds',
            'silver',
            'concrete',
            'asbestos'

        ]
    };

    UI.prototype.updateAutocomplete = function(items){
        var l = '';
        _.each(items, function(item) {
            l += '<li><a href="#">'+item+'</a></li>';
        }) ;
        $('#autocomplete').html(l);
    };

    UI.prototype.updateListItems = function (listName, items) {
        var listli = $('li[data-list-name="'+listName+'"]').find('.list-items ul');

        var it = '';
        _.each(items, function(item){
            if(item.name) {
                var n = item.name;
            } else {
                var n = item;
            }
            var cl = '';
            if(item.removed) {
                cl = ' removed';
            }
            it += '<li class="'+cl+'"><a href="#" class="list-item-link">'+n+'</a></li>';
        });

        listli.html(it);

    };

    UI.prototype.updateLists = function(lists){
        var self = this;
        var l = '';
        var p = '';

        lists = _.sortBy(lists, 'id');

        if(! lists || lists.length == 0){
            $('header h1.list-name').text('No lists');
            $('#drawer').find('header menu a').hide();
            $('#shopping-list').html('<ul><li class="scrollable header"><p class="center" data-l10n-id="no-list-yet">You don\'t have any list yet</p><p class="center"><a href="#" class="new-list" data-l10n-id="create-one">Create one</a></p></li></ul>');
            $('ul.pager').html('');
            return;
        } else {
            $('#drawer').find('header menu a').show();
        }

        _.each(lists, function(list, i) {
            var it = '';
            _.each(list.items, function(item){
                if(item.name) {
                    var n = item.name;
                } else {
                    var n = item;
                }
                var cl = '';
                if(item.removed) {
                    cl = ' removed';
                }
                it += '<li class="'+cl+'"><a href="#" class="list-item-link">'+n+'</a></li>';
            });
            var bgColorClass = self.classes[Math.floor(Math.random()*self.classes.length)];

            if(list.color) {
                bgColorClass = list.color;
            }



            l += '<li class="list scrollable header '+bgColorClass+'" data-list-name="'+list.name+'">' +
                '<div class="list-items"><ul>'+it+'</ul></div>'
                + '</li>';
            p += '<li></li>';
        });
        $('header h1.list-name').text(lists[0].name);

        $('ul.pager').html(p);


        var sw = $('#shopping-list').width();
        var w = sw * lists.length;

        console.log(w, sw, lists.length);

        $('#shopping-list').html('<ul class="lists" data-position="0">'+l+'</ul>');
        $('#shopping-list > ul').css('width', w);
        $('#shopping-list > ul > li').css('width', sw);


    };

    return UI;



});