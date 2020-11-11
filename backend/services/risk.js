const MongoLib = require('../lib/mongo')


class RiskService {
  constructor() {
    this.collection = 'risk'
    this.mongoDB = new MongoLib()
  }
  
  async getRisks() {
    const risk = await this.mongoDB.getAll(this.collection)
    return risk || []
  }

  async getRisk({ machineId }) {
    const risk = await this.mongoDB.getByMachineId(this.collection, machineId)
    return risk || {}
  }
  
}

module.exports = RiskService