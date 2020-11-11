const MongoLib = require('../lib/mongo')

class CostService {
  constructor() {
    this.collection = 'costs'
    this.mongoDB = new MongoLib()
  }
  
  async getCosts() {
    const costs = await this.mongoDB.getAll(this.collection)
    return costs || []
  }

  async getCost({ typeNotice }) {
    const costs = await this.mongoDB.getCosts(this.collection, typeNotice)
    return costs || {}
  }
  
}

module.exports = CostService