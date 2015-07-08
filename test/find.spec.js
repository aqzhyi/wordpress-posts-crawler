import {expect} from 'chai'
import $ from 'cheerio'
import _ from 'lodash'
import crawler from '../dist/index'

describe('find()', () => {

  it('Basic usage', function() {
    this.timeout(10000)

    return crawler
    .find({ url: 'http://yukiblog.tw/read-3802.html' })
    .then((result) => {

      let $body = $('<div>').append(result.body)

      expect(result).to.be.an('object')

      expect(result).to.include.keys('url', 'title', 'datetime', 'address', 'cover', 'body', 'images')

      expect($body.find('style, script')).to.not.have.length.above(0, '不該有script,style,etc.')

      expect(result.body).to.be.a('string')

      expect(result.title).to.be.a('string')

      expect(result.url).to.be.a('string').to.match(/https?:\/\//)

      expect(result.cover).to.be.a('string').to.match(/https?:\/\//)

      expect(new Date(result.datetime).toString()).to.not.match(/invalid/i, '日期ISO8601')

      expect(result.address).to.be.an('array')
      _.each(result.address, (item) => expect(item).to.be.a('string', '地址'))

      expect(result.images).to.be.an('array')
      _.each(result.images, (item) => expect(item).to.be.a('string', '圖片URL').to.match(/https?:\/\//, '圖片URL'))
    })
  })
})
