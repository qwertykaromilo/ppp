(function($){
    window.SimpleWidget = function(options) {
        var that = this;
        this.options = options;
        this.widgetContainter = $('.simple-widget[widgetId="'+options.widgetId+'"]');
        this.refresh = function() {
            var opts = deepClone(that.options);
            opts.action = "refresh";
            AjaxEngine.sendBulkRequest(opts, function(response){
                if (response.code == 0) {
                    that.widgetContainter.html(response.content);
                }
            });
        };

    };
    window.TopMainLinkWidget = function(options) {
        this.__proto__ = new SimpleWidget(options);
    };
})(jQuery);
