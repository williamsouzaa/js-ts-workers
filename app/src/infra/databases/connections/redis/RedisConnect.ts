import redus from 'redis'
import { IDatabaseConnect } from '../../../../data/interfaces/application/database/IDatabaseConnect.js'
import { IDatabaseDisconnect } from '../../../../data/interfaces/application/database/IDatabaseDisconnect.js'
import { MONGOOSE } from '../../../../environment'``

export class MongooseConnectLocal
  implements IDatabaseConnect, IDatabaseDisconnect
{
  async connect(): Promise<void> {
    const { USER, PASSWORD, PORT, DATABASE, AUTH_SOURCE, HOST } = MONGOOSE

    mongoose.connect(
      `mongodb://${HOST}:${PORT}/${DATABASE}?authSource=${AUTH_SOURCE}`,
      {
        user: USER,
        pass: PASSWORD,
        useNewUrlParser: true,
        useCreateIndex: true,
        useUnifiedTopology: true,
        useFindAndModify: true
      }
    ).catch(err => console.error(err))
  }

  async disconnect(): Promise<void> {
    await mongoose.disconnect()
  }
}