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
