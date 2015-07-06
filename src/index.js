'use strict'

const ENV = process.env.NODE_ENV || 'development'
const IS_DEV = ENV.match('dev') ? true : false

import debug from 'debug'
import request from 'request-promise'
import $ from 'cheerio'
import _ from 'lodash'
import async from 'async'
import colors from 'colors'

let logFetcher = debug('wordpress-posts-crawler:findArticles')

//
function findAll(opts = {}) {
  if (!opts.url) Promise.reject('Need a URL that specified the posts list page.')

  let firstTouch = request.get(opts.url)

  return firstTouch
  .then(findPageAmount)

  .then(function(maxPageNum) {
    if (IS_DEV) {
      logFetcher('hey! 開發環境! 最多三頁!')
      maxPageNum = 3
    }

    logFetcher(`確認爬取頁數: ${maxPageNum}`)
    return getAllPages(opts.url, 1, maxPageNum)
  })

  .then(function(datas) {
    datas = datas.map(function(val, index) {
      logFetcher(`找出第 ${index + 1} 頁文章清單`)
      return findArticleList(val)
    })
    return datas
  })

  .then(function(datas) {
    // concat [[...], [...], [...], ...] to [.........]
    datas = datas.reduce(function(cur, next) {
      return cur.concat(next)
    })
    return datas
  })

  .then(function(articlesJson) {
    logFetcher(`全部總共有 ${articlesJson.length} 筆文章, done!`)

    return articlesJson
  })
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
  start = start || 1
  maxPageNum = maxPageNum || 10

  let ranges = _.range(start, maxPageNum + 1)

  return new Promise(function(ok, bad) {

    let data = []

    async.eachSeries(ranges, iterator, onSeriesDone)

    function iterator(n, done) {
      let pageUrl = `${url}/page/${n}`

      logFetcher(
        colors.yellow.underline(`抓取URL: ${pageUrl}`)
      )

      let promise = request.get(`${pageUrl}`)

      promise
        .then(function(htmlString) {
          data.push(htmlString)
          return new Promise(function(timeout) {
            setTimeout(timeout, 200)
          })
        })
        .then(done)

      promise.catch(done)
    }

    function onSeriesDone(err) {
      if (err) {
        bad(err)
      }
      else {
        ok(data)
      }
    }
  })
}

/**
 * 得出最大頁面數量
 *
 * @param {string} htmlString 傳入目標的 html 源碼
 * @return {number}
 */
function findPageAmount(htmlString) {
  let $html = $(htmlString)
  let pageNums = []

  $html.find('.page-numbers').map(function(index, element) {
    let num = parseInt($(element).html(), 10)
    pageNums.push(num)
  })

  pageNums = _.reject(pageNums, function(val) {
    return Number.isNaN(val)
  })

  let maxPageNum = _.max(pageNums)

  return maxPageNum
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
  let $html = $(htmlString)
  let $articles = $html.find('article')
  let articleList = []

  _.each($articles, function(element) {
    let $element = $(element)
    articleList.push({
      title: $element.find('h1 a, h2 a').text(),
      url: $element.find('h1 a, h2 a').attr('href'),
      datetime: $element.find('time').attr('datetime'),
    })
  })

  return articleList
}

export default {
  findAll
}
