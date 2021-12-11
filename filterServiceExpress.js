const { createProxyMiddleware , responseInterceptor} = require('http-proxy-middleware');
const express = require('express');
const { SPFDefaultParams, SensitiveParamFilter } = require('@amaabca/sensitive-param-filter');

const app = express();
const port = 3000;
const hostname = "localhost";
const api_service_url = process.argv[2];

app.use('',createProxyMiddleware({
        target: api_service_url,
        changeOrigin: true,
        selfHandleResponse: true,
        onProxyRes: responseInterceptor(async(responseBuffer, proxyRes, req, res)=> {
          
          if(proxyRes.headers['content-type'].includes('application/json')){
            let data = JSON.parse(responseBuffer.toString('utf8'));
          	const paramFilter = new SensitiveParamFilter({
			  params: SPFDefaultParams.concat(['credit', 'id', 'CVV', 'password', 'code', 'email']),
			  whitelist: ['authentic', 'userId']
			});

			data = paramFilter.filter(data);
			return JSON.stringify(data);
          }
          return responseBuffer;
        })

}));

app.listen(port, hostname,() => {
	console.log(`Server running at http://${hostname}:${port}/`);
});
