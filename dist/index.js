(function (global, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['exports', 'module', 'debug', 'request-promise', 'cheerio', 'lodash', 'async', 'colors', 'he', 'html-taiwan-address-digger', 'html-img-digger'], factory);
  } else if (typeof exports !== 'undefined' && typeof module !== 'undefined') {
    factory(exports, module, require('debug'), require('request-promise'), require('cheerio'), require('lodash'), require('async'), require('colors'), require('he'), require('html-taiwan-address-digger'), require('html-img-digger'));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, mod, global.debug, global.request, global.$, global._, global.async, global.colors, global.he, global.addressDigger, global.imgDigger);
    global.index = mod.exports;
  }
})(this, function (exports, module, _debug, _requestPromise, _cheerio, _lodash, _async, _colors, _he, _htmlTaiwanAddressDigger, _htmlImgDigger) {
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

  var ENV = process.env.NODE_ENV || 'development';
  var IS_DEV = ENV.match('dev') ? true : false;

  var logFindAll = (0, _debug2['default'])('wordpress-posts-crawler:findAll');
  var logFind = (0, _debug2['default'])('wordpress-posts-crawler:find');

  //
  function findAll() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    var MAX_PAGE = opts.maxPage || 5;

    if (!opts.url) Promise.reject('Need a URL that specified the posts list page.');

    var firstTouch = _request['default'].get(opts.url);

    return firstTouch.then(findPageAmount).then(function (maxPageNum) {
      if (IS_DEV) {
        logFindAll('hey! 開發環境! 最多三頁!');
        maxPageNum = 3;
      }

      maxPageNum = maxPageNum - MAX_PAGE >= 1 ? MAX_PAGE : maxPageNum;

      logFindAll('確認爬取頁數: ' + maxPageNum);
      return getAllPages(opts.url, 1, maxPageNum);
    }).then(function (datas) {
      datas = datas.map(function (val, index) {
        logFindAll('找出第 ' + (index + 1) + ' 頁文章清單');
        return findArticleList(val);
      });
      return datas;
    }).then(function (datas) {
      // concat [[...], [...], [...], ...] to [.........]
      datas = datas.reduce(function (cur, next) {
        return cur.concat(next);
      });
      return datas;
    }).then(function (articlesJson) {
      logFindAll('全部總共有 ' + articlesJson.length + ' 筆文章, done!');

      return articlesJson;
    });
  }

  function find() {
    var opts = arguments[0] === undefined ? {} : arguments[0];

    if (!opts.url) return Promise.reject('Need a URL that specified the post page.');

    logFind('來抓取 opts.url');

    return (0, _request['default'])({
      method: 'GET',
      url: opts.url,
      json: false
    }).then(function (result) {
      var $body = (0, _$['default'])(result);

      logFind('分析 body');
      var body = '';
      body = $body.find('article').find('style,script,textarea').remove().end().html();
      body = _he2['default'].decode(body);
      body = body.replace(/[\n\r\t]/mg, '');

      logFind('分析 title');
      var title = '';
      title = $body.find('h1').text();
      title = title.replace(/[\n\r\t]/mg, '');

      logFind('分析 datetime');
      var datetime = '';
      datetime = $body.find('time').attr('datetime');
      datetime = new Date(datetime);
      datetime = datetime.toString().match(/invalid/i) ? null : datetime;
      datetime = datetime ? datetime.toISOString() : null;

      logFind('分析 cover');
      var cover = '';
      cover = (0, _$['default'])('meta[property="og:image"]');
      cover = cover.length ? cover.attr('content') : $body.find('article img').eq(0).attr('src');

      logFind('分析 address');
      var digQ = _addressDigger['default'].dig(body);

      logFind('分析 images');
      var imgQ = _imgDigger['default'].dig(body);

      return Promise.all([digQ, imgQ]).then(function (_ref) {
        var _ref2 = _slicedToArray(_ref, 2);

        var address = _ref2[0];
        var images = _ref2[1];

        images = images.map(function (img) {
          return img.url;
        });

        return {
          address: address,
          body: body,
          cover: cover,
          datetime: datetime,
          images: images,
          title: title,
          url: opts.url
        };
      });
    });
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

    var ranges = _2['default'].range(start, maxPageNum + 1);

    return new Promise(function (ok, bad) {

      var data = [];

      _async2['default'].eachSeries(ranges, iterator, onSeriesDone);

      function iterator(n, done) {
        var pageUrl = url + '/page/' + n;

        logFindAll(_colors2['default'].yellow.underline('抓取URL: ' + pageUrl));

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
   *    datetime: '2015-05-08T18:24:23+00:00',
   *  },
   *  ...
   * ]
   *
   * @param {string} htmlString 傳入目標的 html 源碼
   * @return {array<object{title, href, datetime}>}
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
        datetime: $element.find('time').attr('datetime')
      });
    });

    return articleList;
  }

  module.exports = {
    findAll: findAll,
    find: find
  };
});