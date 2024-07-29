'use strict';

import request from 'request';

import { checkKeyLength, checkType, haveProp, isEqual } from './chai.js';

// API functions
export const createUrl = endpointstring => {
  console.log(BASEURL + endpointstring);
  return BASEURL + endpointstring;
};

export const callAPI = options => {
  return new Promise(function (resolve, reject) {
    request(options, function (error, res, body) {
      if (error) {
        reject(error);
      } else {
        resolve(res);
      }
    });
  });
};

export const callAPIAuth = async (path, skey, key, req, type = 'POST') => {
  const reqURL = createUrl(path);
  const hashed = authorizeHashed(skey, key, req);
  const res = await callAPI({
    url: reqURL,
    method: type,
    headers: {
      'Content-Type': 'application/json',
      Authorization: 'Bearer ' + hashed.author,
    },
    body: JSON.stringify(req),
  });

  console.log('Req Body: ' + JSON.stringify(req));

  return res;
};

export const callAPINoAuth = async (path, req, type = 'POST') => {
  const reqURL = createUrl(path);
  const res = await callAPI({
    url: reqURL,
    method: type,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(req),
  });

  console.log('Req Body: ' + JSON.stringify(req));

  return res;
};

export const checkRes = (res, resCode) => {
  // ステータスコード
  isEqual(res.statusCode, resCode);

  // レスポンスヘッダ
  isEqual(res.headers['content-type'], 'application/json; charset=utf-8');

  // レスポンスボディ
  let body;
  try {
    body = JSON.parse(res.body);
  } catch (e) {
    expect.fail('Not JSON');
  }

  console.log('Res body: ' + body);

  return body;
};

export const checkProp = (body, length, result) => {
  checkType(body, 'object');

  console.log('Body key length: ' + Object.keys(body).length);

  checkKeyLength(body, length);

  // Reduce manual scripting
  for (const key in result) {
    haveProp(body, `${key}`);
  }
};

export const checkResError = (body, errorSchema, caseNo) => {
  checkProp(body, 2, errorSchema);
  isEqual(body.code, caseNo.CODE);
  isEqual(body.message, caseNo.MESSAGE);
};

export const sleep = ms => new Promise(r => setTimeout(r, ms));
