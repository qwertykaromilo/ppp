(function($){
    var InitFuncs = [];
    window.addInitFunction = function(func) {
        var item = func;
        if (typeof func != "function") {
            item = Function(func);
        }
        InitFuncs.push(item);
    };
    $(function() {
        for (var i = 0; i < InitFuncs.length; ++i) {
            InitFuncs[i]();
        }
    });
    window.ClientCache = {
        get: function(key){
            if (typeof sessionStorage == "undefined") {
                return null;
            }
            return sessionStorage.getItem(key);
        },
        set: function(key, value) {
            if (typeof sessionStorage == "undefined") {
                return;
            }
            var prevValue = this.get(key);
            sessionStorage.setItem(key, value);
            return prevValue;
        }
    };
    window.ObjectCache = {
        get: function(key){
            var res = ClientCache.get(key);
            if (res == null) return null;
            return JSON.parse(res);
        },
        set: function(key, value) {
            var prevValue = this.get(key);
            ClientCache.set(key, JSON.stringify(value));
            return prevValue;
        }
    };
    window.LoadingHelper = {
        setLoading: function(timeout) {
            $("#loadingDialog").modal('show');
            if (timeout) setTimeout(LoadingHelper.unsetLoading, timeout);
        },
        unsetLoading: function() {
            $("#loadingDialog").modal('hide');
        }

    };
    window.FormHelper = {
        getFormData: function(container) {
            var elems = $(container).find("input, select, textarea")
            var data = {};
            for (var i = 0; i < elems.length; ++i) {
                var elem = elems[i];
                var name = $(elem).attr("name");
                var value = $(elem).val();
                if ($(elem).attr("type") == "checkbox") {
                    value = $(elem).prop("checked") + "";
                }
                if (name && name.length > 0) {
                    data[name] = value;
                }
            }
            return data;
        }
    };
    window.Alerts_old = {
        success: function(msg) {
            $("#alertDialog").removeClass("error");
            $("#alertDialog").addClass("success");
            Alerts.showMsg(msg, 1000);
        },
        error :function(msg) {
            $("#alertDialog").addClass("error");
            $("#alertDialog").removeClass("success");
            Alerts.showMsg(msg, 3000);
        },
        showMsg: function(msg, timeout) {
            $("#alertDialog .modal-body").text(msg);
            $("#alertDialog").modal('show');
            setTimeout(function() {
                $("#alertDialog").modal('hide');
            }, timeout);
        }
    };
    window.Alerts = {
        success: function(msg) {
            $.notify(msg, "success", {
                autoHideDelay: 700
            });
        },
        error :function(msg) {
            $.notify(msg, "error", {
                autoHideDelay: 3000
            });
        }
    };
    window.Dialogs = {
        prepareAndShowLogin: function() {
            var dialog = $('#loginDialog');
            dialog.find('[name="email"]').val('');
            dialog.find('[name="password"]').val('');
            dialog.modal("show");
        },
        hideLogin: function() {
            var dialog = $('#loginDialog');
            dialog.modal("hide");
        },
        prepareAndShowRegister: function() {
            var dialog = $('#registerDialog');
            dialog.find('[name="email"]').val('');
            dialog.modal("show");
        },
        hideRegister: function() {
            var dialog = $('#registerDialog');
            dialog.modal("hide");
        },
        prepareAndShowSetupExpress: function(templateId) {
            var dialog = $('#setupExpressDialog');
            dialog.find('.tab2').click();
            dialog.find('[name="templateId"]').val(templateId);
            dialog.modal("show");
        },
        hideSetupExpress: function() {
            var dialog = $('#setupExpressDialog');
            dialog.modal("hide");
        },
        prepareAndShowCallback: function() {
            var dialog = $('#callbackDialog');
            dialog.find('[name="phone"]').val('+7');
            dialog.modal("show");
        },
        hideCallback: function() {
            var dialog = $('#callbackDialog');
            dialog.modal("hide");
        }
    };
    window.logOut = function(redirectURL) {
        AjaxEngine.sendBulkRequest({
            requestProcessor: "com.core.entity.pages.LoginPage",
            action: "logout"
        }, function(response) {

        }, function(response) {
            if (response.code == 2) {
                location = response.url;
            }
        }, function() {
//            LoadingHelper.unsetLoading();
        });
    };
    window.onLoginClick = function(that) {
        var form =  $(that).closest("form");
        form.find(".errMsg").hide();
//        LoadingHelper.setLoading();
        AjaxEngine.sendBulkRequest(FormHelper.getFormData(form), function(response) {

        }, function(response) {
            if (response.code == 1) {
                form.find(".errMsg").html(response.message);
                form.find(".errMsg").show();
            } else if (response.code == 2) {
                location = response.url;
            }
        }, function() {
//            LoadingHelper.unsetLoading();
        });
    };
    window.onCallbackClick = function(that) {
        $(that).find(".errMsg").hide();
        LoadingHelper.setLoading();
        $.ajax({
            url: "/login/ajax.jsp",
            dataType: "json",
            method: "post",
            data: FormHelper.getFormData(that),
            success: function(response) {
                if (response.code == 0) {
                    location.href = "/profile";
                } else if (response.message) {
                    $(that).find(".errMsg").text(response.message);
                    $(that).find(".errMsg").show();
                }
            },
            error: function(response) {
                Alerts.error("server is unavailable");
            },
            complete: function() {
                LoadingHelper.unsetLoading();
            }
        });
    };

    window.sendFiles = function(files, callback, callbackError, callbackComplete) {
        var data = new FormData();
        for (var i = 0; i < files.length; ++i) {
            data.append("file" + i, files[i]);
        }
        callbackError = callbackError || function() {
            Alerts.error("files not sent!");
        };
        $.ajax({
            data: data,
            type: "POST",
            url: "/services/file_upload.jsp",
            cache: false,
            contentType: false,
            processData: false,
            success: function(response) {
                callback(response);
            },
            error: callbackError,
            complete: callbackComplete
        });
    };
    addInitFunction(function(){
        $('.modal').on('show.bs.modal', function (event) {
            var modal = $(this);
//            modal.find('input[type="text"], input[type="password"]').val('');
            modal.find('.errMsg').html('');
        });
        $('body').on('click', function (event) {   //todo
            if ($(window).width() < 768 && $(event.target).closest(".main-top, .modal").length == 0) {
                $("#top-navbar").collapse('hide');
            }
        });

    });
    addInitFunction(function() {
        $('a[href*=#]:not([href=#]).scrollHash').click(function() {
            if (location.pathname.replace(/^\//, '') == this.pathname.replace(/^\//, '') || location.hostname == this.hostname) {
                var target = $(this.hash);
                if (target.length == 0) return true;
                target = target.length ? target : $('[name=' + this.hash.slice(1) + ']');
                if (target.length) {
                    var targetTop = target.offset().top - $(".top-nav").height();
                    if (targetTop < 0) targetTop = 0;
                    $('html,body').stop(true);
                    $('html,body').animate({
                        scrollTop: targetTop-$(".main-top").height()
                    }, 700);
                    return false;
                }
            }
        });
    });
    var lastUniqueId = 0;
    window.generateId = function(prefix) {
        prefix = prefix || "";
        return prefix + (lastUniqueId++);
    };
    window.deepClone = function(obj) {
        return JSON.parse(JSON.stringify(obj));
    };
    window.setTitle
})(jQuery);
