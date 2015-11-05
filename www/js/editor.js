(function ($) {
    window.saveConfiguration = saveConfiguration;
    var thisInstanceConfiguration = window.thisInstanceConfiguration;
    var thisTemplateConfiguration = window.thisTemplateConfiguration;
    var thisInstanceId = window.thisInstanceId;
    var ParamRenderers = {
        singleString: function(instanceParam, container) {
            var vg = generateId("_vg_");
            window[vg] = function() {
                return instanceParam.value;
            };
            var res = $('<div class="row form-group config-param" valueGetter="'+vg+'">');
            var valDiv = $('<div class="col-xs-10">');
            var inp = $('<input class="form-control"/>');
            if (typeof instanceParam.value != "undefined") inp.val(instanceParam.value);
            valDiv.append(inp);
            inp.on("input", function(){
                instanceParam.value = inp.val();
                onConfigurationChanged();
            });
            res.append($('<label class="col-xs-2 control-label">'+instanceParam.title+'</label>'));
            res.append(valDiv);
            container.append(res);
        },
        singleCheckbox: function(instanceParam, container) {
            var vg = generateId("_vg_");
            window[vg] = function() {
                return instanceParam.value;
            };
            var res = $('<div class="form-group config-param" valueGetter="'+vg+'">');
            res.append('<div class="checkbox"><label><input type="checkbox"/>' +
                instanceParam.title + '</label></div>');
            var checkbox = res.find('input');
            if (typeof instanceParam.value != "undefined") checkbox.prop('checked', instanceParam.value);
            checkbox.on("change", function(){
                instanceParam.value = checkbox.prop('checked');
                onConfigurationChanged();
            });
            container.append(res);
        },
        singleFile: function(instanceParam, container) {
            var vg = generateId("_vg_");
            window[vg] = function() {
                return instanceParam.value;
            };
            var res = $('<div class="row form-group config-param" valueGetter="'+vg+'">');
            var valDiv = $('<div class="col-xs-10 singleFileInput">');
            var hidInp = $('<input type="hidden"/>');
            var inp = $('<input type="file">');
            if (typeof instanceParam.value != "undefined") {
                hidInp.val(instanceParam.value);
            }
            hidInp.on("input", function(){
                instanceParam.value = hidInp.val();
                onConfigurationChanged();
            });
            valDiv.append(inp);
            valDiv.append(hidInp);
            res.append($('<label class="col-xs-2 control-label">'+instanceParam.title+'</label>'));
            res.append(valDiv);
            container.append(res);
            var initPreview = undefined;
            if (typeof instanceParam.value != "undefined" && instanceParam.value.length > 0) initPreview = ["<img src='"+instanceParam.value+"' class='file-preview-image'>"];
            $(inp).fileinput({
                language: 'ru',
                maxFileCount: 1,
                autoReplace: true,
                showPreview: true,
                initialPreview: initPreview,
                uploadUrl: '/services/file_upload.jsp',
                allowedFileExtensions : instanceParam.options.exts,
                overwriteInitial: true,
                maxFileSize: 5000
            });
            $(inp).on('fileuploaded', function(event, data, previewId, index) {
                var form = data.form,
                    files = data.files,
                    extra = data.extra,
                    response = data.response,
                    reader = data.reader;
                if (response.code == 0) {
                    hidInp.val(response.params.file_data_file).trigger("input");
                }
            });
            $(inp).on('fileclear', function(event, key) {
                hidInp.val("").trigger("input");
            });
            var onFileSelected = function() {
                $(inp).fileinput('upload');
            };
            $(inp).on('filebatchselected', function(event, files) {
                onFileSelected();
            });
        },
        singleRichText: function(instanceParam, container) {
            var vg = generateId("_vg_");
            window[vg] = function() {
                return instanceParam.value;
            };
            var res = $('<div class="row form-group config-param" valueGetter="'+vg+'">');
            var valDiv = $('<div class="col-xs-10">');
            var hidInp = $('<input type="hidden"/>');
            var inp = $('<div class="singleRichTextInput">');
            valDiv.append(inp);
            valDiv.append(hidInp);
            res.append($('<label class="col-xs-2 control-label">'+instanceParam.title+'</label>'));
            res.append(valDiv);
            container.append(res);
            var onImageUploaded = function(response, count) {
                if (response.code == 0) {
                    for (var j = 0; j < count; ++j) {
                        $(inp).summernote('insertImage', response.params["file"+j+"_file"], response.params["file"+j+"_file"]);
                    }
                } else {
                    Alerts.error(response.message);
                }
            };
            var initPreview = undefined;
            if (typeof instanceParam.value != "undefined" && instanceParam.value.length > 0) initPreview = ["<img src='"+instanceParam.value+"' class='file-preview-image'>"];
            $(inp).summernote({
                height: 200,
                onChange: function(contents, $editable) {
                    hidInp.val(contents).trigger('input');
                },
                onImageUpload: function(files) {
                    console.log("files: ");
                    console.log(files);
                    LoadingHelper.setLoading();
                    sendFiles(files, function(response){
                        onImageUploaded(response, files.length);
                    }, undefined, function() {
                        LoadingHelper.unsetLoading();
                    });

                }
            });
            if (typeof instanceParam.value != "undefined") {
                hidInp.val(instanceParam.value);
                $(inp).code(instanceParam.value);
            }
            hidInp.on("input", function(){
                instanceParam.value = hidInp.val();
                onConfigurationChanged();
            });
        },
        singleColor: function(instanceParam, container) {
            var vg = generateId("_vg_");
            window[vg] = function() {
                return instanceParam.value;
            };
            var res = $('<div class="row form-group config-param" valueGetter="'+vg+'">');
            var valDiv = $('<div class="col-xs-10">');
            var inpGroup = $('<div class="input-group">');
            var inp = $('<input class="form-control"/>');
            var addOn = $('<span class="input-group-addon"><i></i></span>');
            inpGroup.append(addOn);
            inpGroup.append(inp);
            valDiv.append(inpGroup);
            res.append($('<label class="col-xs-2 control-label">'+instanceParam.title+'</label>'));
            res.append(valDiv);
            container.append(res);
            $(inpGroup).colorpicker();
            if (typeof instanceParam.value != "undefined" && instanceParam.value.length > 0) {
                $(inpGroup).colorpicker('setValue', instanceParam.value);
                $(inp).val(instanceParam.value);
            }
            inp.on("input", function(){
                instanceParam.value = inp.val();
                onConfigurationChanged();
            });
        },
        multipleBlock: function(instanceParam, container) {
            var vg = generateId("_vg_");
            window[vg] = function() {
                return instanceParam.value;
            };
            var res = $('<div class="row form-group config-param" valueGetter="'+vg+'">');
            var valDiv = $('<div class="col-xs-10">');
            res.append($('<label class="col-xs-2 control-label">'+instanceParam.title+'</label>'));
            res.append(valDiv);
            container.append(res);
            var blockHTML = '<div class="config-block config-block-in">' +
                '<div class="panel panel-default">' +
                '<div class="panel-heading profile-editor-settings-panel-heading" role="tab">' +
                '<div class="row">' +
                '<a role="button" data-toggle="collapse" href="#config-block-settings-{uniqueId}" aria-expanded="false">' +
                '<div class="col-xs-10 config-block-settings-inner">' +
                '<h4 class="panel-title"></h4>' +
                '</div></a>' +
                '<div class="col-xs-2 config-block-settings-inner">' +
                '<div class="config-block-toolbar"></div>' +
                '</div></div>' +
                '</div>' +
                '<div id="config-block-settings-{uniqueId}" class="config-block-settings panel-collapse collapse " role="tabpanel"><div class="panel-body">' +
                '</div></div></div></div>';
            var addFunction = function() {
                var instBlock = deepClone(templateBlock);
                instanceParam.value.push(instBlock);
                renderInBlock(instBlock);
                onConfigurationChanged();
                console.log(instanceParam.value);
            };
            var btnAdd = $('<button class="btn btn-primary btn-param-elem-add">');
            btnAdd.text("Добавить");
            btnAdd.click(addFunction);
            valDiv.append($('<div class="row">').append($('<div class="col-md-12">').append(btnAdd)));
            var blocksContainer = $('<div class="blockContainer">');
            valDiv.append(blocksContainer);
            var templateBlock = instanceParam.options.templateBlock;
            if (typeof instanceParam.value == "undefined") instanceParam.value = [];
            for (var i = 0; i < instanceParam.value.length; ++i) {
                var instanceBlock = instanceParam.value[i];
                renderInBlock(instanceBlock);
            }
            function renderInBlock(instanceBlock) {
                var blockCnt = $(blockHTML.replace(/{uniqueId}/g, generateId("inner-block-")));
                function setConfigBlockTitle(){
                    if (typeof templateBlock.titleParamIndex != "undefined" && templateBlock.titleParamIndex >= 0) {
                        blockCnt.find(".panel-title").text(instanceBlock.params[instanceBlock.titleParamIndex].value);
                    } else {
                        blockCnt.find(".panel-title").text("Элемент");
                    }
                }
                setConfigBlockTitle();
                blockCnt.on("onConfigurationChanged", setConfigBlockTitle);
                blockCnt.find(".config-block-toolbar").append($('<a class="btn btn-param-elem-moveDown"><i class="fa fa-arrow-down"></i></a>' +
                    '<a class="btn btn-param-elem-moveUp"><i class="fa fa-arrow-up"></i></a>' +
                    '<a class="btn btn-param-elem-delete">удалить</a>'));
                blockCnt.find(".btn-param-elem-delete").click(function() {
                    var ind = instanceParam.value.indexOf(instanceBlock);
                    instanceParam.value.splice(ind, 1);
                    blockCnt.remove();
                    onConfigurationChanged();
                    console.log(instanceParam.value);
                });
                blockCnt.find(".btn-param-elem-moveUp").click(function() {
                    var ind = instanceParam.value.indexOf(instanceBlock);
                    if (ind > 0) {
                        blockCnt.prev().before(blockCnt);
                        var t = instanceBlock;
                        instanceParam.value[ind] = instanceParam.value[ind-1];
                        instanceParam.value[ind-1] = t;
                        onConfigurationChanged();
                    }
                    console.log(instanceParam.value);
                });
                blockCnt.find(".btn-param-elem-moveDown").click(function() {
                    var ind = instanceParam.value.indexOf(instanceBlock);
                    if (ind < instanceParam.value.length-1) {
                        blockCnt.before(blockCnt.next());
                        var t = instanceBlock;
                        instanceParam.value[ind] = instanceParam.value[ind+1];
                        instanceParam.value[ind+1] = t;
                        onConfigurationChanged();
                    }
                    console.log(instanceParam.value);
                });
                var panel = blockCnt.find(".panel-body");
                var params = instanceBlock.params;
                for (var pi = 0; pi < params.length; ++pi) {
                    var param = params[pi];
                    renderParam(param, panel);
                }
                blocksContainer.append(blockCnt);
            }
        }
    };
    var saveTimer = undefined;
    function onConfigurationChanged() {
        $(".config-block-in").trigger("onConfigurationChanged");
        $(".profile-editor-top-menu .saveButton").removeAttr("disabled");
        if (typeof saveTimer != "undefined") clearTimeout(saveTimer);
        saveTimer = setTimeout(function(){
            saveConfiguration(true);
        }, 1000);
    }
    ParamRenderers._default = ParamRenderers.singleString;
    function initEditor() {
        initSettings();
    }
    function saveConfiguration(inBg) {
        if (typeof saveTimer != "undefined") clearTimeout(saveTimer);
        if (!inBg) LoadingHelper.setLoading();
        var config = getStringConfiguration();
        $.ajax({
            url: "/profile/editor/ajax.jsp",
            dataType: "json",
            method: "post",
            data: {
                action: "saveConfig",
                instanceId: thisInstanceId,
                config: config
            },
            success: function(response) {
                if (response.code == 0) {
                    console.log("config saved");
                    $(".profile-editor-top-menu .saveButton").attr("disabled", "disabled");
                } else {
                    Alerts.error(response.message);
                }
            },
            error: function(response) {
                Alerts.error("error");
            },
            complete: function() {
                if (!inBg)LoadingHelper.unsetLoading();
            }
        });
    }
    function getStringConfiguration() {
        return JSON.stringify(thisInstanceConfiguration);
    }
    function initSettings() {
        var settings = thisInstanceConfiguration.settings;
        for (var i = 0; i < settings.length; ++i) {
            var blocks = settings[i].blocks;
            for (var bi = 0; bi < blocks.length; ++bi) {
                var block = blocks[bi];
                var blockId = block.id;
                var panel = $("#config-block-settings-"+block.id+" .panel-body");
                var isEnabled = $("#config-block-"+block.id+" > .isEnabled");
                if (block.isEnabledParam) renderParam(block.isEnabledParam, isEnabled);
                var params = block.params;
                for (var pi = 0; pi < params.length; ++pi) {
                    var param = params[pi];
                    renderParam(param, panel);
                }
            }
        }
    }
    function renderParam(instanceParam, container) {
        if (typeof instanceParam.options == "undefined") instanceParam.options = {};
        var renderFunction = ParamRenderers._default;
        if (typeof ParamRenderers[instanceParam.renderer] != "undefined") {
            renderFunction = ParamRenderers[instanceParam.renderer];
        }
        renderFunction(instanceParam, container);
    }
    initEditor();
})(jQuery);
