"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.injector = exports.Injector = void 0;

var _singleton = require("./helpers/singleton");

var _errors = require("./errors");

function _typeof(obj) { if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") { _typeof = function _typeof(obj) { return typeof obj; }; } else { _typeof = function _typeof(obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; }; } return _typeof(obj); }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } }

function _createClass(Constructor, protoProps, staticProps) { if (protoProps) _defineProperties(Constructor.prototype, protoProps); if (staticProps) _defineProperties(Constructor, staticProps); return Constructor; }

function _possibleConstructorReturn(self, call) { if (call && (_typeof(call) === "object" || typeof call === "function")) { return call; } return _assertThisInitialized(self); }

function _assertThisInitialized(self) { if (self === void 0) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return self; }

function _getPrototypeOf(o) { _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf : function _getPrototypeOf(o) { return o.__proto__ || Object.getPrototypeOf(o); }; return _getPrototypeOf(o); }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function"); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, writable: true, configurable: true } }); if (superClass) _setPrototypeOf(subClass, superClass); }

function _setPrototypeOf(o, p) { _setPrototypeOf = Object.setPrototypeOf || function _setPrototypeOf(o, p) { o.__proto__ = p; return o; }; return _setPrototypeOf(o, p); }

var Injector =
/*#__PURE__*/
function (_Singleton) {
  _inherits(Injector, _Singleton);

  function Injector() {
    var _this;

    _classCallCheck(this, Injector);

    _this = _possibleConstructorReturn(this, _getPrototypeOf(Injector).call(this)); // init with empty depenency container

    _this.container = [];
    return _this;
  }
  /**
   * Returns instance of demanded class
   *
   * helper - no dependecies
   * libs - helpers, (not another libs)
   * sharedService - libs, helpers,
   * service - libs, helpers, sharedService
   * controller - all
   *
   * @param {Class | String} Injected // demanded class or it's token
   * @return {Object} // instance of demanded class
   * @memberof Injector
   */


  _createClass(Injector, [{
    key: "get",
    value: function get(Injected) {
      // console.log('Injected', Injected && Injected.name ? Injected.name : Injected);
      if (typeof Injected !== 'string' && !(Injected instanceof Function)) {
        throw new _errors.ServerError({
          message: 'injected object type error: ' + _typeof(Injected)
        });
      } // if cointainer is not empty


      if (this.container.length) {
        // looking for instance of demanded class in container
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this.container[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var item = _step.value;

            if (item.name === (typeof Injected === 'string' ? Injected : Injected.name)) {
              return item.instance;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator["return"] != null) {
              _iterator["return"]();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }
      }

      ;

      if (typeof Injected === 'string') {
        throw new _errors.ServerError({
          message: 'injected class is not in container'
        });
      } // if container is empty or there's no instance
      // of demanded class in container
      // then create new instance


      var injectedClass = new Injected();
      console.log('New', Injected.name);
      this.container.push({
        name: Injected.name,
        instance: injectedClass
      }); // if (Injected.name === 'Config') {
      //   console.log('Config inj', injectedClass);
      // }

      return injectedClass;
    }
  }]);

  return Injector;
}(_singleton.Singleton);

exports.Injector = Injector;
var injector = new Injector();
exports.injector = injector;