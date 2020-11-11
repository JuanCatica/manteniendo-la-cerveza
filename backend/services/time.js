const MongoLib = require('../lib/mongo')

class TimeService {
  constructor() {
    this.collection = 'times'
    this.mongoDB = new MongoLib()
  }
  
  async getTimes() {
    const times = await this.mongoDB.getAll(this.collection)
    return times || []
  }

  async getTime({ typeNotice }) {
    const times = await this.mongoDB.getByTypeNotice(this.collection, typeNotice)
    return times || {}
  }
  
}

module.exports = TimeService