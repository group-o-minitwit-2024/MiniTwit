const fs = require('fs');
const { Sequelize, Op, Model, DataTypes } = require('sequelize');


const dbConnectionType = process.env.DB_CONNECTION_TYPE;

let sequelize;
if (dbConnectionType === 'dev_db') {
  sequelize = new Sequelize(
    `postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/minitwit`, 
    { // Sequlieze connection for postgres
      logging: console.log
  });
  console.log(`postgres://${process.env.POSTGRES_USER}:${process.env.POSTGRES_PASSWORD}@${process.env.POSTGRES_HOST}:${process.env.POSTGRES_PORT}/minitwit`)

} else if (dbConnectionType === 'prod') {

  const ca_file = fs.readFileSync('/express-docker/secrets/ca-certificate.crt');
 
  sequelize = new Sequelize(process.env.POSTGRES_NAME, process.env.POSTGRES_USER, process.env.POSTGRES_PASSWORD, {
    host: process.env.POSTGRES_HOST,
    port: process.env.POSTGRES_PORT,
    dialect: 'postgres',
    dialectOptions: {
      ssl: {
        ca: ca_file
      }
    }
  });
  //throw new Error('Not implemented yet');
}


//127.0.0.1
// sequelize.authenticate().then(() => {
//     console.log('Connection has been established successfully.');
//  }).catch((error) => {
//     console.error('Unable to connect to the database: ', error);
//  });


//  -- Models --
const Account = sequelize.define('Account', {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true // Indicates that it's a SERIAL column in PostgreSQL
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pw_hash: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  tableName: 'account', // Ensure Sequelize uses the correct table name
  timestamps: false // Disable Sequelize's default timestamp fields
});

const Follower = sequelize.define('Follower', {
  who_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  },
  whom_id: {
    type: DataTypes.INTEGER,
    primaryKey: true
  }
}, {
  tableName: 'follower', // Ensure Sequelize uses the correct table name
  timestamps: false // Disable Sequelize's default timestamp fields
});

const Message = sequelize.define('Message', {
  message_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true // Indicates that it's a SERIAL column in PostgreSQL
  },
  author_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  text: {
    type: DataTypes.STRING,
    allowNull: false
  },
  pub_date: {
    type: DataTypes.INTEGER
  },
  flagged: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'message', // Ensure Sequelize uses the correct table name
  timestamps: false // Disable Sequelize's default timestamp fields
});

// Define associations between models
Message.belongsTo(Account, { foreignKey: 'author_id' }); 
// Account.belongsToMany(Account, {
//   as: 'Followers',
//   through: Follower,
//   foreignKey: 'whom_id',
//   foreignKey: 'who_id',
// });


// Test database operations
async function testDatabase() {
  // Inside the testDatabase function, after authenticating and before syncing models
  console.log('Defined Sequelize models:', Object.keys(sequelize.models));


  try {
    // Test connection by authenticating
    await sequelize.authenticate();
    console.log('Connection has been established successfully.');

    // Sync the model with the database
    await Account.sync();
    await Message.sync();

    if (!(Account === sequelize.models.Account)) {
      throw new Error("Something is wrong with the Account model typing");
    }
  
    // Create a new user
    //const newUser = await Account.create({user_id: -1, username: 'testuser', email: 'test@example.com', pw_hash: "basj" });
    //console.log('New user created:', newUser.toJSON());
    const newMessage = await Message.create({ author_id: -1, text: 'oggeli boggely', pub_date: 1, flagged: 0 });
    console.log('New message created:', newMessage.toJSON());

    // Retrieve all messages from the database
    const messages = await Message.findAll({ raw: true });

    // Display the retrieved messages
    console.log('All messages:', messages);
  
  } catch (error) {
    console.error('Unable to connect to the database:', error);
  } finally {
    // Close the Sequelize connection
    await sequelize.close();
  }
}

const get_user_id = async (username) => {
  const user = await Account.findOne({
      attributes: ['user_id'],
      where: {
        username: username
      }
    });
  return user ? user.user_id : null;
};


// Export the models
module.exports = { testDatabase, Account, Follower, Message, sequelize, Op, get_user_id };