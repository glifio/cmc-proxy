This is a proxy HTTP server for the CoinMarketCap api, primarily used for injecting an authorization header into proxied requests, so that client side applications can't see private secrets.

make sure to add a `.env` file that exports a `COINMARKETCAP_API_KEY` variable and a `TARGET` variable.

The TARGET is the server where requests should be forwarded.

You can also specify the PORT to listen on via the PORT .env var

### Notes

Steps we took to get certs working.

In our ubuntu machine on digital ocean, we run:

```
$ sudo add-apt-repository ppa:certbot/certbot
$ sudo apt-get update
$ sudo apt-get install certbot
$ certbot certonly --manual
```

We run the server: `npm run start`, server sould be listening on port 80.

Then we the certbot will generate a challenge file for us. We bring down the server, and add the file inside `/server/.well-known/acme-challenge/<file>`

Then we bring the server back online with `npm run start`

Then we accept the certbot challenge, which hits our server and generates a certificate.

Finally, we bring the server down one more time, and restart it (because we now have the proper certs). HTTPS is enabled!
