const Translate = require('@google-cloud/translate');
const settings = require('./settings.json');

exports.intMessage = (req, res) => {
  const translate = new Translate({
    key: settings.api_key,
  });

  if (req.method === 'OPTIONS') return answerPreflight(req, res);
  if (req.method !== 'POST') return answerWrongMethod(req, res);

  const {from, to, text} = req.body;

  if (from === undefined || to === undefined || text === undefined) {
    res.status(400).send('Invalid Input.');
  } else {
    res.set('Access-Control-Allow-Origin', '*');
    let opts = {
      from: req.body.source,
      to: req.body.to,
    };

    let translation = translate.translate(req.body.text, opts);
    translation
    .then((v) => {
      res.status(200).send({
        text: v[0],
      });
    })
    .catch((v) => {
      res.status(400).send(v);
    });
  }
};

function answerPreflight(req, res) {
  setCorsHeaders(res);
  res.status(200);
  res.send();
}

function answerWrongMethod(req, res) {
  res.status(400);
  res.send('Invalid method');
}

function setCorsHeaders(res) {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'POST');
  res.set('Access-Control-Allow-Headers', 'Content-Type');
}
