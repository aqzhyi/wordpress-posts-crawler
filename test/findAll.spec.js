import {expect} from 'chai'
import _ from 'lodash'
import crawler from '../dist/index'

describe('findAll()', () => {

  it('Basic usage', function() {
    this.timeout(10000)

    return crawler.findAll({ url: 'http://yukiblog.tw/category/yuki-taiwan-food' })
    .then((result) => {

      expect(result).to.be.an('array')

      _.each(result, (item) => {
        expect(item).to.include.keys('url', 'title', 'datetime')
      })
    })
  })

  it('Only N page we crawl', function() {
    this.timeout(10000)

    let opts = {
      maxPage: 1,
      url: 'http://yukiblog.tw/category/yuki-taiwan-food',
    }

    return crawler.findAll(opts)
    .then((result) => {
      expect(result).to.be.an('array')
      expect(result).to.not.have.length.above(10)
    })
  })
})
