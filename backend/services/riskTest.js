const MongoLib = require('../lib/mongo')


class riskTestService {
  constructor() {
    this.collection = 'risk_test'
    this.mongoDB = new MongoLib()
  }
  
  async getRisksTest() {
    const risksTest = await this.mongoDB.getAll(this.collection)
    return risksTest || []
  }

  async getRiskTest({ machineId }) {
    const risksTest = await this.mongoDB.getByMachineId(this.collection, machineId)
    return risksTest || {}
  }
  
}

module.exports = riskTestService