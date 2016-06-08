/// <reference path="../../typings/simplemde/simplemde.d.ts" />
/// <reference path="../../typings/umbraco/umbraco.d.ts" />
var SimpleMDE;
(function (SimpleMDE) {
    "use strict";
    var SimpleMDEController = (function () {
        function SimpleMDEController($scope, $timeout, dialogService) {
            var _this = this;
            this.$scope = $scope;
            this.$timeout = $timeout;
            this.dialogService = dialogService;
            this.toolbars = [
                {
                    name: "bold",
                    action: SimpleMDE.toggleBold,
                    className: "fa fa-bold",
                    title: "Bold",
                },
                {
                    name: "bold",
                    action: SimpleMDE.toggleItalic,
                    className: "fa fa-italic",
                    title: "Italic",
                },
                {
                    name: "bold",
                    action: SimpleMDE.toggleHeadingSmaller,
                    className: "fa fa-italic",
                    title: "Italic",
                },
                "|",
                {
                    name: "quote",
                    action: SimpleMDE.toggleBlockquote,
                    className: "fa fa-quote-left",
                    title: "Quote"
                },
                {
                    name: "unordered-list",
                    action: SimpleMDE.toggleUnorderedList,
                    className: "fa fa-list-ul",
                    title: "Generic List"
                },
                {
                    name: "ordered-list",
                    action: SimpleMDE.toggleOrderedList,
                    className: "fa fa-list-ol",
                    title: "Numbered List"
                },
                "|",
                {
                    name: "umbracofile",
                    action: function (editor) { _this.insertImage(editor); },
                    className: "fa fa-picture-o",
                    title: "Insert image"
                },
                {
                    name: "umbracolink",
                    action: function (editor) { _this.insertLink(editor); },
                    className: "fa fa-link",
                    title: "Insert link"
                },
                "|",
                {
                    name: "preview",
                    action: SimpleMDE.togglePreview,
                    className: "fa fa-eye no-disable",
                    title: "Toggle Preview"
                }];
            if (angular.isUndefined($scope.model.value)) {
                $scope.model.value = "";
            }
            $scope.editorConfig = {
                spellChecker: false,
                toolbar: this.toolbars
            };
            $scope.$on('simplemde', function (event, simplemde) {
                $scope.editor = simplemde;
            });
            $('.umb-nav-tabs > li > a').on('click', function (e) {
                $timeout(function () {
                    $scope.editor.codemirror.refresh();
                }, 100);
            });
        }
        SimpleMDEController.prototype.insertLink = function (editor) {
            var _this = this;
            this.dialogService.linkPicker({
                callback: function (link) {
                    var cm = editor.codemirror;
                    var state = editor.getState(cm);
                    debugger;
                    var startEnd = ["[", "](" + link.url + ")"];
                    _this._replaceSelection(cm, state.link, startEnd);
                }
            });
        };
        SimpleMDEController.prototype.insertImage = function (editor) {
            var _this = this;
            this.dialogService.mediaPicker({
                callback: function (media) {
                    var cm = editor.codemirror;
                    var state = editor.getState(cm);
                    debugger;
                    var startEnd = ["![", "](" + media.image + ")"];
                    _this._replaceSelection(cm, state.link, startEnd);
                },
                onlyImages: true
            });
        };
        SimpleMDEController.prototype._replaceSelection = function (cm, state, startEnd) {
            if (/editor-preview-active/.test(cm.getWrapperElement().lastChild.className))
                return;
            var text;
            var start = startEnd[0];
            var end = startEnd[1];
            var startPoint = cm.getCursor("start");
            var endPoint = cm.getCursor("end");
            if (state) {
                text = cm.getLine(startPoint.line);
                start = text.slice(0, startPoint.ch);
                end = text.slice(startPoint.ch);
                cm.replaceRange(start + end, {
                    line: startPoint.line,
                    ch: 0
                });
            }
            else {
                text = cm.getSelection();
                cm.replaceSelection(start + text + end);
                startPoint.ch += start.length;
                if (startPoint !== endPoint) {
                    endPoint.ch += start.length;
                }
            }
            cm.setSelection(startPoint, endPoint);
            cm.focus();
        };
        SimpleMDEController.prototype.getState = function (cm, pos) {
            pos = pos || cm.getCursor("start");
            var stat = cm.getTokenAt(pos);
            if (!stat.type)
                return {};
            var types = stat.type.split(" ");
            var ret = {}, data, text;
            for (var i = 0; i < types.length; i++) {
                data = types[i];
                if (data === "strong") {
                    ret.bold = true;
                }
                else if (data === "variable-2") {
                    text = cm.getLine(pos.line);
                    if (/^\s*\d+\.\s/.test(text)) {
                        ret["ordered-list"] = true;
                    }
                    else {
                        ret["unordered-list"] = true;
                    }
                }
                else if (data === "atom") {
                    ret.quote = true;
                }
                else if (data === "em") {
                    ret.italic = true;
                }
                else if (data === "quote") {
                    ret.quote = true;
                }
                else if (data === "strikethrough") {
                    ret.strikethrough = true;
                }
                else if (data === "comment") {
                    ret.code = true;
                }
                else if (data === "link") {
                    ret.link = true;
                }
                else if (data === "tag") {
                    ret.image = true;
                }
                else if (data.match(/^header(\-[1-6])?$/)) {
                    ret[data.replace("header", "heading")] = true;
                }
            }
            return ret;
        };
        SimpleMDEController.$inject = ["$scope", "$timeout", "dialogService"];
        return SimpleMDEController;
    }());
    var umbracoModule = angular.module("umbraco");
    angular.module("umbraco").requires.push("ui.simplemde");
    umbracoModule.controller("SimpleMDEController", SimpleMDEController);
})(SimpleMDE || (SimpleMDE = {}));
//# sourceMappingURL=simplemde.controller.js.map