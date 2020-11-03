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
  logout: '/logout'
}))

const accounts = [
  {account: {
    id: 22,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'approved',
    org_name: 'Capsule Corp',
    admin_name: 'Dr. Brief',
    billing_address: { company: 'Capsule Corp' }
  }},
  {account: {
    id: 23,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'approved',
    org_name: 'FOXHOUND',
    admin_name: 'Big Boss',
    billing_address: { company: 'Big Boss' }
  }},
  {account: {
    id: 24,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'pending',
    org_name: 'MomCorp',
    admin_name: 'Mom',
    billing_address: { company: 'Mom' }
  }},
  {account: {
    id: 25,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'approved',
    org_name: 'B.P.R.D',
    admin_name: 'Dr. Thomas Manning',
    billing_address: { company: 'Dr. Thomas Manning' }
  }}
]

const applications = [
  {application: {
    id: 22,
    name: 'Capsule App',
    created_at: '2018-02-10T09:30Z',
    traffic_on: '2018-02-10T09:30Z',
    state: 'live',
    org_name: 'Capsule Corp',
    account_id: 22,
    plan_name: 'Le Plan',
    plan_id: 22,
  }},
  {application: {
    id: 23,
    name: 'FOXHOUND App',
    created_at: '2018-02-10T09:30Z',
    traffic_on: '2018-02-10T09:30Z',
    state: 'rejected',
    org_name: 'FOXHOUND',
    account_id: 23,
    plan_name: 'Le Plan',
    plan_id: 22,
  }},
  {application: {
    id: 24,
    name: 'Mom App',
    created_at: '2018-02-10T09:30Z',
    traffic_on: '2018-02-10T09:30Z',
    state: 'pending',
    org_name: 'MomCorp',
    account_id: 25,
    plan_name: 'Planazo',
    plan_id: 25,
  }},
  {application: {
    id: 2,
    name: 'B.P.R.D App',
    created_at: '2018-02-10T09:30Z',
    traffic_on: '2018-02-10T09:30Z',
    state: 'approved',
    org_name: 'B.P.R.D',
    account_id: 25,
    plan_name: 'Planazo',
    plan_id: 25
  }}
]

app.get('/admin/api/accounts.json', keycloak.protect('realm:app-admin'), (req, res, next) => {
  res.json({accounts})
})

app.get('/admin/api/applications.json', keycloak.protect('realm:app-member'), (req, res, next) => {
  res.json({applications})
})

app.use('*', function (req, res) {
  res.send('Not found!')
})

const port = process.env.PORT || 3000
app.listen(port, () => debug(`Application listening on port ${port}`))