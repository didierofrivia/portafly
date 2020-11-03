const express = require('express')
const router = express.Router()
const debug = require('debug')('app:api')

const accounts = [
  {
    id: 22,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'approved',
    org_name: 'Capsule Corp',
    admin_name: 'Dr. Brief',
    apps_count: 4
  },
  {
    id: 23,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'approved',
    org_name: 'FOXHOUND',
    admin_name: 'Big Boss'
  },
  {
    id: 24,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'pending',
    org_name: 'MomCorp',
    admin_name: 'Mom'
  },
  {
    id: 25,
    created_at: '2018-02-10T09:30Z',
    updated_at: '2018-02-10T09:30Z',
    state: 'approved',
    org_name: 'B.P.R.D',
    admin_name: 'Dr. Thomas Manning'
  }
]

router.get('/admin/api/accounts', (req, res, next) => {
  res.send({ accounts })
});

router.get('/user', (req, res, next) => {
  const user = req.openid ? req.openid.user : null;

  if (req.openid) {
      console.log('req.openid:', req.openid)
  }

  if (!user) {
    res.sendStatus(404);
    return
  }

  debug(user)
  res.send(user)
});

module.exports = router