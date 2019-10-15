const express = require('express');
const Joi = require('joi');

const db = require('../db');
const messages = db.get('messages');

const schema = Joi.object().keys({
  name: Joi.string()
        .min(3)
        .max(100)
        .required(),
  message: Joi.string()
          .min(3)
          .max(500)
          .required(),
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
})

const router = express.Router();

router.get('/', (req, res) => {
  messages.find({})
  .then(allMsgs => {
    res.json(allMsgs);
  })
});

router.post('/', (req, res, next) => {
  // add current time
  const result = Joi.validate(req.body, schema);
  if (result.error === null) {
    const userMessage = {
      name: req.body.name,
      message: req.body.message,
      latitude: req.body.latitude,
      longitude: req.body.longitude,
      date: new Date()
    }

    messages.insert(userMessage)
    .then(insertedMsg => {
      res.json(insertedMsg);
    })
  } else {
    next(result.error);
  }
  
});

module.exports = router;
