import {expect} from 'chai'
import _ from 'lodash'
import crawler from '../dist/index'

describe('findAll()', () => {

  it('Basic usage', function(done) {
    this.timeout(10000)

    crawler.findAll({ url: 'http://yukiblog.tw/category/yuki-taiwan-food' })
    .then((result) => {

      expect(result).to.be.an('array')

      _.each(result, (item) => {
        expect(item).to.include.keys('url', 'title', 'datetime')
      })
    })
    .then(done, done)
  })
})
