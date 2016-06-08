/// <reference path="../../typings/simplemde/simplemde.d.ts" />
angular.module('ui.simplemde', [])
    .directive('uiSimplemde', function ($timeout) {
    return {
        restrict: "EA",
        require: "?ngModel",
        link: postLink
    };
    function postLink(scope, iElement, iAttrs, ngModelCtrl) {
        var textarea = document.createElement("textarea");
        iElement.append(textarea);
        console.log(scope.$eval(iAttrs.ngConfig));
        debugger;
        var editorConfig = angular.extend({ initialValue: '', element: textarea }, scope.$eval(iAttrs.ngConfig));
        var simplemde = new SimpleMDE(editorConfig);
        ngModelLink(scope, simplemde, ngModelCtrl);
        // Allow access to the SimpleMDE instance through a broadcasted event
        // child to parent
        scope.$emit('simplemde', simplemde);
        // Refresh codemirror on dom loaded
        scope.$eval(function () {
            simplemde.codemirror.refresh();
        });
    }
    function ngModelLink(scope, simplemde, ngModelCtrl) {
        if (!ngModelCtrl) {
            return;
        }
        // CodeMirror expects a string, so make sure it gets one.
        // This does not change the model.
        ngModelCtrl.$formatters.push(function (value) {
            if (angular.isUndefined(value) || value === null) {
                return '';
            }
            else if (angular.isObject(value) || angular.isArray(value)) {
                throw new Error('ui-simplemde cannot use an object or an array as a model');
            }
            return value;
        });
        // Override the ngModelController $render method, which is what gets called when the model is updated.
        // This takes care of the synchronizing the codeMirror element with the underlying model, in the case that it is changed by something else.
        ngModelCtrl.$render = function () {
            var safeViewValue = ngModelCtrl.$modelValue || ngModelCtrl.$viewValue || '';
            simplemde.value(safeViewValue);
            $timeout(function () {
                simplemde.codemirror.refresh();
            }, 1);
        };
        // Keep the ngModel in sync with changes from CodeMirror
        simplemde.codemirror.on('change', function () {
            var newValue = simplemde.value();
            if (newValue !== ngModelCtrl.$viewValue) {
                ngModelCtrl.$setViewValue(newValue);
            }
        });
    }
});
//# sourceMappingURL=simplemde.directive.js.map