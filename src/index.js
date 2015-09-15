'use strict'

const ENV = process.env.NODE_ENV || process.env.ENV || 'development'

import debug from 'debug'
import request from 'request-promise'
import $ from 'cheerio'
import _ from 'lodash'
import async from 'async'
import colors from 'colors'
import he from 'he'
import addressDigger from 'html-taiwan-address-digger'
import imgDigger from 'html-img-digger'
import isISOString from 'isostring'

let logRoot = debug(`wordpress-posts-crawler`)
let logFind = debug('wordpress-posts-crawler:find')

//
async function findAll(opts = {}) {

  const FETCH_ALL = (opts.fetchAll === true) ? true : false
  const URL = (_.isString(opts.url)) ? opts.url : null

  let log = debug(`${logRoot.namespace}:findAll`)

  if (!URL) Promise.reject('Expect findAll({url :string}), but connot find url.')
  log(`findAll from URL ${URL}`)

  let maxPageNum = 1

  if (FETCH_ALL === true) {
    maxPageNum = findPageAmount(await request.get(URL))

    log(`fetchAll: ${FETCH_ALL}, therefore, we take the articles from all pages of list, there are amount to ${maxPageNum} pages.`)

    if (ENV.match(/test/i)) {
      log(`ENV: ${ENV}, therefore, pages at most 3, no more.`)
      maxPageNum = 3
    }
  }
  else {
    log(`fetchAll: ${FETCH_ALL}, we take the articles from only list of page 1.`)
    maxPageNum = 1
  }

  let HTMLStringOfLists = await getAllPages(URL, 1, maxPageNum)
  let list = []

  for (let HTMLString of HTMLStringOfLists) {
    let items = await findArticleList(HTMLString)
    list = list.concat(items)
  }

  log(`[ok] There is amount to ${list.length} of article.`)

  return list
}

async function find(opts = {}) {

  const URL = (opts.url) ? opts.url : null
  let log = debug(`${logRoot.namespace}:find`)

  if (!opts.url) return rejection('Expect find({url :string}), but cannot find url.', log)

  log(`HTTP GET ${URL}`)

  let HTMLString = await request({
    method: 'GET',
    url: URL,
    json: false,
  })

  let $body = $(HTMLString)

  let body = ''
  body = $body.find('article').find('style,script,textarea').remove().end().html()
  body = he.decode(body)
  body = body.replace(/[\n\r\t]/mg, '')

  let title = ''
  title = $body.find('h1').text()
  title = title.replace(/[\n\r\t]/mg, '')

  let published = ''
  published = $body.find('time').attr('datetime')
  published = new Date(published).toISOString()
  published = (isISOString(published)) ? published : null

  let cover = ''
  cover = $('meta[property="og:image"]')
  cover = (cover.length) ? cover.attr('content') : $body.find('article img').eq(0).attr('src')

  let digQ = addressDigger.dig(body)

  let imgQ = imgDigger.dig(body)

  let [address, images] = await Promise.all([digQ, imgQ])

  log(`[ok] You got title: ${title}, images.len: ${images.length}, address.len: ${address.length}...`)

  return {
    address,
    body,
    cover,
    images: images.map((img) => img.url),
    published,
    title,
    url: URL,
  }
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

  let log = debug(`${logRoot.namespace}:_getAllPages`)
  let ranges = _.range(start, maxPageNum + 1)

  return new Promise(function(ok, bad) {

    let data = []

    async.eachSeries(ranges, iterator, onSeriesDone)

    function iterator(n, done) {
      let pageUrl = `${url}/page/${n}`

      log(
        colors.blue.underline(`HTTP GET ${pageUrl}`)
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
 *    published: '2015-05-08T18:24:23+00:00',
 *  },
 *  ...
 * ]
 *
 * @param {string} htmlString 傳入目標的 html 源碼
 * @return {array<object{title, href, published}>}
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
      published: $element.find('time').attr('datetime'),
    })
  })

  return articleList
}

function rejection(message = '', log) {
  if (_.isFunction(log)) log(`[error] ${colors.red.underline(message)}`)
  return Promise.reject(message)
}

export default {
  findAll,
  find,
}
