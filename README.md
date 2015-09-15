# WORDPRESS crawler

> A crawler for articles of wordpress

![](http://i.imgur.com/d2nUwIj.png)

## Install

```sh
npm install wordpress-posts-crawler --save-dev
```

## Usage

#### .findAll()

```
/**
@param {object} opts - options
@param {string} opts.url - Url of blog (wordpress) that you want to crawl the lists.
@returns {ArticleShallow}
*/
```

###### example

```js
import wordpress from 'wordpress-posts-crawler'

let articles = await wordpress.findAll({ url: 'http://path/to/wordpress/category/list/' })
// expect array
console.log(articles[0])
```

#### .find()

```
/**
@param {object} opts - options
@param {string} opts.url - Url of article that you want to crawl the detail.
@returns {Article}
*/
```


###### Example

```js
import wordpress from 'wordpress-posts-crawler'

let article = await wordpress.find({ url: 'http://path/to/wordpress/post/id' })
// expect object
console.log(article)
```

## Interface

#### ArticleShallow

```
/**
@interface ArticleShallow
@prop {string} url - Url of article
@prop {string} published - Published of article (format ISO8601)
@prop {string} title - Title of article
*/
```

#### Article

```
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
```

## Development flow

```sh
vi src/index.js
:wq
npm test
npm run build
git commit -m 'dev'
```

## test

```sh
npm test
```
