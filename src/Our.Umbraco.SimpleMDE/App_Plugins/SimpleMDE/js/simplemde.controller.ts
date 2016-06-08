/// <reference path="../../typings/simplemde/simplemde.d.ts" />
/// <reference path="../../typings/umbraco/umbraco.d.ts" />

module SimpleMDE {
    "use strict";

    interface ILinkPickerObject {
        id: string;
        name: string;
        target: string;
        url: string;
    }

    interface IMediaPickerObject {
        name: string;
        id: number;
        isFolder: boolean;
        thumbnail: string;
        image: string;
    }


    interface ISimpleMDEControllerScope extends ng.IScope {
        model: {
            value: string;
            config: {
                defaults: {}
            };
        };
        filenameChange: () => void;
        toggleAutoHeight: () => void;
        loaded: (editor: CodeMirror.Editor) => void;
        editorConfig: SimpleMDE.Configuration;
        editor: SimpleMDE;
    }

    interface ISimpleMDEController {

    }

    class SimpleMDEController implements ISimpleMDEController {
        static $inject: string[] = ["$scope", "$timeout", "dialogService"];
        private defaults;
        private toolbars = <({}|string)>[
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
                action: (editor) => { this.insertImage(editor); },
                className: "fa fa-picture-o",
                title: "Insert image"
            },
            {
                name: "umbracolink",
                action: (editor) => { this.insertLink(editor) },
                className: "fa fa-link",
                title: "Insert link"
            },
            "|",
            {
                name: "preview",
                action: SimpleMDE.togglePreview,
                className: "fa fa-eye no-disable",
                title: "Toggle Preview"
            }]

        constructor(private $scope: ISimpleMDEControllerScope,
            private $timeout: ng.ITimeoutService,
            private dialogService: umb.services.IDialogService) {

            if (angular.isUndefined($scope.model.value)) {
                $scope.model.value = "";
            }

            $scope.editorConfig = {
                spellChecker: false,
                toolbar: this.toolbars
            };

            $scope.$on('simplemde', (event, simplemde) => {
                $scope.editor = simplemde;
            });

            $('.umb-nav-tabs > li > a').on('click', (e) => {
                $timeout(() => {
                    $scope.editor.codemirror.refresh();
                }, 100);
            });
        }

        public insertLink(editor) {
            this.dialogService.linkPicker({
                callback: (link: ILinkPickerObject) => {
                    var cm = editor.codemirror;
                    var state = editor.getState(cm);
                    debugger;
                    var startEnd = ["[", "](" + link.url + ")"];
                    this._replaceSelection(cm, state.link, startEnd);
                }
            });
        }

        public insertImage(editor) {
            this.dialogService.mediaPicker({
                callback: (media: IMediaPickerObject) => {
                    var cm = editor.codemirror;
                    var state = editor.getState(cm);
                    debugger;
                    var startEnd = ["![", "](" + media.image + ")"];
                    this._replaceSelection(cm, state.link, startEnd);
                },
                onlyImages: true
            })
        }

        public _replaceSelection(cm, state, startEnd) {
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
            } else {
                text = cm.getSelection();
                cm.replaceSelection(start + text + end);

                startPoint.ch += start.length;
                if (startPoint !== endPoint) {
                    endPoint.ch += start.length;
                }
            }
            cm.setSelection(startPoint, endPoint);
            cm.focus();
        }

        public getState(cm: CodeMirror.Editor, pos?: CodeMirror.Position): any {
            pos = pos || (<any>cm).getCursor("start");
            var stat = cm.getTokenAt(pos);
            if (!stat.type) return {};

            var types = stat.type.split(" ");

            var ret: any = {},
                data, text;
            for (var i = 0; i < types.length; i++) {
                data = types[i];
                if (data === "strong") {
                    ret.bold = true;
                } else if (data === "variable-2") {
                    text = (<any>cm).getLine(pos.line);
                    if (/^\s*\d+\.\s/.test(text)) {
                        ret["ordered-list"] = true;
                    } else {
                        ret["unordered-list"] = true;
                    }
                } else if (data === "atom") {
                    ret.quote = true;
                } else if (data === "em") {
                    ret.italic = true;
                } else if (data === "quote") {
                    ret.quote = true;
                } else if (data === "strikethrough") {
                    ret.strikethrough = true;
                } else if (data === "comment") {
                    ret.code = true;
                } else if (data === "link") {
                    ret.link = true;
                } else if (data === "tag") {
                    ret.image = true;
                } else if (data.match(/^header(\-[1-6])?$/)) {
                    ret[data.replace("header", "heading")] = true;
                }
            }
            return ret;
        }
    }

    var umbracoModule = angular.module("umbraco");
    angular.module("umbraco").requires.push("ui.simplemde");
    umbracoModule.controller("SimpleMDEController", SimpleMDEController);
}