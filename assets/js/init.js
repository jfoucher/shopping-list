require.config({
    baseUrl: 'assets/js/lib',
    "shim": {
        'zepto_selector': 'zepto',
        'shake': []
    }
});

requirejs(['../app']);
