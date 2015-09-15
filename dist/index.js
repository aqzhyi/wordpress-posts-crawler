(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'debug', 'request-promise', 'cheerio', 'lodash', 'async', 'colors', 'he', 'html-taiwan-address-digger', 'html-img-digger', 'isostring'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('debug'), require('request-promise'), require('cheerio'), require('lodash'), require('async'), require('colors'), require('he'), require('html-taiwan-address-digger'), require('html-img-digger'), require('isostring'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.debug, global.request, global.$, global._, global.async, global.colors, global.he, global.addressDigger, global.imgDigger, global.isISOString);
    global.index = mod.exports;
  }
})(this, function (exports, module, _debug, _requestPromise, _cheerio, _lodash, _async, _colors, _he, _htmlTaiwanAddressDigger, _htmlImgDigger, _isostring) {
  'use strict';

  var _slicedToArray = (function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i['return']) _i['return'](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError('Invalid attempt to destructure non-iterable instance'); } }; })();

  function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

  var _debug2 = _interopRequireDefault(_debug);

  var _request = _interopRequireDefault(_requestPromise);

  var _$ = _interopRequireDefault(_cheerio);

  var _2 = _interopRequireDefault(_lodash);

  var _async2 = _interopRequireDefault(_async);

  var _colors2 = _interopRequireDefault(_colors);

  var _he2 = _interopRequireDefault(_he);

  var _addressDigger = _interopRequireDefault(_htmlTaiwanAddressDigger);

  var _imgDigger = _interopRequireDefault(_htmlImgDigger);

  var _isISOString = _interopRequireDefault(_isostring);

  var ENV = process.env.NODE_ENV || process.env.ENV || 'development';

  var logRoot = (0, _debug2['default'])('wordpress-posts-crawler');
  var logFind = (0, _debug2['default'])('wordpress-posts-crawler:find');

  /**
  @param {object} opts - options
  @param {string} opts.url - Url of blog (wordpress) that you want to crawl the lists.
  @returns {ArticleShallow}
  */
  function findAll() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var FETCH_ALL, URL, log, maxPageNum, HTMLStringOfLists, list, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, HTMLString, items;

    return regeneratorRuntime.async(function findAll$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          FETCH_ALL = opts.fetchAll === true ? true : false;
          URL = _2['default'].isString(opts.url) ? opts.url : null;
          log = (0, _debug2['default'])(logRoot.namespace + ':findAll');

          if (!URL) Promise.reject('Expect findAll({url :string}), but connot find url.');
          log('findAll from URL ' + URL);

          maxPageNum = 1;

          if (!(FETCH_ALL === true)) {
            context$1$0.next = 15;
            break;
          }

          context$1$0.next = 9;
          return regeneratorRuntime.awrap(_request['default'].get(URL));

        case 9:
          context$1$0.t0 = context$1$0.sent;
          maxPageNum = findPageAmount(context$1$0.t0);

          log('fetchAll: ' + FETCH_ALL + ', therefore, we take the articles from all pages of list, there are amount to ' + maxPageNum + ' pages.');

          if (ENV.match(/test/i)) {
            log('ENV: ' + ENV + ', therefore, pages at most 3, no more.');
            maxPageNum = 3;
          }
          context$1$0.next = 17;
          break;

        case 15:
          log('fetchAll: ' + FETCH_ALL + ', we take the articles from only list of page 1.');
          maxPageNum = 1;

        case 17:
          context$1$0.next = 19;
          return regeneratorRuntime.awrap(getAllPages(URL, 1, maxPageNum));

        case 19:
          HTMLStringOfLists = context$1$0.sent;
          list = [];
          _iteratorNormalCompletion = true;
          _didIteratorError = false;
          _iteratorError = undefined;
          context$1$0.prev = 24;
          _iterator = HTMLStringOfLists[Symbol.iterator]();

        case 26:
          if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
            context$1$0.next = 35;
            break;
          }

          HTMLString = _step.value;
          context$1$0.next = 30;
          return regeneratorRuntime.awrap(findArticleList(HTMLString));

        case 30:
          items = context$1$0.sent;

          list = list.concat(items);

        case 32:
          _iteratorNormalCompletion = true;
          context$1$0.next = 26;
          break;

        case 35:
          context$1$0.next = 41;
          break;

        case 37:
          context$1$0.prev = 37;
          context$1$0.t1 = context$1$0['catch'](24);
          _didIteratorError = true;
          _iteratorError = context$1$0.t1;

        case 41:
          context$1$0.prev = 41;
          context$1$0.prev = 42;

          if (!_iteratorNormalCompletion && _iterator['return']) {
            _iterator['return']();
          }

        case 44:
          context$1$0.prev = 44;

          if (!_didIteratorError) {
            context$1$0.next = 47;
            break;
          }

          throw _iteratorError;

        case 47:
          return context$1$0.finish(44);

        case 48:
          return context$1$0.finish(41);

        case 49:

          log('[ok] There is amount to ' + list.length + ' of article.');

          return context$1$0.abrupt('return', list);

        case 51:
        case 'end':
          return context$1$0.stop();
      }
    }, null, this, [[24, 37, 41, 49], [42,, 44, 48]]);
  }

  /**
  @param {object} opts - options
  @param {string} opts.url - Url of article that you want to crawl the detail.
  @returns {Article}
  */
  function find() {
    var opts = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    var URL, log, HTMLString, $body, body, title, published, cover, digQ, imgQ, _ref, _ref2, address, images;

    return regeneratorRuntime.async(function find$(context$1$0) {
      while (1) switch (context$1$0.prev = context$1$0.next) {
        case 0:
          URL = opts.url ? opts.url : null;
          log = (0, _debug2['default'])(logRoot.namespace + ':find');

          if (opts.url) {
            context$1$0.next = 4;
            break;
          }

          return context$1$0.abrupt('return', rejection('Expect find({url :string}), but cannot find url.', log));

        case 4:

          log('HTTP GET ' + URL);

          context$1$0.next = 7;
          return regeneratorRuntime.awrap((0, _request['default'])({
            method: 'GET',
            url: URL,
            json: false
          }));

        case 7:
          HTMLString = context$1$0.sent;
          $body = (0, _$['default'])(HTMLString);
          body = '';

          body = $body.find('article').find('style,script,textarea').remove().end().html();
          body = _he2['default'].decode(body);
          body = body.replace(/[\n\r\t]/mg, '');

          title = '';

          title = $body.find('h1').text();
          title = title.replace(/[\n\r\t]/mg, '');

          published = '';

          published = $body.find('time').attr('datetime');
          published = new Date(published).toISOString();
          published = (0, _isISOString['default'])(published) ? published : null;

          cover = '';

          cover = (0, _$['default'])('meta[property="og:image"]');
          cover = cover.length ? cover.attr('content') : $body.find('article img').eq(0).attr('src');

          digQ = _addressDigger['default'].dig(body);
          imgQ = _imgDigger['default'].dig(body);
          context$1$0.next = 27;
          return regeneratorRuntime.awrap(Promise.all([digQ, imgQ]));

        case 27:
          _ref = context$1$0.sent;
          _ref2 = _slicedToArray(_ref, 2);
          address = _ref2[0];
          images = _ref2[1];

          log('[ok] You got title: ' + title + ', images.len: ' + images.length + ', address.len: ' + address.length + '...');

          return context$1$0.abrupt('return', {
            address: address,
            body: body,
            cover: cover,
            images: images.map(function (img) {
              return img.url;
            }),
            published: published,
            title: title,
            url: URL
          });

        case 33:
        case 'end':
          return context$1$0.stop();
      }
    }, null, this);
  }

  /**
   * 爬取指定文章列表的網址，並序列向下爬取各頁
   *
   * @param {string} url 目標網址，解析為 `${url}/page/${page}` 之後進行爬取
   * @param {number} start 開始頁面，1 表示為爬取 `${url}/page/1`。默認 1。
   * @param {number} maxPageNum 最大頁面，例如 25 表示會依序爬取到網址 `${url}/page/25`。
   * @return {promise} result 為 {array<string>} htmlString。可經由 $(htmlString) 實作後續程式。
   */
  function getAllPages(url, start, maxPageNum) {
    start = start || 1;
    maxPageNum = maxPageNum || 10;

    var log = (0, _debug2['default'])(logRoot.namespace + ':_getAllPages');
    var ranges = _2['default'].range(start, maxPageNum + 1);

    return new Promise(function (ok, bad) {

      var data = [];

      _async2['default'].eachSeries(ranges, iterator, onSeriesDone);

      function iterator(n, done) {
        var pageUrl = url + '/page/' + n;

        log(_colors2['default'].blue.underline('HTTP GET ' + pageUrl));

        var promise = _request['default'].get('' + pageUrl);

        promise.then(function (htmlString) {
          data.push(htmlString);
          return new Promise(function (timeout) {
            setTimeout(timeout, 200);
          });
        }).then(done);

        promise['catch'](done);
      }

      function onSeriesDone(err) {
        if (err) {
          bad(err);
        } else {
          ok(data);
        }
      }
    });
  }

  /**
   * 得出最大頁面數量
   *
   * @param {string} htmlString 傳入目標的 html 源碼
   * @return {number}
   */
  function findPageAmount(htmlString) {
    var $html = (0, _$['default'])(htmlString);
    var pageNums = [];

    $html.find('.page-numbers').map(function (index, element) {
      var num = parseInt((0, _$['default'])(element).html(), 10);
      pageNums.push(num);
    });

    pageNums = _2['default'].reject(pageNums, function (val) {
      return Number.isNaN(val);
    });

    var maxPageNum = _2['default'].max(pageNums);

    return maxPageNum;
  }

  /**
   * 得出文章們的細節資訊
   *
   * @example
   * let data = findArticleList('<!DOCTYPE html> <html lang="zh-hant">...</html>')
   *
   * console.log(data)
   *
   * [
   *  {
   *    title: '桃園龜山．無名麵店（乾麵滑Q順口，豬肝綿密軟嫩）',
   *    href: 'http://www.alberthsieh.com/1837/anonymous-noodle-shop-guishan',
   *    published: '2015-05-08T18:24:23+00:00',
   *  },
   *  ...
   * ]
   *
   * @param {string} htmlString 傳入目標的 html 源碼
   * @return {array<object{title, href, published}>}
   */
  function findArticleList(htmlString) {
    var $html = (0, _$['default'])(htmlString);
    var $articles = $html.find('article');
    var articleList = [];

    _2['default'].each($articles, function (element) {
      var $element = (0, _$['default'])(element);
      articleList.push({
        title: $element.find('h1 a, h2 a').text(),
        url: $element.find('h1 a, h2 a').attr('href'),
        published: $element.find('time').attr('datetime')
      });
    });

    return articleList;
  }

  function rejection(message, log) {
    if (message === undefined) message = '';

    if (_2['default'].isFunction(log)) log('[error] ' + _colors2['default'].red.underline(message));
    return Promise.reject(message);
  }

  /**
  @interface ArticleShallow
  @prop {string} url - Url of article
  @prop {string} published - Published of article (format ISO8601)
  @prop {string} title - Title of article
  */

  /**
  @interface Article
  @prop {string} url - Url of article
  @prop {string} published - Published of article (format ISO8601)
  @prop {string} title - Title of article
  @prop {string[]} address - Tawian Address format
  @prop {string} cover - Url
  @prop {string} body - HTML
  @prop {string[]} images - Url
  */

  module.exports = {
    findAll: findAll,
    find: find
  };
});