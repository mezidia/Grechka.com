# Grechka.com

[![Language](https://img.shields.io/badge/language-javascript-brightgreen?style=flat-square)](https://nodejs.org/uk/)

Hello everyone! This is the repository of the site grechka.com.
Visit [grechka.com here](https://grechka-com.herokuapp.com/)!

## Table of contents

- [Table of contents](#table-of-contents)
- [Motivation](#motivation)
- [Build status](#build-status)
- [Badges](#badges)
- [Code style](#code-style)
- [Screenshots](#screenshots)
- [Tech/framework used](#techframework-used)
- [Features](#features)
- [Code Example](#code-example)
- [Fast usage](#fast-usage)
- [Contribute](#contribute)
- [License](#license)

## Motivation

The goal of this project is to create a website that helps customers find the best prices for buckwheat.

## Build status

Here you can see build status of [continuous integration](https://en.wikipedia.org/wiki/Continuous_integration):

![Lint Code Base](https://github.com/mezidia/grechka.com/workflows/Lint%20Code%20Base/badge.svg)

## Badges

Other badges

[![Theme](https://img.shields.io/badge/Theme-Web_Development-brightgreen?style=flat-square)](https://www.w3schools.com/whatis/)
[![Platform](https://img.shields.io/badge/Platform-NodeJS-brightgreen?style=flat-square)](https://nodejs.org/uk/)

## Code style

We are using [Codacy](https://www.codacy.com/) to automate our code quality.

[![Codacy Badge](https://app.codacy.com/project/badge/Grade/66df46a0daa143cc870de7a1488e1bab)](https://www.codacy.com/gh/mezidia/grechka.com/dashboard?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=mezidia/grechka.com&amp;utm_campaign=Badge_Grade)
 
## Screenshots

- Main page

![Screenshot 1](https://raw.githubusercontent.com/mezgoodle/images/master/grechkacom1.png)

- Filters

![Screenshot 2](https://raw.githubusercontent.com/mezgoodle/images/master/grechkacom2.png)

- Show products with filters

![Screenshot 3](https://raw.githubusercontent.com/mezgoodle/images/master/grechkacom3.png)

- About page

![Screenshot 4](https://raw.githubusercontent.com/mezgoodle/images/master/grechkacom4.png)

- Filters on adaptive screen

![Screenshot 5](https://raw.githubusercontent.com/mezgoodle/images/master/grechkacom5.png)

## Tech/framework used

**Built with**

- [mongoose](https://mongoosejs.com/)
- [http](https://nodejs.org/api/http.html)
- [fs](https://nodejs.org/api/fs.html)
- [cron](https://uk.wikipedia.org/wiki/Cron)
- [Chart.js](https://github.com/chartjs/Chart.js)
- [cheerio](https://github.com/cheeriojs/cheerio)
- [request](https://github.com/request/request)

## Features

On the site you can find the cheapest buckwheat, sort by price segment, by price, by weight, in direct and reverse order and get the lowest price in recent times.

## Code Example

- Product schema

```js
const mongoose = require('mongoose');

const productSchema = mongoose.Schema({
  productName: String,
  categoryId: mongoose.Schema.Types.ObjectId,
  manufacturerId: mongoose.Schema.Types.ObjectId,
  weight: Number,
  price: Number,
  priceSegment: String,
  productURL: String,
  productImgURL: String,
  description: String,
});
```

- Server

```js
'use strict';

const http = require('http');
const FileManager = require('./fileManager').FileManager;
const Database = require('./Database').Database;
const config = require('./config.json');
const setNewProduct = require('./setNewProduct').setNewProduct;
const minPriceByDay = require('./minPriceByDay').minPriceByDay;
const fileManager = new FileManager();
const dbVar = config.development.database;
const db = new Database(dbVar);

//types of request extensions
const mime = {
  'html': 'text/html',
  'js': 'application/javascript',
  'css': 'text/css',
  'png': 'image/png',
  'ico': 'image/x-icon',
  '/date': 'text/plain',
  '/getProdData': 'text/plain',
  'svg': 'image/svg+xml',
};

class Server {
  constructor(port) {
    const server = http.createServer();
    server.listen(port, () => {
      console.log('Server running on port: ' + port);
    });
    server.on('request', this.handleRequest);
  }

  //function for handling requests
  async handleRequest(req, res) {
    let data = null;
    const url = req.url;
    let name = url;
    const method = req.method;
    let extention = url.split('.')[1];
    if (method === 'GET') {
      if (url === '/') {
        extention = 'html';
        name = '/public/index.html';
      } else if (url === '/about') {
        extention = 'html';
        name = '/public/about.html';
      } else if (url === '/getProdData') {
        console.log('/getProdData');
        data = [];
        const products = await db.getAllByTableName('Product');
        for (const product of products) {
          const category = (await db.find('Category', { _id: product.categoryId })).categoryType;
          const isCompanyName = (await db.find('Manufacturer', { _id: product.manufacturerId }));
          if (isCompanyName) {
            data.push(setNewProduct(product, category, isCompanyName.companyName));
          } else {
            data.push(setNewProduct(product, category));
          }
        }
        console.log(data);
        data = JSON.stringify(data);
      } else if (url === '/getGraphicData') {
        console.log('/getGraphicData');
        const history = await db.getAllByTableName('History');
        data = JSON.stringify(minPriceByDay(history));
      }
      const typeAns = mime[extention];
      if (!data) data = await fileManager.readFile('.' + name);
      if (!data) {
        console.log('no such file => ' + name);
        //handle if no page
        const pageNotFound = await fileManager.readFile('./public/pageNotFound.html');
        res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
        res.write(pageNotFound);
      } else if (typeof data === 'number') {
        console.log('error occured => ' + name);
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      } else {
        res.writeHead(200, { 'Content-Type': `${typeAns}; charset=utf-8` });
        res.write(data);
      }
      res.end();
    } else if (method === 'POST') {
      console.log('POST');
    }
  }
}

module.exports = { Server };
```

## Fast usage

Just open the link in the description and enjoy your pastime.

## Contribute

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change. Also look at the [CONTRIBUTING.md](https://github.com/mezidia/grechka.com/blob/main/CONTRIBUTING.md).

## License

MIT © [mezidia](https://github.com/mezidia)
