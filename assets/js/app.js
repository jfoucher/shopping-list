
define(['zepto',  'async_storage', 'events', 'underscore', 'ui'], function($, storage, Events, _, UI) {

    $(function() {
        window.screen.mozLockOrientation('portrait');
        var ui = new UI();

        storage.getItem('lists', function(lists) {
            console.log(lists);
            if(lists && lists.length) {
                $('header menu a.hidden').removeClass('hidden');
                ui.updateLists(lists)
                $('#shopping-list > ul > li').first().addClass('active');
                $('ul.pager').find('li').first().addClass('active');
            }


            var events = new Events(ui);
            events.bindEvents();
        });

        storage.getItem('autocompleteitems', function(items) {

            ui.updateAutocomplete(items);

        });

    });

    
});
