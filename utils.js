'use strict';

// Other functions
const decodeJwt = token => {
  const base64Url = token.split('.')[1];
  const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  const res = decodeURIComponent(atob(base64));
  return JSON.parse(res);
};

const authorizeHashed = (skey, key, req) => {
  const now =
    new Date().toISOString().replace(/-/g, '').replace(/:/g, '').slice(0, 15) +
    'Z';
  console.log('x-epco-api-date: ' + now);
  console.log('x-epco-api-key: ' + key);
  console.log('sercet key: ' + skey);
  const header = {
    'x-epco-api-key': key,
    'x-epco-api-date': now,
  };

  //step 1
  const RS1 = CryptoJS.HmacSHA256(now, skey).toString(CryptoJS.enc.Hex);

  //step 2
  const RS2 = CryptoJS.HmacSHA256(RS1, key).toString(CryptoJS.enc.Hex);

  //step 3
  const RS3 = CryptoJS.HmacSHA256(RS2, JSON.stringify(req)).toString(
    CryptoJS.enc.Hex,
  );

  //step 4
  const RS4 = CryptoJS.HmacSHA256(JSON.stringify(header), RS3).toString(
    CryptoJS.enc.Hex,
  );

  console.log('Authorization: ' + RS4);

  return { author: RS4, timeNow: now, api_key: key };
};

const deepCloneObj = obj => {
  if (typeof obj !== 'object' || obj === null) {
    console.log('Invalid input');
    return;
  }
  return JSON.parse(JSON.stringify(obj));
};

const isEmptyObj = obj => {
  if (typeof obj !== 'object' || obj === null) {
    console.log('Invalid input');
    return;
  }
  const isEmpty = !Object.keys(obj).length;
  isEmpty && console.log('Empty object');
  return isEmpty;
};

const deleteOnePropOnly = obj => {
  const clonedObj = deepCloneObj(obj);

  if (isEmptyObj(clonedObj)) return {};

  const missingPropObjList = {};
  for (const key in clonedObj) {
    const { [key]: deletedProp, ...rest } = clonedObj;
    missingPropObjList[`no_${key}`] = rest;
  }

  return missingPropObjList;
};

const emptyByType = obj => {
  switch (typeof obj) {
    case 'object':
      if (Array.isArray(obj)) {
        obj = [];
      } else if (obj === null) {
      } else {
        obj = {};
      }
      break;
    case 'string':
      obj = '';
      break;
    case 'number':
      obj = null;
      break;
    case 'boolean':
      obj = null;
      break;
    default:
      obj = undefined;
      break;
  }
  return obj;
};

const emptyOnePropOnly = obj => {
  const clonedObj = deepCloneObj(obj);

  if (isEmptyObj(clonedObj)) return {};

  const emptyPropObjList = {};
  for (const key in clonedObj) {
    const newObj = { ...clonedObj };
    newObj[key] = emptyByType(newObj[key]);
    // Label it for easy tracking
    emptyPropObjList[`empty_${key}`] = newObj;
  }

  return emptyPropObjList;
};

const nullifyOnePropOnly = obj => {
  const clonedObj = deepCloneObj(obj);

  if (isEmptyObj(clonedObj)) return {};

  const nullPropObjList = {};
  for (const key in clonedObj) {
    const newObj = { ...clonedObj };
    newObj[key] = null;
    // Label it for easy tracking
    nullPropObjList[`null_${key}`] = newObj;
  }

  return nullPropObjList;
};

const deleteOneRequiredInSchema = (obj, schema) => {
  const clonedObj = deepCloneObj(obj);

  if (isEmptyObj(clonedObj)) return {};

  const missingOneRequiredInSchemaList = {};
  if (!Array.isArray(clonedObj)) {
    for (const key in clonedObj) {
      missingOneRequiredInSchemaList[`missingOneRequiredIn_${key}`] = {};
      const { [key]: nestedObj, ...rest } = clonedObj;
      // Fix this condition later
      if (Array.isArray(nestedObj)) {
        // Take only one item to do
        const firstItem = nestedObj[0];
        if (isEmptyObj(firstItem)) return {};
        for (const nestedKey in firstItem) {
          const { [nestedKey]: deletedProp, ...nestedRest } = firstItem;
          if (schema[key][nestedKey] === 'required') {
            missingOneRequiredInSchemaList[`missingOneRequiredIn_${key}`][
              `missing_${nestedKey}`
            ] = { [key]: [{ ...nestedRest }], ...rest };
          }
        }
      } else {
        if (isEmptyObj(nestedObj)) return {};
        for (const nestedKey in nestedObj) {
          const { [nestedKey]: deletedProp, ...nestedRest } = nestedObj;
          if (schema[key][nestedKey] === 'required') {
            missingOneRequiredInSchemaList[`missingOneRequiredIn_${key}`][
              `missing_${nestedKey}`
            ] = { [key]: nestedRest, ...rest };
          }
        }
      }
    }
  }
  return missingOneRequiredInSchemaList;
};

const emptyOneRequiredInSchema = (obj, schema) => {
  const clonedObj = deepCloneObj(obj);

  if (isEmptyObj(clonedObj)) return {};

  const emptyOneRequiredInSchemaList = {};

  if (!Array.isArray(clonedObj)) {
    for (const key in clonedObj) {
      emptyOneRequiredInSchemaList[`emptyOneRequiredIn_${key}`] = {};
      const { [key]: nestedObj, ...rest } = clonedObj;

      if (Array.isArray(nestedObj)) {
        const firstItem = nestedObj[0];
        if (isEmptyObj(firstItem)) return {};
        for (const nestedKey in firstItem) {
          if (schema[key][nestedKey] === 'required') {
            const emptyProp = deepCloneObj(firstItem);
            emptyProp[nestedKey] = emptyByType(emptyProp[nestedKey]); // Replace with empty string
            emptyOneRequiredInSchemaList[`emptyOneRequiredIn_${key}`][
              `empty_${nestedKey}`
            ] = { [key]: [emptyProp], ...rest };
          }
        }
      } else {
        if (isEmptyObj(nestedObj)) return {};
        for (const nestedKey in nestedObj) {
          if (schema[key][nestedKey] === 'required') {
            const emptyProp = deepCloneObj(nestedObj);
            emptyProp[nestedKey] = emptyByType(emptyProp[nestedKey]); // Replace with empty string
            emptyOneRequiredInSchemaList[`emptyOneRequiredIn_${key}`][
              `empty_${nestedKey}`
            ] = { [key]: emptyProp, ...rest };
          }
        }
      }
    }
  }
  return emptyOneRequiredInSchemaList;
};
