define(['zepto', 'underscore', 'async_storage'], function($, _, storage) {

    var Events = function(ui){
        this.ui = ui;
        var self = this;
        this.preferences = {'clear-shake': true};

        storage.getItem('preferences', function(prefs) {
            self.preferences = prefs || {};
        });
    };

    Events.prototype.addItemToList = function(listName, item) {
        var self = this;
        $('#item-count').val("1");
        $('#autocomplete').find('li').show();

        storage.getItem('lists', function(lists) {
            if(!lists) {
                lists = [];
            }
            var list = _.find(lists, function(l) {
                return (l.name == listName);
            });

            list.items.push({name: item, removed: false});

            var newLists = _.filter(lists, function(l) {
                return (l.name != listName);
            });

            self.ui.updateListItems(listName, list.items);

            newLists.push(list);
            storage.setItem('lists', newLists);

        });
    };

    Events.prototype.bindEvents = function(){
        var self = this;
        $('#item-name').on('keyup', function(e){
            var ac = $('#autocomplete');
            var $el = $(e.currentTarget);
            var val = $el.val();
            if (!val) {
                ac.find('li').show();
            } else {
                ac.find('li').not(':contains('+val+')').hide();
                ac.find('li:contains('+val+')').show();
            }
        });

        $('#add-item-form').on('submit', function(e) {
            e.preventDefault();
            var li = $('#shopping-list').find('ul > li.list.active');
            var listName = li.attr('data-list-name');
            var item = $('#item-name').val();

            if (!item || item === '') {
                return;
            }

            var ac = $('#autocomplete');

            ac.prepend('<li><a href="#">'+item+'</a></li>');
            self.addItemToList(listName, item);
            setTimeout(function(){
                var l = ac.find('li').first();
                l.addClass('go-left');

                l.on('transitionend', function(){
                    $('#item-name').val("");
                    l.remove();
                    storage.getItem('autocompleteitems', function(items) {
                        if(!items) {
                            items = [];
                        }

                        items.push(item);

                        items = _.uniq(items);
                        storage.setItem('autocompleteitems', items);

                    });
                });



            }, 500);



        });

        $('#autocomplete').on('click', 'a', function(e) {
            e.preventDefault();
            var $el = $(e.currentTarget);
            var li = $('#shopping-list').find('ul > li.list.active');
            var listName = li.attr('data-list-name');

            var l = $el.parent();
            l.addClass('go-left');
            l.on('transitionend', function(){
                l.remove();
            });
            $('#item-name').val("");

            self.addItemToList(listName, $el.text());

        });

        $('#shopping-list').on('click', 'a.list-item-link', function(e){
            var $el = $(e.currentTarget);
            $el.parent().toggleClass('removed');
            var li = $('#shopping-list').find('ul > li.list.active');
            var listName = li.attr('data-list-name');
            //TODO save list to db

            var item = $el.text();

            storage.getItem('lists', function(lists) {
                if(!lists) {
                    lists = [];
                }
                var list = _.find(lists, function(l) {
                    return (l.name == listName);
                });

                var newItems = _.filter(list.items, function(it) {
                    return (it.name != item && it != item);
                });

                newItems.push({name: item, removed: $el.parent().hasClass('removed')});

                list.items = newItems;


                var newLists = _.filter(lists, function(l) {
                    return (l.name != listName);
                });


                newLists.push(list);
                storage.setItem('lists', newLists);

            });

        });


        $('#add-list-form').on('submit', function(e) {
            e.preventDefault();
            storage.getItem('lists', function(lists) {
                if(!lists) {
                    lists = [];
                }
                $('header menu a.hidden').removeClass('hidden');
                var id = lists.length + 2;
                var color = self.ui.classes[Math.floor(Math.random()*self.ui.classes.length)];
                lists.push({id: id, name: $('#list-name').val(), items:[], color: color});
                storage.setItem('lists', lists);
                self.ui.updateLists(lists);
                $('header h1.list-name').text($('#list-name').val());
                var tr = -$('#shopping-list').width() * (lists.length-1);
                window.location.hash = '';
                $('#shopping-list').find('ul.lists').css({'transform': 'translateX('+tr+'px)'});
                var lis = $('#shopping-list > ul > li');
                lis.removeClass('active');
                lis.last().addClass('active');
                var pages = $('ul.pager > li');
                pages.removeClass('active');
                pages.last().addClass('active');
            });
            $('.fade-in').removeClass('fade-in');
        });

        $('#add-item-to-list').on('click', function(e) {
            e.preventDefault();
            $('#add-item').addClass('fade-in').attr('data-list-name',  $('#shopping-list').find('li.active').data('list-name'));
            $('#item-name').val("").focus();
        });
        $('a.cancel').on('click', function(e) {
            e.preventDefault();
            storage.getItem('autocompleteitems', function(items) {
                if(!items) {
                    items = [];
                }

                $('#autocomplete').find('a').each(function(i, a) {
                    var $a = $(a);
                    items.push($a.text());
                });


                items = _.uniq(items);
                storage.setItem('autocompleteitems', items);
                self.ui.updateAutocomplete(items);


            });
            $('.fade-in').removeClass('fade-in');
        });

        $('body').on('click', '.new-list', function(){
            $('#add-list').addClass('fade-in');
            $('#list-name').val("").focus();
        });

        var startX;
        var currentPos = 0;
        var prevX = 0;
        $('#shopping-list').on('touchstart', 'ul.lists', function(ev){
//            ev.preventDefault();
            var el = $(this);
            el.removeClass('touchend');
            el.find('aside').removeClass('touchend');
            var touches = ev.changedTouches;
            startX = touches[0].pageX;
            prevX = touches[0].pageX;

        }).on('touchmove', 'ul.lists', function(e){
//            e.preventDefault();
            var $el = $(e.currentTarget);
            var touches = e.changedTouches;

            var moveX = - (currentPos - (touches[0].pageX - startX));
            var direction = touches[0].pageX - prevX;
            var lis = $el.find('li.list');

            if (lis.find('active').index() == 0 || lis.find('active').index() == lis.length - 1) {
                moveX = moveX / 2;
            }

            if((moveX > 0 && moveX < 30 && direction > 0) || (moveX > -30 && moveX < 0 && direction < 0)) {
                moveX = 0;
            }
            $el.css({'transform': 'translateX('+moveX+'px)'});
            prevX = touches[0].pageX;
        })
        .on('touchend', 'ul.lists', function(e) {
//            e.preventDefault();
            var $el = $(e.currentTarget);
            var touches = e.changedTouches;
            var mX = touches[0].pageX - startX;
            var moveX = currentPos - mX;
            var w = $('#shopping-list').width();
            var itemNum = Math.round(moveX / w);
            var lis = $el.find('li.list');
            var liCount = lis.length;
            if(itemNum > liCount - 1 ){
                itemNum = liCount - 1;
            } else if(itemNum < 0 ) {
                itemNum = 0;
            }
            lis.removeClass('active');
            var toMove = -w * itemNum;
            var li = lis.eq(itemNum);
            li.addClass('active');
            var pages = $('ul.pager').find('li');
            pages.removeClass('active');
            pages.eq(itemNum).addClass('active');
            $('header h1.list-name').text(li.data('list-name'));
            $el.data('position', toMove);
            currentPos = -toMove;
            $el.animate({'transform': 'translateX('+toMove+'px)'}, 300, 'ease');
        });

        $('ul.pager').on('click', 'li', function(e) {
            var $el = $(e.currentTarget);
            var lists = $('#shopping-list').find('ul.lists > li');
            lists.removeClass('active');
            $('ul.pager').find('li').removeClass('active');
            $el.addClass('active');


            var i = -$el.index();


            var li = lists.eq(-i);
            li.addClass('active');
            var listName = li.data('list-name');
            $('header h1.list-name').text(li.data('list-name'));
            var translate = i * $('#shopping-list').width();
            currentPos = -translate;
            $('#shopping-list').find('ul.lists').animate({'transform': 'translateX('+translate+'px)'}, 300, 'ease');
    });



        window.addEventListener('shake', function(e) {
            if(!self.preferences['clear-shake']) {
                return;
            }
            window.navigator.vibrate(100);
            //TODO remove all striked out items from current list
            var li = $('#shopping-list').find('ul > li.list.active');
            var listName = li.attr('data-list-name');

            var toRemove = [];

            $('#shopping-list').find('ul > li.list.active').find('.list-items li.removed').each(function(i, item) {
                toRemove.push($(item).text());
            });


            storage.getItem('lists', function(lists) {
                if(!lists) {
                    lists = [];
                }
                var list = _.find(lists, function(l) {
                    return (l.name == listName);
                });

                var newItems = _.filter(list.items, function(it) {
                    return (_.indexOf(toRemove, it.name) == -1 && _.indexOf(toRemove, it) == -1);
                });

                list.items = newItems;

                var newLists = _.filter(lists, function(l) {
                    return (l.name != listName);
                });


                newLists.push(list);
                storage.setItem('lists', newLists);

                self.ui.updateListItems(listName, newItems);

            });

        }, false);




        $("#settings").find("input[type=checkbox]").on("click", function(e) {
            var pref, prefs, res;
            pref = $(this).attr("id");
            if ($(this).is("[checked]")) {
                $(this).removeAttr("checked");
                res = false;
            } else {
                $(this).attr("checked", "checked");
                res = true;
            }

            self.preferences[pref] = res;
            console.log('settings prefs', self.preferences);
            storage.setItem('preferences', self.preferences);
        });

        $('#delete-list').on('click', function(e){
            e.preventDefault();
            var li = $('#shopping-list').find('ul > li.list.active');
            var listName = li.attr('data-list-name');
            if(confirm('Are you sure you want to delete list "'+ listName+'"?')) {
                storage.getItem('lists', function(lists) {
                    if(!lists) {
                        lists = [];
                    }
                    var newLists = _.filter(lists, function(l) {
                        return (l.name != listName);
                    });

                    storage.setItem('lists', newLists);

                    self.ui.updateLists(newLists);
                    $('#shopping-list > ul > li').first().addClass('active');
                    $('ul.pager').find('li').first().addClass('active');
                    $('#shopping-list').find('ul.lists').animate({'transform': 'translateX(0px)'}, 300, 'ease');

                });
            }

        })


    };

    return Events;



});