import {expect} from 'chai'
import $ from 'cheerio'
import crawler from '../dist/index'

describe('find()', () => {

  it('Basic usage', function() {
    this.timeout(10000)

    return crawler
    .find({ url: 'http://yukiblog.tw/read-3802.html' })
    .then((result) => {

      let $body = $('<div>').append(result.body)

      expect(result).to.be.an('object')
      expect($body.find('style, script')).to.not.have.length.above(0)
      expect(result).to.include.keys('url', 'title', 'datetime', 'address', 'cover', 'body')
    })
  })
})
