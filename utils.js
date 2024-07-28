"use strict";

import request from "request";

const callAPI = (options) => {
  return new Promise(function (resolve, reject) {
    request(options, function (error, response, body) {
      if (error) {
        reject(error);
      } else {
        resolve(response);
      }
    });
  });
};

export { callAPI };
