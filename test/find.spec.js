import _ from 'lodash'
import {expect} from 'chai'
import $ from 'cheerio'
import crawler from '../src/index'
import isISOString from 'isostring'
import isUrl from 'is-url'

describe('find()', function () {

  this.timeout(10000)

  it('Basic usage', async () => {

    let article = await crawler.find({ url: 'http://yukiblog.tw/read-3802.html' })

    let $body = $('<div>').append(article.body)

    expect(article).to.be.an('object')

    expect(article).to.include.keys('url', 'title', 'published', 'address', 'cover', 'body', 'images')

    expect($body.find('style, script')).to.not.have.length.above(0, '不該有script,style,etc.')

    expect(article.body).to.be.a('string')

    expect(article.title).to.be.a('string')

    expect(isUrl(article.url)).to.equal(true, 'article.url 必須是 URL')

    expect(isUrl(article.cover)).to.equal(true, 'article.cover 必須是 URL')

    expect(isISOString(article.published)).to.equal(true, 'article.published 必須為 ISO8601')

    expect(article.address).to.be.an('array')
    _.each(article.address, (item) => expect(item).to.be.a('string', 'article.address 必須是 string[]'))

    expect(article.images).to.be.an('array')
    _.each(article.images, (item) => expect(isUrl(item)).to.equal(true, 'article.images 必須是 string[]'))
  })
})
