const express = require('express')
const session = require('express-session')
const helmet = require('helmet')
const morgan = require('morgan')
const debug = require('debug')('app:server')
const Keycloak = require('keycloak-connect')
const bodyParser = require('body-parser')
const { join } = require('path')

const app = express()

// Middleware
app.use(bodyParser.json())
app.use(helmet())


// Set up a request logger for Express, sending the
// output to `debug()`
app.use(morgan('dev', { stream: { write: m => debug(m) } }));

// Create a session-store to be used by both the express-session
// middleware and the keycloak middleware.

const memoryStore = new session.MemoryStore()

app.use(session({
  secret: 'coco poco loco',
  resave: false,
  saveUninitialized: true,
  store: memoryStore
}))

// Provide the session store to the Keycloak so that sessions
// can be invalidated from the Keycloak console callback.
//
// Additional configuration is read from keycloak.json file
// installed from the Keycloak web console.

const keycloak = new Keycloak({
  store: memoryStore
})

app.use(keycloak.middleware({
  logout: '/logout',
  admin: '/',
  realm: "3scale",
  'bearer-only': true,
  'auth-server-url': "http://localhost:8080/auth",
  'ssl-required': "external",
  resource: "service-nodejs"
}))

// Serve static files from the /public folder
app.use(express.static(join(__dirname, '..', 'app', 'build')))

app.get('/service/public', function (req, res) {
  res.json({message: 'public'})
})

// Serve the index file in response to any other request
// that doesn't match a static file or the API
app.get('/app', (req, res) => {
  res.sendFile(join(__dirname, '..', 'app', 'build', 'index.html'));
})

app.get('/login', keycloak.protect(), function (req, res) {
  res.render('index', {
    result: JSON.stringify(JSON.parse(req.session['keycloak-token']), null, 4),
    event: '1. Authentication\n2. Login'
  })
})

app.get('/service/secured', keycloak.protect('realm:user'), function (req, res) {
  res.json({message: 'secured'})
})

app.get('/service/admin', keycloak.protect('realm:admin'), function (req, res) {
  res.json({message: 'admin'})
})

app.use('*', function (req, res) {
  res.send('Not found!')
})

const port = process.env.PORT || 3000
app.listen(port, () => debug(`Application listening on port ${port}`))