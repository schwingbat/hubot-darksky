const chai = require("chai");
const sinon = require("sinon");

chai.use(require("sinon-chai"));

const { expect } = chai;

describe("darksky", () => {
  let robot;

  beforeEach(() => {
    robot = {
      respond: sinon.spy(),
      hear: sinon.spy()
    };

    require("../src/darksky")(robot);
  });

  it("registers a respond listener for 'weather'", () => {
    expect(robot.respond).to.have.been.calledWith(/weather ?(.+)?/i);
  });
});
