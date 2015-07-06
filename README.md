# Preview

![](preview.png)

# Usage

```js
import wordpress from 'wordpress-posts-crawler'

wordpress
  .findAll({ url: 'http://path/to/wordpress/category/list/' })
  .then((result) => {
    // expect array
    console.log(result)

    // expect object include keys title, url, datetime
    console.log(result[0])
  })
```

# Development

```sh
npm run dev
```

# test

```sh
DEBUG=wordpress-posts-crawler:* npm t
```

## DEBUG scopes ![https://www.npmjs.com/package/debug](https://img.shields.io/badge/npm-debug-cb3837.svg)

- `wordpress-posts-crawler:*`
- `wordpress-posts-crawler:findArticles`
