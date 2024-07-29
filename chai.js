"use strict";

import { expect } from "chai";

// Chai functions
export const isEqual = (retrieved, expected) => {
  expect(retrieved).to.equal(expected);
};

export const haveProp = (retrieved, propName) => {
  expect(retrieved).to.have.property(propName);
};

export const checkType = (retrieved, typeName) => {
  expect(retrieved).to.be.an(typeName);
};

export const checkKeyLength = (retrieved, length) => {
  expect(Object.keys(retrieved)).to.have.lengthOf(length);
};
