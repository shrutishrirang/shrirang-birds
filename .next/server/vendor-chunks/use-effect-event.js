"use strict";
/*
 * ATTENTION: An "eval-source-map" devtool has been used.
 * This devtool is neither made for production nor for readable output files.
 * It uses "eval()" calls to create a separate source file with attached SourceMaps in the browser devtools.
 * If you are trying to read the output file, select a different devtool (https://webpack.js.org/configuration/devtool/)
 * or disable the default devtool with "devtool: false".
 * If you are looking for production-ready output files, see mode: "production" (https://webpack.js.org/configuration/mode/).
 */
exports.id = "vendor-chunks/use-effect-event";
exports.ids = ["vendor-chunks/use-effect-event"];
exports.modules = {

/***/ "(ssr)/./node_modules/use-effect-event/dist/index.js":
/*!*****************************************************!*\
  !*** ./node_modules/use-effect-event/dist/index.js ***!
  \*****************************************************/
/***/ ((__unused_webpack___webpack_module__, __webpack_exports__, __webpack_require__) => {

eval("__webpack_require__.r(__webpack_exports__);\n/* harmony export */ __webpack_require__.d(__webpack_exports__, {\n/* harmony export */   useEffectEvent: () => (/* binding */ useEffectEvent)\n/* harmony export */ });\n/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ \"(ssr)/./node_modules/next/dist/server/future/route-modules/app-page/vendored/ssr/react.js\");\n\nconst context = react__WEBPACK_IMPORTED_MODULE_0__.createContext(!0);\nfunction forbiddenInRender() {\n  throw new Error(\"A function wrapped in useEffectEvent can't be called during rendering.\");\n}\nconst isInvalidExecutionContextForEventFunction = \"use\" in react__WEBPACK_IMPORTED_MODULE_0__ ? () => {\n  try {\n    return react__WEBPACK_IMPORTED_MODULE_0__.use(context);\n  } catch {\n    return !1;\n  }\n} : () => !1;\nfunction useEffectEvent(fn) {\n  const ref = react__WEBPACK_IMPORTED_MODULE_0__.useRef(forbiddenInRender);\n  return react__WEBPACK_IMPORTED_MODULE_0__.useInsertionEffect(() => {\n    ref.current = fn;\n  }, [fn]), (...args) => {\n    isInvalidExecutionContextForEventFunction() && forbiddenInRender();\n    const latestFn = ref.current;\n    return latestFn(...args);\n  };\n}\n\n//# sourceMappingURL=index.js.map\n//# sourceURL=[module]\n//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiKHNzcikvLi9ub2RlX21vZHVsZXMvdXNlLWVmZmVjdC1ldmVudC9kaXN0L2luZGV4LmpzIiwibWFwcGluZ3MiOiI7Ozs7O0FBQTBCO0FBQzFCLGdCQUFnQixnREFBbUI7QUFDbkM7QUFDQTtBQUNBO0FBQ0Esa0RBQWtELDJDQUFjO0FBQ2hFO0FBQ0EsV0FBVyxzQ0FBUztBQUNwQixJQUFJO0FBQ0o7QUFDQTtBQUNBLEVBQUU7QUFDRjtBQUNBLGNBQWMseUNBQVk7QUFDMUIsU0FBUyxxREFBd0I7QUFDakM7QUFDQSxHQUFHO0FBQ0g7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUdFO0FBQ0YiLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9zaHJpcmFuZy1iaXJkcy8uL25vZGVfbW9kdWxlcy91c2UtZWZmZWN0LWV2ZW50L2Rpc3QvaW5kZXguanM/ZGQ4NiJdLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgUmVhY3QgZnJvbSBcInJlYWN0XCI7XG5jb25zdCBjb250ZXh0ID0gUmVhY3QuY3JlYXRlQ29udGV4dCghMCk7XG5mdW5jdGlvbiBmb3JiaWRkZW5JblJlbmRlcigpIHtcbiAgdGhyb3cgbmV3IEVycm9yKFwiQSBmdW5jdGlvbiB3cmFwcGVkIGluIHVzZUVmZmVjdEV2ZW50IGNhbid0IGJlIGNhbGxlZCBkdXJpbmcgcmVuZGVyaW5nLlwiKTtcbn1cbmNvbnN0IGlzSW52YWxpZEV4ZWN1dGlvbkNvbnRleHRGb3JFdmVudEZ1bmN0aW9uID0gXCJ1c2VcIiBpbiBSZWFjdCA/ICgpID0+IHtcbiAgdHJ5IHtcbiAgICByZXR1cm4gUmVhY3QudXNlKGNvbnRleHQpO1xuICB9IGNhdGNoIHtcbiAgICByZXR1cm4gITE7XG4gIH1cbn0gOiAoKSA9PiAhMTtcbmZ1bmN0aW9uIHVzZUVmZmVjdEV2ZW50KGZuKSB7XG4gIGNvbnN0IHJlZiA9IFJlYWN0LnVzZVJlZihmb3JiaWRkZW5JblJlbmRlcik7XG4gIHJldHVybiBSZWFjdC51c2VJbnNlcnRpb25FZmZlY3QoKCkgPT4ge1xuICAgIHJlZi5jdXJyZW50ID0gZm47XG4gIH0sIFtmbl0pLCAoLi4uYXJncykgPT4ge1xuICAgIGlzSW52YWxpZEV4ZWN1dGlvbkNvbnRleHRGb3JFdmVudEZ1bmN0aW9uKCkgJiYgZm9yYmlkZGVuSW5SZW5kZXIoKTtcbiAgICBjb25zdCBsYXRlc3RGbiA9IHJlZi5jdXJyZW50O1xuICAgIHJldHVybiBsYXRlc3RGbiguLi5hcmdzKTtcbiAgfTtcbn1cbmV4cG9ydCB7XG4gIHVzZUVmZmVjdEV2ZW50XG59O1xuLy8jIHNvdXJjZU1hcHBpbmdVUkw9aW5kZXguanMubWFwXG4iXSwibmFtZXMiOltdLCJzb3VyY2VSb290IjoiIn0=\n//# sourceURL=webpack-internal:///(ssr)/./node_modules/use-effect-event/dist/index.js\n");

/***/ })

};
;