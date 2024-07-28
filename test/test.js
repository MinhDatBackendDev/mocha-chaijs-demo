"use strict";

import "dotenv/config";
import { expect } from "chai";
import { callAPI } from "../utils.js";

describe("Test API Token", async function (token) {
  this.timeout(2000);

  it("Test Login", async function () {
    const account = {
      email: process.env.EMAIL,
      password: process.env.PASSWORD,
    };

    const res = await callAPI({
      url: "https://api.escuelajs.co/api/v1/auth/login",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(account),
    });

    const body = JSON.parse(res.body);

    console.log(body);

    console.log(res.statusCode);

    console.log(res.headers);

    token = body.access_token;

    //Test cases
    expect(body).to.be.an("object");

    expect(Object.keys(body)).to.have.lengthOf(2);

    expect(body).to.have.property("access_token");
    expect(body).to.have.property("refresh_token");
  });

  it("Test Get Profile", async function () {
    const res = await callAPI({
      url: "https://api.escuelajs.co/api/v1/auth/profile",
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const body = JSON.parse(res.body);

    console.log(body);

    console.log(res.statusCode);

    // Test cases
    expect(body.email).to.equal("john@mail.com");
    expect(body).not.to.have.property("secret password");
  });
});
