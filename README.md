# Bhojpur Shipping - Data Management Engine

The `Bhojpur Shipping` is an intelligent shipping management engine applied within
the [Bhojpur.NET Platform](https://github.com/bhojpur/platform/) ecosystem for delivery
of distributed `applications` or `services`.

## Simple Usage

Start the *MongoDB* server instance (e.g. using `brew services start mongodb-community`
command). Alternatively, you can issue the following commands in a new Terminal window.

```bash
mkdir -p data/db
mongod
```

Create a `config/local.js` file and start the *server-side* web backend application

```bash
cd pkg/server
yarn start
```

Now, the server is listening on port `5050` (default behavior).

Start the *client-side* web frontend application

```bash
cd pkg/webui
yarn start
```

then, open `http://localhost:3000/` URL in your web-browser

## Pre-requisites

You need the following installed on target system.

- [Yarn](https://yarnpkg.com/) framework
- [MongoDB](https://www.mongodb.com/) database

## Build Source Code

You need `Node.js`, `MongoDB`, etc installed on target system.
