(function($){
    window.WidgetEngine = new (function() {
        var that = this;
        var widgets = {};
        this.registerWidget = function(widget) {
            widgets[widget.options.widgetId] = widget;
        };
        var initRefreshInterval = function() {
            var refreshInterval = 500;
            var refreshCounter = 0;
            function refreshWidgets() {
                refreshCounter = (refreshCounter + 1) % 10000;
                for (var widgetId in widgets) {
                    if (widgets[widgetId].options.refreshFrequency != -1 &&
                        refreshCounter % widgets[widgetId].options.refreshFrequency == 0) {
                        widgets[widgetId].refresh();
                    }
                }
            }
            setInterval(refreshWidgets, refreshInterval);
        };
        this.init = function() {
            initRefreshInterval();
        };
        this.getWidget = function(widgetId) {
            return widgets[widgetId];
        };
    })();
    addInitFunction(function() {
        WidgetEngine.init();
    });
    window.AjaxEngine = new (function() {
        var requestBuffer = [];
        var callbackBuffer = [];
        var sendBulkRequests = function() {
            var request = {
                requests: requestBuffer
            };
            var requestString = JSON.stringify(request);
            requestBuffer = [];
            var callbacks = callbackBuffer;
            callbackBuffer = [];
            $.ajax({
                url: Config.ServerHost + "/services/bulk.jsp",
                dataType: "jsonp",
                jsonp: "jsonp_callback",
                crossDomain: true,
                data: {
                    data: requestString
                },
                success: function(response) {
                    if (response.code == 0) {
                        var responses = response.responses;
                        for (var i = 0; i < responses.length; ++i) {
                            var responseElem = responses[i];
                            if (responseElem.code == 0 && typeof callbacks[i].callbackSuccess != "undefined") {
                                callbacks[i].callbackSuccess(responseElem);
                            }
                            if (responseElem.code != 0 && typeof callbacks[i].callbackError != "undefined") {
                                callbacks[i].callbackError(responseElem);
                            }
                            if (typeof callbacks[i].callbackComplete != "undefined") {
                                callbacks[i].callbackComplete(responseElem);
                            }
                        }
                    } else {
                        alert("Error while bulk request sending. Message: '"+response +"'.");
                    }
                },
                error: function(response) {
                    alert("Error while bulk request sending. Message: '"+response + "'.");
                }
            });
        };
        this.sendBulkRequest = function(jsonRequest, callbackSuccess, callbackError, callbackComplete) {
            if (requestBuffer.length == 0) {
                setTimeout(sendBulkRequests, 1);
            }
            requestBuffer.push(jsonRequest);
            callbackBuffer.push({
                callbackSuccess: callbackSuccess,
                callbackError: callbackError,
                callbackComplete: callbackComplete
            });

        };
        this.sendSimpleRequest = function(jsonRequest, callbackSuccess, callbackError, callbackComplete) {
            var request = {
                requests: [jsonRequest]
            };
            var requestString = JSON.stringify(request);
            $.ajax({
                url: Config.ServerHost + "/services/bulk.jsp",
                dataType: "jsonp",
                method: "post",
                jsonp: "jsonp_callback",
                crossDomain: true,
                data: {
                    data: requestString
                },
                success: function(response) {
                    if (response.code == 0) {
                        var responseElem = response.responses[0];
                        if (responseElem.code == 0 && typeof callbackSuccess != "undefined") {
                            callbackSuccess(responseElem);
                        }
                        if (responseElem.code != 0 && typeof callbackError != "undefined") {
                            callbackError(responseElem);
                        }
                        if (typeof callbackComplete != "undefined") {
                            callbackComplete(responseElem);
                        }
                    } else {
                        alert("Error while bulk request sending. Message: '"+response +"'.");
                    }
                },
                error: function(response) {
                     alert("Error while bulk request sending. Message: '"+response +"'.");
                }
            });
        };
    })();
    window.PageEngine = new (function() {
        var that = this;
        this.initPage = function(pageClass, container) {
            AjaxEngine.sendBulkRequest({
                requestProcessor: pageClass,
                action: "get_content"
            }, function(response) {
                $(container).html(response.content);
            }, function(response) {
                if (response.code == 2) {
                    location = response.url;
                }
            })
        };
    })();
})(jQuery);
