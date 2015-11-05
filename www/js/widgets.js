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
    window.GameController = function(options) {
        this.__proto__ = new SimpleWidget(options);
    };
    window.GameTablesWidget = function(options) {
        var that = this;
        this.__proto__ = new SimpleWidget(options);
        this.takePart = function(tableId) {
            that.widgetContainter.find(".errMsg").hide();
            var opts = deepClone(that.options);
            opts.action = "take_a_part";
            opts.table_id = tableId;
            AjaxEngine.sendBulkRequest(opts, function(response){
                if (response.code == 0) {
                    that.widgetContainter.html(response.content);
                }
            }, function(response){
                if (response.code == 1) {
                    that.widgetContainter.find(".errMsg").html(response.message);
                    that.widgetContainter.find(".errMsg").show();
                } else if (response.code == 2) {
                    location = response.url;
                }

            });
        }
    };
})(jQuery);
